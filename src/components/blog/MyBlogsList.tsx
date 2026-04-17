"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchMyBlogs } from "@/lib/api";
import FeedSortDropdown from "@/components/feed/FeedSortDropdown";
import type { BlogListItem, FeedSort } from "@/types";
import BlogCard from "./BlogCard";

type Tab = "all" | "DRAFT" | "PUBLISHED";

export default function MyBlogsList() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [sort, setSort] = useState<FeedSort>("NEWEST");
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadBlogs = useCallback(async (pageNum: number, status?: string, sortBy?: string) => {
    setIsLoading(true);
    try {
      const result = await fetchMyBlogs(
        status === "all" ? undefined : status,
        pageNum,
        20,
        sortBy
      );
      if (pageNum === 0) {
        setBlogs(result.content);
      } else {
        setBlogs((prev) => [...prev, ...result.content]);
      }
      setHasMore(!result.last);
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.warn("블로그 목록 로딩 실패:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(0);
    loadBlogs(0, activeTab, sort);
  }, [activeTab, sort, loadBlogs]);

  const handleSortChange = useCallback((newSort: FeedSort) => {
    setSort(newSort);
  }, []);

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "전체" },
    { key: "DRAFT", label: "초안" },
    { key: "PUBLISHED", label: "발행됨" },
  ];

  return (
    <div>
      {/* Tabs + Sort */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                activeTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <FeedSortDropdown selected={sort} onSelect={handleSortChange} />
      </div>

      {/* Blog grid */}
      {isLoading && blogs.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : blogs.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-400">
          아직 작성한 블로그가 없습니다
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} showStatus />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && blogs.length > 0 && (
        <div className="flex justify-center py-4">
          <button
            onClick={() => {
              const next = page + 1;
              setPage(next);
              loadBlogs(next, activeTab, sort);
            }}
            disabled={isLoading}
            className="rounded-lg border border-gray-200 px-6 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            {isLoading ? "불러오는 중..." : "더 보기"}
          </button>
        </div>
      )}
    </div>
  );
}
