import React from "react";
import { FaReact, FaJava, FaAws, FaGoogle } from "react-icons/fa";
import { SiSpringboot, SiTailwindcss } from "react-icons/si";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pt-10 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Column 1: Brand Info */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
              LearnHub Content System
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              A robust platform for managing course materials. Upload PDFs, videos,
              and images, and get instant AI-powered summaries to boost your learning efficiency.
            </p>
          </div>

          {/* Column 2: Tech Stack (with icons) */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
              Powered By
            </h3>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <FaReact className="text-sky-400" /> React + Vite + Tailwind
              </li>
              <li className="flex items-center gap-2">
                <SiSpringboot className="text-green-500" /> Spring Boot 3
              </li>
              <li className="flex items-center gap-2">
                <FaAws className="text-orange-500" /> AWS S3 Storage
              </li>
              <li className="flex items-center gap-2">
                <FaGoogle className="text-blue-500" /> Gemini AI 2.5
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Info */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
              System Capabilities
            </h3>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li>• Max file size: 100 MB</li>
              <li>• Supported: PDF, MP4, PNG, JPG</li>
              <li>• Secure cloud storage</li>
              <li>• Real-time progress tracking</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            &copy; {currentYear} Silverline Task. All rights reserved.
          </p>
          <div className="flex gap-4">
            <span className="text-xs font-medium text-slate-400 hover:text-sky-600 cursor-pointer transition">Privacy</span>
            <span className="text-xs font-medium text-slate-400 hover:text-sky-600 cursor-pointer transition">Terms</span>
            <span className="text-xs font-medium text-slate-400 hover:text-sky-600 cursor-pointer transition">Contact</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;