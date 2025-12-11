import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaTimes, FaUserCircle } from "react-icons/fa";
import { getComments, addComment } from "../api/contentApi";

function CommentsModal({ isOpen, onClose, contentId, onCommentAdded }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const listRef = useRef(null);

  // Fetch comments when modal opens
  useEffect(() => {
    if (isOpen && contentId) {
      fetchComments();
    }
  }, [isOpen, contentId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await getComments(contentId);
      setComments(res.data);
    } catch (error) {
      console.error("Failed to load comments", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSending(true);
    try {
      const res = await addComment(contentId, newComment);
      // Add new comment to the top of the list immediately
      setComments([res.data, ...comments]);
      setNewComment("");

      // ✅ Notify Home to refresh the comment count
      if (onCommentAdded) {
        onCommentAdded();
      }

    } catch (error) {
      console.error("Failed to post comment", error);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-950 w-full max-w-md h-[600px] rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Comments</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <FaTimes />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/20" ref={listRef}>
          {loading ? (
            <p className="text-center text-slate-400 text-sm mt-4">Loading comments...</p>
          ) : comments.length === 0 ? (
            <div className="text-center py-10">
                <p className="text-slate-400 text-sm">No comments yet. Be the first!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                {/* Avatar */}
                <div className="shrink-0">
                   {comment.userAvatar ? (
                     <img
                       src={comment.userAvatar}
                       alt={comment.username}
                       referrerPolicy="no-referrer"
                       className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                     />
                   ) : (
                     <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                        <FaUserCircle />
                     </div>
                   )}
                </div>

                {/* Comment Body */}
                <div className="flex-1 space-y-1">
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{comment.username}</span>
                            <span className="text-[10px] text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{comment.text}</p>
                    </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-3 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex gap-2">
          <input
            type="text"
            className="flex-1 bg-slate-100 dark:bg-slate-900 border-0 rounded-full px-4 text-sm focus:ring-2 focus:ring-sky-500 outline-none dark:text-white placeholder:text-slate-400"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newComment.trim()}
            className="w-10 h-10 bg-sky-600 text-white rounded-full flex items-center justify-center hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {sending ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"/> : <FaPaperPlane className="text-xs ml-0.5" />}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CommentsModal;