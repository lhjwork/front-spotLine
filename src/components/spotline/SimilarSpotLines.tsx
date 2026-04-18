"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Route } from "lucide-react";
import { fetchSimilarSpotLines, logRecommendationEvent } from "@/lib/api";
import OptimizedImage from "@/components/common/OptimizedImage";
import type { SimilarSpotLine } from "@/types";

const themeLabels: Record<string, string> = {
  DATE: "데이트", TRAVEL: "여행", WALK: "산책",
  HANGOUT: "만남", FOOD_TOUR: "맛집투어", CAFE_TOUR: "카페투어", CULTURE: "문화",
};

interface SimilarSpotLinesProps {
  spotlineId: string;
}

export default function SimilarSpotLines({ spotlineId }: SimilarSpotLinesProps) {
  const [spotlines, setSpotlines] = useState<SimilarSpotLine[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchSimilarSpotLines(spotlineId, 4)
      .then((data) => {
        setSpotlines(data);
        if (data.length > 0) {
          logRecommendationEvent("impression", "similar_spotline", spotlineId);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [spotlineId]);

  if (!loaded || spotlines.length === 0) return null;

  return (
    <section className="mt-6 mb-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">비슷한 코스</h2>
      <div className="flex flex-col gap-3">
        {spotlines.map((sl) => (
          <Link
            key={sl.id}
            href={`/spotline/${sl.slug}`}
            onClick={() => logRecommendationEvent("click", "similar_spotline", sl.id)}
            className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
              {sl.coverImageUrl ? (
                <OptimizedImage
                  src={sl.coverImageUrl}
                  alt={sl.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Route className="h-5 w-5 text-gray-300" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">{sl.title}</p>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                <span>{themeLabels[sl.theme] || sl.theme}</span>
                <span>·</span>
                <span>{sl.spotCount}곳</span>
                <span>·</span>
                <span>{sl.area}</span>
              </div>
              {sl.reasonLabel && (
                <p className="mt-0.5 truncate text-xs text-blue-500">{sl.reasonLabel}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
