import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  FaClock, FaHeart, FaRegHeart, FaComment, FaComments,
  FaRobot, FaShareAlt, FaDownload, FaFilePdf, FaFileAlt, FaLink
} from "react-icons/fa";
import CommentsSection from "./CommentsSection";

// Helper to extract YouTube ID
const getYoutubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const ContentCard = ({
  item,
  onLike,
  onChat,
  onSummary,
  onShare,
  onDownload,
  onView,
  highlight // ✅ Prop from Home.jsx to trigger scroll
}) => {
  const [showComments, setShowComments] = useState(false);
  const [localCommentCount, setLocalCommentCount] = useState(item.commentCount || 0);

  // Ref for scrolling
  const cardRef = useRef(null);

  // ✅ Effect: Listen for highlight prop
  useEffect(() => {
    if (highlight) {
      setShowComments(true); // Open accordion

      // Smooth scroll to this card
      setTimeout(() => {
        cardRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 500);
    }
  }, [highlight]);

  // Preview Render Logic
  const renderPreview = () => {
    if (item.fileType === "video/youtube") {
      const videoId = getYoutubeId(item.fileUrl);
      return (
        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden mb-4 border border-slate-200 dark:border-slate-800">
          <iframe
            width="100%" height="100%"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={item.fileName}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    }
    if (item.fileType === "resource/link") {
      return (
        <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="block mb-4 group">
          <div className="flex items-center gap-4 bg-sky-50 dark:bg-sky-900/20 p-4 rounded-xl border border-sky-100 dark:border-slate-800 group-hover:bg-sky-100 dark:group-hover:bg-sky-900/30 transition-colors">
            <div className="bg-sky-500 text-white p-3 rounded-full shrink-0"><FaLink className="text-xl"/></div>
            <div className="overflow-hidden">
              <h4 className="font-bold text-sky-700 dark:text-sky-400 truncate text-sm">{item.fileName}</h4>
              <p className="text-xs text-sky-600/70 dark:text-sky-500 truncate">{item.fileUrl}</p>
            </div>
          </div>
        </a>
      );
    }
    if (item.fileType?.startsWith("image/")) {
      return (
        <div className="w-full h-64 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden cursor-pointer border border-slate-200 dark:border-slate-800 mb-4 group relative" onClick={() => onView(item)}>
          <img src={item.fileUrl} alt={item.fileName} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
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
      <div className="flex gap-4 items-start bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors" onClick={() => onView(item)}>
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
    <motion.div
      ref={cardRef} // ✅ Attach Ref
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={`bg-white dark:bg-slate-950 rounded-2xl p-6 shadow-sm border transition-all duration-500
        ${highlight
          ? "border-sky-500 ring-1 ring-sky-500 shadow-sky-100 dark:shadow-none"
          : "border-slate-200 dark:border-slate-800 hover:shadow-md"
        }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        {item.uploaderImage ? (
          <img src={item.uploaderImage} alt="Uploader" referrerPolicy="no-referrer" className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 object-cover"/>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-sm uppercase">
             {item.uploadedBy ? item.uploadedBy.charAt(0) : "?"}
          </div>
        )}
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.uploadedBy || "Anonymous User"}</h3>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <FaClock className="text-[10px]" />
            <span>{new Date(item.uploadDate).toLocaleDateString()}</span> •
            {item.fileSize > 0 && <span>{(item.fileSize / 1024).toFixed(0)} KB</span>}
          </div>
        </div>
      </div>

      {item.description && (
        <p className="mb-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{item.description}</p>
      )}

      {renderPreview()}

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
         <div className="flex gap-4">
            <button onClick={() => onLike(item.id)} className={`flex items-center gap-1.5 text-sm font-medium transition-transform active:scale-125 duration-200 ${item.likedByCurrentUser ? "text-red-500" : "text-slate-500 hover:text-red-500"}`}>
                {item.likedByCurrentUser ? <FaHeart className="animate-pulse-once" /> : <FaRegHeart />}
                <span>{item.likeCount || 0}</span>
            </button>

            {/* Toggle Comments */}
            <button
                onClick={() => setShowComments(!showComments)}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${showComments ? "text-sky-600" : "text-slate-500 hover:text-sky-600"}`}
            >
                <FaComment />
                <span>{localCommentCount}</span>
            </button>

            <button onClick={() => onChat(item)} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-purple-600 transition-colors">
                <FaComments />
                <span className="hidden sm:inline">Chat</span>
            </button>

            <button onClick={() => onSummary(item)} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors">
                <FaRobot />
                <span className="hidden sm:inline">Summary</span>
            </button>
         </div>

         <div className="flex gap-1">
            <button onClick={() => onShare(item)} className="p-2 rounded-full text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors" title="Share">
              <FaShareAlt />
            </button>

            {item.fileSize > 0 && (
                <button onClick={() => onDownload(item)} className="p-2 rounded-full text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" title="Download">
                <FaDownload />
                </button>
            )}
         </div>
      </div>

      {/* Inline Comments Section */}
      {showComments && (
        <CommentsSection
            contentId={item.id}
            onCommentAdded={() => setLocalCommentCount(prev => prev + 1)}
        />
      )}
    </motion.div>
  );
};

export default ContentCard;