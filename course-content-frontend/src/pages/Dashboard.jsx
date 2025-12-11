import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast"; // ✅ Import Toast

// Components
import FileUpload from "../components/FileUpload.jsx";
import ContentList from "../components/ContentList.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import ProfileModal from "../components/ProfileModal.jsx";

// API
import {
  fetchMyContents,
  deleteContent,
  generateSummary,
  getSummary,
  downloadFile,
} from "../api/contentApi.js";

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userEmail = localStorage.getItem("userEmail") || "User";

  // --- LOGOUT LOGIC ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  // --- PROFILE MODAL STATE ---
  const [profileOpen, setProfileOpen] = useState(false);

  // --- DATA FETCHING (MY CONTENTS) ---
  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-contents"],
    queryFn: async () => {
      const res = await fetchMyContents();
      return res.data;
    },
  });

  // Dark mode
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [darkMode]);

  // Search & Sort
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");

  const filteredContents = useMemo(() => {
    if (!data) return [];
    let items = [...data];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      items = items.filter(
        (item) =>
          item.fileName?.toLowerCase().includes(term) ||
          item.fileType?.toLowerCase().includes(term)
      );
    }

    items.sort((a, b) => {
      if (sortBy === "name_asc") return (a.fileName || "").localeCompare(b.fileName || "");
      if (sortBy === "size_desc") return (b.fileSize || 0) - (a.fileSize || 0);
      const da = a.uploadDate ? new Date(a.uploadDate) : 0;
      const db = b.uploadDate ? new Date(b.uploadDate) : 0;
      return db - da;
    });

    return items;
  }, [data, searchTerm, sortBy]);

  // Modals state
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [previewFileName, setPreviewFileName] = useState("");

  // --- HANDLERS ---

  const handleDownload = async (item) => {
    const toastId = toast.loading("Downloading..."); // ✅ Toast Loading
    try {
      const res = await downloadFile(item.id);
      const contentType = res.headers["content-type"] || item.fileType || "application/octet-stream";
      const blob = new Blob([res.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", item.fileName || "download");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Download started!", { id: toastId }); // ✅ Toast Success
    } catch (err) {
      console.error(err);
      toast.error("Download failed", { id: toastId }); // ✅ Toast Error
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    const toastId = toast.loading("Deleting content..."); // ✅ Toast Loading
    try {
      await deleteContent(id);
      // ✅ Invalidate 'my-contents' to remove the deleted item from the list
      await queryClient.invalidateQueries({ queryKey: ["my-contents"] });
      toast.success("Content deleted successfully!", { id: toastId }); // ✅ Toast Success
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete file. You may not be the owner.", { id: toastId }); // ✅ Toast Error
    }
  };

  const handleView = (item) => {
    try {
      // Handle Link/YouTube
      if (item.fileType === "video/youtube" || item.fileType === "resource/link") {
        window.open(item.fileUrl, "_blank");
        return;
      }

      const contentType = item.fileType || "application/octet-stream";
      let type = "other";
      if (contentType.includes("pdf")) type = "pdf";
      else if (contentType.startsWith("image/")) type = "image";
      else if (contentType.startsWith("video/")) type = "video";

      setPreviewUrl(item.fileUrl);
      setPreviewType(type);
      setPreviewFileName(item.fileName);
      setPreviewOpen(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to open file"); // ✅ Toast Error
    }
  };

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
        toast.success("Summary generated!"); // ✅ Toast Success
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load AI summary"); // ✅ Toast Error
      setSummaryModalOpen(false);
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-sky-50 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">

      {/* Header with Profile Trigger */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onLogout={handleLogout}
        userEmail={userEmail}
        onOpenProfile={() => setProfileOpen(true)}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left: Upload */}
          <div className="lg:col-span-2">
            {/* ✅ FIXED: Pass onUploadSuccess to refresh the list */}
            <FileUpload onUploadSuccess={() => queryClient.invalidateQueries({ queryKey: ["my-contents"] })} />
          </div>

          {/* Right: Content List (Card with shadow) */}
          <div className="lg:col-span-3 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-slate-800 p-6 flex flex-col h-full transition-all">
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                  My Course Materials
                </h2>
                <span className="bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                  {filteredContents.length} Files
                </span>
              </div>

              {/* Search + Sort */}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search files..."
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm px-4 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none shadow-sm transition-all"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sm:w-40 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm px-4 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none shadow-sm transition-all"
                >
                  <option value="date_desc">Newest</option>
                  <option value="size_desc">Size (Large)</option>
                  <option value="name_asc">Name (A-Z)</option>
                </select>
              </div>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {isError && <p className="text-sm text-red-500 text-center py-4">Error loading files</p>}

            {!isLoading && !isError && (
              <ContentList
                contents={filteredContents}
                onDownload={handleDownload}
                onView={handleView}
                onDelete={handleDelete}
                onShowSummary={handleShowSummary}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />

      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        userEmail={userEmail}
      />

      {/* --- Existing Modals --- */}
      {previewOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-semibold truncate pr-4">{previewFileName}</h3>
              <button onClick={() => setPreviewOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold">✕</button>
            </div>
            <div className="flex-1 bg-slate-100 dark:bg-slate-900 p-2 overflow-auto flex justify-center">
              {previewType === "pdf" && <iframe src={previewUrl} className="w-full h-full min-h-[60vh] rounded-lg bg-white" />}
              {previewType === "image" && <img src={previewUrl} className="max-h-full object-contain rounded-lg" />}
              {previewType === "video" && <video src={previewUrl} controls className="max-h-full rounded-lg" />}
              {previewType === "other" && <p className="self-center text-slate-500">Preview not available. Download to view.</p>}
            </div>
          </div>
        </div>
      )}

      {summaryModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[85vh] overflow-y-auto border border-white/10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">AI Insight</span>
                <h3 className="text-xl font-bold mt-2 text-slate-800 dark:text-white">{summaryData?.fileName}</h3>
              </div>
              <button onClick={() => setSummaryModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold">✕</button>
            </div>

            {summaryLoading && (
               <div className="flex flex-col items-center justify-center py-12 space-y-4">
                 <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                 <p className="text-sm text-slate-500 animate-pulse font-medium">Consulting Gemini AI...</p>
               </div>
            )}

            {!summaryLoading && summaryData && (
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold mb-2 flex items-center gap-2 text-slate-700 dark:text-slate-200">📝 Summary</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{summaryData.summary}</p>
                </div>
                <div>
                  <h4 className="font-bold mb-3 flex items-center gap-2 text-slate-700 dark:text-slate-200">🔑 Key Takeaways</h4>
                  <ul className="space-y-2">
                    {summaryData.keyPoints?.split("\n").map((line, i) => {
                       const text = line.replace(/^[-•]\s*/, "").trim();
                       if(!text) return null;
                       return (
                         <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                           <span className="text-emerald-500 font-bold">✓</span>
                           <span>{text}</span>
                         </li>
                       )
                    })}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;