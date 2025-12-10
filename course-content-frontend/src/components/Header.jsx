import React from "react";
import { FaCloudUploadAlt, FaMoon, FaSun, FaSignOutAlt, FaUserCircle, FaCog } from "react-icons/fa";

function Header({ darkMode, setDarkMode, onLogout, userEmail, onOpenProfile }) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <div className="bg-sky-600 text-white p-2 rounded-lg shadow-lg shadow-sky-500/20">
              <FaCloudUploadAlt className="text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                LearnHub
              </h1>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 -mt-1 uppercase tracking-wider">
                Course Manager
              </p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">

            {/* Dark Mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon />}
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

            {/* User Pill (Clickable for Profile) */}
            {userEmail && (
              <button
                onClick={onOpenProfile}
                className="hidden sm:flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 transition-all cursor-pointer group"
                title="Manage Profile"
              >
                <FaUserCircle className="text-slate-400 group-hover:text-sky-500 transition-colors text-lg" />
                <span className="font-medium">{userEmail}</span>
                <FaCog className="text-slate-400 text-xs ml-1 group-hover:rotate-90 transition-transform" />
              </button>
            )}

            {/* Logout */}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Logout"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;