"use client";

import { cn } from "@/lib/utils";
import { CITIES } from "@/constants/cities";

interface FeedAreaTabsProps {
  selected: string | null;
  onSelect: (area: string | null) => void;
}

export default function FeedAreaTabs({ selected, onSelect }: FeedAreaTabsProps) {
  const tabs = [{ name: "전체", value: null }, ...CITIES.map((c) => ({ name: c.name, value: c.area }))];

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
      <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => onSelect(tab.value)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              selected === tab.value
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {tab.name}
          </button>
        ))}
      </div>
    </div>
  );
}
