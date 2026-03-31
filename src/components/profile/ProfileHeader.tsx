"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/types";

interface ProfileHeaderProps {
  profile: UserProfile;
  isMe: boolean;
  isFollowing: boolean;
  onFollow: () => void;
  onShowFollowers: () => void;
  onShowFollowing: () => void;
}

export default function ProfileHeader({
  profile,
  isMe,
  isFollowing,
  onFollow,
  onShowFollowers,
  onShowFollowing,
}: ProfileHeaderProps) {
  const postsCount = profile.stats.liked + profile.stats.recommended;

  return (
    <div className="px-4 py-5">
      <div className="flex items-start gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-gray-200">
          {profile.avatar ? (
            <Image
              src={profile.avatar}
              alt={profile.nickname}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl font-bold text-gray-400">
              {profile.nickname.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold">{profile.nickname}</h1>
            {!isMe && (
              <button
                onClick={onFollow}
                className={cn(
                  "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
                  isFollowing
                    ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                {isFollowing ? "팔로잉" : "팔로우"}
              </button>
            )}
          </div>

          {profile.instagramId && (
            <p className="text-sm text-gray-500">@{profile.instagramId}</p>
          )}

          {profile.bio && (
            <p className="mt-1 text-sm text-gray-700">{profile.bio}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex justify-around border-t border-gray-100 pt-4">
        <div className="text-center">
          <p className="text-base font-bold">{postsCount}</p>
          <p className="text-xs text-gray-500">게시물</p>
        </div>
        <button onClick={onShowFollowers} className="text-center">
          <p className="text-base font-bold">{profile.stats.followers}</p>
          <p className="text-xs text-gray-500">팔로워</p>
        </button>
        <button onClick={onShowFollowing} className="text-center">
          <p className="text-base font-bold">{profile.stats.following}</p>
          <p className="text-xs text-gray-500">팔로잉</p>
        </button>
      </div>
    </div>
  );
}
