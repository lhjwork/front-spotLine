"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import OptimizedImage from "@/components/common/OptimizedImage";
import { fetchFeedSpots } from "@/lib/api";
import type { SpotDetailResponse } from "@/types";

interface CategoryConfig {
  category: string;
  label: string;
  emoji: string;
}

const CATEGORIES: CategoryConfig[] = [
  { category: "CAFE", label: "카페", emoji: "☕" },
  { category: "RESTAURANT", label: "맛집", emoji: "🍽️" },
  { category: "CULTURE", label: "문화", emoji: "🎭" },
  { category: "ACTIVITY", label: "액티비티", emoji: "🏃" },
];

const MIN_PER_CATEGORY = 3;

interface FeedCategoryCurationProps {
  area?: string | null;
}

export default function FeedCategoryCuration({ area }: FeedCategoryCurationProps) {
  const [sections, setSections] = useState<{ config: CategoryConfig; spots: SpotDetailResponse[] }[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const results = await Promise.allSettled(
        CATEGORIES.map(async (config) => {
          const result = await fetchFeedSpots(area || undefined, config.category, 0, 5, "POPULAR");
          return { config, spots: result.content };
        })
      );
      if (cancelled) return;
      const valid = results
        .filter((r): r is PromiseFulfilledResult<{ config: CategoryConfig; spots: SpotDetailResponse[] }> =>
          r.status === "fulfilled" && r.value.spots.length >= MIN_PER_CATEGORY
        )
        .map((r) => r.value);
      setSections(valid);
    };
    load();
    return () => { cancelled = true; };
  }, [area]);

  if (sections.length === 0) return null;

  return (
    <section className="py-4">
      {sections.map(({ config, spots }) => (
        <div key={config.category} className="mb-4 last:mb-0">
          <h3 className="mb-2 px-4 text-base font-bold text-gray-900">
            {config.emoji} {config.label}
          </h3>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
            {spots.map((spot) => (
              <CurationCard key={spot.id} spot={spot} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function CurationCard({ spot }: { spot: SpotDetailResponse }) {
  const imageUrl = spot.mediaItems?.[0]?.url || spot.placeInfo?.photos?.[0] || spot.media?.[0];

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
        <h3 className="truncate text-sm font-bold text-white">{spot.title}</h3>
        <span className="text-[10px] text-white/70">{spot.area}</span>
      </div>
    </Link>
  );
}
