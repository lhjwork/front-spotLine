"use client";

import { useState } from "react";
import { Heart, Share2, Bookmark, CalendarPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSocialStore } from "@/store/useSocialStore";
import { useAuthStore } from "@/store/useAuthStore";
import LoginBottomSheet from "@/components/auth/LoginBottomSheet";
import ReplicateRouteSheet from "@/components/route/ReplicateRouteSheet";
import type { RouteDetailResponse } from "@/types";

interface RouteBottomBarProps {
  route: RouteDetailResponse;
}

export default function RouteBottomBar({ route }: RouteBottomBarProps) {
  const item = useSocialStore((s) => s.getItem("route", route.id));
  const toggleLike = useSocialStore((s) => s.toggleLike);
  const toggleSave = useSocialStore((s) => s.toggleSave);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [showLogin, setShowLogin] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [showReplicate, setShowReplicate] = useState(false);

  const liked = item?.liked ?? false;
  const saved = item?.saved ?? false;
  const likesCount = item?.likesCount ?? route.likesCount;

  const handleLike = () => {
    if (!isAuthenticated) {
      setLoginMessage("로그인하고 좋아요를 남겨보세요");
      setShowLogin(true);
      return;
    }
    toggleLike("route", route.id);
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      setLoginMessage("로그인하고 이 코스를 저장해보세요");
      setShowLogin(true);
      return;
    }
    toggleSave("route", route.id);
  };

  const handleReplicate = () => {
    if (!isAuthenticated) {
      setLoginMessage("로그인하고 내 일정에 추가해보세요");
      setShowLogin(true);
      return;
    }
    setShowReplicate(true);
  };

  const handleShare = async () => {
    const shareData = {
      title: route.title,
      text: route.description || `${route.area}의 ${route.title}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // 공유 취소
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("링크가 복사되었습니다!");
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center gap-2 px-4 py-3">
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              liked
                ? "bg-red-50 text-red-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Heart className={cn("h-4 w-4", liked && "fill-red-500")} />
            <span>{likesCount.toLocaleString()}</span>
          </button>

          <button
            onClick={handleSave}
            className={cn(
              "flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              saved
                ? "bg-amber-50 text-amber-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-amber-500")} />
            <span>{saved ? "저장됨" : "저장"}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
          >
            <Share2 className="h-4 w-4" />
            <span>공유</span>
          </button>

          <button
            onClick={handleReplicate}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-purple-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 active:bg-purple-800"
          >
            <CalendarPlus className="h-4 w-4" />
            내 일정에 추가
          </button>
        </div>
      </div>

      <LoginBottomSheet
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        message={loginMessage}
      />

      <ReplicateRouteSheet
        isOpen={showReplicate}
        onClose={() => setShowReplicate(false)}
        route={{
          id: route.id,
          slug: route.slug,
          title: route.title,
          area: route.area,
          spotsCount: route.spots.length,
        }}
      />
    </>
  );
}
