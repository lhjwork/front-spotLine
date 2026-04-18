"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { fetchRecommendedSpots, logRecommendationEvent } from "@/lib/api";
import OptimizedImage from "@/components/common/OptimizedImage";
import type { RecommendedSpot } from "@/types";

export default function FeedRecommendationSection() {
  const [spots, setSpots] = useState<RecommendedSpot[]>([]);
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const impressionLogged = useRef(false);

  useEffect(() => {
    fetchRecommendedSpots(0, 10)
      .then((res) => {
        setSpots(res.content);
        if (!impressionLogged.current && res.content.length > 0) {
          logRecommendationEvent("impression", "feed_recommendation", "feed");
          impressionLogged.current = true;
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded || spots.length === 0) return null;

  return (
    <section className="px-4 py-3">
      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
        <Sparkles className="h-4 w-4 text-blue-500" />
        맞춤 추천
      </h2>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
      >
        {spots.map((spot) => (
          <Link
            key={spot.id}
            href={`/spot/${spot.slug}`}
            onClick={() => logRecommendationEvent("click", "feed_recommendation", spot.id)}
            className="w-40 shrink-0"
          >
            <div className="relative h-28 w-full overflow-hidden rounded-xl bg-gray-100">
              {spot.coverImageUrl ? (
                <OptimizedImage
                  src={spot.coverImageUrl}
                  alt={spot.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Sparkles className="h-6 w-6 text-gray-300" />
                </div>
              )}
            </div>
            <div className="mt-1.5">
              <p className="truncate text-sm font-medium text-gray-900">{spot.title}</p>
              {spot.reasonLabel && (
                <p className="truncate text-xs text-blue-500">{spot.reasonLabel}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
