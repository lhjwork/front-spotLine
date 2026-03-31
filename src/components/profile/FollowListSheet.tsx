"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { fetchFollowers, fetchFollowing } from "@/lib/api";
import { useSocialStore } from "@/store/useSocialStore";
import { useAuthStore } from "@/store/useAuthStore";
import type { UserProfile } from "@/types";

interface FollowListSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: "followers" | "following";
}

export default function FollowListSheet({ isOpen, onClose, userId, type }: FollowListSheetProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const toggleFollow = useSocialStore((s) => s.toggleFollow);
  const initFollowStatus = useSocialStore((s) => s.initFollowStatus);
  const currentUser = useAuthStore((s) => s.user);

  const loadUsers = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const fetcher = type === "followers" ? fetchFollowers : fetchFollowing;
      const res = await fetcher(userId, pageNum);
      if (pageNum === 1) {
        setUsers(res.content);
      } else {
        setUsers((prev) => [...prev, ...res.content]);
      }
      setHasMore(!res.last);
    } catch {
      // 로딩 실패 시 빈 상태
    } finally {
      setLoading(false);
    }
  }, [userId, type]);

  useEffect(() => {
    if (isOpen) {
      loadUsers(1);
      setPage(1);
    }
  }, [isOpen, loadUsers]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadUsers(nextPage);
  };

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const title = type === "followers" ? "팔로워" : "팔로잉";

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-base font-bold">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {loading && users.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : users.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-400">
              {type === "followers" ? "아직 팔로워가 없습니다" : "아직 팔로잉이 없습니다"}
            </p>
          ) : (
            <ul>
              {users.map((u) => (
                <UserRow
                  key={u.id}
                  user={u}
                  isMe={currentUser?.instagramId === u.id}
                  isAuthenticated={isAuthenticated}
                  toggleFollow={toggleFollow}
                  initFollowStatus={initFollowStatus}
                  onClose={onClose}
                />
              ))}
            </ul>
          )}

          {hasMore && !loading && (
            <button
              onClick={handleLoadMore}
              className="w-full py-3 text-center text-sm font-medium text-blue-600 hover:bg-gray-50"
            >
              더 보기
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function UserRow({
  user,
  isMe,
  isAuthenticated,
  toggleFollow,
  initFollowStatus,
  onClose,
}: {
  user: UserProfile;
  isMe: boolean;
  isAuthenticated: boolean;
  toggleFollow: (userId: string) => Promise<void>;
  initFollowStatus: (userId: string, isFollowing: boolean, followersCount: number) => void;
  onClose: () => void;
}) {
  const followItem = useSocialStore((s) => s.getFollowStatus(user.id));

  useEffect(() => {
    if (!followItem) {
      initFollowStatus(user.id, false, user.stats.followers);
    }
  }, [user.id, user.stats.followers, followItem, initFollowStatus]);

  const isFollowing = followItem?.isFollowing ?? false;

  const handleFollow = () => {
    if (!isAuthenticated) return;
    toggleFollow(user.id);
  };

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <Link href={`/profile/${user.id}`} onClick={onClose} className="flex flex-1 items-center gap-3">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gray-200">
          {user.avatar ? (
            <Image src={user.avatar} alt={user.nickname} fill className="object-cover" sizes="36px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-400">
              {user.nickname.charAt(0)}
            </div>
          )}
        </div>
        <span className="text-sm font-medium">{user.nickname}</span>
      </Link>

      {!isMe && isAuthenticated && (
        <button
          onClick={handleFollow}
          className={cn(
            "rounded-lg px-3 py-1 text-xs font-medium transition-colors",
            isFollowing
              ? "border border-gray-300 text-gray-600"
              : "bg-blue-600 text-white"
          )}
        >
          {isFollowing ? "팔로잉" : "팔로우"}
        </button>
      )}
    </li>
  );
}
