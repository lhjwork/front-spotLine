"use client";

import { useState, useEffect } from "react";
import { Heart, Bookmark, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSocialStore } from "@/store/useSocialStore";
import { useAuthStore } from "@/store/useAuthStore";
import LoginBottomSheet from "@/components/auth/LoginBottomSheet";

interface SocialActionButtonsProps {
  type: "spot" | "spotline";
  id: string;
  initialLikesCount: number;
  initialSavesCount: number;
  initialSharesCount?: number;
  size?: "sm" | "md";
}

export default function SocialActionButtons({
  type,
  id,
  initialLikesCount,
  initialSavesCount,
  initialSharesCount = 0,
  size = "sm",
}: SocialActionButtonsProps) {
  const item = useSocialStore((s) => s.getItem(type, id));
  const batchInit = useSocialStore((s) => s.batchInitSocialStatus);
  const toggleLike = useSocialStore((s) => s.toggleLike);
  const toggleSave = useSocialStore((s) => s.toggleSave);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [showLogin, setShowLogin] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");

  useEffect(() => {
    if (!item) {
      batchInit([{ type, id, likesCount: initialLikesCount, savesCount: initialSavesCount }]);
    }
  }, [item, batchInit, type, id, initialLikesCount, initialSavesCount]);

  const liked = item?.liked ?? false;
  const saved = item?.saved ?? false;
  const likesCount = item?.likesCount ?? initialLikesCount;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isAuthenticated) {
      setLoginMessage("로그인하고 좋아요를 남겨보세요");
      setShowLogin(true);
      return;
    }
    toggleLike(type, id);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isAuthenticated) {
      setLoginMessage("로그인하고 저장해보세요");
      setShowLogin(true);
      return;
    }
    toggleSave(type, id);
  };

  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleLike}
          className={cn(
            "flex items-center gap-0.5 rounded-full p-1 transition-transform active:scale-110",
            liked ? "text-red-500" : "text-gray-400 hover:text-red-400"
          )}
          aria-label="좋아요"
        >
          <Heart className={cn(iconSize, liked && "fill-red-500")} />
          {likesCount > 0 && (
            <span className={cn(textSize, "tabular-nums")}>{likesCount}</span>
          )}
        </button>
        <button
          type="button"
          onClick={handleSave}
          className={cn(
            "rounded-full p-1 transition-transform active:scale-110",
            saved ? "text-amber-500" : "text-gray-400 hover:text-amber-400"
          )}
          aria-label="저장"
        >
          <Bookmark className={cn(iconSize, saved && "fill-amber-500")} />
        </button>
        {initialSharesCount > 0 && (
          <span className={cn("flex items-center gap-0.5 text-gray-400", textSize)}>
            <Share2 className={iconSize} />
            <span className="tabular-nums">{initialSharesCount}</span>
          </span>
        )}
      </div>

      <LoginBottomSheet
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        message={loginMessage}
      />
    </>
  );
}
