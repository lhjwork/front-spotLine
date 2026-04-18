# Recommendation Engine — Design Document

> Feature: `recommendation-engine`
> Created: 2026-04-18
> Plan: `docs/01-plan/features/recommendation-engine.plan.md`

## Executive Summary

| Perspective | Description |
|-------------|-------------|
| **Problem** | 피드가 POPULAR/NEWEST 정렬과 지역/카테고리 필터만 제공하여 사용자 행동 데이터(좋아요/저장/방문)가 추천에 활용되지 않음 |
| **Solution** | 프론트엔드에 3개 추천 컴포넌트 + API 함수를 추가하여 백엔드 추천 API와 연동, Graceful Degradation으로 피드 안정성 유지 |
| **Function UX Effect** | 피드 상단 "맞춤 추천" 가로 스크롤 + Spot/SpotLine 상세의 "비슷한 장소/코스" 섹션으로 콘텐츠 발견 경로 확장 |
| **Core Value** | 개인화 추천으로 체류 시간과 탐색 깊이를 높이고, Cold Start 시 인기 콘텐츠 자동 폴백으로 빈 상태 방지 |

---

## 1. Overview

프론트엔드에서 3개의 추천 API를 호출하고 3개의 신규 컴포넌트로 결과를 렌더링한다.
백엔드 `RecommendationService`가 하이브리드 추천(콘텐츠 기반 + 협업 필터링)을 처리하며,
프론트엔드는 응답을 받아 표시만 한다. 추천 API 실패 시 해당 섹션만 숨기고 기존 피드/상세 기능에는 영향 없음.

---

## 2. Implementation Order

| # | File | Change | LOC |
|---|------|--------|-----|
| 1 | `src/types/index.ts` | ADD: RecommendedSpot, SimilarSpotLine 인터페이스 | ~25 |
| 2 | `src/lib/api.ts` | ADD: fetchRecommendedSpots, fetchSimilarSpots, fetchSimilarSpotLines, logRecommendationEvent | ~50 |
| 3 | `src/components/feed/FeedRecommendationSection.tsx` | NEW: 피드 맞춤 추천 가로 스크롤 섹션 | ~90 |
| 4 | `src/components/feed/FeedPage.tsx` | MODIFY: FeedRecommendationSection 삽입 | ~8 |
| 5 | `src/components/spot/SimilarSpots.tsx` | NEW: Spot 상세 "비슷한 장소" 2열 그리드 | ~75 |
| 6 | `src/app/spot/[slug]/page.tsx` | MODIFY: SimilarSpots 삽입 (SpotNearby 아래) | ~12 |
| 7 | `src/components/spotline/SimilarSpotLines.tsx` | NEW: SpotLine 상세 "비슷한 코스" 카드 리스트 | ~65 |
| 8 | `src/app/spotline/[slug]/page.tsx` | MODIFY: SimilarSpotLines 삽입 | ~10 |

**Total**: ~335 LOC (3 NEW, 5 MODIFY)

---

## 3. Detailed Changes

### 3.1 Types — `src/types/index.ts`

```typescript
// 추천 Spot (피드 + 유사 장소 공용)
export interface RecommendedSpot {
  id: string;
  slug: string;
  title: string;
  category: SpotCategory;
  area: string;
  likesCount: number;
  savesCount: number;
  coverImageUrl: string | null;
  reasonLabel: string | null;  // "카페를 자주 저장했어요", "홍대 인기 장소" 등
  score: number;               // 추천 점수 (정렬용, 표시하지 않음)
}

// 유사 SpotLine
export interface SimilarSpotLine {
  id: string;
  slug: string;
  title: string;
  theme: string;
  area: string;
  spotCount: number;
  totalDuration: number;
  likesCount: number;
  coverImageUrl: string | null;
  reasonLabel: string | null;
}

// 추천 이벤트 트래킹
export type RecommendationSource = "feed_recommendation" | "similar_spot" | "similar_spotline";
```

### 3.2 API Functions — `src/lib/api.ts`

```typescript
// 피드 맞춤 추천
export async function fetchRecommendedSpots(
  page = 0,
  size = 10
): Promise<PaginatedResponse<RecommendedSpot>> {
  const sessionId = getOrCreateSessionId();
  const res = await apiV2.get("/recommendations/feed", {
    params: { page, size, sessionId },
  });
  return res.data;
}

// 유사 Spot
export async function fetchSimilarSpots(
  spotId: string,
  size = 6
): Promise<RecommendedSpot[]> {
  const res = await apiV2.get(`/spots/${spotId}/similar`, {
    params: { size },
  });
  return res.data;
}

// 유사 SpotLine
export async function fetchSimilarSpotLines(
  spotlineId: string,
  size = 4
): Promise<SimilarSpotLine[]> {
  const res = await apiV2.get(`/spotlines/${spotlineId}/similar`, {
    params: { size },
  });
  return res.data;
}

// 추천 이벤트 로깅 (fire-and-forget)
export function logRecommendationEvent(
  eventType: "impression" | "click",
  source: RecommendationSource,
  itemId: string
): void {
  const sessionId = getOrCreateSessionId();
  apiV2
    .post("/recommendations/events", { eventType, source, itemId, sessionId })
    .catch(() => {});
}
```

