# user-profile-enhancement Design Document

> **Summary**: 프로필 페이지를 소셜 허브로 강화 — 공개 콘텐츠 탭, 정확한 통계, 프로필 공유 기능 추가
>
> **Project**: front-spotLine (Spotline)
> **Version**: 0.1.0
> **Author**: Claude
> **Date**: 2026-04-16
> **Status**: Draft
> **Plan Reference**: `docs/01-plan/features/user-profile-enhancement.plan.md`

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 다른 사용자의 프로필에서 생성한 SpotLine/Spot을 볼 수 없고, 통계가 부정확하며(recommended 항상 0, spotlines가 저장 수 표시), 프로필 공유 수단이 없어 소셜 플랫폼으로서 핵심 기능이 부족함 |
| **Solution** | 공개 프로필에 콘텐츠 탭(SpotLine/Spot) 추가, Backend의 spotsCount/spotLinesCount 활용한 정확한 통계, Web Share API 기반 프로필 공유, 블로그 탭 인라인 표시로 전환 |
| **Function/UX Effect** | 다른 사용자의 프로필 방문 시 생성 콘텐츠를 직접 탐색 가능하고, 정확한 활동 통계로 신뢰도 향상, 프로필 링크를 외부에 공유하여 유입 증대 |
| **Core Value** | 프로필이 단순 정보 표시에서 소셜 허브로 전환되어, 콘텐츠 크리에이터의 가시성을 높이고 플랫폼 소셜 기능(Pillar 3)의 기반을 확립 |

---

## 1. Overview

### 1.1 Design Objective

Plan 문서 FR-01~FR-06의 기능 요구사항을 구체적인 컴포넌트/API/타입 변경으로 매핑한다. Backend API에 공개 엔드포인트가 부족한 부분은 Backend 변경을 선행 작업(prerequisite)으로 명시한다.

### 1.2 Backend Prerequisites (Scope 조정)

탐색 결과, Frontend만으로는 FR-01/FR-02/FR-03을 구현할 수 없다:

| 이슈 | 현재 상태 | 필요 변경 |
|------|----------|----------|
| 사용자 생성 SpotLine 공개 조회 | `/me/spotlines-created` (인증 필수) | `GET /users/{userId}/spotlines-created` 공개 엔드포인트 추가 |
| 사용자 생성 Spot 공개 조회 | `/me/spots` (인증 필수) | `GET /users/{userId}/spots` 공개 엔드포인트 추가 |
| 프로필 통계 | `getProfile`이 `(0, 0, 0)` 반환 | spotsCount, spotLinesCount, blogsCount 실제 값 반환 |

**결론**: Backend 3건의 변경을 선행 작업으로 포함한다. Plan의 Out of Scope를 수정한다.

---

## 2. Architecture

### 2.1 Component Diagram

```
page.tsx (SSR - generateMetadata 강화)
  └── ProfileClient.tsx (client component)
        ├── ProfileHeader.tsx
        │     ├── 기존: avatar, nickname, bio, follow/edit 버튼
        │     ├── 변경: 통계 라벨 수정 (게시물→SpotLine, ??? →Spot)
        │     └── 추가: ShareButton (Web Share API + 클립보드 폴백)
        ├── ProfileTabs.tsx
        │     ├── 기존 탭: likes, saves, visited (공개)
        │     ├── 변경: spotlines, my-spots 탭 → 공개 전환 (meOnly 제거)
        │     ├── 변경: blogs 탭 → 인라인 표시 (리다이렉트 제거)
        │     └── 추가: 비로그인 사용자도 공개 탭 데이터 로드
        └── FollowListSheet.tsx (기존 유지)
```

### 2.2 Data Flow

```
[공개 프로필 방문]
  → page.tsx: fetchUserProfile(userId) → SSR 메타데이터 생성
  → ProfileClient: isMe 판별
  → ProfileHeader: stats 표시 (spotsCount, spotLinesCount from profile)
  → ProfileTabs:
      - likes/saves/visited: 기존 API 그대로
      - spotlines 탭: fetchUserSpotLines(userId) → SpotLine 목록
      - my-spots 탭: fetchUserSpots(userId) → Spot 목록
      - blogs 탭: fetchUserBlogs(userId) → Blog 목록 (인라인)
```

---

## 3. Data Model

### 3.1 UserProfile 타입 변경

