// src/components/FileUpload.jsx
import React, { useState } from "react";

function FileUpload({ onUpload }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      await onUpload(file, (event) => {
        if (!event.total) return;
        const percent = Math.round((event.loaded * 100) / event.total);
        setProgress(percent);
      });

      setFile(null);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setTimeout(() => setProgress(0), 500);
      setUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-4">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">
        Upload Course Content
      </h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Supported: PDF, MP4, JPG, PNG · Max 100 MB
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-slate-900 dark:text-slate-100
                     file:mr-4 file:py-2 file:px-3
                     file:rounded-md file:border-0
                     file:text-sm file:font-semibold
                     file:bg-sky-600 file:text-white
                     hover:file:bg-sky-700"
        />

        {file && (
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Selected: <span className="font-medium">{file.name}</span>{" "}
            ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}

        <button
          type="submit"
          disabled={!file || uploading}
          className="w-full inline-flex items-center justify-center px-4 py-2
                     rounded-md text-sm font-medium
                     bg-sky-600 text-white
                     hover:bg-sky-700
                     disabled:opacity-60 disabled:cursor-not-allowed
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>

        {uploading && (
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500 dark:text-slate-400">Uploading…</span>
              <span className="text-slate-700 dark:text-slate-200">
                {progress}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-[width] duration-150"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default FileUpload;
