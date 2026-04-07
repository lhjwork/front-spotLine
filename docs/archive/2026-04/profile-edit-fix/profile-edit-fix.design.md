# Profile Edit Fix Design Document

> **Feature**: Profile Edit Fix
> **Plan Reference**: `docs/01-plan/features/profile-edit-fix.plan.md`
> **Version**: 1.0.0
> **Date**: 2026-04-07
> **Status**: Design

---

## 1. Architecture Overview

### 1.1 Bug Fixes (3 files — `instagramId` → `id`)

```
[profile/me/page.tsx]
- Line 23: !user?.instagramId → !user?.id
- Line 28: user.instagramId → user.id

[ProfileClient.tsx]
- Line 27: user?.instagramId === profile.id → user?.id === profile.id

[FollowListSheet.tsx]
- Line 102: currentUser?.instagramId === u.id → currentUser?.id === u.id
```

### 1.2 New API Functions (api.ts)

```
updateMyProfile({ nickname?, bio?, instagramId? })
  → PUT /api/v2/users/me/profile → UserProfileResponse

requestAvatarUploadUrl(filename, contentType)
  → POST /api/v2/users/me/avatar → { presignedUrl, avatarKey, avatarUrl }

uploadFileToS3(presignedUrl, file)
  → fetch PUT presignedUrl (direct S3, no auth header)

deleteMyAvatar()
  → DELETE /api/v2/users/me/avatar → UserProfileResponse
```

### 1.3 New Component: ProfileEditSheet

```
ProfileEditSheet({ isOpen, onClose, profile, onSave })
  → Portal to document.body
  → Bottom sheet (same pattern as LoginBottomSheet/SpotShareSheet)
  → Form: avatar tap-to-change, nickname input, bio textarea, instagramId input
  → Save → updateMyProfile() + optional avatar upload
  → onSave callback updates parent state + useAuthStore.setUser()
```

### 1.4 ProfileHeader Extension

```
ProfileHeader — add props:
  onEdit?: () => void    ← NEW (optional, only used when isMe=true)

When isMe && onEdit:
  Show "프로필 편집" button instead of follow button
```

---

## 2. Component Specifications

### 2.1 Bug Fix: profile/me/page.tsx

**File**: `front-spotLine/src/app/profile/me/page.tsx`

Replace line 23:
```tsx
// BEFORE
if (!isAuthenticated || !user?.instagramId) {
// AFTER
if (!isAuthenticated || !user?.id) {
```

Replace line 28:
```tsx
// BEFORE
const userId = user.instagramId;
// AFTER
const userId = user.id;
```

### 2.2 Bug Fix: ProfileClient.tsx

**File**: `front-spotLine/src/app/profile/[userId]/ProfileClient.tsx`

Replace line 27:
```tsx
// BEFORE
const isMe = user?.instagramId === profile.id;
// AFTER
const isMe = user?.id === profile.id;
```

### 2.3 Bug Fix: FollowListSheet.tsx

**File**: `front-spotLine/src/components/profile/FollowListSheet.tsx`

Replace line 102:
```tsx
// BEFORE
isMe={currentUser?.instagramId === u.id}
// AFTER
isMe={currentUser?.id === u.id}
```

### 2.4 API Functions (api.ts)

**File**: `front-spotLine/src/lib/api.ts`

Add after profile-related functions section:

```typescript
// ==================== Profile Edit API (v2 — 프로필 수정) ====================

/** 내 프로필 수정 (partial update) */
export async function updateMyProfile(request: {
  nickname?: string;
  bio?: string;
  instagramId?: string;
}): Promise<UserProfile> {
  const { data } = await apiV2.put("/users/me/profile", request, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    timeout: 5000,
  });
  return data;
}

/** 아바타 업로드 URL 생성 */
export async function requestAvatarUploadUrl(
  filename: string,
  contentType: string
): Promise<{ presignedUrl: string; avatarKey: string; avatarUrl: string }> {
  const { data } = await apiV2.post("/users/me/avatar", { filename, contentType }, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    timeout: 5000,
  });
  return data;
}

/** 아바타 삭제 */
export async function deleteMyAvatar(): Promise<UserProfile> {
  const { data } = await apiV2.delete("/users/me/avatar", {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    timeout: 5000,
  });
  return data;
}
```

Note: S3 PUT upload uses `fetch()` directly inside ProfileEditSheet (not a separate api.ts function) since it's an external AWS URL with no auth header.

### 2.5 ProfileEditSheet Component

**File**: `front-spotLine/src/components/profile/ProfileEditSheet.tsx` (NEW)

