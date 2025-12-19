import React, { useState, useEffect } from "react";
import { FaPaperPlane, FaUserCircle } from "react-icons/fa";
// Make sure path matches your project structure
import { getComments, addComment } from "../api/contentApi";

function CommentsSection({ contentId, onCommentAdded }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Fetch comments automatically when this component renders
  useEffect(() => {
    if (contentId) {
      fetchComments();
    }
  }, [contentId]);

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
      // Add new comment to top of list
      setComments([res.data, ...comments]);
      setNewComment("");

      // Notify parent (ContentCard) to increase the number on the icon
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      console.error("Failed to post comment", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4 animate-in slide-in-from-top-2 duration-300">

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-4">
        <input
          type="text"
          className="flex-1 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 rounded-full px-4 py-2 text-sm outline-none transition-all dark:text-white placeholder:text-slate-400"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !newComment.trim()}
          className="p-2 text-sky-600 hover:text-sky-700 disabled:opacity-50 transition-colors"
        >
          {sending ? (
            <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <FaPaperPlane />
          )}
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <p className="text-center text-slate-400 text-xs py-2">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-center text-slate-400 text-xs py-2">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 group">
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
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <FaUserCircle />
                  </div>
                )}
              </div>

              {/* Comment Bubble */}
              <div className="flex-1">
                <div className="bg-slate-100 dark:bg-slate-800/50 px-3 py-2 rounded-2xl rounded-tl-none inline-block max-w-full">
                  <div className="flex items-baseline justify-between gap-4 mb-0.5">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {comment.username}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug break-words">
                    {comment.text}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CommentsSection;