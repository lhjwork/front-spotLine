"use client";

import Link from "next/link";
import type { SpotLineDetailResponse } from "@/types";

interface BlogSpotLineOverviewProps {
  spotLine: SpotLineDetailResponse;
}

export default function BlogSpotLineOverview({ spotLine }: BlogSpotLineOverviewProps) {
  return (
    <div className="rounded-xl bg-blue-50 px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-blue-600">코스 정보</p>
          <p className="mt-0.5 text-sm font-semibold text-gray-900">
            {spotLine.title}
          </p>
        </div>
        <Link
          href={`/spotline/${spotLine.slug}`}
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          코스 보기 →
        </Link>
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
        {spotLine.spots.map((spot, i) => (
          <span key={spot.spotId}>
            {i > 0 && <span className="mx-1">→</span>}
            {spot.spotTitle}
          </span>
        ))}
      </div>
    </div>
  );
}
