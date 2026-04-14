"use client";

import { useEffect } from "react";
import { useSocialStore } from "@/store/useSocialStore";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchSocialStatus } from "@/lib/api";

interface SocialHydratorProps {
  type: "spot" | "spotline" | "blog";
  id: string;
  likesCount: number;
  savesCount: number;
  visitedCount?: number;
}

export default function SocialHydrator({ type, id, likesCount, savesCount, visitedCount }: SocialHydratorProps) {
  const initSocialStatus = useSocialStore((s) => s.initSocialStatus);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    // 기본 카운트로 초기화
    initSocialStatus(type, id, { isLiked: false, isSaved: false, isVisited: false }, likesCount, savesCount, visitedCount);

    // 로그인 시 사용자별 소셜 상태 조회
    if (isAuthenticated) {
      fetchSocialStatus(type, id).then((status) => {
        initSocialStatus(type, id, status, likesCount, savesCount, visitedCount);
      });
    }
  }, [type, id, likesCount, savesCount, visitedCount, isAuthenticated, initSocialStatus]);

  return null;
}
