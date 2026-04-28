"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useSocialStore } from "@/store/useSocialStore";
import { fetchUserProfile } from "@/lib/api";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import FollowListSheet from "@/components/profile/FollowListSheet";
import ProfileEditSheet from "@/components/profile/ProfileEditSheet";
import LoginBottomSheet from "@/components/auth/LoginBottomSheet";
import type { UserProfile } from "@/types";

export default function MyProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initFollowStatus = useSocialStore((s) => s.initFollowStatus);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(true);
  const [showFollowList, setShowFollowList] = useState<"followers" | "following" | null>(null);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setLoading(false);
      return;
    }

    const userId = user.id;
    fetchUserProfile(userId).then((p) => {
      setProfile(p);
      if (p) {
        initFollowStatus(p.id, false, p.stats.followers);
      }
      setLoading(false);
    });
  }, [isAuthenticated, user, initFollowStatus]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    const handleLoginClose = () => {
      setShowLogin(false);
      router.back();
    };

    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 pb-20">
        <p className="mb-4 text-gray-500">로그인하고 프로필을 확인해보세요</p>
        <LoginBottomSheet
          isOpen={showLogin}
          onClose={handleLoginClose}
          message="로그인하고 프로필을 확인해보세요"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg pb-20">
      <ProfileHeader
        profile={profile}
        isMe={true}
        isFollowing={false}
        onFollow={() => {}}
        onEdit={() => setShowEdit(true)}
        onShowFollowers={() => setShowFollowList("followers")}
        onShowFollowing={() => setShowFollowList("following")}
      />

      <ProfileTabs userId={profile.id} isMe={true} />

      {showFollowList && (
        <FollowListSheet
          isOpen={true}
          onClose={() => setShowFollowList(null)}
          userId={profile.id}
          type={showFollowList}
        />
      )}

      <ProfileEditSheet
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        profile={profile}
        onSave={(updated) => setProfile(updated)}
      />
    </div>
  );
}
