interface SpotCardSkeletonProps {
  index?: number;
}

export default function SpotCardSkeleton({ index = 0 }: SpotCardSkeletonProps) {
  return (
    <div
      className="animate-pulse overflow-hidden rounded-xl border border-gray-100 bg-white"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="h-36 w-full bg-gray-200" />
      <div className="p-3">
        <div className="mb-1.5 flex items-center gap-1.5">
          <div className="h-3 w-10 rounded bg-gray-200" />
          <div className="h-3 w-1 rounded bg-gray-200" />
          <div className="h-3 w-8 rounded bg-gray-200" />
        </div>
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="mt-1 h-3 w-full rounded bg-gray-200" />
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-3 w-10 rounded bg-gray-200" />
          <div className="h-3 w-10 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
