import SpotPreviewCard from "@/components/shared/SpotPreviewCard";
import type { SpotDetailResponse } from "@/types";

interface ThemeSpotsProps {
  spots: SpotDetailResponse[];
}

export default function ThemeSpots({ spots }: ThemeSpotsProps) {
  if (spots.length === 0) return null;

  return (
    <section className="px-4 py-4">
      <h2 className="mb-3 text-lg font-bold text-gray-900">추천 Spot</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {spots.map((spot) => (
          <SpotPreviewCard key={spot.id} spot={spot} />
        ))}
      </div>
    </section>
  );
}
