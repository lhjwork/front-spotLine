"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Users, Search } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchFollowingFeed } from "@/lib/api";
import SpotLinePreviewCard from "@/components/shared/SpotLinePreviewCard";
import BlogCard from "@/components/blog/BlogCard";
import LoginBottomSheet from "@/components/auth/LoginBottomSheet";
import type { FollowingFeedItem } from "@/types";

export default function FollowingFeed() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [items, setItems] = useState<FollowingFeedItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setInitialLoading(false);
      return;
    }
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchFollowingFeed(page, 20);
        if (!cancelled) {
          setItems((prev) => (page === 0 ? res.content : [...prev, ...res.content]));
          setHasMore(!res.last);
        }
      } catch {
        // non-critical
      } finally {
        if (!cancelled) {
          setLoading(false);
          setInitialLoading(false);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isAuthenticated, page]);

  // IntersectionObserver for infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && !loading && hasMore) {
        setPage((p) => p + 1);
      }
    },
    [loading, hasMore]
  );

  useEffect(() => {
    if (!observerRef.current || !hasMore) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.5 });
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, handleObserver]);

  // --- Unauthenticated state ---
  if (!isAuthenticated) {
    return (
      <>
        <div className="flex flex-col items-center px-4 py-16 text-center">
          <Users className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-700">
            로그인하고 관심 크루의
          </p>
          <p className="text-sm font-medium text-gray-700">
            콘텐츠를 모아보세요
          </p>
          <button
            type="button"
            onClick={() => setShowLogin(true)}
            className="mt-4 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            로그인
          </button>
        </div>
        <LoginBottomSheet
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          message="로그인하고 팔로잉 피드를 확인하세요"
        />
      </>
    );
  }

  // --- Initial loading ---
  if (initialLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  // --- Empty state ---
  if (!loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center px-4 py-16 text-center">
        <Search className="mb-3 h-10 w-10 text-gray-300" />
        <p className="text-sm font-medium text-gray-700">
          팔로우한 크루의 콘텐츠가 없어요
        </p>
        <p className="mt-1 text-xs text-gray-500">
          다양한 크루를 탐색하고 팔로우해보세요
        </p>
        <Link
          href="/"
          className="mt-4 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          탐색하기
        </Link>
      </div>
    );
  }

  // --- Content feed ---
  return (
    <div className="space-y-4 px-4 py-4">
      {items.map((item) =>
        item.type === "SPOTLINE" ? (
          <SpotLinePreviewCard
            key={`sl-${item.id}`}
            spotLine={{
              id: item.id,
              slug: item.slug,
              title: item.title,
              theme: item.theme || "",
              area: item.area || "",
              totalDuration: item.totalDuration || 0,
              totalDistance: 0,
              spotCount: item.spotCount || 0,
              likesCount: item.likesCount,
              coverImageUrl: item.coverImageUrl || undefined,
            }}
          />
        ) : (
          <BlogCard
            key={`blog-${item.id}`}
            blog={{
              id: item.id,
              slug: item.slug,
              title: item.title,
              summary: item.summary,
              coverImageUrl: item.coverImageUrl,
              status: "PUBLISHED",
              userName: item.userName,
              userAvatarUrl: item.userAvatar,
              spotLineTitle: "",
              spotLineArea: item.area || "",
              spotCount: item.spotCount || 0,
              viewsCount: item.viewsCount,
              likesCount: item.likesCount,
              publishedAt: item.createdAt,
              createdAt: item.createdAt,
            }}
          />
        )
      )}

      {loading && (
        <div className="flex justify-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      )}
      {hasMore && <div ref={observerRef} className="h-10" />}
    </div>
  );
}