```typescript
// src/types/index.ts — stats 인터페이스 변경

export interface UserProfile {
  id: string;
  nickname: string;
  avatar: string;
  bio?: string;
  joinedAt: string;
  email?: string;
  instagramId?: string;
  stats: {
    visited: number;
    liked: number;
    recommended: number;     // deprecated → spotsCount로 대체
    spotlines: number;       // deprecated → spotLinesCount로 대체
    spotsCount: number;      // NEW: 생성한 Spot 수
    spotLinesCount: number;  // NEW: 생성한 SpotLine 수
    blogsCount: number;      // NEW: 작성한 블로그 수
    followers: number;
    following: number;
  };
}
```

> **하위 호환**: `recommended`/`spotlines` 필드는 유지하되, UI에서는 `spotsCount`/`spotLinesCount` 사용.

---

## 4. API Specification

### 4.1 Backend 추가 필요 엔드포인트 (선행 작업)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/v2/users/{userId}/spotlines-created` | 사용자 생성 SpotLine 목록 | 불필요 |
| GET | `/api/v2/users/{userId}/spots` | 사용자 생성 Spot 목록 | 불필요 |
| GET | `/api/v2/users/{userId}/blogs` | 사용자 작성 Blog 목록 | 불필요 |

### 4.2 Frontend API 함수 추가

```typescript
// src/lib/api.ts — 추가 함수

// 사용자 생성 SpotLine 목록 (공개)
export async function fetchUserSpotLines(userId: string): Promise<SpotLinePreview[]> {
  const { data } = await api.get(`/users/${userId}/spotlines-created`);
  return data;
}

// 사용자 생성 Spot 목록 (공개)
export async function fetchUserSpots(userId: string): Promise<SpotPreview[]> {
  const { data } = await api.get(`/users/${userId}/spots`);
  return data;
}

// 사용자 작성 Blog 목록 (공개)
export async function fetchUserBlogs(userId: string): Promise<Blog[]> {
  const { data } = await api.get(`/users/${userId}/blogs`);
  return data;
}
```

### 4.3 기존 API 활용 (변경 없음)

| 함수 | 엔드포인트 | 용도 |
|------|-----------|------|
| `fetchUserLikedSpots(userId)` | `/users/${userId}/likes/spots` | likes 탭 |
| `fetchUserSavedSpotLines(userId)` | `/users/${userId}/saves/spotlines` | saves 탭 |
| `fetchVisitedSpots(userId)` | `/users/${userId}/visited-spots` | visited 탭 |

---

## 5. UI/UX Design

### 5.1 ProfileHeader 변경

**통계 행 변경 (before → after)**:

| Before | After |
|--------|-------|
| 게시물: `liked + recommended` (recommended=0) | SpotLine: `stats.spotLinesCount` |
| 팔로워: `followers` | Spot: `stats.spotsCount` |
| 팔로잉: `following` | 팔로워: `followers` |
| | 팔로잉: `following` |

```
┌──────────────────────────────────────────┐
│  [Avatar]  닉네임           [공유] [팔로우]│
│            @instagramId                   │
│            bio text...                    │
│                                           │
│  SpotLine    Spot    팔로워    팔로잉       │
│     5         12      120       45        │
└──────────────────────────────────────────┘
```

**공유 버튼**: ProfileHeader 우측 상단, `Share2` 아이콘 (lucide-react).

### 5.2 ProfileTabs 변경

**탭 순서 변경**:

| 순서 | 탭 | 아이콘 | 공개 | 비고 |
|------|-----|-------|------|------|
| 1 | SpotLine | MapPin | ✅ | `meOnly` 제거 |
| 2 | Spot | Map | ✅ | `meOnly` 제거, 라벨 "내 Spot" → "Spot" |
| 3 | 블로그 | BookOpen | ✅ | `meOnly` 제거, 인라인 표시 |
| 4 | 좋아요 | Heart | ✅ | 기존 유지 |
| 5 | 저장 | Bookmark | ✅ | 기존 유지 |
| 6 | 체크인 | MapPinCheck | ✅ | 기존 유지 |

**핵심 변경**: 모든 탭이 공개. `meOnly` 속성 완전 제거.

### 5.3 빈 상태 처리

콘텐츠가 없는 탭:
```
┌──────────────────────────────────────┐
│                                      │
│       아직 생성한 SpotLine이 없어요     │
│                                      │
└──────────────────────────────────────┘
```

- isMe인 경우: "첫 SpotLine을 만들어보세요!" CTA 버튼 추가
- 타인 프로필: 안내 메시지만

### 5.4 공유 기능

