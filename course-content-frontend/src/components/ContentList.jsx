// src/components/ContentList.jsx
import React from "react";

function getTypeLabel(fileType) {
  if (!fileType) return { label: "Unknown", color: "bg-slate-100" };

  if (fileType.includes("pdf"))
    return { label: "PDF", color: "bg-red-100 text-red-700" };
  if (fileType.includes("video"))
    return { label: "Video", color: "bg-indigo-100 text-indigo-700" };
  if (fileType.includes("image"))
    return { label: "Image", color: "bg-emerald-100 text-emerald-700" };

  return { label: fileType, color: "bg-slate-100 text-slate-700" };
}

function ContentList({ contents, onDownload, onView, onDelete, onShowSummary }) {
  if (!contents.length) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
        No files uploaded yet. Upload your first course content on the left.
      </p>
    );
  }

  return (
    <div className="mt-2 overflow-x-auto">
      <table className="min-w-full text-sm border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">
              Name
            </th>
            <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">
              Type
            </th>
            <th className="px-3 py-2 text-right font-semibold text-slate-700 dark:text-slate-200">
              Size (KB)
            </th>
            <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">
              Uploaded
            </th>
            <th className="px-3 py-2 text-center font-semibold text-slate-700 dark:text-slate-200">
              View
            </th>
            <th className="px-3 py-2 text-center font-semibold text-slate-700 dark:text-slate-200">
              Download
            </th>
            <th className="px-3 py-2 text-center font-semibold text-slate-700 dark:text-slate-200">
              AI Summary
            </th>
            <th className="px-3 py-2 text-center font-semibold text-slate-700 dark:text-slate-200">
              Delete
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950">
          {contents.map((item) => {
            const typeInfo = getTypeLabel(item.fileType);

            return (
              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60">
                <td className="px-3 py-2 text-slate-800 dark:text-slate-100 max-w-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {item.fileType?.includes("pdf") && "📄"}
                      {item.fileType?.includes("video") && "🎬"}
                      {item.fileType?.includes("image") && "🖼️"}
                      {!item.fileType && "📁"}
                    </span>
                    <span className="line-clamp-1">{item.fileName}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                  <span
                    className={`text-[11px] px-2 py-1 rounded-full inline-flex items-center gap-1 ${typeInfo.color}`}
                  >
                    {typeInfo.label}
                  </span>
                </td>
                <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-200">
                  {(item.fileSize / 1024).toFixed(2)}
                </td>
                <td className="px-3 py-2 text-slate-600 dark:text-slate-300 text-xs">
                  {item.uploadDate
                    ? new Date(item.uploadDate).toLocaleString()
                    : "-"}
                </td>

                {/* View */}
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => onView(item)}
                    className="inline-flex items-center px-3 py-1.5 rounded-md
                               bg-sky-600 text-white text-xs font-medium
                               hover:bg-sky-700 focus:outline-none
                               focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                  >
                    View
                  </button>
                </td>

                {/* Download */}
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => onDownload(item)}
                    className="inline-flex items-center px-3 py-1.5 rounded-md
                               bg-emerald-600 text-white text-xs font-medium
                               hover:bg-emerald-700 focus:outline-none
                               focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    Download
                  </button>
                </td>

                {/* AI Summary */}
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => onShowSummary(item)}
                    className="inline-flex items-center px-3 py-1.5 rounded-md
                               bg-purple-600 text-white text-xs font-medium
                               hover:bg-purple-700 focus:outline-none
                               focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    AI Summary
                  </button>
                </td>

                {/* Delete */}
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => onDelete(item.id)}
                    className="inline-flex items-center px-3 py-1.5 rounded-md
                               bg-red-600 text-white text-xs font-medium
                               hover:bg-red-700 focus:outline-none
                               focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ContentList;
