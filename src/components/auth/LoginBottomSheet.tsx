"use client";

import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { startOAuthLogin } from "@/lib/auth";

interface LoginBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function LoginBottomSheet({ isOpen, onClose, message }: LoginBottomSheetProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose();
    }
  }, [isAuthenticated, isOpen, onClose]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="relative w-full max-w-lg animate-slide-up rounded-t-2xl bg-white px-6 pb-8 pt-4">
        {/* Drag handle */}
        <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-gray-300" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900">
            {message || "로그인하고 좋아요를 남겨보세요"}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Spotline에서 좋아한 장소를 저장하고 나만의 코스를 만들어보세요
          </p>
        </div>

        {/* Google Login Button */}
        <button
          onClick={() => startOAuthLogin("google")}
          className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl border border-gray-300 bg-white py-3.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google로 계속하기
        </button>

        {/* Kakao Login Button */}
        <button
          onClick={() => startOAuthLogin("kakao")}
          className="mt-3 flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#FEE500] py-3.5 text-sm font-semibold text-[#191919] transition-colors hover:bg-[#FDD800]"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#191919">
            <path d="M12 3C6.48 3 2 6.36 2 10.44c0 2.62 1.75 4.93 4.38 6.24l-1.12 4.1c-.1.35.3.64.6.44l4.8-3.18c.44.04.88.06 1.34.06 5.52 0 10-3.36 10-7.5S17.52 3 12 3z" />
          </svg>
          카카오로 계속하기
        </button>

        {/* Skip button */}
        <button
          onClick={onClose}
          className="mt-3 w-full py-2 text-sm text-gray-400 transition-colors hover:text-gray-600"
        >
          나중에 할게요
        </button>
      </div>
    </div>,
    document.body
  );
}
