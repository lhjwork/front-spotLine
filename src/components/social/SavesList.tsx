"use client";

import { useState, useEffect, useCallback } from "react";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchMySaves } from "@/lib/api";
import LoginBottomSheet from "@/components/auth/LoginBottomSheet";
import Link from "next/link";
import type { SpotDetailResponse } from "@/types";

type TabType = "spot" | "spotline";

export default function SavesList() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [activeTab, setActiveTab] = useState<TabType>("spot");
  const [items, setItems] = useState<SpotDetailResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [showLogin, setShowLogin] = useState(false);

  const loadSaves = useCallback(async (type: TabType, pageNum: number, append = false) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const result = await fetchMySaves(type, pageNum);
      setItems((prev) => append ? [...prev, ...result.items] : result.items);
      setHasMore(result.hasMore);
    } catch {
      // graceful fallback
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setPage(0);
    setItems([]);
    loadSaves(activeTab, 0);
  }, [activeTab, loadSaves]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadSaves(activeTab, nextPage, true);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <Bookmark className="mb-4 h-12 w-12 text-gray-300" />
        <h3 className="text-lg font-bold text-gray-900">로그인이 필요합니다</h3>
        <p className="mt-2 text-sm text-gray-500">
          저장한 Spot과 SpotLine을 확인하려면 로그인해주세요
        </p>
        <button
          onClick={() => setShowLogin(true)}
          className="mt-4 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          로그인하기
        </button>
        <LoginBottomSheet
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          message="로그인하고 저장한 장소를 확인해보세요"
        />
      </div>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {(["spot", "spotline"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-3 text-center text-sm font-medium transition-colors",
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab === "spot" ? "Spot" : "SpotLine"}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading && items.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
          <Bookmark className="mb-4 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-900">
            저장한 {activeTab === "spot" ? "장소" : "코스"}가 없습니다
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {activeTab === "spot"
              ? "Spot을 둘러보며 마음에 드는 곳을 저장해보세요"
              : "SpotLine을 둘러보며 가고 싶은 코스를 저장해보세요"}
          </p>
          <Link
            href="/feed"
            className="mt-4 rounded-xl bg-gray-100 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            둘러보기
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/spot/${item.slug}`}
              className="flex gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
            >
              {item.media[0] ? (
                <img
                  src={item.media[0]}
                  alt={item.title}
                  className="h-16 w-16 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                  <Bookmark className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{item.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {item.area} · {item.category}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                  <span>❤️ {item.likesCount}</span>
                  <span>🔖 {item.savesCount}</span>
                </div>
              </div>
            </Link>
          ))}

          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="w-full py-4 text-center text-sm font-medium text-blue-600 hover:bg-gray-50 disabled:text-gray-400"
            >
              {isLoading ? "불러오는 중..." : "더 보기"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
