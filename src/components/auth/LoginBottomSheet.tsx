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
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Mobile: Bottom Sheet / PC: Center Modal */}
      <div className="relative w-full max-w-lg animate-slide-up rounded-t-2xl bg-white px-6 pb-8 pt-4 md:animate-none md:rounded-2xl md:shadow-xl">
        {/* Drag handle (mobile only) */}
        <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-gray-300 md:hidden" />

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

        {/* Instagram Login Button */}
        <button
          onClick={() => startOAuthLogin("instagram")}
          className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
          Instagram으로 계속하기
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
