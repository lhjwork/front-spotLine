# Feed SpotLine Cover Image Design Document

> **Summary**: SpotLinePreviewCard에 커버 이미지 추가. Backend 이미 coverImageUrl 반환 중 — Frontend 3개 파일만 수정.
>
> **Project**: Spotline (front-spotLine)
> **Version**: 1.0.0
> **Author**: Claude Code
> **Date**: 2026-04-07
> **Status**: Draft
> **Planning Doc**: [feed-spotline-cover-image.plan.md](../../01-plan/features/feed-spotline-cover-image.plan.md)

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | SpotLinePreviewCard가 아이콘만 표시 — BlogCard 대비 시각적 매력 부족. |
| **Solution** | SpotLinePreview 타입에 coverImageUrl 추가, 카드에 이미지 렌더링. Backend 변경 없음. |
| **Function/UX Effect** | 커버 이미지 있는 카드는 이미지 표시, 없으면 기존 아이콘 폴백. |
| **Core Value** | 피드 시각적 매력 향상 → 클릭률 상승. BlogCard와 시각적 일관성 확보. |

---

## 1. Overview

### 1.1 Design Goals

- SpotLinePreviewCard에 커버 이미지 표시 (BlogCard의 `aspect-[2/1]` 패턴 재사용)
- coverImageUrl 없을 때 기존 아이콘+텍스트 레이아웃 폴백 (graceful degradation)
- OptimizedImage 컴포넌트 재사용 (lazy loading, 재시도, 폴백)

### 1.2 Design Principles

- **최소 변경**: 타입 1필드 + 카드 조건부 렌더링 + FollowingFeed 매핑 1줄
- **BlogCard 패턴 참조**: 이미지 있으면 상단 이미지 + 하단 정보, 없으면 기존 레이아웃

---

## 2. File Changes

### 2.1 Frontend — Modified Files (3)

| # | File | Changes |
|---|------|---------|
| 1 | `types/index.ts` | `SpotLinePreview`에 `coverImageUrl?: string` 추가 |
| 2 | `components/shared/SpotLinePreviewCard.tsx` | 커버 이미지 조건부 렌더링 |
| 3 | `components/feed/FollowingFeed.tsx` | SpotLine 매핑에 `coverImageUrl` 포함 |

---

## 3. Detailed Specifications

### 3.1 SpotLinePreview Type (types/index.ts — MODIFY)

```typescript
export interface SpotLinePreview {
  id: string;
  slug: string;
  title: string;
  theme: string;
  area: string;
  totalDuration: number;
  totalDistance: number;
  spotCount: number;
  likesCount: number;
  coverImageUrl?: string;  // NEW — nullable, S3 URL from backend
}
```

### 3.2 SpotLinePreviewCard.tsx (MODIFY)

**Design Decision**: 커버 이미지 유무에 따라 2가지 레이아웃.

**Layout A — coverImageUrl 있을 때 (이미지 카드):**
```
┌──────────────────────────────────┐
│  [커버 이미지 aspect-[2/1]]       │
│  ┌─────────────────────────────┐ │
│  │                             │ │
│  │    OptimizedImage           │ │
│  │                             │ │
│  └─────────────────────────────┘ │
│  [테마뱃지] [지역]                 │
│  제목                             │
│  📍 5곳  🕐 2시간    ❤️ 12       │
└──────────────────────────────────┘
```

**Layout B — coverImageUrl 없을 때 (기존 아이콘 카드, 변경 없음):**
```
┌──────────────────────────────────┐
│ 🟣  [테마뱃지] [지역]             │
│      제목                         │
│      📍 5곳  🕐 2시간   ❤️ 12   │
└──────────────────────────────────┘
```

**구현 상세:**
```tsx
import OptimizedImage from "@/components/common/OptimizedImage";

export default function SpotLinePreviewCard({ spotLine }: SpotLinePreviewCardProps) {
  const themeLabel = themeLabels[spotLine.theme] || spotLine.theme;
  const themeColor = themeColors[spotLine.theme] || "bg-gray-100 text-gray-700";

  return (
    <Link
      href={`/spotline/${spotLine.slug}`}
      className="block overflow-hidden rounded-xl border border-gray-100 bg-white transition-shadow hover:shadow-md"
    >
      {/* Layout A: Cover image */}
      {spotLine.coverImageUrl && (
        <div className="aspect-[2/1] w-full overflow-hidden">
          <OptimizedImage
            src={spotLine.coverImageUrl}
            alt={spotLine.title}
            width={400}
            height={200}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Layout B fallback: icon only when no image */}
          {!spotLine.coverImageUrl && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
              <Route className="h-5 w-5 text-purple-600" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${themeColor}`}>
                {themeLabel}
              </span>
              <span className="text-xs text-gray-400">{spotLine.area}</span>
            </div>
            <h3 className="truncate text-sm font-bold text-gray-900">
              {spotLine.title}
            </h3>
            <div className="mt-1 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-0.5">
                  <MapPin className="h-3 w-3" />
                  {spotLine.spotCount}곳
                </span>
                <span className="flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  {formatWalkingTime(spotLine.totalDuration)}
                </span>
              </div>
              <SocialActionButtons
                type="spotline"
                id={spotLine.id}
                initialLikesCount={spotLine.likesCount}
                initialSavesCount={0}
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
```

**Key Changes vs Current:**
1. `"use client"` 디렉티브 추가 (OptimizedImage가 client component)
2. `overflow-hidden` 추가 (이미지가 rounded-xl 안에 clip)
3. `p-4` 위치 변경 (이미지 밖 → 텍스트 영역만)
4. 아이콘은 `!spotLine.coverImageUrl` 조건부 렌더링
5. OptimizedImage import 추가

### 3.3 FollowingFeed.tsx (MODIFY)

SpotLine 매핑에 `coverImageUrl` 1줄 추가:

```typescript
<SpotLinePreviewCard
  key={`sl-${item.id}`}
  spotLine={{
    id: item.id,
    slug: item.slug,
    title: item.title,
    theme: item.theme || "",
    area: item.area || "",
    totalDuration: item.totalDuration || 0,
    totalDistance: 0,
    spotCount: item.spotCount || 0,
    likesCount: item.likesCount,
    coverImageUrl: item.coverImageUrl || undefined,  // NEW
  }}
/>
```

---

## 4. Implementation Order

| Step | Task | File |
|------|------|------|
| 1 | SpotLinePreview 타입에 coverImageUrl 추가 | `types/index.ts` (MODIFY) |
| 2 | SpotLinePreviewCard 리디자인 | `components/shared/SpotLinePreviewCard.tsx` (MODIFY) |
| 3 | FollowingFeed 매핑 업데이트 | `components/feed/FollowingFeed.tsx` (MODIFY) |
| 4 | Frontend 빌드 검증 | `pnpm type-check && pnpm build` |

**총 파일: Frontend MODIFY 3개, Backend 변경 없음**

---

## 5. Verification Checklist

- [ ] coverImageUrl 있는 SpotLine → 이미지 카드 렌더링
- [ ] coverImageUrl 없는 SpotLine → 기존 아이콘 카드 유지
- [ ] FollowingFeed에서 SpotLine 이미지 표시
- [ ] FeedSpotLineSection에서도 이미지 표시 (타입 변경으로 자동 적용)
- [ ] OptimizedImage lazy loading 동작
- [ ] `pnpm type-check` + `pnpm build` 통과

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-07 | Initial design — Feed SpotLine Cover Image | Claude Code |
