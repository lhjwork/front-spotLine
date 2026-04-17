# SpotLine Detail Page v2 — Design Document

> Feature: `spotline-detail-page-v2`
> Plan: `docs/01-plan/features/spotline-detail-page-v2.plan.md`
> Created: 2026-04-17
> Status: Design

## Executive Summary

| Perspective | Description |
|-------------|-------------|
| **Problem** | SpotLine 상세 페이지가 Spot v2 대비 시각적으로 밀리며, 히어로 이미지 없고 크리에이터 정보 부족, 타임라인 카드가 텍스트 중심이라 코스의 매력을 충분히 전달하지 못함 |
| **Solution** | Spot v2에서 검증된 HeroCarousel 재사용, 크리에이터 프로필 섹션 강화, 타임라인 카드 비주얼 확대, 지도 미리보기 상시 표시로 코스 전체 경험을 시각적으로 전달 |
| **Function UX Effect** | 첫 화면에서 코스의 분위기를 바로 파악 가능, 타임라인에서 각 Spot의 사진과 추천 코멘트를 한눈에 확인, 지도에서 동선 파악 |
| **Core Value** | SpotLine의 "경험 코스" 가치를 시각적으로 극대화하여 복제율(Replication)과 체류 시간 증가 |

---

## 1. Component Architecture

### 1.1 Modified Components

| # | File | FR | Change Type |
|---|------|----|-------------|
| 1 | `src/components/spotline/SpotLineHeader.tsx` | FR-01, FR-02, FR-03 | MODIFY |
| 2 | `src/components/spotline/SpotLineTimelineItem.tsx` | FR-04 | MODIFY |
| 3 | `src/components/spotline/SpotLineMapPreview.tsx` | FR-05 | MODIFY |
| 4 | `src/app/spotline/[slug]/page.tsx` | FR-06, FR-07 | MODIFY |

### 1.2 Reused Components (No Changes)

| Component | Path | Usage |
|-----------|------|-------|
| `HeroCarousel` | `src/components/spot/HeroCarousel.tsx` | FR-01: 히어로 캐러셀 |
| `OptimizedImage` | `src/components/common/OptimizedImage.tsx` | FR-04: 타임라인 썸네일 |

---

## 2. Detailed Design — FR-01: Hero Carousel Section

### 2.1 Data Flow

```
SpotLineDetailResponse.spots[]
  → spots.map(s => s.spotMedia[0]).filter(Boolean)
  → heroPhotos: string[]
  → <HeroCarousel photos={heroPhotos} title={spotLine.title} />
```

### 2.2 Implementation in `SpotLineHeader.tsx`

**Before**: `<section className="bg-white pb-4">` 직접 시작, 히어로 이미지 없음

**After**:
```tsx
import HeroCarousel from "@/components/spot/HeroCarousel";
import { Route } from "lucide-react";

// SpotLineHeader 내부, return 최상단
const heroPhotos = spotLine.spots
  .map(s => s.spotMedia?.[0])
  .filter((url): url is string => Boolean(url));

// 히어로 섹션
{heroPhotos.length > 0 ? (
  <div className="relative">
    <HeroCarousel photos={heroPhotos} title={spotLine.title} />
    {/* 뒤로가기 버튼 오버레이 (FR-02) */}
    <div className="absolute left-4 top-4 z-10">
      <Link href="/" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-colors hover:bg-black/40">
        <ArrowLeft className="h-5 w-5 text-white" />
      </Link>
    </div>
  </div>
) : (
  <div className="relative flex h-56 w-full items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 md:h-72">
    <Route className="h-12 w-12 text-blue-300" />
    <div className="absolute left-4 top-4">
      <Link href="/" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-colors hover:bg-black/40">
        <ArrowLeft className="h-5 w-5 text-white" />
      </Link>
    </div>
  </div>
)}
```

### 2.3 Fallback Strategy

이미지 없는 SpotLine → 테마별 그라데이션 배경 + Route 아이콘. 테마별 그라데이션 매핑:

```tsx
const themeGradients: Record<string, string> = {
  DATE: "from-pink-100 to-rose-200",
  TRAVEL: "from-blue-100 to-sky-200",
  WALK: "from-green-100 to-emerald-200",
  HANGOUT: "from-yellow-100 to-amber-200",
  FOOD_TOUR: "from-red-100 to-orange-200",
  CAFE_TOUR: "from-amber-100 to-yellow-200",
  CULTURE: "from-purple-100 to-violet-200",
};
```

