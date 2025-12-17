import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaMoon, FaSun, FaSignOutAlt, FaUserCircle, FaCog, FaHome, FaColumns, FaBell, FaSearch } from "react-icons/fa";
import logo from "../assets/lernLogo.png";
import { getUnreadCount } from "../api/contentApi"; // ✅ Import API
import NotificationsModal from "./NotificationsModal"; // ✅ Import Modal

function Header({ darkMode, setDarkMode, onLogout, userEmail, onOpenProfile, onSearch }) {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);

  // Get Avatar URL from local storage
  const userAvatar = localStorage.getItem("userAvatar");

  // Helper to check active route
  const isActive = (path) => location.pathname === path
    ? "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20"
    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800";

  // ✅ Poll for unread notifications every 30 seconds
  useEffect(() => {
    if (userEmail) {
        fetchCount();
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }
  }, [userEmail]);

  const fetchCount = async () => {
    try {
        const res = await getUnreadCount();
        setUnreadCount(res.data);
    } catch(e) {
        console.error("Failed to fetch notification count");
    }
  };

  const handleCloseNotifications = () => {
    setNotifOpen(false);
    fetchCount(); // Refresh count after closing (in case user marked some as read)
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">

            {/* 1. Logo Section */}
            <Link to="/home" className="flex items-center gap-3 group shrink-0">
              <img
                src={logo}
                alt="LearnHub Logo"
                className="h-10 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-sm"
              />
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight hidden sm:block">LearnHub</h1>
              </div>
            </Link>

            {/* 2. Navigation (Hidden on mobile) */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
              <Link to="/home" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${isActive("/home")}`}>
                <FaHome /> Home
              </Link>
              <Link to="/dashboard" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${isActive("/dashboard")}`}>
                <FaColumns /> Dashboard
              </Link>
            </nav>

            {/* 3. ✨ NEW: Search Bar (Visible if onSearch prop is passed) */}
            {onSearch && (
              <div className="flex-1 max-w-md hidden lg:block">
                <div className="relative group">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search contents..."
                    onChange={(e) => onSearch(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-full py-2 pl-10 pr-4 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 focus:bg-white dark:focus:bg-black transition-all outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            {/* 4. Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon />}
              </button>

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

              {/* Notification Bell */}
              {userEmail && (
                  <button
                    onClick={() => setNotifOpen(true)}
                    className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Notifications"
                  >
                      <FaBell className="text-lg" />
                      {unreadCount > 0 && (
                          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-950">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                      )}
                  </button>
              )}

              {userEmail && (
                <button onClick={onOpenProfile} className="hidden sm:flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 transition-all cursor-pointer group">
                  {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt="Profile"
                        referrerPolicy="no-referrer"
                        className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-600 object-cover"
                      />
                  ) : (
                      <FaUserCircle className="text-slate-400 group-hover:text-sky-500 transition-colors text-lg" />
                  )}
                  <span className="font-medium max-w-[80px] truncate">{userEmail.split('@')[0]}</span>
                  <FaCog className="text-slate-400 text-xs ml-1 group-hover:rotate-90 transition-transform" />
                </button>
              )}

              <button onClick={onLogout} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Logout">
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </div>

        {/* ✨ Mobile Search Bar (Only shows on small screens if onSearch exists) */}
        {onSearch && (
          <div className="lg:hidden px-4 pb-3 animate-in slide-in-from-top-2">
             <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  onChange={(e) => onSearch(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-white"
                />
             </div>
          </div>
        )}
      </header>

      {/* Mount Notification Modal */}
      <NotificationsModal isOpen={notifOpen} onClose={handleCloseNotifications} />
    </>
  );
}

export default Header;