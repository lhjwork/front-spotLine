"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { fetchBlogs } from "@/lib/api";
import BlogCard from "@/components/blog/BlogCard";
import FeedAreaTabs from "@/components/feed/FeedAreaTabs";
import FeedSortDropdown from "@/components/feed/FeedSortDropdown";
import type { BlogListItem, FeedSort } from "@/types";

interface BlogsPageClientProps {
  initialBlogs: BlogListItem[];
  initialHasMore: boolean;
}

export default function BlogsPageClient({ initialBlogs, initialHasMore }: BlogsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [blogs, setBlogs] = useState(initialBlogs);
  const [area, setArea] = useState<string | null>(searchParams.get("area"));
  const [sort, setSort] = useState<FeedSort>(
    (searchParams.get("sort") as FeedSort) || "POPULAR"
  );
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  const handleAreaChange = useCallback((newArea: string | null) => {
    setArea(newArea);
    setPage(0);
    setBlogs([]);
    setHasMore(true);
  }, []);

  const handleSortChange = useCallback((newSort: FeedSort) => {
    setSort(newSort);
    setPage(0);
    setBlogs([]);
    setHasMore(true);
  }, []);

  const handleResetFilters = useCallback(() => {
    setArea(null);
    setSort("POPULAR");
    setPage(0);
    setBlogs([]);
    setHasMore(true);
  }, []);

  // URL 동기화
  useEffect(() => {
    const params = new URLSearchParams();
    if (area) params.set("area", area);
    if (sort !== "POPULAR") params.set("sort", sort);
    const query = params.toString();
    router.replace(`/blogs${query ? `?${query}` : ""}`, { scroll: false });
  }, [area, sort, router]);

  // 데이터 로드
  useEffect(() => {
    if (area === null && sort === "POPULAR" && page === 0 && initialBlogs.length > 0) {
      setBlogs(initialBlogs);
      setHasMore(initialHasMore);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const result = await fetchBlogs(page, 20, area || undefined, sort);
        if (!cancelled) {
          setBlogs((prev) => page === 0 ? result.content : [...prev, ...result.content]);
          setHasMore(!result.last);
        }
      } catch {
        // 로딩 실패 시 조용히 처리
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [area, sort, page, initialBlogs, initialHasMore]);

  // Infinite scroll
  useEffect(() => {
    if (!observerRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="mx-auto max-w-2xl">
        <div className="px-4 pt-6 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">블로그</h1>
              <p className="mt-1 text-sm text-gray-500">경험이 담긴 이야기를 만나보세요</p>
            </div>
            <FeedSortDropdown selected={sort} onSelect={handleSortChange} />
          </div>
        </div>

        <FeedAreaTabs selected={area} onSelect={handleAreaChange} />

        {(area || sort !== "POPULAR") && (
          <div className="px-4 py-1">
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              <RotateCcw className="h-3 w-3" />
              필터 초기화
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 px-4 py-4">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>

        {!loading && blogs.length === 0 && (
          <div className="px-4 py-16 text-center">
            <p className="text-sm text-gray-400">
              {area ? "이 지역의 블로그가 아직 없습니다" : "아직 발행된 블로그가 없습니다"}
            </p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        )}

        {hasMore && <div ref={observerRef} className="h-10" />}
      </div>
    </div>
  );
}
