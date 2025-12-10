import React from "react";
import { 
  FaFilePdf, 
  FaFileImage, 
  FaFileVideo, 
  FaFileAlt, 
  FaEye, 
  FaDownload, 
  FaRobot, 
  FaTrashAlt 
} from "react-icons/fa";

// Helper to get file type badges and icons
function getFileMeta(fileType) {
  if (!fileType) return { label: "Unknown", color: "bg-slate-100 text-slate-600", icon: <FaFileAlt /> };

  if (fileType.includes("pdf"))
    return { label: "PDF", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: <FaFilePdf className="text-red-500" /> };
  if (fileType.includes("video"))
    return { label: "Video", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400", icon: <FaFileVideo className="text-indigo-500" /> };
  if (fileType.includes("image"))
    return { label: "Image", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: <FaFileImage className="text-emerald-500" /> };

  return { label: "File", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", icon: <FaFileAlt className="text-slate-400" /> };
}

// Reusable Action Button Component
const ActionBtn = ({ onClick, icon, colorClass, title }) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-2 rounded-lg transition-all duration-200 ${colorClass} hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-200 dark:focus:ring-slate-700`}
  >
    {icon}
  </button>
);

function ContentList({ contents, onDownload, onView, onDelete, onShowSummary }) {
  if (!contents.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-3">
          <FaFileAlt className="text-3xl text-slate-300 dark:text-slate-600" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">No files uploaded yet.</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Upload your first document above.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          {/* Table Header */}
          <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200 hidden sm:table-cell">Type</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200 hidden md:table-cell">Size</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200 hidden lg:table-cell">Uploaded</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
            {contents.map((item) => {
              const meta = getFileMeta(item.fileType);

              return (
                <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  
                  {/* File Name + Icon */}
                  <td className="px-4 py-3 max-w-[200px]">
                    <div className="flex items-center gap-3">
                      <div className="text-lg shrink-0">{meta.icon}</div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate" title={item.fileName}>
                          {item.fileName}
                        </span>
                        {/* Mobile-only meta info */}
                        <span className="text-[10px] text-slate-400 sm:hidden">
                          {(item.fileSize / 1024).toFixed(0)} KB • {new Date(item.uploadDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Type Badge */}
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${meta.color}`}>
                      {meta.label}
                    </span>
                  </td>

                  {/* Size */}
                  <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 tabular-nums hidden md:table-cell">
                    {(item.fileSize / 1024 < 1024) 
                      ? `${(item.fileSize / 1024).toFixed(0)} KB` 
                      : `${(item.fileSize / (1024 * 1024)).toFixed(2)} MB`}
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs hidden lg:table-cell">
                    {item.uploadDate ? new Date(item.uploadDate).toLocaleDateString() : "-"}
                  </td>

                  {/* Actions Column (Grouped) */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      
                      {/* View */}
                      <ActionBtn 
                        onClick={() => onView(item)} 
                        title="Preview File"
                        icon={<FaEye />}
                        colorClass="text-sky-600 bg-sky-50 hover:bg-sky-100 dark:bg-sky-900/20 dark:hover:bg-sky-900/40"
                      />

                      {/* Download */}
                      <ActionBtn 
                        onClick={() => onDownload(item)} 
                        title="Download File"
                        icon={<FaDownload />}
                        colorClass="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40"
                      />

                      {/* AI Summary */}
                      <ActionBtn 
                        onClick={() => onShowSummary(item)} 
                        title="Generate AI Summary"
                        icon={<FaRobot />}
                        colorClass="text-purple-600 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40"
                      />

                      <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>

                      {/* Delete */}
                      <ActionBtn 
                        onClick={() => onDelete(item.id)} 
                        title="Delete File"
                        icon={<FaTrashAlt />}
                        colorClass="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      />
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ContentList;