```typescript
async function handleShare() {
  const url = `${window.location.origin}/profile/${profile.id}`;
  const shareData = {
    title: `${profile.nickname}의 프로필`,
    text: profile.bio || `${profile.nickname}의 Spotline 프로필을 확인해보세요`,
    url,
  };

  if (navigator.share) {
    await navigator.share(shareData);
  } else {
    await navigator.clipboard.writeText(url);
    toast.success("프로필 링크가 복사되었습니다");
  }
}
```

### 5.5 SEO 메타데이터 강화

```typescript
// page.tsx generateMetadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await fetchUserProfile(params.userId);
  const title = `${profile.nickname}의 프로필 | Spotline`;
  const description = profile.bio ||
    `${profile.nickname}님이 ${profile.stats.spotLinesCount}개의 SpotLine과 ${profile.stats.spotsCount}개의 Spot을 공유합니다`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      images: profile.avatar ? [{ url: profile.avatar }] : [],
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}
```

---

## 6. Error Handling

| 상황 | 처리 |
|------|------|
| API 호출 실패 (탭 데이터) | 탭 내 에러 메시지 표시, 재시도 버튼 |
| 프로필 미존재 (404) | 기존 notFound() 동작 유지 |
| Web Share API 실패 | 클립보드 복사 폴백 |
| 클립보드 복사 실패 | toast.error("링크 복사에 실패했습니다") |
| 공개 SpotLine/Spot API 미구현 시 | 탭 비활성화 또는 "준비 중" 메시지 |

---

## 7. Security

- 공개 프로필 탭은 인증 불필요 (공개 API만 사용)
- 이메일 등 민감 정보는 `isMe`일 때만 표시 (기존 로직 유지)
- XSS 방지: profile.bio 등 사용자 입력은 React 기본 이스케이핑 활용

---

## 8. Implementation Guide

### 8.1 구현 순서

| 순서 | 대상 | 작업 | 의존 |
|------|------|------|------|
| 0 | **Backend** | 공개 엔드포인트 3개 추가 + 프로필 통계 수정 | 선행 필수 |
| 1 | `src/types/index.ts` | UserProfile stats 타입 확장 | - |
| 2 | `src/lib/api.ts` | fetchUserSpotLines, fetchUserSpots, fetchUserBlogs 추가 | 순서 0 |
| 3 | `src/components/profile/ProfileHeader.tsx` | 통계 라벨/값 변경 + 공유 버튼 | 순서 1 |
| 4 | `src/components/profile/ProfileTabs.tsx` | meOnly 제거, 공개 탭 데이터 로드, 블로그 인라인 | 순서 2 |
| 5 | `src/app/profile/[userId]/ProfileClient.tsx` | 신규 탭 데이터 전달 로직 (필요시) | 순서 3, 4 |
| 6 | `src/app/profile/[userId]/page.tsx` | SEO 메타데이터 강화 | 순서 1 |

### 8.2 파일별 변경 요약

| 파일 | 변경 유형 | 변경 내용 |
|------|----------|----------|
| `src/types/index.ts` | MODIFY | stats에 spotsCount, spotLinesCount, blogsCount 추가 |
| `src/lib/api.ts` | MODIFY | fetchUserSpotLines, fetchUserSpots, fetchUserBlogs 추가 |
| `src/components/profile/ProfileHeader.tsx` | MODIFY | 통계 행 변경 (4칸), 공유 버튼 추가 |
| `src/components/profile/ProfileTabs.tsx` | MODIFY | meOnly 제거, 탭 순서 변경, 블로그 인라인, 공개 데이터 페칭 |
| `src/app/profile/[userId]/page.tsx` | MODIFY | OG/Twitter 메타데이터 강화 |
| `src/app/profile/[userId]/ProfileClient.tsx` | MODIFY | 필요시 추가 props 전달 |

### 8.3 Coding Conventions (프로젝트 준수)

- `"use client"` 디렉티브: ProfileHeader, ProfileTabs (인터랙티브)
- 경로 별칭: `@/*` 사용
- Tailwind CSS 4 + `cn()` 유틸리티
- UI 텍스트: 한국어
- 모바일 퍼스트 반응형

---

## 9. Clean Architecture Checklist

- [x] 단일 책임: 각 컴포넌트가 하나의 역할 (Header=통계+공유, Tabs=콘텐츠 탐색)
- [x] API 레이어 분리: api.ts에 함수 추가, 컴포넌트에서 직접 호출 없음
- [x] 타입 안전: UserProfile 인터페이스 확장으로 타입 일관성 유지
- [x] 하위 호환: 기존 recommended/spotlines 필드 유지

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-16 | Initial design | Claude |