### 3.3 FeedRecommendationSection — `src/components/feed/FeedRecommendationSection.tsx`

NEW 파일. 피드 "전체" 탭 상단에 삽입되는 맞춤 추천 가로 스크롤 섹션.

```typescript
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { fetchRecommendedSpots, logRecommendationEvent } from "@/lib/api";
import OptimizedImage from "@/components/common/OptimizedImage";
import type { RecommendedSpot } from "@/types";

export default function FeedRecommendationSection() {
  const [spots, setSpots] = useState<RecommendedSpot[]>([]);
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const impressionLogged = useRef(false);

  useEffect(() => {
    fetchRecommendedSpots(0, 10)
      .then((res) => {
        setSpots(res.content);
        if (!impressionLogged.current && res.content.length > 0) {
          logRecommendationEvent("impression", "feed_recommendation", "feed");
          impressionLogged.current = true;
        }
      })
      .catch(() => {})  // Graceful: 실패 시 섹션 숨김
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded || spots.length === 0) return null;

  return (
    <section className="px-4 py-3">
      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
        <Sparkles className="h-4 w-4 text-blue-500" />
        맞춤 추천
      </h2>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
      >
        {spots.map((spot) => (
          <Link
            key={spot.id}
            href={`/spot/${spot.slug}`}
            onClick={() => logRecommendationEvent("click", "feed_recommendation", spot.id)}
            className="w-40 shrink-0"
          >
            <div className="relative h-28 w-full overflow-hidden rounded-xl bg-gray-100">
              {spot.coverImageUrl ? (
                <OptimizedImage
                  src={spot.coverImageUrl}
                  alt={spot.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Sparkles className="h-6 w-6 text-gray-300" />
                </div>
              )}
            </div>
            <div className="mt-1.5">
              <p className="truncate text-sm font-medium text-gray-900">{spot.title}</p>
              {spot.reasonLabel && (
                <p className="truncate text-xs text-blue-500">{spot.reasonLabel}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

### 3.4 FeedPage Modification — `src/components/feed/FeedPage.tsx`

`FeedRecommendationSection`을 "전체" 탭의 `FeedSpotLineSection` 위에 삽입.

```diff
 import FeedSpotLineSection from "./FeedSpotLineSection";
+import FeedRecommendationSection from "./FeedRecommendationSection";

           <div ref={contentRef} />
+          <FeedRecommendationSection />
           <FeedSpotLineSection spotLines={spotLines} />
```

**위치**: 필터 영역 아래, SpotLine 섹션 위. 비동기 로딩으로 피드 렌더링 차단 없음.

### 3.5 SimilarSpots — `src/components/spot/SimilarSpots.tsx`

NEW 파일. Spot 상세 페이지에서 유사한 장소를 2열 그리드로 표시.

```typescript
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { fetchSimilarSpots, logRecommendationEvent } from "@/lib/api";
import OptimizedImage from "@/components/common/OptimizedImage";
import type { RecommendedSpot } from "@/types";

interface SimilarSpotsProps {
  spotId: string;
}

