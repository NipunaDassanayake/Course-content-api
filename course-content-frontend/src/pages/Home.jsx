import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchContents, downloadFile, getSummary, generateSummary } from "../api/contentApi";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProfileModal from "../components/ProfileModal";
import ChatModal from "../components/ChatModal";
import {
  FaFilePdf, FaFileAlt, FaRobot, FaDownload,
  FaEye, FaClock, FaFileVideo, FaFileImage,
  FaShareAlt, FaComments
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail") || "Guest";
  const [profileOpen, setProfileOpen] = useState(false);

  // Dark mode
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains("dark"));

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  // Data Fetching
  const { data: contents, isLoading, isError } = useQuery({
    queryKey: ["contents"],
    queryFn: async () => {
      const res = await fetchContents();
      return res.data;
    },
  });

  // --- MODALS STATE ---
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [previewName, setPreviewName] = useState("");

  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatFile, setChatFile] = useState({ id: null, name: "" });

  // --- HANDLERS ---

  const handleChat = (item) => {
    setChatFile({ id: item.id, name: item.fileName });
    setChatOpen(true);
  };

  const handleView = (item) => {
    const type = item.fileType.includes("pdf") ? "pdf" : item.fileType.includes("image") ? "image" : item.fileType.includes("video") ? "video" : "other";
    setPreviewUrl(item.fileUrl);
    setPreviewType(type);
    setPreviewName(item.fileName);
    setPreviewOpen(true);
  };

  const handleDownload = async (item) => {
    try {
        const res = await downloadFile(item.id);
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", item.fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch(e) { alert("Download failed"); }
  };

  const handleShare = async (item) => {
    const shareData = {
      title: item.fileName,
      text: item.description || `Check out this file: ${item.fileName}`,
      url: item.fileUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(item.fileUrl);
        alert("Link copied to clipboard! 📋");
      } catch (err) {
        alert("Failed to copy link.");
      }
    }
  };

  const handleSummary = async (item) => {
    setSummaryOpen(true);
    setSummaryLoading(true);
    setSummaryData(null);
    try {
        let res = await getSummary(item.id);
        if (!res.data.summary) res = await generateSummary(item.id);
        setSummaryData(res.data);
    } catch(e) { alert("Summary failed"); setSummaryOpen(false); }
    finally { setSummaryLoading(false); }
  };

  // Content Preview Helper
  const renderContentPreview = (item) => {
    if (item.fileType?.startsWith("image/")) {
      return (
        <div
          className="w-full h-64 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden cursor-pointer border border-slate-200 dark:border-slate-800 mb-4 group relative"
          onClick={() => handleView(item)}
        >
          <img
            src={item.fileUrl}
            alt={item.fileName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
             <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">View Image</span>
          </div>
        </div>
      );
    }
    if (item.fileType?.startsWith("video/")) {
      return (
        <div className="w-full bg-black rounded-xl overflow-hidden mb-4 border border-slate-200 dark:border-slate-800 relative group">
          <video src={item.fileUrl} className="w-full max-h-[400px] object-contain" controls />
        </div>
      );
    }
    return (
      <div className="flex gap-4 items-start bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors" onClick={() => handleView(item)}>
        <div className="shrink-0">
           {item.fileType?.includes("pdf") ? <FaFilePdf className="text-red-500 text-4xl" /> : <FaFileAlt className="text-slate-400 text-4xl" />}
        </div>
        <div className="min-w-0">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 truncate">{item.fileName}</h4>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide font-medium">{item.fileType?.split('/')[1] || "FILE"}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans">
      <Header
        darkMode={darkMode}
        setDarkMode={toggleDarkMode}
        onLogout={handleLogout}
        userEmail={userEmail}
        onOpenProfile={() => setProfileOpen(true)}
      />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Community Feed</h1>
          <p className="text-slate-500 dark:text-slate-400">Discover what others are learning and sharing.</p>
        </div>

        {isLoading && <p className="text-center text-slate-500">Loading feed...</p>}
        {isError && <p className="text-center text-red-500">Failed to load feed.</p>}

        <div className="space-y-8">
          {!isLoading && contents?.map((item) => (
            <div key={item.id} className="bg-white dark:bg-slate-950 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">

              {/* ✅ Header: User Profile Picture & Date */}
              <div className="flex items-center gap-3 mb-4">

                {/* Logic: Show Image if exists, else show Initial */}
                {item.uploaderImage ? (
                  <img
                    src={item.uploaderImage}
                    alt="Uploader"
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-sm uppercase">
                     {item.uploadedBy ? item.uploadedBy.charAt(0) : "?"}
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                     {item.uploadedBy || "Anonymous User"}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <FaClock className="text-[10px]" />
                    <span>{new Date(item.uploadDate).toLocaleDateString()}</span> •
                    <span>{(item.fileSize / 1024).toFixed(0)} KB</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {item.description && (
                <p className="mb-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </p>
              )}

              {/* Preview */}
              {renderContentPreview(item)}

              {/* Actions */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">

                 {/* Left Side: Preview, Chat & AI */}
                 <div className="flex gap-2">
                    {(!item.fileType?.startsWith("image") && !item.fileType?.startsWith("video")) && (
                      <button onClick={() => handleView(item)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <FaEye /> Preview
                      </button>
                    )}

                    <button onClick={() => handleChat(item)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors">
                        <FaComments /> Chat
                    </button>

                    <button onClick={() => handleSummary(item)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                        <FaRobot /> AI Summary
                    </button>
                 </div>

                 {/* Right Side: Share & Download */}
                 <div className="flex gap-1">
                    <button
                      onClick={() => handleShare(item)}
                      className="p-2 rounded-full text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors"
                      title="Share"
                    >
                      <FaShareAlt />
                    </button>

                    <button
                      onClick={() => handleDownload(item)}
                      className="p-2 rounded-full text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                      title="Download"
                    >
                      <FaDownload />
                    </button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />

      <ChatModal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        fileId={chatFile.id}
        fileName={chatFile.name}
      />

      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} userEmail={userEmail} />

      {/* Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
             <div className="bg-white w-full max-w-5xl h-[80vh] rounded-lg relative flex flex-col bg-slate-900">
                <button onClick={() => setPreviewOpen(false)} className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70 rounded-full w-8 h-8 flex items-center justify-center z-10 transition-colors">✕</button>
                <div className="flex-1 overflow-auto flex items-center justify-center p-2">
                  {previewType === "pdf" && <iframe src={previewUrl} className="w-full h-full rounded bg-white" title="preview"></iframe>}
                  {previewType === "image" && <img src={previewUrl} className="max-h-full max-w-full object-contain" alt="preview" />}
                  {previewType === "video" && <video src={previewUrl} controls className="max-h-full max-w-full" />}
                </div>
             </div>
        </div>
      )}

      {/* Summary Modal */}
      {summaryOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[85vh] overflow-y-auto border border-white/10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">AI Insight</span>
                <h3 className="text-xl font-bold mt-2 text-slate-800 dark:text-white">{summaryData?.fileName || "Analysis Result"}</h3>
              </div>
              <button onClick={() => setSummaryOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold">✕</button>
            </div>
            {summaryLoading ? (
               <div className="flex flex-col items-center justify-center py-12 space-y-4">
                 <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                 <p className="text-sm text-slate-500 animate-pulse font-medium">Consulting Gemini AI...</p>
               </div>
            ) : (
              summaryData && <div className="space-y-6">
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
                         <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">
                           <span className="text-emerald-500 font-bold mt-0.5">✅</span>
                           <span className="leading-relaxed">{text}</span>
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

export default Home;