"use client";

import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { startInstagramLogin } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface LoginButtonProps {
  className?: string;
}

export default function LoginButton({ className }: LoginButtonProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const instagramUser = useAuthStore((s) => s.instagramUser);
  const logout = useAuthStore((s) => s.logout);

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  if (isAuthenticated && user) {
    return (
      <div className={cn("relative", className)} ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1 pl-1 pr-3 transition-colors hover:bg-gray-50"
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.nickname}
              className="h-7 w-7 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-xs font-bold text-white">
              {user.nickname.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="max-w-[100px] truncate text-sm font-medium text-gray-700">
            {instagramUser?.username || user.nickname}
          </span>
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
            <div className="border-b border-gray-100 px-4 py-2">
              <p className="truncate text-sm font-medium text-gray-900">
                @{instagramUser?.username || user.nickname}
              </p>
              <p className="text-xs text-gray-500">Instagram 연동됨</p>
            </div>
            <button
              onClick={() => {
                logout();
                setShowDropdown(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
            >
              로그아웃
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => startInstagramLogin()}
      className={cn(
        "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90",
        "bg-gradient-to-r from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888]",
        className
      )}
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
      <span className="hidden sm:inline">Instagram 로그인</span>
    </button>
  );
}
