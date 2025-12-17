import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ContentSkeleton = ({ cards = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(cards).fill(0).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">

          {/* Header: Icon + Title */}
          <div className="flex items-start gap-4 mb-4">
            <Skeleton circle width={40} height={40} /> {/* File Icon */}
            <div className="flex-1">
              <Skeleton width="80%" height={20} className="mb-1" /> {/* Title */}
              <Skeleton width="40%" height={15} /> {/* Date/Size */}
            </div>
          </div>

          {/* Body: Description */}
          <div className="mb-4">
            <Skeleton count={2} />
          </div>

          {/* Footer: Buttons */}
          <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Skeleton width={80} height={30} borderRadius={8} />
            <Skeleton width={80} height={30} borderRadius={8} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContentSkeleton;