"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useSocialStore } from "@/store/useSocialStore";
import { fetchFollowStatus } from "@/lib/api";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import FollowListSheet from "@/components/profile/FollowListSheet";
import LoginBottomSheet from "@/components/auth/LoginBottomSheet";
import type { UserProfile } from "@/types";

interface ProfileClientProps {
  profile: UserProfile;
}

export default function ProfileClient({ profile }: ProfileClientProps) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initFollowStatus = useSocialStore((s) => s.initFollowStatus);
  const toggleFollow = useSocialStore((s) => s.toggleFollow);
  const followItem = useSocialStore((s) => s.getFollowStatus(profile.id));

  const [showFollowList, setShowFollowList] = useState<"followers" | "following" | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  const isMe = user?.id === profile.id;
  const isFollowing = followItem?.isFollowing ?? false;

  useEffect(() => {
    if (!isMe && isAuthenticated) {
      fetchFollowStatus(profile.id).then((res) => {
        initFollowStatus(profile.id, res.isFollowing, profile.stats.followers);
      });
    } else {
      initFollowStatus(profile.id, false, profile.stats.followers);
    }
  }, [profile.id, isMe, isAuthenticated, initFollowStatus, profile.stats.followers]);

  const handleFollow = () => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }
    toggleFollow(profile.id);
  };

  return (
    <div className="mx-auto max-w-lg pb-20">
      <ProfileHeader
        profile={profile}
        isMe={isMe}
        isFollowing={isFollowing}
        onFollow={handleFollow}
        onShowFollowers={() => setShowFollowList("followers")}
        onShowFollowing={() => setShowFollowList("following")}
      />

      <ProfileTabs userId={profile.id} isMe={isMe} />

      {showFollowList && (
        <FollowListSheet
          isOpen={true}
          onClose={() => setShowFollowList(null)}
          userId={profile.id}
          type={showFollowList}
        />
      )}

      <LoginBottomSheet
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        message="로그인하고 팔로우해보세요"
      />
    </div>
  );
}
