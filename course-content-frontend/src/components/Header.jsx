import React from "react";
import { Link, useLocation } from "react-router-dom"; // Import useLocation
import { FaCloudUploadAlt, FaMoon, FaSun, FaSignOutAlt, FaUserCircle, FaCog, FaHome, FaColumns } from "react-icons/fa";

function Header({ darkMode, setDarkMode, onLogout, userEmail, onOpenProfile }) {
  const location = useLocation(); // Get current route

  const isActive = (path) => location.pathname === path
    ? "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20"
    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800";

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2 group">
            <div className="bg-sky-600 text-white p-2 rounded-lg shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <FaCloudUploadAlt className="text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">LearnHub</h1>
            </div>
          </Link>

          {/* ✅ CENTER NAVIGATION */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <Link to="/home" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${isActive("/home")}`}>
              <FaHome /> Home
            </Link>
            <Link to="/dashboard" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${isActive("/dashboard")}`}>
              <FaColumns /> Dashboard
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon />}
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

            {userEmail && (
              <button onClick={onOpenProfile} className="hidden sm:flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 transition-all cursor-pointer group">
                <FaUserCircle className="text-slate-400 group-hover:text-sky-500 transition-colors text-lg" />
                <span className="font-medium">{userEmail}</span>
                <FaCog className="text-slate-400 text-xs ml-1 group-hover:rotate-90 transition-transform" />
              </button>
            )}

            <button onClick={onLogout} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Logout">
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;