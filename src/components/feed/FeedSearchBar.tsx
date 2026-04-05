"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

interface FeedSearchBarProps {
  value: string;
  onChange: (keyword: string) => void;
}

export default function FeedSearchBar({ value, onChange }: FeedSearchBarProps) {
  const [inputValue, setInputValue] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Sync external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (v: string) => {
    setInputValue(v);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(v.trim()), 300);
  };

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <div className="flex flex-1 items-center gap-2 rounded-lg bg-gray-100 px-3 py-2">
      <Search className="h-4 w-4 shrink-0 text-gray-400" />
      <input
        type="text"
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="장소, 크루노트 검색"
        className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
      />
      {inputValue && (
        <button
          type="button"
          onClick={() => handleChange("")}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
