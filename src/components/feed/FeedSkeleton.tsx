import SpotCardSkeleton from "./SpotCardSkeleton";

export default function FeedSkeleton() {
  return (
    <div>
      {/* Area tabs skeleton */}
      <div className="flex animate-pulse gap-2 overflow-hidden border-b border-gray-100 px-4 py-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-8 w-16 shrink-0 rounded-full bg-gray-200" />
        ))}
      </div>

      {/* Category chips skeleton */}
      <div className="flex animate-pulse flex-wrap gap-2 px-4 py-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-7 w-14 rounded-full bg-gray-200" />
        ))}
      </div>

      {/* Route section skeleton */}
      <div className="animate-pulse px-4 py-4">
        <div className="mb-3 h-6 w-24 rounded bg-gray-200" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="mb-3 h-20 rounded-xl bg-gray-200" />
        ))}
      </div>

      {/* Spot grid skeleton — staggered */}
      <div className="px-4 py-4">
        <div className="mb-3 h-6 w-20 animate-pulse rounded bg-gray-200" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SpotCardSkeleton key={i} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
