"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlaceMenuItem } from "@/types";

interface SpotMenuProps {
  menuItems: PlaceMenuItem[];
  placeUrl: string | null;
}

export default function SpotMenu({ menuItems, placeUrl }: SpotMenuProps) {
  const [expanded, setExpanded] = useState(false);
  const displayItems = expanded ? menuItems : menuItems.slice(0, 5);
  const hasMore = menuItems.length > 5;

  return (
    <section className="mt-4 rounded-2xl border border-gray-100 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">
        메뉴 <span className="font-normal text-gray-400">{menuItems.length}</span>
      </h2>

      <ul className="space-y-2">
        {displayItems.map((item, i) => (
          <li key={i} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {item.photo && (
                <img
                  src={item.photo}
                  alt={item.name}
                  className="h-8 w-8 shrink-0 rounded-md object-cover"
                />
              )}
              <span className="truncate text-sm text-gray-700">{item.name}</span>
            </div>
            {item.price && (
              <span className="shrink-0 text-sm font-medium text-gray-900">{item.price}</span>
            )}
          </li>
        ))}
      </ul>

      {hasMore && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-2 flex w-full items-center justify-center gap-0.5 text-xs text-gray-500 hover:text-gray-700"
        >
          더보기
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      )}

      {placeUrl && (
        <a
          href={placeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "block text-center text-xs text-blue-600 hover:underline",
            hasMore || menuItems.length > 5 ? "mt-2" : "mt-3",
          )}
        >
          카카오맵에서 전체 메뉴 보기
        </a>
      )}
    </section>
  );
}
