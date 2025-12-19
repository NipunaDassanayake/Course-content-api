import React, { useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom"; // ✅ Import useSearchParams
import toast from "react-hot-toast";
import { AnimatePresence } from "framer-motion";

// API
import {
  fetchContents,
  downloadFile,
  getSummary,
  generateSummary,
  toggleLike
} from "../api/contentApi";

// Components
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProfileModal from "../components/ProfileModal";
import ChatModal from "../components/ChatModal";
import ContentSkeleton from "../components/ContentSkeleton";
import ContentCard from "../components/ContentCard"; // ✅ Import new card

import { FaSearch, FaArrowDown } from "react-icons/fa";

function Home() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userEmail = localStorage.getItem("userEmail") || "Guest";

  // ✅ Get query params (e.g., ?openComments=123)
  const [searchParams] = useSearchParams();
  const contentIdToHighlight = searchParams.get("openComments");

  // State
  const [profileOpen, setProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains("dark"));
  const [searchTerm, setSearchTerm] = useState("");

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userAvatar");
    navigate("/");
  };

  // --- QUERY & DATA ---
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useInfiniteQuery({
    queryKey: ["contents"],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await fetchContents(pageParam);
      return res.data;
    },
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.number + 1),
  });

  const allContents = data?.pages.flatMap((page) => page.content) || [];

  const filteredContents = allContents.filter((item) => {
    if (!searchTerm) return true;
    const lowerTerm = searchTerm.toLowerCase();
    return (
      item.fileName?.toLowerCase().includes(lowerTerm) ||
      item.description?.toLowerCase().includes(lowerTerm) ||
      item.uploadedBy?.toLowerCase().includes(lowerTerm)
    );
  });

  // --- MUTATION ---
  const likeMutation = useMutation({
    mutationFn: (id) => toggleLike(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["contents"] });
      const previousData = queryClient.getQueryData(["contents"]);
      queryClient.setQueryData(["contents"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            content: page.content.map((item) =>
              item.id === id
                ? { ...item, likedByCurrentUser: !item.likedByCurrentUser, likeCount: item.likedByCurrentUser ? item.likeCount - 1 : item.likeCount + 1 }
                : item
            ),
          })),
        };
      });
      return { previousData };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(["contents"], context.previousData);
      toast.error("Failed to like post");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["contents"] });
    },
  });

  // --- MODALS STATE ---
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);

  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatFile, setChatFile] = useState({ id: null, name: "" });

  // --- HANDLERS ---
  const handleLike = (id) => likeMutation.mutate(id);
  const handleChat = (item) => { setChatFile({ id: item.id, name: item.fileName }); setChatOpen(true); };

  const handleView = (item) => {
    if (item.fileType === "video/youtube" || item.fileType === "resource/link") {
        window.open(item.fileUrl, "_blank");
        return;
    }
    const type = item.fileType.includes("pdf") ? "pdf" : item.fileType.includes("image") ? "image" : item.fileType.includes("video") ? "video" : "other";
    setPreviewUrl(item.fileUrl);
    setPreviewType(type);
    setPreviewOpen(true);
  };

  const handleDownload = async (item) => {
    if(item.fileType === "resource/link" || item.fileType === "video/youtube") {
        toast.error("Cannot download external links.");
        return;
    }
    const toastId = toast.loading("Downloading...");
    try {
        const res = await downloadFile(item.id);
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", item.fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("Download complete!", { id: toastId });
    } catch(e) { toast.error("Download failed", { id: toastId }); }
  };

  const handleShare = async (item) => {
    const shareData = {
      title: item.fileName,
      text: item.description || `Check out this content: ${item.fileName}`,
      url: item.fileUrl,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.error("Error sharing:", err); }
    } else {
        await navigator.clipboard.writeText(item.fileUrl);
        toast.success("Link copied!");
    }
  };

  const handleSummary = async (item) => {
    if(item.fileType === "resource/link" || item.fileType === "video/youtube") {
        toast.error("AI Summary not supported for external links.");
        return;
    }
    setSummaryOpen(true);
    setSummaryLoading(true);
    setSummaryData(null);
    try {
        let res = await getSummary(item.id);
        if (!res.data.summary) res = await generateSummary(item.id);
        setSummaryData(res.data);
    } catch(e) {
        toast.error("Summary failed");
        setSummaryOpen(false);
    }
    finally { setSummaryLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans">
      <Header
        darkMode={darkMode}
        setDarkMode={toggleDarkMode}
        onLogout={handleLogout}
        userEmail={userEmail}
        onOpenProfile={() => setProfileOpen(true)}
        onSearch={setSearchTerm}
      />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Community Feed</h1>
          <p className="text-slate-500 dark:text-slate-400">Discover what others are learning and sharing.</p>
        </div>

        {/* LOADING & ERROR */}
        {isLoading && <ContentSkeleton cards={4} />}
        {isError && <p className="text-center text-red-500">Failed to load feed.</p>}
        {!isLoading && filteredContents?.length === 0 && searchTerm && (
            <div className="text-center py-12">
                <FaSearch className="text-4xl text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No results found for "{searchTerm}"</p>
                <button onClick={() => setSearchTerm("")} className="text-indigo-600 font-bold mt-2 hover:underline">Clear Search</button>
            </div>
        )}

        {/* FEED LIST */}
        <div className="space-y-8">
          <AnimatePresence>
          {!isLoading && filteredContents?.map((item) => (
             // ✅ USING THE NEW COMPONENT
             <ContentCard
                key={item.id}
                item={item}
                onLike={handleLike}
                onChat={handleChat}
                onSummary={handleSummary}
                onShare={handleShare}
                onDownload={handleDownload}
                onView={handleView}
                // ✅ Highlight Prop
                highlight={contentIdToHighlight && Number(contentIdToHighlight) === item.id}
             />
          ))}
          </AnimatePresence>

          {/* LOAD MORE */}
          {hasNextPage && (
            <div className="flex justify-center pt-4 pb-8">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 px-6 py-3 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-medium disabled:opacity-50"
              >
                {isFetchingNextPage ? "Loading..." : <>Load More <FaArrowDown className="text-xs" /></>}
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* GLOBAL MODALS */}
      <ChatModal isOpen={chatOpen} onClose={() => setChatOpen(false)} fileId={chatFile.id} fileName={chatFile.name} />
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} userEmail={userEmail} />

      {/* PREVIEW MODAL */}
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

      {/* SUMMARY MODAL */}
      {summaryOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[85vh] overflow-y-auto border border-white/10">
            <div className="flex justify-between items-start mb-4">
               <h3 className="text-xl font-bold text-slate-800 dark:text-white">AI Analysis</h3>
               <button onClick={() => setSummaryOpen(false)} className="text-2xl">✕</button>
            </div>
            {summaryLoading ? (
                <p className="text-center py-8">Generating...</p>
            ) : (
              summaryData && (
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
                           <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">
                             <span className="text-emerald-500 font-bold mt-0.5">✅</span>
                             <span className="leading-relaxed">{text}</span>
                           </li>
                         )
                      })}
                    </ul>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;