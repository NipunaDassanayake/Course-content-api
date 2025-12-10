import React, { useState, useRef } from "react";
import { FaCloudUploadAlt, FaFilePdf, FaFileImage, FaFileVideo, FaFileAlt, FaTimes, FaCheckCircle } from "react-icons/fa";

function FileUpload({ onUpload }) {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState(""); // ✅ State for description
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const inputRef = useRef(null);

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
    setDescription(""); // Reset description
    setError("");
    setSuccess(false);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError("");

    try {
      // ✅ Pass description to onUpload
      await onUpload(file, description, (event) => {
        if (!event.total) return;
        const percent = Math.round((event.loaded * 100) / event.total);
        setProgress(percent);
      });

      setSuccess(true);
      setFile(null);
      setDescription("");
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
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <FaCloudUploadAlt className="text-sky-600" />
          Upload Content
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Supported: PDF, MP4, JPG, PNG (Max 100MB)</p>
      </div>

      <form onSubmit={handleSubmit} onDragEnter={handleDrag}>
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

        {/* ✅ Description Input */}
        <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description (Optional)</label>
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this file about?"
                rows="2"
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all resize-none"
                disabled={uploading}
            />
        </div>

        {error && <div className="mt-3 text-xs text-red-600 bg-red-50 p-2 rounded-lg text-center">{error}</div>}
        {success && <div className="mt-3 text-xs text-emerald-600 bg-emerald-50 p-2 rounded-lg flex items-center justify-center gap-2"><FaCheckCircle /> Uploaded!</div>}

        {file && !success && (
          <button type="submit" disabled={uploading} className="w-full mt-3 bg-sky-600 hover:bg-sky-700 text-white py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-70">
            {uploading ? "Uploading..." : "Upload File"}
          </button>
        )}
      </form>
    </div>
  );
}

export default FileUpload;