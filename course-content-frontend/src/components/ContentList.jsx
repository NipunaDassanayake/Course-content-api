// src/components/ContentList.jsx
import React from "react";

function ContentList({ contents, onDownload, onView, onDelete, onShowSummary }) {
  if (!contents.length) {
    return (
      <p className="text-sm text-slate-500">
        No files uploaded yet. Upload your first course content on the left.
      </p>
    );
  }

  return (
    <div className="mt-2 overflow-x-auto">
      <table className="min-w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">
              Name
            </th>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">
              Type
            </th>
            <th className="px-3 py-2 text-right font-semibold text-slate-700">
              Size (KB)
            </th>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">
              Uploaded
            </th>
            <th className="px-3 py-2 text-center font-semibold text-slate-700">
              View
            </th>
            <th className="px-3 py-2 text-center font-semibold text-slate-700">
              Download
            </th>
            <th className="px-3 py-2 text-center font-semibold text-slate-700">
              AI Summary
            </th>
            <th className="px-3 py-2 text-center font-semibold text-slate-700">
              Delete
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {contents.map((item) => (
            <tr key={item.id}>
              <td className="px-3 py-2 text-slate-800">
                <span className="line-clamp-1">{item.fileName}</span>
              </td>
              <td className="px-3 py-2 text-slate-600">
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100">
                  {item.fileType}
                </span>
              </td>
              <td className="px-3 py-2 text-right text-slate-700">
                {(item.fileSize / 1024).toFixed(2)}
              </td>
              <td className="px-3 py-2 text-slate-600 text-xs">
                {item.uploadDate
                  ? new Date(item.uploadDate).toLocaleString()
                  : "-"}
              </td>

              {/* View → pass whole item */}
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
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ContentList;
