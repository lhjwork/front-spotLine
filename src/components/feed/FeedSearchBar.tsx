"use client";

import SearchAutocomplete from "@/components/search/SearchAutocomplete";

interface FeedSearchBarProps {
  value: string;
  onChange: (keyword: string) => void;
}

export default function FeedSearchBar({ value, onChange }: FeedSearchBarProps) {
  return (
    <SearchAutocomplete
      defaultValue={value}
      onSearch={onChange}
      placeholder="장소, 크루노트 검색"
      className="flex-1"
    />
  );
}
