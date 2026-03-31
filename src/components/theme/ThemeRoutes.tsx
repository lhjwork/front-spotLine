import RoutePreviewCard from "@/components/shared/RoutePreviewCard";
import type { RoutePreview } from "@/types";

interface ThemeRoutesProps {
  routes: RoutePreview[];
}

export default function ThemeRoutes({ routes }: ThemeRoutesProps) {
  if (routes.length === 0) {
    return (
      <section className="px-4 py-8 text-center">
        <p className="text-sm text-gray-400">아직 등록된 코스가 없습니다</p>
      </section>
    );
  }

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
