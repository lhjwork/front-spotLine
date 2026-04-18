"use client";

import { MapPin, Route, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SpotDetailResponse, SpotLinePreview, BlogListItem } from "@/types";

export interface AutocompleteData {
  spots: SpotDetailResponse[];
  spotLines: SpotLinePreview[];
  blogs: BlogListItem[];
}

type SearchTab = "spot" | "spotline" | "blog";

export interface AutocompleteResultsProps {
  data: AutocompleteData;
  keyword: string;
  activeIndex: number;
  onSelect: (type: SearchTab, slug: string) => void;
  onSearchAll: (tab?: SearchTab) => void;
}

export default function AutocompleteResults({
  data,
  keyword,
  activeIndex,
  onSelect,
  onSearchAll,
}: AutocompleteResultsProps) {
  const { spots, spotLines, blogs } = data;
  const hasResults = spots.length > 0 || spotLines.length > 0 || blogs.length > 0;

  if (!hasResults) {
    return (
      <div className="p-4 text-center text-sm text-gray-400">
        검색 결과가 없습니다
      </div>
    );
  }

  let itemIndex = 0;

  return (
    <ul id="autocomplete-listbox" role="listbox" className="py-2">
      {/* Spot 섹션 */}
      {spots.length > 0 && (
        <li role="presentation">
          <div className="flex items-center justify-between px-4 py-1.5">
            <span className="text-xs font-semibold text-gray-500">Spot</span>
            <button
              type="button"
              onClick={() => onSearchAll("spot")}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              더보기
            </button>
          </div>
          {spots.map((spot) => {
            const idx = itemIndex++;
            return (
              <button
                key={spot.id}
                id={`ac-item-${idx}`}
                role="option"
                aria-selected={activeIndex === idx}
                type="button"
                onClick={() => onSelect("spot", spot.slug)}
                className={cn(
                  "flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50",
                  activeIndex === idx && "bg-blue-50"
                )}
              >
                <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="truncate font-medium text-gray-900">{spot.title}</span>
                <span className="shrink-0 text-xs text-gray-400">{spot.area}</span>
              </button>
            );
          })}
        </li>
      )}

      {/* SpotLine 섹션 */}
      {spotLines.length > 0 && (
        <li role="presentation">
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-1.5 mt-1">
            <span className="text-xs font-semibold text-gray-500">SpotLine</span>
            <button
              type="button"
              onClick={() => onSearchAll("spotline")}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              더보기
            </button>
          </div>
          {spotLines.map((sl) => {
            const idx = itemIndex++;
            return (
              <button
                key={sl.id}
                id={`ac-item-${idx}`}
                role="option"
                aria-selected={activeIndex === idx}
                type="button"
                onClick={() => onSelect("spotline", sl.slug)}
                className={cn(
                  "flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50",
                  activeIndex === idx && "bg-blue-50"
                )}
              >
                <Route className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="truncate font-medium text-gray-900">{sl.title}</span>
                <span className="shrink-0 text-xs text-gray-400">{sl.spotCount}곳</span>
              </button>
            );
          })}
        </li>
      )}

      {/* Blog 섹션 */}
      {blogs.length > 0 && (
        <li role="presentation">
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-1.5 mt-1">
            <span className="text-xs font-semibold text-gray-500">Blog</span>
            <button
              type="button"
              onClick={() => onSearchAll("blog")}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              더보기
            </button>
          </div>
          {blogs.map((blog) => {
            const idx = itemIndex++;
            return (
              <button
                key={blog.id}
                id={`ac-item-${idx}`}
                role="option"
                aria-selected={activeIndex === idx}
                type="button"
                onClick={() => onSelect("blog", blog.slug)}
                className={cn(
                  "flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50",
                  activeIndex === idx && "bg-blue-50"
                )}
              >
                <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="truncate font-medium text-gray-900">{blog.title}</span>
                <span className="shrink-0 text-xs text-gray-400">@{blog.userName}</span>
              </button>
            );
          })}
        </li>
      )}

      {/* 전체 결과 보기 */}
      <li role="presentation">
        <button
          type="button"
          onClick={() => onSearchAll()}
          className="mt-1 flex w-full items-center justify-center border-t border-gray-100 px-4 py-3 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
        >
          &ldquo;{keyword}&rdquo; 전체 결과 보기
        </button>
      </li>
    </ul>
  );
}

/** Get total item count for keyboard navigation */
export function getResultItemCount(data: AutocompleteData): number {
  return data.spots.length + data.spotLines.length + data.blogs.length;
}
