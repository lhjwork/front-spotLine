"use client";

import { Flame } from "lucide-react";
import { TRENDING_SEARCHES } from "@/constants/trendingSearches";

export interface TrendingSearchesProps {
  onSelect: (keyword: string) => void;
}

export default function TrendingSearches({ onSelect }: TrendingSearchesProps) {
  return (
    <div className="p-4">
      <div className="mb-3 flex items-center gap-1.5">
        <Flame className="h-4 w-4 text-orange-500" />
        <span className="text-sm font-semibold text-gray-700">인기 검색어</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {TRENDING_SEARCHES.map((keyword) => (
          <button
            key={keyword}
            type="button"
            onClick={() => onSelect(keyword)}
            className="rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-200"
          >
            {keyword}
          </button>
        ))}
      </div>
    </div>
  );
}
