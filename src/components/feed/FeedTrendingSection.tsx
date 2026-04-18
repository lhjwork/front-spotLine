"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, MapPin } from "lucide-react";
import OptimizedImage from "@/components/common/OptimizedImage";
import { fetchFeedSpots } from "@/lib/api";
import type { SpotDetailResponse } from "@/types";

const categoryLabels: Record<string, string> = {
  CAFE: "카페", RESTAURANT: "맛집", BAR: "바", NATURE: "자연",
  CULTURE: "문화", EXHIBITION: "전시", WALK: "산책", ACTIVITY: "액티비티",
  SHOPPING: "쇼핑", OTHER: "기타",
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const MIN_THRESHOLD = 5;

export default function FeedTrendingSection() {
  const [spots, setSpots] = useState<SpotDetailResponse[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const result = await fetchFeedSpots(undefined, undefined, 0, 10, "POPULAR");
        if (cancelled) return;
        const cutoff = Date.now() - SEVEN_DAYS_MS;
        const recent = result.content.filter(
          (s) => new Date(s.createdAt).getTime() >= cutoff
        );
        setSpots(recent);
      } catch {
        // non-critical, hide section
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  if (spots.length < MIN_THRESHOLD) return null;

  return (
    <section className="py-4">
      <h2 className="mb-3 flex items-center gap-1.5 px-4 text-lg font-bold text-gray-900">
        <Flame className="h-5 w-5 text-orange-500" />
        지금 뜨는 Spot
      </h2>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {spots.map((spot) => (
          <TrendingCard key={spot.id} spot={spot} />
        ))}
      </div>
    </section>
  );
}

function TrendingCard({ spot }: { spot: SpotDetailResponse }) {
  const imageUrl = spot.mediaItems?.[0]?.url || spot.placeInfo?.photos?.[0] || spot.media?.[0];
  const categoryLabel = categoryLabels[spot.category] || spot.category;

  return (
    <Link
      href={`/spot/${spot.slug}`}
      className="relative h-48 w-36 shrink-0 overflow-hidden rounded-xl bg-gray-100"
    >
      {imageUrl ? (
        <OptimizedImage src={imageUrl} alt={spot.title} fill className="object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center">
          <MapPin className="h-8 w-8 text-gray-300" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <span className="mb-0.5 block text-[10px] font-medium text-white/80">
          {categoryLabel}
        </span>
        <h3 className="truncate text-sm font-bold text-white">{spot.title}</h3>
        <span className="text-[10px] text-white/70">{spot.area}</span>
      </div>
    </Link>
  );
}