export default function SimilarSpots({ spotId }: SimilarSpotsProps) {
  const [spots, setSpots] = useState<RecommendedSpot[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchSimilarSpots(spotId, 6)
      .then((data) => {
        setSpots(data);
        if (data.length > 0) {
          logRecommendationEvent("impression", "similar_spot", spotId);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [spotId]);

  if (!loaded || spots.length === 0) return null;

  return (
    <section className="mt-6 mb-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">비슷한 장소</h2>
      <div className="grid grid-cols-2 gap-3">
        {spots.map((spot) => (
          <Link
            key={spot.id}
            href={`/spot/${spot.slug}`}
            onClick={() => logRecommendationEvent("click", "similar_spot", spot.id)}
            className="overflow-hidden rounded-xl bg-white shadow-sm"
          >
            <div className="relative h-24 w-full bg-gray-100">
              {spot.coverImageUrl ? (
                <OptimizedImage
                  src={spot.coverImageUrl}
                  alt={spot.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <MapPin className="h-5 w-5 text-gray-300" />
                </div>
              )}
            </div>
            <div className="p-2">
              <p className="truncate text-sm font-medium text-gray-900">{spot.title}</p>
              {spot.reasonLabel && (
                <p className="truncate text-xs text-gray-500">{spot.reasonLabel}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

### 3.6 Spot Detail Modification — `src/app/spot/[slug]/page.tsx`

`SimilarSpots`를 `SpotNearby` 아래에 삽입. 서버 컴포넌트이므로 spotId만 전달.

```diff
 import SpotNearby from "@/components/spot/SpotNearby";
+import SimilarSpots from "@/components/spot/SimilarSpots";

         {nearbySpots.length > 0 && <SpotNearby spots={nearbySpots} />}
+        <SimilarSpots spotId={spot.id} />
         <CommentSection ... />
```

**근처 Spot vs 비슷한 장소**: `SpotNearby`는 지리적 근접성 기반, `SimilarSpots`는 카테고리/행동 유사도 기반. 서로 다른 관점의 추천.

### 3.7 SimilarSpotLines — `src/components/spotline/SimilarSpotLines.tsx`

NEW 파일. SpotLine 상세 페이지에서 유사 코스를 세로 카드 리스트로 표시.

```typescript
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Route } from "lucide-react";
import { fetchSimilarSpotLines, logRecommendationEvent } from "@/lib/api";
import OptimizedImage from "@/components/common/OptimizedImage";
import type { SimilarSpotLine } from "@/types";

const themeLabels: Record<string, string> = {
  DATE: "데이트", TRAVEL: "여행", WALK: "산책",
  HANGOUT: "만남", FOOD_TOUR: "맛집투어", CAFE_TOUR: "카페투어", CULTURE: "문화",
};

interface SimilarSpotLinesProps {
  spotlineId: string;
}

export default function SimilarSpotLines({ spotlineId }: SimilarSpotLinesProps) {
  const [spotlines, setSpotlines] = useState<SimilarSpotLine[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchSimilarSpotLines(spotlineId, 4)
      .then((data) => {
        setSpotlines(data);
        if (data.length > 0) {
          logRecommendationEvent("impression", "similar_spotline", spotlineId);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [spotlineId]);

  if (!loaded || spotlines.length === 0) return null;

  return (
    <section className="mt-6 mb-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">비슷한 코스</h2>
      <div className="flex flex-col gap-3">
        {spotlines.map((sl) => (
          <Link
            key={sl.id}
            href={`/spotline/${sl.slug}`}
            onClick={() => logRecommendationEvent("click", "similar_spotline", sl.id)}
            className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
              {sl.coverImageUrl ? (
                <OptimizedImage
                  src={sl.coverImageUrl}
                  alt={sl.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Route className="h-5 w-5 text-gray-300" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">{sl.title}</p>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                <span>{themeLabels[sl.theme] || sl.theme}</span>
                <span>·</span>
                <span>{sl.spotCount}곳</span>
                <span>·</span>
                <span>{sl.area}</span>
              </div>
              {sl.reasonLabel && (
                <p className="mt-0.5 truncate text-xs text-blue-500">{sl.reasonLabel}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

### 3.8 SpotLine Detail Modification — `src/app/spotline/[slug]/page.tsx`

`SimilarSpotLines`를 SpotLine 상세 페이지 하단(CommentSection 위)에 삽입.

```diff
+import SimilarSpotLines from "@/components/spotline/SimilarSpotLines";

           {/* Desktop left column - after Variations */}
+          <SimilarSpotLines spotlineId={spotline.id} />
           <CommentSection ... />
```

---

## 4. Data Flow

```
┌────────────────────────────────────────────────────┐
│ Frontend (Next.js)                                  │
│                                                     │
│  FeedPage ─────→ fetchRecommendedSpots()            │
│       └─ FeedRecommendationSection (가로 스크롤)    │
│                                                     │
│  SpotDetail ───→ fetchSimilarSpots(spotId)           │
│       └─ SimilarSpots (2열 그리드)                  │
│                                                     │
│  SpotLineDetail → fetchSimilarSpotLines(spotlineId)  │
│       └─ SimilarSpotLines (세로 카드 리스트)        │
│                                                     │
│  All components → logRecommendationEvent()          │
│       └─ fire-and-forget POST                       │
└───────────────────┬────────────────────────────────┘
                    │ HTTP (apiV2)
                    ▼
┌────────────────────────────────────────────────────┐
│ Backend (Spring Boot)                               │
│  RecommendationController                           │
│    GET  /recommendations/feed                       │
│    GET  /spots/{id}/similar                         │
│    GET  /spotlines/{id}/similar                     │
│    POST /recommendations/events                     │
│  RecommendationService                              │
│    hybridScore = content*0.4 + collab*0.4 + pop*0.2 │
└────────────────────────────────────────────────────┘
```

---

## 5. Error Handling & Graceful Degradation

| Scenario | Behavior |
|----------|----------|
| 추천 API 실패 (네트워크/500) | `.catch(() => {})` — 섹션 렌더링 안 함, 기존 UI 정상 |
| 추천 결과 0개 | `spots.length === 0 → return null` — 섹션 숨김 |
| 비로그인 사용자 | `sessionId` 기반 요청 — 인기 기반 폴백 (백엔드 처리) |
| 이벤트 로깅 실패 | fire-and-forget — UI 영향 없음 |

---

## 6. Notes

- 백엔드 구현 (RecommendationService, Controller)은 `springboot-spotLine-backend` 레포 별도 작업
- 프론트엔드는 API 응답 구조만 맞으면 독립 개발 가능
- 레거시 `src/components/recommendation/` 디렉토리는 QR 기반 추천으로 별개 — 수정하지 않음
- `logRecommendationEvent`는 기존 분석 로깅 패턴(fire-and-forget, 5초 타임아웃) 동일하게 적용
