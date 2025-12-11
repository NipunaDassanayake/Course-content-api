import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchContents,
  downloadFile,
  getSummary,
  generateSummary,
  toggleLike
} from "../api/contentApi";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProfileModal from "../components/ProfileModal";
import ChatModal from "../components/ChatModal";
import CommentsModal from "../components/CommentsModal";
import toast from "react-hot-toast"; // ✅ Import Toast
import {
  FaFilePdf, FaFileAlt, FaRobot, FaDownload,
  FaEye, FaClock, FaFileVideo, FaFileImage,
  FaShareAlt, FaComments, FaHeart, FaRegHeart, FaComment, FaLink
} from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";

// Helper to extract YouTube ID
const getYoutubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

function Home() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const userEmail = localStorage.getItem("userEmail") || "Guest";

  // State
  const [profileOpen, setProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains("dark"));

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

  // --- DATA FETCHING ---
  const { data: contents, isLoading, isError } = useQuery({
    queryKey: ["contents"],
    queryFn: async () => {
      const res = await fetchContents();
      return res.data;
    },
  });

  // Like Mutation
  const likeMutation = useMutation({
    mutationFn: (id) => toggleLike(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["contents"]);
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

  const [chatOpen, setChatOpen] = useState(false);
  const [chatFile, setChatFile] = useState({ id: null, name: "" });

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsContentId, setCommentsContentId] = useState(null);

  // Effect: Open Comments from Notification Link
  useEffect(() => {
    const contentIdToOpen = searchParams.get("openComments");
    if (contentIdToOpen) {
      setCommentsContentId(Number(contentIdToOpen));
      setCommentsOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // --- HANDLERS ---
  const handleLike = (id) => likeMutation.mutate(id);
  const handleComments = (id) => { setCommentsContentId(id); setCommentsOpen(true); };
  const handleCommentAdded = () => queryClient.invalidateQueries(["contents"]);
  const handleChat = (item) => { setChatFile({ id: item.id, name: item.fileName }); setChatOpen(true); };

  const handleView = (item) => {
    if (item.fileType === "video/youtube" || item.fileType === "resource/link") {
        window.open(item.fileUrl, "_blank"); // Open links in new tab
        return;
    }
    const type = item.fileType.includes("pdf") ? "pdf" : item.fileType.includes("image") ? "image" : item.fileType.includes("video") ? "video" : "other";
    setPreviewUrl(item.fileUrl);
    setPreviewType(type);
    setPreviewName(item.fileName);
    setPreviewOpen(true);
  };

  const handleDownload = async (item) => {
    // Cannot download external links
    if(item.fileType === "resource/link" || item.fileType === "video/youtube") {
        toast.error("Cannot download external links."); // ✅ Toast Error
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
        toast.success("Download complete!", { id: toastId }); // ✅ Toast Success
    } catch(e) { toast.error("Download failed", { id: toastId }); } // ✅ Toast Error
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
      try {
          await navigator.clipboard.writeText(item.fileUrl);
          toast.success("Link copied to clipboard! 📋"); // ✅ Toast Success
      } catch (err) { toast.error("Failed to copy link."); } // ✅ Toast Error
    }
  };

  const handleSummary = async (item) => {
    if(item.fileType === "resource/link" || item.fileType === "video/youtube") {
        toast.error("AI Summary not supported for external links yet."); // ✅ Toast Error
        return;
    }
    setSummaryOpen(true);
    setSummaryLoading(true);
    setSummaryData(null);
    try {
        let res = await getSummary(item.id);
        if (!res.data.summary) res = await generateSummary(item.id);
        setSummaryData(res.data);
        toast.success("Summary generated!"); // ✅ Toast Success
    } catch(e) {
        toast.error("Summary failed"); // ✅ Toast Error
        setSummaryOpen(false);
    }
    finally { setSummaryLoading(false); }
  };

  // Content Preview Renderer
  const renderContentPreview = (item) => {

    // 1. YouTube Video (Embedded Player)
    if (item.fileType === "video/youtube") {
        const videoId = getYoutubeId(item.fileUrl);
        return (
            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden mb-4 border border-slate-200 dark:border-slate-800">
                <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={item.fileName}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        );
    }

    // 2. Generic Link Card
    if (item.fileType === "resource/link") {
        return (
            <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="block mb-4 group">
                <div className="flex items-center gap-4 bg-sky-50 dark:bg-sky-900/20 p-4 rounded-xl border border-sky-100 dark:border-slate-800 group-hover:bg-sky-100 dark:group-hover:bg-sky-900/30 transition-colors">
                    <div className="bg-sky-500 text-white p-3 rounded-full shrink-0">
                        <FaLink className="text-xl"/>
                    </div>
                    <div className="overflow-hidden">
                        <h4 className="font-bold text-sky-700 dark:text-sky-400 truncate text-sm">{item.fileName}</h4>
                        <p className="text-xs text-sky-600/70 dark:text-sky-500 truncate">{item.fileUrl}</p>
                    </div>
                </div>
            </a>
        );
    }

    // 3. Image
    if (item.fileType?.startsWith("image/")) {
      return (
        <div
          className="w-full h-64 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden cursor-pointer border border-slate-200 dark:border-slate-800 mb-4 group relative"
          onClick={() => handleView(item)}
        >
          <img
            src={item.fileUrl}
            alt={item.fileName}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
             <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">View Image</span>
          </div>
        </div>
      );
    }

    // 4. Native Video Upload
    if (item.fileType?.startsWith("video/")) {
      return (
        <div className="w-full bg-black rounded-xl overflow-hidden mb-4 border border-slate-200 dark:border-slate-800 relative group">
          <video src={item.fileUrl} className="w-full max-h-[400px] object-contain" controls />
        </div>
      );
    }

    // 5. Default File (PDF/Doc)
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

              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
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
                    {/* Hide size for links */}
                    {item.fileSize > 0 && <span>{(item.fileSize / 1024).toFixed(0)} KB</span>}
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

                 <div className="flex gap-4">
                    <button
                      onClick={() => handleLike(item.id)}
                      className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${item.likedByCurrentUser ? "text-red-500" : "text-slate-500 hover:text-red-500"}`}
                    >
                        {item.likedByCurrentUser ? <FaHeart /> : <FaRegHeart />}
                        <span>{item.likeCount || 0}</span>
                    </button>

                    <button
                      onClick={() => handleComments(item.id)}
                      className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-sky-600 transition-colors"
                    >
                        <FaComment />
                        <span>{item.commentCount || 0}</span>
                    </button>

                    <button onClick={() => handleChat(item)} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-purple-600 transition-colors">
                        <FaComments />
                        <span className="hidden sm:inline">Chat</span>
                    </button>

                    <button onClick={() => handleSummary(item)} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors">
                        <FaRobot />
                        <span className="hidden sm:inline">Summary</span>
                    </button>
                 </div>

                 <div className="flex gap-1">
                    <button onClick={() => handleShare(item)} className="p-2 rounded-full text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors" title="Share">
                      <FaShareAlt />
                    </button>

                    {/* Hide download button for links */}
                    {item.fileSize > 0 && (
                        <button onClick={() => handleDownload(item)} className="p-2 rounded-full text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" title="Download">
                        <FaDownload />
                        </button>
                    )}
                 </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />

      <ChatModal isOpen={chatOpen} onClose={() => setChatOpen(false)} fileId={chatFile.id} fileName={chatFile.name} />
      <CommentsModal isOpen={commentsOpen} onClose={() => setCommentsOpen(false)} contentId={commentsContentId} onCommentAdded={handleCommentAdded} />
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} userEmail={userEmail} />

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