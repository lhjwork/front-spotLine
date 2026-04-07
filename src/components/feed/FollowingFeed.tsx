"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Search } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchFollowing } from "@/lib/api";
import type { UserProfile } from "@/types";
import LoginBottomSheet from "@/components/auth/LoginBottomSheet";

export default function FollowingFeed() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  const [followingUsers, setFollowingUsers] = useState<UserProfile[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    let cancelled = false;

    const loadFollowing = async () => {
      setLoading(true);
      try {
        const res = await fetchFollowing(user.id, 1, 50);
        if (!cancelled) setFollowingUsers(res.content);
      } catch {
        if (!cancelled) setFollowingUsers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadFollowing();
    return () => { cancelled = true; };
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <>
        <div className="flex flex-col items-center px-4 py-16 text-center">
          <Users className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-700">
            로그인하고 관심 크루의
          </p>
          <p className="text-sm font-medium text-gray-700">
            콘텐츠를 모아보세요
          </p>
          <button
            type="button"
            onClick={() => setShowLogin(true)}
            className="mt-4 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            로그인
          </button>
        </div>
        <LoginBottomSheet
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          message="로그인하고 팔로잉 피드를 확인하세요"
        />
      </>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!followingUsers || followingUsers.length === 0) {
    return (
      <div className="flex flex-col items-center px-4 py-16 text-center">
        <Search className="mb-3 h-10 w-10 text-gray-300" />
        <p className="text-sm font-medium text-gray-700">
          아직 팔로우한 크루가 없어요
        </p>
        <p className="mt-1 text-xs text-gray-500">
          다양한 크루를 탐색해보세요
        </p>
        <Link
          href="/"
          className="mt-4 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          탐색하기
        </Link>
      </div>
    );
  }

  return (
    <section className="px-4 py-4">
      <h2 className="mb-3 text-lg font-bold text-gray-900">팔로잉 중인 크루</h2>
      <div className="flex flex-col gap-2">
        {followingUsers.map((u) => (
          <Link
            key={u.id}
            href={`/profile/${u.id}`}
            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-500">
              {u.avatar ? (
                <img src={u.avatar} alt={u.nickname} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                u.nickname.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {u.nickname}
              </p>
              <p className="text-xs text-gray-500">
                팔로워 {u.stats?.followers ?? 0}명
                {u.stats?.spotlines != null && ` · SpotLine ${u.stats.spotlines}개`}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
