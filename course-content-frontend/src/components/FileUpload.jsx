import React, { useState } from "react";

const MAX_SIZE_MB = 100;
const ALLOWED_TYPES = [
  "application/pdf",
  "video/mp4",
  "image/jpeg",
  "image/png",
];

function FileUpload({ onUpload }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const handleChange = (e) => {
    setError("");
    setProgress(0);
    const selected = e.target.files[0];
    if (!selected) return;

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError("Invalid file type. Only PDF, MP4, JPG, PNG allowed.");
      setFile(null);
      return;
    }

    const sizeMb = selected.size / (1024 * 1024);
    if (sizeMb > MAX_SIZE_MB) {
      setError("File is too large. Max 100MB.");
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a valid file.");
      return;
    }

    setError("");
    setProgress(0);

    await onUpload(file, (event) => {
      if (!event.total) return;
      const percent = Math.round((event.loaded * 100) / event.total);
      setProgress(percent);
    });

    setFile(null);
    setProgress(0);
    e.target.reset();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <h2 className="text-lg font-semibold text-slate-800 mb-3">
        Upload Course Content
      </h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Select file
          </label>
          <input
            type="file"
            onChange={handleChange}
            className="block w-full text-sm text-slate-700
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
          />
          <p className="mt-1 text-xs text-slate-500">
            Allowed: PDF, MP4, JPG, PNG. Max {MAX_SIZE_MB}MB.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        {progress > 0 && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-600">Uploading...</span>
              <span className="text-xs text-slate-600">{progress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 rounded-lg
                     bg-blue-600 text-white text-sm font-medium
                     hover:bg-blue-700 focus:outline-none
                     focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Upload
        </button>
      </form>
    </div>
  );
}

export default FileUpload;