---

## 3. Detailed Design — FR-02: Enhanced Header Layout

### 3.1 Layout Changes

**Before**: 뒤로가기 버튼 → 테마 배지 → 제목 → 설명 → 통계 → 소셜 통계 → 크리에이터

**After**: 뒤로가기 버튼이 히어로 오버레이로 이동 → 나머지 정보는 히어로 아래 동일 구조 유지

```tsx
// 히어로 아래 컨텐츠 영역
<div className="px-4 pt-4">
  {/* Theme badge */}
  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${themeColor}`}>
    {themeLabel}
  </span>
  <h1 className="mt-2 text-2xl font-bold text-gray-900">{spotLine.title}</h1>
  {/* description, stats, social stats — 기존 코드 유지 */}
</div>
```

### 3.2 Key Change

- `<div className="px-4 pt-4">` (뒤로가기 버튼 블록) 삭제
- 뒤로가기 버튼은 FR-01의 히어로 오버레이로 이동
- 나머지 영역의 `pt-3` → `pt-4`로 변경 (히어로와의 간격)

---

## 4. Detailed Design — FR-03: Creator Profile Section

### 4.1 Layout

```tsx
{/* Creator profile section — stats 하단, 구분선 위 */}
{spotLine.creatorName && (
  <div className="mt-4 border-t border-gray-100 pt-4">
    <Link
      href={`/profile/${spotLine.creatorId}`}
      className="flex items-center gap-3 transition-colors hover:bg-gray-50 rounded-lg -mx-1 px-1 py-1"
    >
      {/* Avatar with initial fallback */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
        {spotLine.creatorName.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{spotLine.creatorName}</span>
          <span className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-medium",
            spotLine.creatorType === "CREW"
              ? "bg-blue-50 text-blue-600"
              : "bg-gray-100 text-gray-500"
          )}>
            {spotLine.creatorType === "CREW" ? "크루" : "유저"}
          </span>
        </div>
      </div>
      <ArrowLeft className="h-4 w-4 rotate-180 text-gray-300" />
    </Link>
  </div>
)}
```

### 4.2 Notes

- `creatorId`가 null일 수 있으므로, null인 경우 Link를 div로 변경 (클릭 비활성)
- 아바타는 이니셜 폴백 (서버에서 아바타 URL을 받지 않으므로)
- `creatorType` 배지: "CREW" → 파란색, 그 외 → 회색

---

## 5. Detailed Design — FR-04: Enhanced Timeline Cards

### 5.1 Changes in `SpotLineTimelineItem.tsx`

| Element | Before | After |
|---------|--------|-------|
| Thumbnail size | `h-16 w-16` | `h-20 w-20` |
| Category label | `text-[10px] text-gray-400` plain | `rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500` chip |
| crewNote | `truncate` (1줄) | `line-clamp-2` (2줄) |
| Media count badge | 없음 | `spotMedia.length > 1` → "+N" 배지 |

### 5.2 Media Count Badge

```tsx
{/* Thumbnail */}
<div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
  {imageUrl ? (
    <OptimizedImage src={imageUrl} alt={spot.spotTitle} fill className="object-cover" />
  ) : (
    <div className="flex h-full items-center justify-center">
      <MapPin className="h-5 w-5 text-gray-300" />
    </div>
  )}
  {spot.spotMedia.length > 1 && (
    <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 py-0.5 text-[10px] font-medium text-white">
      +{spot.spotMedia.length - 1}
    </span>
  )}
</div>
```

### 5.3 Category Chip Style

```tsx
{/* Before */}
<span className="text-[10px] text-gray-400">{categoryLabel}</span>

{/* After */}
<span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
  {categoryLabel}
</span>
```

### 5.4 CrewNote line-clamp

```tsx
{/* Before */}
<p className="mt-0.5 truncate text-xs text-gray-500">{spot.crewNote}</p>

