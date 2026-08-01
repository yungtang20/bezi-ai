// [AI MOD] Skeleton loading components for lazy-loaded pages — 內部使用，不 export

function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-zen-card/60 rounded-2xl p-6 border border-white/5 animate-pulse ${className}`}>
      <div className="h-4 bg-white/5 rounded w-1/3 mb-4" />
      <div className="h-3 bg-white/5 rounded w-full mb-2" />
      <div className="h-3 bg-white/5 rounded w-5/6 mb-2" />
      <div className="h-3 bg-white/5 rounded w-2/3" />
    </div>
  );
}

function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-3 bg-white/5 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

function SkeletonChart({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-zen-card/60 rounded-2xl p-6 border border-white/5 animate-pulse ${className}`}>
      <div className="h-4 bg-white/5 rounded w-1/4 mb-6 mx-auto" />
      <div className="flex justify-center gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 min-w-[70px]">
            <div className="h-3 bg-white/5 rounded w-12" />
            <div className="h-3 bg-white/5 rounded w-8" />
            <div className="w-10 h-10 bg-white/5 rounded-lg" />
            <div className="w-10 h-10 bg-white/5 rounded-lg" />
            <div className="w-10 h-6 bg-white/5 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonPage({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full max-w-4xl mx-auto space-y-6 px-4 md:px-0 ${className}`}>
      <SkeletonCard className="h-32" />
      <SkeletonChart />
      <SkeletonCard className="h-48" />
      <SkeletonText lines={4} />
    </div>
  );
}
