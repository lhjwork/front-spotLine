"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeedSort } from "@/types";

const SORT_OPTIONS: { label: string; value: FeedSort }[] = [
  { label: "인기순", value: "POPULAR" },
  { label: "최신순", value: "NEWEST" },
];

interface FeedSortDropdownProps {
  selected: FeedSort;
  onSelect: (sort: FeedSort) => void;
}

export default function FeedSortDropdown({ selected, onSelect }: FeedSortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  const selectedLabel = SORT_OPTIONS.find((o) => o.value === selected)?.label || "인기순";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
      >
        {selectedLabel}
        <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[100px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => { onSelect(option.value); setOpen(false); }}
              className={cn(
                "block w-full px-3 py-2 text-left text-sm hover:bg-gray-50",
                selected === option.value ? "font-medium text-blue-600" : "text-gray-700"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
