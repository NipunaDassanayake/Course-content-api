// src/App.jsx
import React, { useState } from "react";
import FileUpload from "./components/FileUpload.jsx";
import ContentList from "./components/ContentList.jsx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchContents,
  uploadFile,
  downloadFile,
  deleteContent,
  generateSummary,
  getSummary,
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

  const handleDownload = async (id, originalName) => {
    try {
      const response = await downloadFile(id);
      const contentType =
        response.headers["content-type"] || "application/octet-stream";
      const blob = new Blob([response.data], { type: contentType });
      const fileName = originalName || "download";

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
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

  // ✅ NEW: inline preview instead of window.open
  const handleView = async (item) => {
    try {
      const response = await downloadFile(item.id);

      const contentType =
        response.headers["content-type"] ||
        item.fileType ||
        "application/octet-stream";

      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);

      let type = "other";
      if (contentType.includes("pdf")) type = "pdf";
      else if (contentType.startsWith("image/")) type = "image";
      else if (contentType.startsWith("video/")) type = "video";

      setPreviewUrl(url);
      setPreviewType(type);
      setPreviewFileName(item.fileName);
      setPreviewOpen(true);
    } catch (err) {
      console.error(err);
      alert("Failed to open file");
    }
  };

  const closePreview = () => {
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewOpen(false);
  };

  // Show AI summary for a specific file
  const handleShowSummary = async (item) => {
    try {
      setSummaryModalOpen(true);
      setSummaryLoading(true);
      setSummaryData(null);

      // 1) Try to fetch existing summary
      const existing = await getSummary(item.id);
      if (existing.data.summary) {
        setSummaryData({
          fileName: item.fileName,
          summary: existing.data.summary,
          keyPoints: existing.data.keyPoints,
        });
      } else {
        // 2) If not present, generate via backend (Gemini)
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
    <div className="min-h-screen flex flex-col bg-slate-200">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-300">
        <div className="w-full px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">LearnHub</h1>
          </div>
        </div>
      </header>

      {/* Middle: white section */}
      <main className="flex-1 bg-white">
        <div className="w-full px-8 py-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Left: Upload card (2/5 width) */}
            <div className="lg:col-span-2">
              <FileUpload onUpload={handleUpload} />
            </div>

            {/* Right: List card (3/5 width) */}
            <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col h-full">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-slate-800">
                  Uploaded Files
                </h2>
                <span className="text-xs text-slate-500">
                  {data?.length || 0} file(s)
                </span>
              </div>

              {isLoading && (
                <p className="text-sm text-slate-500">Loading contents...</p>
              )}

              {isError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                  Error: {error?.message || "Failed to load contents"}
                </p>
              )}

              {!isLoading && !isError && (
                <ContentList
                  contents={data || []}
                  onDownload={handleDownload}
                  onView={handleView}
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-slate-800">
                👀 Preview – {previewFileName}
              </h3>
              <button
                className="text-slate-400 hover:text-slate-700 text-lg"
                onClick={closePreview}
              >
                ✕
              </button>
            </div>

            <div className="border rounded-lg bg-slate-50 flex items-center justify-center p-2">
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
                <p className="text-sm text-slate-600 p-4">
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  AI Study Assistant
                </p>
                <h3 className="text-lg font-semibold text-slate-800">
                  📚 AI Summary – {summaryData?.fileName}
                </h3>
              </div>
              <button
                className="text-slate-400 hover:text-slate-700 text-lg"
                onClick={() => setSummaryModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            {summaryLoading && (
              <p className="text-sm text-slate-500">
                ✨ Analyzing your document and generating a summary...
              </p>
            )}

            {!summaryLoading && summaryData && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {/* Summary */}
                <div className="bg-slate-50 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-slate-800 mb-1">
                    📝 Summary
                  </h4>
                  <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                    {summaryData.summary}
                  </p>
                </div>

                {/* Key points */}
                <div className="bg-slate-50 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">
                    🔑 Key Points
                  </h4>

                  {(() => {
                    const bullets =
                      summaryData.keyPoints
                        ?.split("\n")
                        .map((line) => line.replace(/^[-•]\s*/, "").trim())
                        .filter(Boolean) || [];

                    return (
                      <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
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
      <footer className="bg-black border-t border-slate-700 mt-4">
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
                assignment using a modern React + Spring Boot stack.
              </p>
            </div>

            {/* Tech stack */}
            <div className="text-xs">
              <h4 className="font-semibold text-slate-100 mb-1">Tech Stack</h4>
              <ul className="space-y-0.5 text-slate-400">
                <li>Frontend: React, Vite, Tailwind CSS, React Query</li>
                <li>Backend: Spring Boot, REST API</li>
                <li>Database: MySQL / PostgreSQL</li>
                <li>Storage: Local file system (extensible to S3)</li>
              </ul>
            </div>

            {/* Usage note */}
            <div className="text-xs">
              <h4 className="font-semibold text-slate-100 mb-1">Notes</h4>
              <ul className="space-y-0.5 text-slate-400">
                <li>Max file size: 100 MB</li>
                <li>Supported types: PDF, MP4, JPG, PNG</li>
                <li>Includes file validation &amp; progress display</li>
                <li>Ready to extend with JWT auth &amp; S3</li>
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
                React, Tailwind CSS, React Query &amp; Spring Boot
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
