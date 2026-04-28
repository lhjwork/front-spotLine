import Link from "next/link";
import SpotPreviewCard from "@/components/shared/SpotPreviewCard";
import type { SpotDetailResponse } from "@/types";

interface LatestSpotsSectionProps {
  spots: SpotDetailResponse[];
}

export default function LatestSpotsSection({ spots }: LatestSpotsSectionProps) {
  if (spots.length === 0) return null;

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">새로 추가된 Spot</h2>
          <Link href="/feed" className="text-sm text-blue-600 hover:underline">
            전체 보기 &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {spots.map((spot) => (
            <SpotPreviewCard key={spot.id} spot={spot} />
          ))}
        </div>
      </div>
    </section>
  );
}
