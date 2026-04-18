"use client";

import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeedLayout } from "@/types";

interface FeedLayoutToggleProps {
  layout: FeedLayout;
  onToggle: (layout: FeedLayout) => void;
}

export default function FeedLayoutToggle({ layout, onToggle }: FeedLayoutToggleProps) {
  return (
    <div className="flex rounded-lg border border-gray-200">
      <button
        type="button"
        onClick={() => onToggle("grid")}
        className={cn(
          "rounded-l-lg p-2 transition-colors",
          layout === "grid" ? "bg-gray-900 text-white" : "text-gray-400 hover:bg-gray-50"
        )}
        aria-label="그리드 보기"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onToggle("list")}
        className={cn(
          "rounded-r-lg p-2 transition-colors",
          layout === "list" ? "bg-gray-900 text-white" : "text-gray-400 hover:bg-gray-50"
        )}
        aria-label="리스트 보기"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}
