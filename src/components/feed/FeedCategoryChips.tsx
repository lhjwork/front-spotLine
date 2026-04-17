"use client";

import { cn } from "@/lib/utils";
import type { SpotCategory } from "@/types";

const CATEGORIES: { label: string; value: SpotCategory | null }[] = [
  { label: "전체", value: null },
  { label: "카페", value: "CAFE" },
  { label: "맛집", value: "RESTAURANT" },
  { label: "문화", value: "CULTURE" },
  { label: "자연", value: "NATURE" },
  { label: "산책", value: "WALK" },
  { label: "바", value: "BAR" },
  { label: "전시", value: "EXHIBITION" },
  { label: "액티비티", value: "ACTIVITY" },
  { label: "쇼핑", value: "SHOPPING" },
];

interface FeedCategoryChipsProps {
  selected: SpotCategory | null;
  onSelect: (category: SpotCategory | null) => void;
}

export default function FeedCategoryChips({ selected, onSelect }: FeedCategoryChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 px-4 py-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.label}
          onClick={() => onSelect(cat.value)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            selected === cat.value
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
