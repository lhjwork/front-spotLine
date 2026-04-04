export default function RouteLoading() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-lg px-4 pt-6">
        {/* Header skeleton */}
        <div className="space-y-3">
          <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
          <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
          <div className="flex gap-3">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          </div>
        </div>

        {/* Timeline skeleton */}
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
                {i < 3 && <div className="h-16 w-0.5 bg-gray-200" />}
              </div>
              <div className="flex-1 space-y-2 rounded-xl border border-gray-100 bg-white p-3">
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
