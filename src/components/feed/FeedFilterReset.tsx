"use client";

import { RotateCcw } from "lucide-react";
import type { SpotCategory, FeedSort } from "@/types";

interface FeedFilterResetProps {
  area: string | null;
  category: SpotCategory | null;
  sort: FeedSort;
  keyword: string;
  onReset: () => void;
}

export default function FeedFilterReset({ area, category, sort, keyword, onReset }: FeedFilterResetProps) {
  const hasActiveFilter = area || category || sort !== "POPULAR" || keyword;
  if (!hasActiveFilter) return null;

  return (
    <div className="px-4 py-1">
      <button
        type="button"
        onClick={onReset}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
      >
        <RotateCcw className="h-3 w-3" />
        필터 초기화
      </button>
    </div>
  );
}
