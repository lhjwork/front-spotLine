"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateMyProfile, requestAvatarUploadUrl } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import type { UserProfile } from "@/types";

interface ProfileEditSheetProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updated: UserProfile) => void;
}

export default function ProfileEditSheet({
  isOpen,
  onClose,
  profile,
  onSave,
}: ProfileEditSheetProps) {
  const setUser = useAuthStore((s) => s.setUser);
  const [mounted, setMounted] = useState(false);
  const [nickname, setNickname] = useState(profile.nickname);
  const [bio, setBio] = useState(profile.bio || "");
  const [instagramId, setInstagramId] = useState(profile.instagramId || "");
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingFile = useRef<File | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    setNickname(profile.nickname);
    setBio(profile.bio || "");
    setInstagramId(profile.instagramId || "");
    setAvatarPreview(profile.avatar);
    pendingFile.current = null;
  }, [profile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    pendingFile.current = file;
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let newAvatarUrl = profile.avatar;

      if (pendingFile.current) {
        const file = pendingFile.current;
        const { presignedUrl, avatarUrl } = await requestAvatarUploadUrl(
          file.name,
          file.type
        );
        await fetch(presignedUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        newAvatarUrl = avatarUrl;
      }

      const updated = await updateMyProfile({
        nickname: nickname.trim(),
        bio: bio.trim(),
        instagramId: instagramId.trim().replace(/^@/, ""),
      });

      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        setUser({
          ...currentUser,
          nickname: updated.nickname || currentUser.nickname,
          bio: updated.bio,
          instagramId: updated.instagramId,
          avatar: newAvatarUrl || currentUser.avatar,
        });
      }

      onSave({ ...updated, avatar: newAvatarUrl || updated.avatar });
      onClose();
    } catch {
      // 에러 처리는 추후 toast로 개선
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-lg animate-slide-up rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)]">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="relative flex items-center justify-center px-4 pb-3">
          <h2 className="text-lg font-bold">프로필 편집</h2>
          <button onClick={onClose} className="absolute right-4 text-gray-400">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-5 px-6 pb-6">
          {/* Avatar */}
          <div className="flex justify-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="relative h-20 w-20 overflow-hidden rounded-full bg-gray-200"
            >
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="avatar"
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-400">
                  {nickname.charAt(0)}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Camera size={20} className="text-white" />
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Nickname */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              닉네임
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={30}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              소개
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="자기소개를 입력하세요"
            />
            <p className="mt-1 text-right text-xs text-gray-400">
              {bio.length}/200
            </p>
          </div>

          {/* Instagram */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Instagram
            </label>
            <div className="flex items-center rounded-lg border border-gray-300 px-3 py-2">
              <span className="text-sm text-gray-400">@</span>
              <input
                type="text"
                value={instagramId}
                onChange={(e) => setInstagramId(e.target.value)}
                maxLength={50}
                className="ml-1 flex-1 text-sm focus:outline-none"
                placeholder="instagram_id"
              />
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || !nickname.trim()}
            className={cn(
              "w-full rounded-lg py-3 text-sm font-medium text-white transition-colors",
              saving || !nickname.trim()
                ? "cursor-not-allowed bg-gray-300"
                : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
