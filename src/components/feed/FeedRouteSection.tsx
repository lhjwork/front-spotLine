import RoutePreviewCard from "@/components/shared/RoutePreviewCard";
import type { RoutePreview } from "@/types";

interface FeedRouteSectionProps {
  routes: RoutePreview[];
}

export default function FeedRouteSection({ routes }: FeedRouteSectionProps) {
  if (routes.length === 0) return null;

  return (
    <section className="px-4 py-4">
      <h2 className="mb-3 text-lg font-bold text-gray-900">인기 Route</h2>
      <div className="flex flex-col gap-3">
        {routes.map((route) => (
          <RoutePreviewCard key={route.id} route={route} />
        ))}
      </div>
    </section>
  );
}
