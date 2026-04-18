"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { fetchSimilarSpots, logRecommendationEvent } from "@/lib/api";
import OptimizedImage from "@/components/common/OptimizedImage";
import type { RecommendedSpot } from "@/types";

interface SimilarSpotsProps {
  spotId: string;
}

export default function SimilarSpots({ spotId }: SimilarSpotsProps) {
  const [spots, setSpots] = useState<RecommendedSpot[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchSimilarSpots(spotId, 6)
      .then((data) => {
        setSpots(data);
        if (data.length > 0) {
          logRecommendationEvent("impression", "similar_spot", spotId);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [spotId]);

  if (!loaded || spots.length === 0) return null;

  return (
    <section className="mt-6 mb-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">비슷한 장소</h2>
      <div className="grid grid-cols-2 gap-3">
        {spots.map((spot) => (
          <Link
            key={spot.id}
            href={`/spot/${spot.slug}`}
            onClick={() => logRecommendationEvent("click", "similar_spot", spot.id)}
            className="overflow-hidden rounded-xl bg-white shadow-sm"
          >
            <div className="relative h-24 w-full bg-gray-100">
              {spot.coverImageUrl ? (
                <OptimizedImage
                  src={spot.coverImageUrl}
                  alt={spot.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <MapPin className="h-5 w-5 text-gray-300" />
                </div>
              )}
            </div>
            <div className="p-2">
              <p className="truncate text-sm font-medium text-gray-900">{spot.title}</p>
              {spot.reasonLabel && (
                <p className="truncate text-xs text-gray-500">{spot.reasonLabel}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
