# Profile Edit Fix Planning Document

> **Summary**: 프로필 페이지의 instagramId 버그 수정 + 프로필 편집 UI 추가. 현재 로그인한 유저의 /profile/me 페이지가 완전히 깨져있는 Critical 버그 해결.
>
> **Project**: Spotline (front-spotLine)
> **Version**: 1.0.0
> **Date**: 2026-04-07
> **Status**: Planning

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | profile/me 페이지가 `user.instagramId`를 유저 ID로 사용하여, Instagram ID가 없는 대부분의 유저에게 프로필이 아예 로드되지 않는다. `isMe` 비교도 깨져서 타인 프로필에서 팔로우 대신 편집 버튼이 뜨는 등 심각한 버그가 있다. |
| **Solution** | 3곳의 `instagramId` → `id` 버그 수정 + ProfileEditSheet 컴포넌트 신규 생성 + api.ts에 updateProfile/uploadAvatar/deleteAvatar 함수 추가. Backend는 이미 완전히 준비됨. |
| **Function/UX Effect** | 로그인한 유저가 자신의 프로필을 정상적으로 볼 수 있고, 닉네임/소개/Instagram/아바타를 편집할 수 있다. |
| **Core Value** | 유저 계정 시스템의 기본 기능 정상화. 프로필이 깨진 상태에서는 소셜 기능(팔로우, 게시물) 전체가 무의미하다. |

| Item | Detail |
|------|--------|
| Feature | Profile Edit Fix |
| Created | 2026-04-07 |
| Duration | 예상 0.5일 |
| Status | Planning |
| Level | Dynamic |
| Target Repo | front-spotLine (Backend 변경 없음) |

---

## 1. Overview

### 1.1 Purpose

프로필 시스템의 Critical 버그 3건 수정 + 프로필 편집 UI 추가. Backend는 `PUT /api/v2/users/me/profile`, `POST /api/v2/users/me/avatar`, `DELETE /api/v2/users/me/avatar` 엔드포인트가 이미 완전히 구현됨.

### 1.2 Background

- Supabase Auth 마이그레이션 (2026-04-03) 이후 유저 ID가 Supabase UUID로 변경됨
- 레거시 코드가 `user.instagramId`를 유저 식별자로 사용하고 있어 프로필 페이지 전체가 깨짐
- instagramId는 옵셔널 소셜 핸들 필드이지, 유저 식별자가 아님
- `useAuthStore`의 `sessionToUserProfile()`은 `user.id`에 Supabase UUID를 정확히 설정함

### 1.3 Current State

**버그 3건:**
1. `profile/me/page.tsx:23` — `!user?.instagramId` 가드가 instagramId 없는 유저의 프로필 로드를 차단
2. `ProfileClient.tsx:27` — `user?.instagramId === profile.id`로 isMe 비교 → 항상 false
3. `FollowListSheet.tsx:102` — `currentUser?.instagramId === u.id`로 자기 자신 감지 → 항상 false

**누락된 기능:**
- `updateProfile()`, `uploadAvatar()`, `deleteAvatar()` API 함수 (api.ts)
- ProfileEditSheet 컴포넌트 (프로필 편집 바텀시트)
- ProfileHeader에 "프로필 편집" 버튼 (isMe일 때)

---

## 2. Scope

### 2.1 In Scope

- [ ] **Bug Fix**: profile/me/page.tsx의 `instagramId` → `id` 수정
- [ ] **Bug Fix**: ProfileClient.tsx의 `isMe` 비교를 `user?.id === profile.id`로 수정
- [ ] **Bug Fix**: FollowListSheet.tsx의 자기 자신 감지를 `currentUser?.id === u.id`로 수정
- [ ] **Frontend**: `updateProfile()` API 함수 추가 (api.ts)
- [ ] **Frontend**: `generateAvatarUploadUrl()` API 함수 추가 (api.ts)
- [ ] **Frontend**: `deleteAvatar()` API 함수 추가 (api.ts)
- [ ] **Frontend**: ProfileEditSheet 컴포넌트 신규 생성
- [ ] **Frontend**: ProfileHeader에 isMe일 때 "프로필 편집" 버튼 + onEdit 콜백 추가

### 2.2 Out of Scope

