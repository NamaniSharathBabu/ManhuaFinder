
import React from 'react';

const SkeletonLoader: React.FC = () => {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden animate-pulse p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <div className="h-6 w-20 bg-slate-800 rounded-full shimmer" />
        <div className="h-8 w-8 bg-slate-800 rounded-full shimmer" />
      </div>
      <div className="space-y-4">
        <div className="h-7 w-3/4 bg-slate-800 rounded-md shimmer" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-800 rounded-md shimmer" />
          <div className="h-4 w-full bg-slate-800 rounded-md shimmer" />
          <div className="h-4 w-5/6 bg-slate-800 rounded-md shimmer" />
        </div>
        <div className="flex gap-2 pt-6">
          <div className="h-9 w-24 bg-slate-800 rounded-lg shimmer" />
          <div className="h-9 w-24 bg-slate-800 rounded-lg shimmer" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
