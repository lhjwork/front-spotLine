"use client";

import Image from "next/image";
import { Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/types";

interface ProfileHeaderProps {
  profile: UserProfile;
  isMe: boolean;
  isFollowing: boolean;
  onFollow: () => void;
  onEdit?: () => void;
  onShowFollowers: () => void;
  onShowFollowing: () => void;
}

export default function ProfileHeader({
  profile,
  isMe,
  isFollowing,
  onFollow,
  onEdit,
  onShowFollowers,
  onShowFollowing,
}: ProfileHeaderProps) {
  const handleShare = async () => {
    const url = `${window.location.origin}/profile/${profile.id}`;
    const shareData = {
      title: `${profile.nickname}의 프로필`,
      text: profile.bio || `${profile.nickname}의 Spotline 프로필을 확인해보세요`,
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // share cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("프로필 링크가 복사되었습니다");
    }
  };

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
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="rounded-lg border border-gray-300 p-1.5 text-gray-500 hover:bg-gray-50"
                aria-label="프로필 공유"
              >
                <Share2 className="h-4 w-4" />
              </button>
              {isMe ? (
                onEdit && (
                  <button
                    onClick={onEdit}
                    className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    프로필 편집
                  </button>
                )
              ) : (
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
          <p className="text-base font-bold">{profile.stats.spotLinesCount}</p>
          <p className="text-xs text-gray-500">SpotLine</p>
        </div>
        <div className="text-center">
          <p className="text-base font-bold">{profile.stats.spotsCount}</p>
          <p className="text-xs text-gray-500">Spot</p>
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
