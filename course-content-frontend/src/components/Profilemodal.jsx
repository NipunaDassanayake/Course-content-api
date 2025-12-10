import React, { useState } from "react";
import { FaLock, FaTimes, FaSave } from "react-icons/fa";
import { changePassword } from "../api/contentApi";

function ProfileModal({ isOpen, onClose, userEmail }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // ✅ New State
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    // ✅ Frontend Validation: Check if passwords match
    if (newPassword !== confirmPassword) {
      setMessage({ text: "New passwords do not match!", type: "error" });
      return;
    }

    if (newPassword.length < 6) {
        setMessage({ text: "Password must be at least 6 characters.", type: "error" });
        return;
    }

    setLoading(true);

    try {
      // Send only current and new password to backend
      await changePassword({ currentPassword, newPassword });

      setMessage({ text: "Password updated successfully!", type: "success" });

      // Clear form after delay
      setTimeout(() => {
        onClose();
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setMessage({ text: "", type: "" });
      }, 1500);

    } catch (err) {
      const errorMsg = err.response?.data || "Failed to update password";
      setMessage({ text: typeof errorMsg === 'string' ? errorMsg : "Error updating password", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-950 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FaLock className="text-sky-600" /> Security Settings
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-slate-500 mb-6">
            Update password for: <span className="font-semibold text-slate-700 dark:text-slate-300">{userEmail}</span>
          </p>

          {message.text && (
            <div className={`text-sm p-3 rounded-lg mb-4 text-center border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Current Password</label>
              <input
                type="password"
                required
                placeholder="Enter current password"
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">New Password</label>
              <input
                type="password"
                required
                placeholder="Enter new password"
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            {/* ✅ Confirm Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                placeholder="Re-enter new password"
                className={`w-full p-2.5 rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 outline-none transition-all
                  ${confirmPassword && newPassword !== confirmPassword
                    ? "border-red-300 focus:ring-red-500"
                    : "border-slate-300 dark:border-slate-700 focus:ring-sky-500"
                  }`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2.5 rounded-lg font-semibold shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70 mt-2"
            >
              {loading ? "Updating..." : <><FaSave /> Update Password</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;