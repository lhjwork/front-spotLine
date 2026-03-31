"use client";

import { useEffect } from "react";
import { useSocialStore } from "@/store/useSocialStore";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchSocialStatus } from "@/lib/api";

interface SocialHydratorProps {
  type: "spot" | "route";
  id: string;
  likesCount: number;
  savesCount: number;
}

export default function SocialHydrator({ type, id, likesCount, savesCount }: SocialHydratorProps) {
  const initSocialStatus = useSocialStore((s) => s.initSocialStatus);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    // 기본 카운트로 초기화
    initSocialStatus(type, id, { isLiked: false, isSaved: false }, likesCount, savesCount);

    // 로그인 시 사용자별 소셜 상태 조회
    if (isAuthenticated) {
      fetchSocialStatus(type, id).then((status) => {
        initSocialStatus(type, id, status, likesCount, savesCount);
      });
    }
  }, [type, id, likesCount, savesCount, isAuthenticated, initSocialStatus]);

  return null;
}
