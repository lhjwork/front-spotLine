"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeedSort, FeedSortPeriod } from "@/types";

interface SortOption {
  label: string;
  sort: FeedSort;
  period: FeedSortPeriod;
}

const SORT_OPTIONS: SortOption[] = [
  { label: "인기순 (전체)", sort: "POPULAR", period: "ALL" },
  { label: "주간 인기", sort: "POPULAR", period: "WEEKLY" },
  { label: "월간 인기", sort: "POPULAR", period: "MONTHLY" },
  { label: "최신순", sort: "NEWEST", period: "ALL" },
];

interface FeedSortDropdownProps {
  selectedSort: FeedSort;
  selectedPeriod: FeedSortPeriod;
  onSelect: (sort: FeedSort, period: FeedSortPeriod) => void;
}

export default function FeedSortDropdown({ selectedSort, selectedPeriod, onSelect }: FeedSortDropdownProps) {
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

  const currentOption = SORT_OPTIONS.find(
    (o) => o.sort === selectedSort && o.period === selectedPeriod
  ) || SORT_OPTIONS[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
      >
        {currentOption.label}
        <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[140px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {SORT_OPTIONS.map((option) => {
            const isSelected = selectedSort === option.sort && selectedPeriod === option.period;
            return (
              <button
                key={`${option.sort}-${option.period}`}
                type="button"
                onClick={() => { onSelect(option.sort, option.period); setOpen(false); }}
                className={cn(
                  "block w-full px-3 py-2 text-left text-sm hover:bg-gray-50",
                  isSelected ? "font-medium text-blue-600" : "text-gray-700"
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
