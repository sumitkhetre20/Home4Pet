import React from 'react';

export const SkeletonLine = ({ className = "" }) => {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-md ${className}`} />
  );
};

export const SkeletonPetCard = () => {
  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm overflow-hidden flex flex-col space-y-4">
      {/* Image Skeleton */}
      <div className="animate-pulse bg-slate-200 dark:bg-slate-700 w-full aspect-[4/5] rounded-xl" />
      
      {/* Title & Badge Skeleton */}
      <div className="flex justify-between items-center">
        <SkeletonLine className="w-1/2 h-6" />
        <SkeletonLine className="w-1/4 h-5" />
      </div>

      {/* Info Rows Skeleton */}
      <div className="space-y-2">
        <SkeletonLine className="w-full h-4" />
        <SkeletonLine className="w-3/4 h-4" />
      </div>

      {/* Footer / CTA Skeleton */}
      <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
        <SkeletonLine className="w-1/3 h-5" />
        <SkeletonLine className="w-1/4 h-8 rounded-full" />
      </div>
    </div>
  );
};

export const SkeletonDetail = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto p-4 md:p-8">
      <div className="lg:col-span-7 space-y-6">
        <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded-3xl w-full aspect-video" />
        <div className="flex space-x-4">
          <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl w-24 h-24" />
          <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl w-24 h-24" />
          <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl w-24 h-24" />
        </div>
        <div className="space-y-4">
          <SkeletonLine className="w-1/3 h-8" />
          <SkeletonLine className="w-full h-4" />
          <SkeletonLine className="w-full h-4" />
          <SkeletonLine className="w-4/5 h-4" />
        </div>
      </div>
      <div className="lg:col-span-5 space-y-6">
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-6">
          <SkeletonLine className="w-1/2 h-8" />
          <SkeletonLine className="w-full h-12 rounded-xl" />
          <SkeletonLine className="w-full h-24 rounded-xl" />
          <SkeletonLine className="w-full h-12 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export default function Skeleton({ type = "card", count = 1 }) {
  const skeletons = Array.from({ length: count });

  if (type === "card") {
    return (
      <div className="pinterest-grid w-full">
        {skeletons.map((_, i) => (
          <SkeletonPetCard key={i} />
        ))}
      </div>
    );
  }

  if (type === "detail") {
    return <SkeletonDetail />;
  }

  return (
    <div className="space-y-2">
      {skeletons.map((_, i) => (
        <SkeletonLine key={i} className="w-full h-4" />
      ))}
    </div>
  );
}