```typescript
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
  isOpen, onClose, profile, onSave,
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

  useEffect(() => { setMounted(true); }, []);

  // Escape key close
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

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

  // Sync form when profile changes
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

      // Upload avatar if changed
      if (pendingFile.current) {
        const file = pendingFile.current;
        const { presignedUrl, avatarUrl } = await requestAvatarUploadUrl(
          file.name, file.type
        );
        await fetch(presignedUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        newAvatarUrl = avatarUrl;
      }

      // Update profile text fields
      const updated = await updateMyProfile({
        nickname: nickname.trim(),
        bio: bio.trim(),
        instagramId: instagramId.trim().replace(/^@/, ""),
      });

      // Sync auth store
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
      // TODO: show error toast
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
                <Image src={avatarPreview} alt="avatar" fill className="object-cover" sizes="80px" />
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
            <label className="mb-1 block text-sm font-medium text-gray-700">닉네임</label>
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
            <label className="mb-1 block text-sm font-medium text-gray-700">소개</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="자기소개를 입력하세요"
            />
            <p className="mt-1 text-right text-xs text-gray-400">{bio.length}/200</p>
          </div>

          {/* Instagram */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Instagram</label>
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
                ? "bg-gray-300 cursor-not-allowed"
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
```

### 2.6 ProfileHeader — Add Edit Button

**File**: `front-spotLine/src/components/profile/ProfileHeader.tsx`

Add `onEdit` prop:
```typescript
interface ProfileHeaderProps {
  profile: UserProfile;
  isMe: boolean;
  isFollowing: boolean;
  onFollow: () => void;
  onEdit?: () => void;        // ← NEW
  onShowFollowers: () => void;
  onShowFollowing: () => void;
}
```

Replace the button area:
```tsx
{!isMe && (
  <button onClick={onFollow} ...>
    {isFollowing ? "팔로잉" : "팔로우"}
  </button>
)}
```

With:
```tsx
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
  <button onClick={onFollow} ...>
    {isFollowing ? "팔로잉" : "팔로우"}
  </button>
)}
```

### 2.7 profile/me/page.tsx — Connect ProfileEditSheet

**File**: `front-spotLine/src/app/profile/me/page.tsx`

Add state and imports:
```tsx
import ProfileEditSheet from "@/components/profile/ProfileEditSheet";
const [showEdit, setShowEdit] = useState(false);
```

Add `onEdit` prop to ProfileHeader:
```tsx
<ProfileHeader
  profile={profile}
  isMe={true}
  isFollowing={false}
  onFollow={() => {}}
  onEdit={() => setShowEdit(true)}
  ...
/>
```

Add ProfileEditSheet:
```tsx
<ProfileEditSheet
  isOpen={showEdit}
  onClose={() => setShowEdit(false)}
  profile={profile}
  onSave={(updated) => setProfile(updated)}
/>
```

---

## 3. FR Mapping

| FR | Description | File(s) | Change Type |
|----|-------------|---------|-------------|
| FR-01 | profile/me instagramId → id | profile/me/page.tsx | Bug fix (2 lines) |
| FR-02 | ProfileClient isMe fix | ProfileClient.tsx | Bug fix (1 line) |
| FR-03 | FollowListSheet self-detection | FollowListSheet.tsx | Bug fix (1 line) |
| FR-04 | updateMyProfile() API | api.ts | New function (~8 lines) |
| FR-05 | requestAvatarUploadUrl() API | api.ts | New function (~8 lines) |
| FR-06 | deleteMyAvatar() API | api.ts | New function (~6 lines) |
| FR-07 | ProfileEditSheet form | ProfileEditSheet.tsx | New component (~170 lines) |
| FR-08 | Avatar upload in ProfileEditSheet | ProfileEditSheet.tsx | Part of component |
| FR-09 | ProfileHeader edit button | ProfileHeader.tsx | Modify (~10 lines) |
| FR-10 | State sync after save | ProfileEditSheet.tsx + page.tsx | Integration (~5 lines) |

---

## 4. File Inventory

| File | Repo | Change | Lines Changed (est.) |
|------|------|--------|:--------------------:|
| `src/app/profile/me/page.tsx` | front | Bug fix + connect edit sheet | +10 (modify 3) |
| `src/app/profile/[userId]/ProfileClient.tsx` | front | Bug fix isMe | modify 1 |
| `src/components/profile/FollowListSheet.tsx` | front | Bug fix self-detection | modify 1 |
| `src/lib/api.ts` | front | Add 3 API functions | +25 |
| `src/components/profile/ProfileEditSheet.tsx` | front | NEW component | +170 |
| `src/components/profile/ProfileHeader.tsx` | front | Add onEdit prop + button | +12 (modify 5) |

**Total**: 6 files, ~220 lines changed

---

## 5. Implementation Order

| Step | Task | Dependencies |
|------|------|-------------|
| 1 | Bug fix: profile/me/page.tsx (FR-01) | None |
| 2 | Bug fix: ProfileClient.tsx (FR-02) | None |
| 3 | Bug fix: FollowListSheet.tsx (FR-03) | None |
| 4 | API functions in api.ts (FR-04,05,06) | None |
| 5 | ProfileEditSheet component (FR-07,08) | Step 4 |
| 6 | ProfileHeader edit button (FR-09) | None |
| 7 | Connect ProfileEditSheet to page.tsx (FR-10) | Steps 5, 6 |

Steps 1-4, 6 are independent. Step 5 depends on Step 4. Step 7 depends on Steps 5, 6.

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-04-07 | Initial design — 6 files, ~220 lines | Claude Code |
