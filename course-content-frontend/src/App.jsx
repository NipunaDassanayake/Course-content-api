// src/App.jsx
import React, { useState, useEffect, useMemo } from "react";
import FileUpload from "./components/FileUpload.jsx";
import ContentList from "./components/ContentList.jsx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchContents,
  uploadFile,
  deleteContent,
  generateSummary,
  getSummary,
  downloadFile,
} from "./api/contentApi.js";

function App() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["contents"],
    queryFn: async () => {
      const res = await fetchContents();
      return res.data;
    },
  });

  // 🌙 Dark mode state
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    console.log("darkMode:", darkMode, "html.className:", root.className);
  }, [darkMode]);

  // 🔍 Search + sort state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date_desc"); // 'date_desc' | 'size_desc' | 'name_asc'

  const filteredContents = useMemo(() => {
    if (!data) return [];
    let items = [...data];

    // filter by search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      items = items.filter(
        (item) =>
          item.fileName?.toLowerCase().includes(term) ||
          item.fileType?.toLowerCase().includes(term)
      );
    }

    // sort
    items.sort((a, b) => {
      if (sortBy === "name_asc") {
        return (a.fileName || "").localeCompare(b.fileName || "");
      }
      if (sortBy === "size_desc") {
        return (b.fileSize || 0) - (a.fileSize || 0);
      }
      // default: date_desc (newest first)
      const da = a.uploadDate ? new Date(a.uploadDate) : 0;
      const db = b.uploadDate ? new Date(b.uploadDate) : 0;
      return db - da;
    });

    return items;
  }, [data, searchTerm, sortBy]);

  // AI Summary modal state
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null); // { fileName, summary, keyPoints }

  // Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null); // 'pdf' | 'image' | 'video' | 'other'
  const [previewFileName, setPreviewFileName] = useState("");

  const handleUpload = async (file, onUploadProgress) => {
    try {
      await uploadFile(file, onUploadProgress);
      await queryClient.invalidateQueries({ queryKey: ["contents"] });
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

 const handleDownload = async (item) => {
   try {
     const res = await downloadFile(item.id); // Axios call → blob

     const contentType =
       res.headers["content-type"] || item.fileType || "application/octet-stream";

     const blob = new Blob([res.data], { type: contentType });
     const url = window.URL.createObjectURL(blob);

     const link = document.createElement("a");
     link.href = url;
     link.setAttribute("download", item.fileName || "download");
     document.body.appendChild(link);
     link.click();
     link.remove();

     window.URL.revokeObjectURL(url);
   } catch (err) {
     console.error(err);
     alert("Download failed");
   }
 };

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this file?");
    if (!ok) return;

    try {
      await deleteContent(id);
      await queryClient.invalidateQueries({ queryKey: ["contents"] });
    } catch (err) {
      console.error(err);
      alert("Failed to delete file");
    }
  };

  // ✅ Inline preview using direct S3 URL
  const handleView = (item) => {
    try {
      const contentType = item.fileType || "application/octet-stream";

      let type = "other";
      if (contentType.includes("pdf")) type = "pdf";
      else if (contentType.startsWith("image/")) type = "image";
      else if (contentType.startsWith("video/")) type = "video";

      setPreviewUrl(item.fileUrl); // direct S3 URL
      setPreviewType(type);
      setPreviewFileName(item.fileName);
      setPreviewOpen(true);
    } catch (err) {
      console.error(err);
      alert("Failed to open file");
    }
  };

  const closePreview = () => {
    setPreviewUrl(null);
    setPreviewOpen(false);
  };

  // Show AI summary for a specific file
  const handleShowSummary = async (item) => {
    try {
      setSummaryModalOpen(true);
      setSummaryLoading(true);
      setSummaryData(null);

      const existing = await getSummary(item.id);
      if (existing.data.summary) {
        setSummaryData({
          fileName: item.fileName,
          summary: existing.data.summary,
          keyPoints: existing.data.keyPoints,
        });
      } else {
        const res = await generateSummary(item.id);
        setSummaryData({
          fileName: item.fileName,
          summary: res.data.summary,
          keyPoints: res.data.keyPoints,
        });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load AI summary");
      setSummaryModalOpen(false);
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="bg-white dark:bg-slate-950 shadow-sm border-b border-slate-200 dark:border-slate-800">
        <div className="w-full px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
              LearnHub
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Central place for your course PDFs, videos, images & AI summaries
            </p>
          </div>

          {/* 🌙 Dark mode toggle */}
          <button
            onClick={() => setDarkMode((d) => !d)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                       border border-slate-300 dark:border-slate-700
                       bg-slate-50 dark:bg-slate-900
                       text-xs font-medium text-slate-700 dark:text-slate-200
                       hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {darkMode ? "☀️ Light mode" : "🌙 Dark mode"}
          </button>
        </div>
      </header>

      {/* Middle: white section */}
      <main className="flex-1 bg-white dark:bg-slate-900">
        <div className="w-full px-8 py-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Left: Upload card (2/5 width) */}
            <div className="lg:col-span-2">
              <FileUpload onUpload={handleUpload} />
            </div>

            {/* Right: List card (3/5 width) */}
            <div className="lg:col-span-3 bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 flex flex-col h-full">
              <div className="flex flex-col gap-3 mb-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    Uploaded Files
                  </h2>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {filteredContents.length} file(s)
                  </span>
                </div>

                {/* 🔍 Search + sort controls */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name or type..."
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700
                                 bg-white dark:bg-slate-900
                                 text-sm px-3 py-2
                                 text-slate-800 dark:text-slate-100
                                 placeholder:text-slate-400 dark:placeholder:text-slate-500
                                 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div className="sm:w-48">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700
                                 bg-white dark:bg-slate-900
                                 text-sm px-3 py-2
                                 text-slate-800 dark:text-slate-100
                                 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="date_desc">Sort by: Newest</option>
                      <option value="size_desc">Sort by: Size (large → small)</option>
                      <option value="name_asc">Sort by: Name (A → Z)</option>
                    </select>
                  </div>
                </div>
              </div>

              {isLoading && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Loading contents...
                </p>
              )}

              {isError && (
                <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900 rounded-md px-3 py-2">
                  Error: {error?.message || "Failed to load contents"}
                </p>
              )}

              {!isLoading && !isError && (
                <ContentList
                  contents={filteredContents}
                  onDownload={handleDownload} // expects (item)
                  onView={handleView} // expects (item)
                  onDelete={handleDelete}
                  onShowSummary={handleShowSummary}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 🔍 Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
          <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-xl w-full max-w-5xl p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                👀 Preview – {previewFileName}
              </h3>
              <button
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-lg"
                onClick={closePreview}
              >
                ✕
              </button>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-2">
              {previewType === "pdf" && (
                <iframe
                  src={previewUrl}
                  title="PDF preview"
                  className="w-full h-[70vh] rounded-md bg-white"
                />
              )}

              {previewType === "image" && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-[70vh] object-contain mx-auto rounded-md"
                />
              )}

              {previewType === "video" && (
                <video
                  src={previewUrl}
                  controls
                  className="w-full max-h-[70vh] rounded-md"
                />
              )}

              {previewType === "other" && (
                <p className="text-sm text-slate-600 dark:text-slate-300 p-4">
                  This file type can’t be previewed here. Please use{" "}
                  <span className="font-medium">Download</span> instead.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🤖 AI Summary Modal */}
      {summaryModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-xl w-full max-w-xl p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  AI Study Assistant
                </p>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  📚 AI Summary – {summaryData?.fileName}
                </h3>
              </div>
              <button
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-lg"
                onClick={() => setSummaryModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            {summaryLoading && (
              <p className="text-sm text-slate-500 dark:text-slate-300">
                ✨ Analyzing your document and generating a summary...
              </p>
            )}

            {!summaryLoading && summaryData && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {/* Summary */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
                    📝 Summary
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                    {summaryData.summary}
                  </p>
                </div>

                {/* Key points */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">
                    🔑 Key Points
                  </h4>

                  {(() => {
                    const bullets =
                      summaryData.keyPoints
                        ?.split("\n")
                        .map((line) => line.replace(/^[-•]\s*/, "").trim())
                        .filter(Boolean) || [];

                    return (
                      <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-200">
                        {bullets.map((point, idx) => (
                          <li key={idx}>
                            <span className="mr-1">✅</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    );
                  })()}
                </div>

                <p className="text-[11px] text-slate-400 text-right">
                  Generated with Gemini · Use this as a study aid, not as a
                  replacement for the full material.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black dark:bg-slate-950 border-t border-slate-700 mt-4">
        <div className="w-full px-8 py-6 flex flex-col gap-4 text-slate-300">
          {/* Top row */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            {/* Project info */}
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Course Content Upload System
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                A demo application for uploading and managing course materials
                such as PDFs, videos, and images, built as part of a technical
                assignment using a modern React + Spring Boot + AWS S3 stack.
              </p>
            </div>

            {/* Tech stack */}
            <div className="text-xs">
              <h4 className="font-semibold text-slate-100 mb-1">Tech Stack</h4>
              <ul className="space-y-0.5 text-slate-400">
                <li>Frontend: React, Vite, Tailwind CSS, React Query</li>
                <li>Backend: Spring Boot, REST API</li>
                <li>Database: MySQL / PostgreSQL</li>
                <li>Storage: AWS S3</li>
              </ul>
            </div>

            {/* Usage note */}
            <div className="text-xs">
              <h4 className="font-semibold text-slate-100 mb-1">Notes</h4>
              <ul className="space-y-0.5 text-slate-400">
                <li>Max file size: 100 MB</li>
                <li>Supported types: PDF, MP4, JPG, PNG</li>
                <li>Includes file validation &amp; upload progress</li>
                <li>AI summaries powered by Gemini</li>
              </ul>
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-800">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Course Content System. For
              interview/demo use only.
            </p>
            <p className="text-xs text-slate-500">
              Built with{" "}
              <span className="font-medium text-slate-100">
                React, Tailwind CSS, React Query, Spring Boot &amp; AWS S3
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
