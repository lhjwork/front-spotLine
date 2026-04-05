"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Share2, Bookmark, CalendarPlus, GitFork } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSocialStore } from "@/store/useSocialStore";
import { useAuthStore } from "@/store/useAuthStore";
import LoginBottomSheet from "@/components/auth/LoginBottomSheet";
import ReplicateSpotLineSheet from "@/components/spotline/ReplicateSpotLineSheet";
import ShareSheet from "@/components/spotline/ShareSheet";
import type { SpotLineDetailResponse } from "@/types";

interface SpotLineBottomBarProps {
  spotLine: SpotLineDetailResponse;
}

export default function SpotLineBottomBar({ spotLine }: SpotLineBottomBarProps) {
  const router = useRouter();
  const item = useSocialStore((s) => s.getItem("spotline", spotLine.id));
  const toggleLike = useSocialStore((s) => s.toggleLike);
  const toggleSave = useSocialStore((s) => s.toggleSave);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [showLogin, setShowLogin] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [showReplicate, setShowReplicate] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const liked = item?.liked ?? false;
  const saved = item?.saved ?? false;
  const likesCount = item?.likesCount ?? spotLine.likesCount;

  const handleLike = () => {
    if (!isAuthenticated) {
      setLoginMessage("로그인하고 좋아요를 남겨보세요");
      setShowLogin(true);
      return;
    }
    toggleLike("spotline", spotLine.id);
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      setLoginMessage("로그인하고 이 코스를 저장해보세요");
      setShowLogin(true);
      return;
    }
    toggleSave("spotline", spotLine.id);
  };

  const handleReplicate = () => {
    if (!isAuthenticated) {
      setLoginMessage("로그인하고 내 일정에 추가해보세요");
      setShowLogin(true);
      return;
    }
    setShowReplicate(true);
  };

  const handleFork = () => {
    if (!isAuthenticated) {
      setLoginMessage("로그인하고 나만의 버전을 만들어보세요");
      setShowLogin(true);
      return;
    }
    router.push(`/create-spotline?fork=${spotLine.slug}`);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center gap-1.5 px-4 py-3">
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center gap-1 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-colors",
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
              "flex items-center gap-1 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-colors",
              saved
                ? "bg-amber-50 text-amber-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-amber-500")} />
          </button>

          <button
            onClick={() => setShowShare(true)}
            className="flex items-center gap-1 rounded-xl px-2.5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
          >
            <Share2 className="h-4 w-4" />
          </button>

          <button
            onClick={handleFork}
            className="flex items-center gap-1 rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100"
          >
            <GitFork className="h-4 w-4" />
            <span className="hidden sm:inline">내 버전</span>
          </button>

          <button
            onClick={handleReplicate}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-purple-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 active:bg-purple-800"
          >
            <CalendarPlus className="h-4 w-4" />
            일정 추가
          </button>
        </div>
      </div>

      <LoginBottomSheet
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        message={loginMessage}
      />

      <ShareSheet
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        spotLine={spotLine}
      />

      <ReplicateSpotLineSheet
        isOpen={showReplicate}
        onClose={() => setShowReplicate(false)}
        spotLine={{
          id: spotLine.id,
          slug: spotLine.slug,
          title: spotLine.title,
          area: spotLine.area,
          spotsCount: spotLine.spots.length,
        }}
      />
    </>
  );
}
