"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { createUserProfileFromInstagram, getAndClearReturnUrl } from "@/lib/auth";
import type { InstagramAuthResponse } from "@/types";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(errorParam);
      return;
    }

    const data = searchParams.get("data");
    if (!data) {
      setError("인증 데이터가 없습니다.");
      return;
    }

    try {
      const decoded = atob(data.replace(/-/g, "+").replace(/_/g, "/"));
      const authData: InstagramAuthResponse = JSON.parse(decoded);

      if (!authData.success || !authData.user) {
        setError("인증 데이터가 올바르지 않습니다.");
        return;
      }

      const userProfile = createUserProfileFromInstagram(authData.user);
      setUser(userProfile, authData.user, authData.expiresAt);

      const returnUrl = getAndClearReturnUrl();
      window.location.href = returnUrl;
    } catch {
      setError("인증 처리 중 오류가 발생했습니다.");
    }
  }, [searchParams, setUser]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="mb-2 text-lg font-semibold text-gray-900">로그인 실패</h1>
          <p className="mb-6 text-sm text-gray-500">{error}</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        <p className="text-sm text-gray-500">로그인 처리 중...</p>
      </div>
    </div>
  );
}
