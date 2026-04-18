"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchFeedSpots, fetchFeedSpotLines, fetchBlogs } from "@/lib/api";
import AutocompleteResults, {
  getResultItemCount,
  type AutocompleteData,
} from "@/components/search/AutocompleteResults";
import TrendingSearches from "@/components/search/TrendingSearches";

export interface SearchAutocompleteProps {
  defaultValue?: string;
  onSearch: (keyword: string) => void;
  placeholder?: string;
  className?: string;
}

type SearchTab = "spot" | "spotline" | "blog";

export default function SearchAutocomplete({
  defaultValue = "",
  onSearch,
  placeholder = "Spot, SpotLine, Blog 검색",
  className,
}: SearchAutocompleteProps) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<AutocompleteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Sync defaultValue changes
  useEffect(() => {
    setInputValue(defaultValue);
  }, [defaultValue]);

  const fetchAutocomplete = useCallback(async (keyword: string) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    try {
      const [spotsResult, spotLinesResult, blogsResult] = await Promise.allSettled([
        fetchFeedSpots(undefined, undefined, 0, 3, undefined, keyword),
        fetchFeedSpotLines(undefined, undefined, 0, 3, keyword),
        fetchBlogs(0, 3),
      ]);

      // Check if aborted
      if (abortRef.current.signal.aborted) return;

      setResults({
        spots: spotsResult.status === "fulfilled" ? spotsResult.value.content : [],
        spotLines: spotLinesResult.status === "fulfilled" ? spotLinesResult.value.content : [],
        blogs: blogsResult.status === "fulfilled" ? blogsResult.value.content : [],
      });
      setIsOpen(true);
      setActiveIndex(-1);
    } catch {
      // AbortError or network error — ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value);
      clearTimeout(timerRef.current);

      if (value.trim().length < 2) {
        setResults(null);
        setIsOpen(value.length === 0 && isFocused);
        return;
      }

      timerRef.current = setTimeout(() => {
        fetchAutocomplete(value.trim());
      }, 300);
    },
    [fetchAutocomplete, isFocused]
  );

  const handleSelect = useCallback(
    (type: SearchTab, slug: string) => {
      setIsOpen(false);
      router.push(`/${type === "spotline" ? "spotline" : type}/${slug}`);
    },
    [router]
  );

  const handleSearchAll = useCallback(
    (tab?: SearchTab) => {
      setIsOpen(false);
      const keyword = inputValue.trim();
      if (tab) {
        router.push(`/search?q=${encodeURIComponent(keyword)}&tab=${tab}`);
      } else {
        onSearch(keyword);
      }
    },
    [inputValue, onSearch, router]
  );

  const handleTrendingSelect = useCallback(
    (keyword: string) => {
      setInputValue(keyword);
      setIsOpen(false);
      onSearch(keyword);
    },
    [onSearch]
  );

  const handleSubmit = useCallback(() => {
    const keyword = inputValue.trim();
    if (!keyword) return;

    if (activeIndex >= 0 && results) {
      // Navigate to selected item
      const allItems = [
        ...results.spots.map((s) => ({ type: "spot" as const, slug: s.slug })),
        ...results.spotLines.map((sl) => ({ type: "spotline" as const, slug: sl.slug })),
        ...results.blogs.map((b) => ({ type: "blog" as const, slug: b.slug })),
      ];
      if (allItems[activeIndex]) {
        handleSelect(allItems[activeIndex].type, allItems[activeIndex].slug);
        return;
      }
    }

    setIsOpen(false);
    onSearch(keyword);
  }, [inputValue, activeIndex, results, onSearch, handleSelect]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || !results) {
        if (e.key === "Enter") {
          e.preventDefault();
          handleSubmit();
        }
        return;
      }

      const totalItems = getResultItemCount(results);

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % totalItems);
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) => (prev <= 0 ? totalItems - 1 : prev - 1));
          break;
        case "Enter":
          e.preventDefault();
          handleSubmit();
          break;
        case "Escape":
          setIsOpen(false);
          setActiveIndex(-1);
          break;
      }
    },
    [isOpen, results, handleSubmit]
  );

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      abortRef.current?.abort();
    };
  }, []);

  const showTrending = isFocused && inputValue.length === 0 && !results;
  const showResults = isOpen && results && inputValue.trim().length >= 2;

  return (
    <div ref={containerRef} className={cn("relative", className)} role="combobox" aria-expanded={isOpen} aria-haspopup="listbox">
      <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2.5">
        <Search className="h-4 w-4 shrink-0 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          role="searchbox"
          aria-autocomplete="list"
          aria-controls="autocomplete-listbox"
          aria-activedescendant={activeIndex >= 0 ? `ac-item-${activeIndex}` : undefined}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (inputValue.length === 0) setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
        />
        {isLoading && (
          <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        )}
        {inputValue && !isLoading && (
          <button
            type="button"
            onClick={() => {
              setInputValue("");
              setResults(null);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {(showTrending || showResults) && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[60vh] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg md:max-h-[400px]">
          {showTrending && <TrendingSearches onSelect={handleTrendingSelect} />}
          {showResults && (
            <AutocompleteResults
              data={results}
              keyword={inputValue.trim()}
              activeIndex={activeIndex}
              onSelect={handleSelect}
              onSearchAll={handleSearchAll}
            />
          )}
        </div>
      )}
    </div>
  );
}
