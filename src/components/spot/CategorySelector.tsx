"use client";

import { cn } from "@/lib/utils";
import type { SpotCategory } from "@/types";

const CATEGORIES: { value: SpotCategory; label: string }[] = [
  { value: "cafe", label: "카페" },
  { value: "restaurant", label: "맛집" },
  { value: "bar", label: "바" },
  { value: "nature", label: "자연" },
  { value: "culture", label: "문화" },
  { value: "exhibition", label: "전시" },
  { value: "walk", label: "산책" },
  { value: "activity", label: "활동" },
  { value: "shopping", label: "쇼핑" },
  { value: "other", label: "기타" },
];

interface CategorySelectorProps {
  value: SpotCategory | null;
  onChange: (category: SpotCategory) => void;
}

export default function CategorySelector({ value, onChange }: CategorySelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map(({ value: cat, label }) => (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(cat)}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            value === cat
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