- Backend 변경 — 모든 엔드포인트 이미 구현됨
- ProfileHeader의 postsCount 계산 로직 개선 (별도 feature)
- Backend UserProfileResponse의 follower/following 실제 카운트 연동 (별도 feature)
- 프로필 세팅 페이지 (알림 설정, 계정 삭제 등)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | profile/me에서 `user.id`로 프로필 fetch (버그 수정) | Critical | Pending |
| FR-02 | ProfileClient에서 `user.id === profile.id`로 isMe 비교 (버그 수정) | Critical | Pending |
| FR-03 | FollowListSheet에서 `currentUser.id === u.id`로 자기 자신 감지 (버그 수정) | Critical | Pending |
| FR-04 | `updateProfile(request)` API 함수 (PUT /users/me/profile) | High | Pending |
| FR-05 | `generateAvatarUploadUrl(filename, contentType)` API 함수 (POST /users/me/avatar) | High | Pending |
| FR-06 | `deleteAvatar()` API 함수 (DELETE /users/me/avatar) | High | Pending |
| FR-07 | ProfileEditSheet: 닉네임, 소개, Instagram ID 편집 바텀시트 | High | Pending |
| FR-08 | ProfileEditSheet: 아바타 변경 (presigned URL → S3 업로드 → 반영) | High | Pending |
| FR-09 | ProfileHeader에 isMe일 때 "프로필 편집" 버튼 표시 | High | Pending |
| FR-10 | 편집 완료 후 useAuthStore.setUser() + 로컬 프로필 상태 동기화 | High | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria |
|----------|----------|
| UX | 편집 시트는 기존 바텀시트 패턴과 동일 (LoginBottomSheet, SpotShareSheet 참고) |
| Performance | 아바타 업로드는 presigned URL 방식 (서버 부하 없음) |
| Consistency | 기존 프로필 UI 스타일과 일관성 유지 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 로그인한 유저가 /profile/me에서 프로필 정상 로드
- [ ] 타인 프로필 페이지에서 isMe=false, 팔로우 버튼 정상 표시
- [ ] "프로필 편집" 버튼으로 닉네임/소개/Instagram 수정 가능
- [ ] 아바타 사진 변경 가능

### 4.2 Quality Criteria

- [ ] `pnpm lint` 에러 0
- [ ] `pnpm type-check` 통과
- [ ] `pnpm build` 성공

---

## 5. Architecture Considerations

### 5.1 Backend Endpoints (이미 구현됨)

```
PUT  /api/v2/users/me/profile          — { nickname?, bio?, instagramId? }
POST /api/v2/users/me/avatar           — { fileName, contentType } → { uploadUrl, publicUrl }
DELETE /api/v2/users/me/avatar         — 아바타 삭제
```

### 5.2 Frontend 패턴

- 바텀시트: AnimatePresence + motion.div 패턴 (기존 LoginBottomSheet 참고)
- 아바타 업로드: presigned URL → fetch PUT → publicUrl 사용
- 상태 동기화: 편집 후 setUser()로 auth store 업데이트

---

## 6. Implementation Order

| Step | Task | File | Status |
|------|------|------|--------|
| 1 | Bug fix: profile/me/page.tsx instagramId → id | profile/me/page.tsx | Pending |
| 2 | Bug fix: ProfileClient.tsx isMe 비교 | ProfileClient.tsx | Pending |
| 3 | Bug fix: FollowListSheet.tsx self-detection | FollowListSheet.tsx | Pending |
| 4 | API 함수 3개 추가 | api.ts | Pending |
| 5 | ProfileEditSheet 컴포넌트 생성 | components/profile/ProfileEditSheet.tsx | Pending |
| 6 | ProfileHeader에 편집 버튼 + onEdit prop | ProfileHeader.tsx | Pending |
| 7 | profile/me/page.tsx에 ProfileEditSheet 연결 | profile/me/page.tsx | Pending |

Steps 1-3은 독립적이고 병렬 가능. Steps 4-7은 순차적.

---

## 7. Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| S3 presigned URL CORS 이슈 | Medium | Backend에서 이미 CORS 설정됨, 테스트 필요 |
| 아바타 이미지 캐시 | Low | Image URL에 timestamp 파라미터 추가로 캐시 무효화 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-04-07 | Initial plan — Profile Edit Fix | Claude Code |
