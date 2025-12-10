import React, { useState, useRef } from "react";
import { 
  FaCloudUploadAlt, 
  FaFilePdf, 
  FaFileImage, 
  FaFileVideo, 
  FaFileAlt, 
  FaTimes, 
  FaCheckCircle 
} from "react-icons/fa";

function FileUpload({ onUpload }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const inputRef = useRef(null);

  // Helper: Get icon based on file type
  const getFileIcon = (type) => {
    if (type.includes("pdf")) return <FaFilePdf className="text-red-500 text-2xl" />;
    if (type.includes("image")) return <FaFileImage className="text-emerald-500 text-2xl" />;
    if (type.includes("video")) return <FaFileVideo className="text-indigo-500 text-2xl" />;
    return <FaFileAlt className="text-slate-400 text-2xl" />;
  };

  // Drag Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError("");
    setSuccess(false);
    
    // Max size 100MB
    if (selectedFile.size > 100 * 1024 * 1024) {
      setError("File is too large (Max 100MB)");
      return;
    }
    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
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
      await onUpload(file, (event) => {
        if (!event.total) return;
        const percent = Math.round((event.loaded * 100) / event.total);
        setProgress(percent);
      });

      setSuccess(true);
      setFile(null);
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
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Supported: PDF, MP4, JPG, PNG (Max 100MB)
        </p>
      </div>

      <form onSubmit={handleSubmit} onDragEnter={handleDrag}>
        {/* Drag & Drop Zone */}
        {!file ? (
          <div
            className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer
              ${dragActive 
                ? "border-sky-500 bg-sky-50 dark:bg-sky-900/20" 
                : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-900"
              }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current.click()}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={handleChange}
              accept=".pdf,video/mp4,image/jpeg,image/png"
            />
            
            <div className="flex flex-col items-center pointer-events-none">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-3">
                <FaCloudUploadAlt className="text-2xl text-sky-600" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Click to upload
              </p>
              <p className="text-xs text-slate-500 mt-1">
                or drag and drop file here
              </p>
            </div>
          </div>
        ) : (
          // File Selected Preview
          <div className="relative w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              {getFileIcon(file.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              {!uploading && (
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <FaTimes className="text-slate-500" />
                </button>
              )}
            </div>

            {/* Progress Bar */}
            {(uploading || progress > 0) && (
              <div className="mt-3">
                <div className="flex justify-between text-[10px] mb-1 text-slate-500 font-medium">
                  <span>{uploading ? "Uploading..." : "Completed"}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-sky-600 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-3 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-100 dark:border-red-900 text-center">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mt-3 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900 flex items-center justify-center gap-2">
            <FaCheckCircle /> File uploaded successfully!
          </div>
        )}

        {/* Action Button */}
        {file && !success && (
          <button
            type="submit"
            disabled={uploading}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-lg
                       bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-md shadow-sky-500/20
                       transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Uploading...
              </>
            ) : (
              <>Upload File</>
            )}
          </button>
        )}
      </form>
    </div>
  );
}

export default FileUpload;