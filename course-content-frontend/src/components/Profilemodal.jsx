import React, { useState, useRef, useEffect } from "react";
import { FaTimes, FaSave, FaUserCircle, FaCamera } from "react-icons/fa";
import { changePassword, updateProfilePicture } from "../api/contentApi";
import toast from "react-hot-toast";

function ProfileModal({ isOpen, onClose, userEmail }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [uploadingImg, setUploadingImg] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize state from localStorage
  const [userAvatar, setUserAvatar] = useState(null);

  // Sync avatar with localStorage when modal opens
  useEffect(() => {
    if (isOpen) {
      const storedAvatar = localStorage.getItem("userAvatar");
      if (storedAvatar && storedAvatar !== "null") {
        setUserAvatar(storedAvatar);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImg(true);
    const toastId = toast.loading("Updating profile picture...");

    const formData = new FormData();
    formData.append("file", file);

    try {
        const res = await updateProfilePicture(formData);
        // Backend returns the string URL directly
        const newUrl = res.data;

        // 1. Update Local Storage
        localStorage.setItem("userAvatar", newUrl);

        // 2. Update Local State (Immediate Preview)
        setUserAvatar(newUrl);

        toast.success("Profile picture updated!", { id: toastId });

        // 3. Reload to update Header/Other components
        // (Ideally use React Context in the future to avoid reload)
        setTimeout(() => window.location.reload(), 1000);

    } catch (err) {
        console.error(err);
        toast.error("Failed to upload image.", { id: toastId });
    } finally {
        setUploadingImg(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (newPassword.length < 6) {
        toast.error("Password must be at least 6 characters.");
        return;
    }

    setLoading(true);
    const toastId = toast.loading("Updating password...");

    try {
      // ✅ Payload matches Java DTO: { currentPassword: "...", newPassword: "..." }
      await changePassword({
        currentPassword: currentPassword,
        newPassword: newPassword
      });

      toast.success("Password updated successfully!", { id: toastId });

      // Close modal and clear fields after success
      setTimeout(() => {
        onClose();
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }, 1000);

    } catch (err) {
      console.error(err);
      // Handle specific backend error messages if available
      const errMsg = err.response?.data || "Failed to update password. Check current password.";
      toast.error(errMsg, { id: toastId });
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
            Settings
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <FaTimes />
          </button>
        </div>

        <div className="p-6">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
              {userAvatar ? (
                 <img src={userAvatar} referrerPolicy="no-referrer" className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800 object-cover shadow-sm" alt="Profile" />
              ) : (
                 <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-4xl text-slate-400">
                    <FaUserCircle />
                 </div>
              )}
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 {uploadingImg ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                 ) : (
                    <FaCamera className="text-white text-xl drop-shadow-md" />
                 )}
              </div>
            </div>
            {/* Hidden File Input */}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange}/>

            <p className="mt-3 font-semibold text-slate-700 dark:text-slate-200">{userEmail}</p>
            <p className="text-xs text-slate-500">Click image to update</p>
          </div>

          <hr className="mb-6 border-slate-100 dark:border-slate-800" />

          {/* Password Change Form */}
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Current Password</label>
              <input
                type="password"
                required
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">New Password</label>
              <input
                type="password"
                required
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                className={`w-full p-2.5 rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 outline-none transition-all ${confirmPassword && newPassword !== confirmPassword ? "border-red-300 focus:ring-red-500" : "border-slate-300 dark:border-slate-700 focus:ring-sky-500"}`}
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