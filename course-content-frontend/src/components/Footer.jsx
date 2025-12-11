import React from "react";
import { FaGithub, FaTwitter, FaLinkedin, FaHeart, FaCode, FaCloud, FaRocket, FaLayerGroup } from "react-icons/fa";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pt-10 pb-6 mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Section: Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Column 1: Brand & Description */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <FaCode className="text-sky-600" /> LearnHub Content System
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              A robust platform for managing course materials. Upload PDFs, videos, and images, and get instant AI-powered summaries to boost your learning efficiency.
            </p>
          </div>

          {/* Column 2: Tech Stack */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FaLayerGroup className="text-purple-500" /> Powered By
            </h3>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span> React + Vite + Tailwind
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Spring Boot 3
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span> AWS S3 Storage
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> Gemini AI 2.5
              </li>
            </ul>
          </div>

          {/* Column 3: Capabilities */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FaRocket className="text-red-500" /> System Capabilities
            </h3>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <FaCloud className="text-slate-400 text-xs" /> Max file size: 100 MB
              </li>
              <li className="flex items-center gap-2">
                <FaCloud className="text-slate-400 text-xs" /> Supported: PDF, MP4, PNG, JPG
              </li>
              <li className="flex items-center gap-2">
                <FaCloud className="text-slate-400 text-xs" /> Secure cloud storage
              </li>
              <li className="flex items-center gap-2">
                <FaCloud className="text-slate-400 text-xs" /> Real-time progress tracking
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-slate-800 my-6"></div>

        {/* Bottom Section: Copyright & Socials */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">

          <div className="text-sm text-slate-500 dark:text-slate-400">
            © {currentYear} LearnHub. All rights reserved.
          </div>

          <div className="hidden md:flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
            <span>Built with</span>
            <FaHeart className="text-red-500 animate-pulse mx-1" />
            <span>for better learning</span>
          </div>

          <div className="flex gap-5">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors transform hover:scale-110">
              <FaGithub size={20} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-sky-500 transition-colors transform hover:scale-110">
              <FaTwitter size={20} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors transform hover:scale-110">
              <FaLinkedin size={20} />
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}

export default Footer;