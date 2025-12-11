import React, { useState, useRef } from "react";
import { FaCloudUploadAlt, FaFilePdf, FaFileImage, FaFileVideo, FaFileAlt, FaTimes, FaCheckCircle, FaLink, FaYoutube } from "react-icons/fa";
import { uploadFile, addContentLink } from "../api/contentApi"; // ✅ Import API functions directly

function FileUpload({ onUploadSuccess }) { // ✅ Renamed prop to onUploadSuccess (to refresh dashboard)
  const [activeTab, setActiveTab] = useState("file"); // 'file' or 'link'

  // File State
  const [file, setFile] = useState(null);

  // Link State
  const [url, setUrl] = useState("");

  // Common State
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const inputRef = useRef(null);

  // --- File Helpers ---
  const getFileIcon = (type) => {
    if (type.includes("pdf")) return <FaFilePdf className="text-red-500 text-2xl" />;
    if (type.includes("image")) return <FaFileImage className="text-emerald-500 text-2xl" />;
    if (type.includes("video")) return <FaFileVideo className="text-indigo-500 text-2xl" />;
    return <FaFileAlt className="text-slate-400 text-2xl" />;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) validateAndSetFile(e.target.files[0]);
  };

  const validateAndSetFile = (selectedFile) => {
    setError("");
    setSuccess(false);
    if (selectedFile.size > 100 * 1024 * 1024) {
      setError("File is too large (Max 100MB)");
      return;
    }
    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  // --- SUBMIT LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setUploading(true);
    setProgress(0);

    try {
      if (activeTab === "file") {
        // 1. Handle File Upload
        if (!file) {
            setError("Please select a file.");
            setUploading(false);
            return;
        }

        await uploadFile(file, description, (event) => {
            if (!event.total) return;
            const percent = Math.round((event.loaded * 100) / event.total);
            setProgress(percent);
        });

      } else {
        // 2. Handle Link Submission
        if (!url) {
            setError("Please enter a valid URL.");
            setUploading(false);
            return;
        }
        // Basic URL validation
        if (!url.startsWith("http")) {
            setError("URL must start with http:// or https://");
            setUploading(false);
            return;
        }

        await addContentLink(url, description);
        setProgress(100);
      }

      // Success Handling
      setSuccess(true);
      setFile(null);
      setUrl("");
      setDescription("");
      if (inputRef.current) inputRef.current.value = "";

      // Trigger parent refresh
      if (onUploadSuccess) onUploadSuccess();

      setTimeout(() => {
        setSuccess(false);
        setProgress(0);
      }, 3000);

    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sticky top-24">

      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b border-slate-100 dark:border-slate-800 pb-1">
        <button
          type="button"
          onClick={() => { setActiveTab("file"); setError(""); setSuccess(false); }}
          className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all ${activeTab === 'file' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
          <FaCloudUploadAlt className="text-lg" /> Upload File
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab("link"); setError(""); setSuccess(false); }}
          className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all ${activeTab === 'link' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
          <FaLink className="text-lg" /> Add Link
        </button>
      </div>

      <form onSubmit={handleSubmit} onDragEnter={activeTab === 'file' ? handleDrag : undefined}>

        {/* --- TAB 1: FILE UPLOAD --- */}
        {activeTab === "file" && (
            <>
                {!file ? (
                <div
                    className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer
                    ${dragActive ? "border-sky-500 bg-sky-50 dark:bg-sky-900/20" : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-900"}`}
                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={() => inputRef.current.click()}
                >
                    <input ref={inputRef} type="file" className="hidden" onChange={handleChange} accept=".pdf,video/mp4,image/jpeg,image/png" />
                    <div className="flex flex-col items-center pointer-events-none">
                    <FaCloudUploadAlt className="text-3xl text-sky-600 mb-2" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Click or Drag file here</p>
                    <p className="text-xs text-slate-400 mt-1">PDF, Video, Image (Max 100MB)</p>
                    </div>
                </div>
                ) : (
                <div className="relative w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                    {getFileIcon(file.type)}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    {!uploading && <button type="button" onClick={removeFile}><FaTimes className="text-slate-500 hover:text-red-500" /></button>}
                    </div>
                    {(uploading || progress > 0) && (
                    <div className="mt-2 w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                    )}
                </div>
                )}
            </>
        )}

        {/* --- TAB 2: LINK INPUT --- */}
        {activeTab === "link" && (
            <div className="mb-4">
                <div className="flex flex-col gap-2">
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex items-center gap-3">
                        <div className="bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm text-red-500">
                            <FaYoutube size={20} />
                        </div>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Paste YouTube or Resource URL here..."
                            className="bg-transparent w-full outline-none text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                            required={activeTab === 'link'}
                        />
                    </div>
                    <p className="text-xs text-slate-400 px-1">Supported: YouTube Videos, Blog Articles, Doc Links</p>
                </div>
            </div>
        )}

        {/* --- COMMON: DESCRIPTION --- */}
        <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description (Optional)</label>
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={activeTab === 'file' ? "Describe this file..." : "What is this link about?"}
                rows="2"
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all resize-none"
                disabled={uploading}
            />
        </div>

        {/* Status Messages */}
        {error && <div className="mt-3 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg text-center">{error}</div>}
        {success && <div className="mt-3 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg flex items-center justify-center gap-2"><FaCheckCircle /> {activeTab === 'file' ? 'Uploaded!' : 'Link Added!'}</div>}

        {/* Submit Button */}
        <button
            type="submit"
            disabled={uploading || (activeTab === 'file' && !file) || (activeTab === 'link' && !url)}
            className="w-full mt-4 bg-sky-600 hover:bg-sky-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/20"
        >
            {uploading ? "Processing..." : (activeTab === 'file' ? "Upload File" : "Add Resource")}
        </button>
      </form>
    </div>
  );
}

export default FileUpload;