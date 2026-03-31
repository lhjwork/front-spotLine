import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SpotPreviewCard from "@/components/shared/SpotPreviewCard";
import type { SpotDetailResponse } from "@/types";

interface CitySpotsProps {
  spots: SpotDetailResponse[];
  cityArea: string;
}

export default function CitySpots({ spots, cityArea }: CitySpotsProps) {
  if (spots.length === 0) {
    return (
      <section className="px-4 py-8 text-center">
        <p className="text-sm text-gray-400">아직 등록된 Spot이 없습니다</p>
      </section>
    );
  }

  return (
    <section className="px-4 py-4">
      <h2 className="mb-3 text-lg font-bold text-gray-900">인기 Spot</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {spots.map((spot) => (
          <SpotPreviewCard key={spot.id} spot={spot} />
        ))}
      </div>
      <Link
        href={`/feed?area=${encodeURIComponent(cityArea)}`}
        className="mt-4 flex items-center justify-center gap-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
      >
        더 보기
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
