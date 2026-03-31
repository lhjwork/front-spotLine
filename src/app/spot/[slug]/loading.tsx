export default function SpotLoading() {
  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Hero skeleton */}
      <div
        className="relative h-64 w-full animate-pulse bg-gray-200 md:h-80"
        style={{ animationDelay: "0ms" }}
      />

      {/* Info card skeleton — mirrors SpotHero -mt-16 card */}
      <div className="relative -mt-16 px-4">
        <div
          className="animate-pulse rounded-2xl bg-white p-4 shadow-sm"
          style={{ animationDelay: "150ms" }}
        >
          <div className="mb-1 flex items-center gap-2">
            <div className="h-5 w-12 rounded-full bg-gray-200" />
            <div className="h-4 w-16 rounded bg-gray-200" />
          </div>
          <div className="mb-1 h-7 w-3/4 rounded bg-gray-200" />
          <div className="h-4 w-1/2 rounded bg-gray-200" />
          <div className="mt-3 flex gap-1.5">
            <div className="h-5 w-14 rounded-full bg-gray-100" />
            <div className="h-5 w-12 rounded-full bg-gray-100" />
            <div className="h-5 w-16 rounded-full bg-gray-100" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg space-y-4 px-4 pt-4">
        {/* CrewNote skeleton */}
        <div
          className="animate-pulse rounded-2xl border border-blue-100 bg-blue-50/50 p-4"
          style={{ animationDelay: "300ms" }}
        >
          <div className="h-4 w-24 rounded bg-blue-100" />
          <div className="mt-2 h-4 w-full rounded bg-blue-100" />
        </div>

        {/* PlaceInfo skeleton */}
        <div
          className="animate-pulse space-y-3 rounded-2xl border border-gray-100 bg-white p-4"
          style={{ animationDelay: "450ms" }}
        >
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-4 w-48 rounded bg-gray-200" />
          <div className="h-4 w-40 rounded bg-gray-200" />
        </div>

        {/* Gallery skeleton */}
        <div
          className="animate-pulse"
          style={{ animationDelay: "600ms" }}
        >
          <div className="h-4 w-12 rounded bg-gray-200" />
          <div className="mt-3 grid grid-cols-3 gap-1.5 overflow-hidden rounded-xl">
            <div className="col-span-2 row-span-2 aspect-square bg-gray-200" />
            <div className="aspect-square bg-gray-200" />
            <div className="aspect-square bg-gray-200" />
          </div>
        </div>
      </div>

      {/* BottomBar spacer */}
      <div className="h-16" />
    </main>
  );
}
