import React from 'react';

export const SkeletonLoader: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4 w-full animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"
        />
      ))}
    </div>
  );
};
