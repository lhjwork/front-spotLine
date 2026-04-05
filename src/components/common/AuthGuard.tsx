"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import LoginBottomSheet from "@/components/auth/LoginBottomSheet";

interface AuthGuardProps {
  children: ReactNode;
  message?: string;
}

export default function AuthGuard({
  children,
  message = "로그인하고 나만의 코스를 만���어보세요",
}: AuthGuardProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // 로그인 후 현재 페이지로 돌아오기 위해 저장
      if (typeof window !== "undefined") {
        sessionStorage.setItem("spotline_return_url", window.location.pathname + window.location.search);
      }
      setShowLogin(true);
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoginBottomSheet
          isOpen={showLogin}
          onClose={() => {
            setShowLogin(false);
            router.back();
          }}
          message={message}
        />
      </div>
    );
  }

  return <>{children}</>;
}