{/* After */}
<p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{spot.crewNote}</p>
```

---

## 6. Detailed Design — FR-05: Always-visible Map Section

### 6.1 Changes in `SpotLineMapPreview.tsx`

**Before**: `useState(false)` 토글 → 접기/펼치기 패턴
**After**: 항상 표시, `useState` 및 토글 버튼 제거

```tsx
export default function SpotLineMapPreview({ spots, title }: SpotLineMapPreviewProps) {
  const sorted = [...spots].sort((a, b) => a.order - b.order);
  // ... URL 생성 (기존 유지)

  return (
    <section className="mt-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Map className="h-5 w-5 text-blue-600" />
        <h2 className="text-sm font-semibold text-gray-900">경로 지도</h2>
        <span className="text-xs text-gray-400">{sorted.length}곳</span>
      </div>

      {/* Always-visible content */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        {/* Spot list with numbered markers */}
        <div className="space-y-1.5">
          {sorted.map((spot, index) => (
            <div key={spot.spotId} className="flex items-center gap-2 text-xs">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                {index + 1}
              </span>
              <span className="truncate text-gray-700">{spot.spotTitle}</span>
              <span className="shrink-0 text-gray-400">{spot.spotArea}</span>
            </div>
          ))}
        </div>

        {/* External map links */}
        <div className="flex gap-2 pt-3 mt-3 border-t border-gray-100">
          {/* 카카오맵, 네이버지도 버튼 — 기존 코드 유지 */}
        </div>
      </div>
    </section>
  );
}
```

### 6.2 Key Changes

- `"use client"` 디렉티브 제거 가능 (useState 없어짐) → 서버 컴포넌트로 전환
- `useState`, `onClick` 제거
- 토글 버튼 → 섹션 제목으로 교체
- 항상 내용 표시

---

## 7. Detailed Design — FR-06: Desktop Two-Column Layout

### 7.1 Changes in `page.tsx`

**Before**: `<div className="mx-auto max-w-lg px-4">` 단일 컬럼

**After**: md 이상에서 2컬럼 그리드

```tsx
<main className="min-h-screen bg-gray-50 pb-20">
  <JsonLd data={generateSpotLineJsonLd(spotLine)} />
  <Breadcrumb items={[...]} />
  <SpotLineHeader spotLine={spotLine} />

  {/* Desktop: 2-column, Mobile: single column */}
  <div className="mx-auto max-w-5xl px-4 md:flex md:gap-8">
    {/* Left column: Timeline + Comments + Variations */}
    <div className="min-w-0 md:flex-1">
      <SpotLineTimeline spots={spotLine.spots} />
      <CommentSection ... />
      <SpotLineVariations ... />
    </div>

    {/* Right column: Map + Course Summary (sticky) */}
    {spotLine.spots.length >= 2 && (
      <div className="hidden md:block md:w-80 md:shrink-0">
        <div className="sticky top-4 space-y-4">
          <SpotLineMapPreview spots={spotLine.spots} title={spotLine.title} />
          {/* Course summary card */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-gray-900">코스 요약</h3>
            <div className="mt-2 space-y-2 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>전체 소요</span>
                <span className="font-medium text-gray-700">{formatWalkingTime(spotLine.totalDuration)}</span>
              </div>
              <div className="flex justify-between">
                <span>총 거리</span>
                <span className="font-medium text-gray-700">{formatDistance(spotLine.totalDistance)}</span>
              </div>
              <div className="flex justify-between">
                <span>장소 수</span>
                <span className="font-medium text-gray-700">{spotLine.spots.length}곳</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>

  {/* Mobile: Map below timeline (single column) */}
  <div className="mx-auto max-w-lg px-4 md:hidden">
    {spotLine.spots.length >= 2 && (
      <SpotLineMapPreview spots={spotLine.spots} title={spotLine.title} />
    )}
  </div>

  <ViewTracker ... />
  <SocialHydrator ... />
  <SpotLineBottomBar spotLine={spotLine} />
</main>
```

### 7.2 Layout Breakpoints

| Breakpoint | Layout | Max Width |
|:----------:|--------|-----------|
| < md (768px) | 단일 컬럼 | max-w-lg (32rem) |
| >= md | 2컬럼 (flex-1 + w-80) | max-w-5xl (64rem) |

### 7.3 Notes

- `max-w-lg` → `max-w-5xl`로 외부 컨테이너 확대 (데스크톱)
- 모바일에서 MapPreview는 타임라인 아래 별도 블록으로 렌더링
- 데스크톱에서 MapPreview + 코스 요약은 우측 sticky 패널
- `formatWalkingTime`, `formatDistance`는 `@/lib/utils`에서 이미 import

---

## 8. Detailed Design — FR-07: Visual Polish

### 8.1 Section Spacing

모든 섹션 간 간격을 `mt-6`으로 통일:
- `SpotLineTimeline`: `mt-6` (기존 유지)
- `SpotLineMapPreview`: `mt-6` (기존 유지)
- `CommentSection`: 래퍼에 `mt-6` 추가
- `SpotLineVariations`: 래퍼에 `mt-6` 추가

### 8.2 Card Shadows

타임라인 카드에 `shadow-sm` 추가 (Spot v2 스타일과 통일):

```tsx
// SpotLineTimelineItem.tsx
className="mb-4 flex flex-1 gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-colors hover:bg-gray-50"
```

### 8.3 OG Image Update

`page.tsx`의 `generateMetadata`에서 첫 번째 spotMedia를 OG image로 사용:

```tsx
const ogImage = spotLine.spots?.[0]?.spotMedia?.[0];
return {
  // ...existing fields
  openGraph: {
    // ...existing fields
    ...(ogImage && { images: [{ url: ogImage }] }),
  },
};
```

### 8.4 Bottom Bar Spacing

`pb-20` 유지 확인 (SpotLineBottomBar의 fixed position 대응).

---

## 9. Implementation Order

| Order | FR | File | Description | LOC Est. |
|:-----:|------|------|-------------|:--------:|
| 1 | FR-01 + FR-02 + FR-03 | `SpotLineHeader.tsx` | 히어로 캐러셀, 헤더 재구성, 크리에이터 프로필 | ~60 |
| 2 | FR-04 | `SpotLineTimelineItem.tsx` | 타임라인 카드 비주얼 강화 | ~15 |
| 3 | FR-05 | `SpotLineMapPreview.tsx` | 상시 표시 지도 | ~20 |
| 4 | FR-06 + FR-07 | `page.tsx` | 데스크톱 2컬럼 + 비주얼 폴리시 + OG image | ~40 |

**총 예상 LOC 변경**: ~135 lines across 4 files

---

## 10. Data Dependencies

```
SpotLineDetailResponse (기존 API — 변경 없음)
├── spots[].spotMedia[]     → FR-01 heroPhotos 수집
├── creatorId               → FR-03 프로필 링크
├── creatorType             → FR-03 크루/유저 배지
├── creatorName             → FR-03 아바타 이니셜
├── spots[].spotMedia.length → FR-04 +N 배지
├── totalDuration           → FR-06 코스 요약
├── totalDistance            → FR-06 코스 요약
└── theme                   → FR-01 그라데이션 폴백
```

**Backend API 변경**: 없음. 모든 필드가 기존 `SpotLineDetailResponse`에 포함됨.

---

## 11. `"use client"` Boundary Changes

| Component | Before | After | Reason |
|-----------|--------|-------|--------|
| `SpotLineHeader.tsx` | Server | **Client** | `HeroCarousel` 사용 (IntersectionObserver) |
| `SpotLineMapPreview.tsx` | Client | **Server** | `useState` 제거 (상시 표시) |
| `SpotLineTimelineItem.tsx` | Server | Server | 변경 없음 |
| `page.tsx` | Server | Server | 변경 없음 |

### SpotLineHeader Client 전환 상세

`HeroCarousel`은 `"use client"` 컴포넌트이므로, SpotLineHeader 내에서 직접 import하면 SpotLineHeader도 Client Component가 되어야 함. 대안으로 HeroCarousel을 page.tsx에서 직접 렌더링하고 SpotLineHeader를 Server로 유지할 수 있으나, 히어로와 헤더의 시각적 결합이 강하므로 SpotLineHeader를 Client로 전환하는 것이 더 적절.

**결정**: SpotLineHeader에 `"use client"` 추가, HeroCarousel 직접 포함.

---

## 12. Testing Checklist

- [ ] SpotLine에 이미지 있는 경우 → 히어로 캐러셀 표시
- [ ] SpotLine에 이미지 없는 경우 → 테마별 그라데이션 폴백
- [ ] 크리에이터 정보 유/무 → 프로필 섹션 조건부 렌더링
- [ ] creatorId null → 링크 비활성 (div로 렌더링)
- [ ] 타임라인 카드 썸네일 크기 h-20 w-20
- [ ] spotMedia 2장 이상 → "+N" 배지 표시
- [ ] crewNote 2줄까지 표시 (line-clamp-2)
- [ ] 모바일: 단일 컬럼, 지도 타임라인 하단
- [ ] 데스크톱 (768px+): 2컬럼, 지도+요약 우측 sticky
- [ ] OG image에 첫 번째 spotMedia 반영
- [ ] 뒤로가기 버튼 반투명 오버레이 정상 작동
