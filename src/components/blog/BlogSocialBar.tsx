"use client";

import { useState } from "react";
import { Heart, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSocialStore } from "@/store/useSocialStore";
import { useAuthStore } from "@/store/useAuthStore";
import LoginBottomSheet from "@/components/auth/LoginBottomSheet";

interface BlogSocialBarProps {
  blogId: string;
}

export default function BlogSocialBar({ blogId }: BlogSocialBarProps) {
  const item = useSocialStore((s) => s.getItem("blog", blogId));
  const toggleLike = useSocialStore((s) => s.toggleLike);
  const toggleSave = useSocialStore((s) => s.toggleSave);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [showLogin, setShowLogin] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");

  const liked = item?.liked ?? false;
  const saved = item?.saved ?? false;
  const likesCount = item?.likesCount ?? 0;

  const handleLike = () => {
    if (!isAuthenticated) {
      setLoginMessage("로그인하고 좋아요를 남겨보세요");
      setShowLogin(true);
      return;
    }
    toggleLike("blog", blogId);
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      setLoginMessage("로그인하고 이 블로그를 저장해보세요");
      setShowLogin(true);
      return;
    }
    toggleSave("blog", blogId);
  };

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={handleLike}
          className={cn(
            "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
            liked
              ? "bg-red-50 text-red-600"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          <Heart className={cn("h-5 w-5", liked && "fill-current")} />
          <span>{likesCount}</span>
        </button>

        <button
          onClick={handleSave}
          className={cn(
            "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
            saved
              ? "bg-amber-50 text-amber-600"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          <Bookmark className={cn("h-5 w-5", saved && "fill-current")} />
          <span>{saved ? "저장됨" : "저장"}</span>
        </button>
      </div>

      <LoginBottomSheet
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        message={loginMessage}
      />
    </>
  );
}
