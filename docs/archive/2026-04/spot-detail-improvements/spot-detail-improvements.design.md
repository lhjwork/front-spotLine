# spot-detail-improvements Design

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | Spot 상세 로딩 스켈레톤 동시 깜빡임, Hero info 카드 등장감 없음, 라이트박스 즉시 전환, SpotNearby 스크롤 힌트 없음, BottomBar 맵 패널 즉시 토글 |
| **Solution** | 스태거드 스켈레톤 + info 카드 형태, fadeInUp 등장, 라이트박스 fade/scale, 스크롤 그래디언트, 맵 패널 animate height |
| **Function/UX Effect** | 순차 로딩감, 페이지 진입 생동감, 사진 탐색 부드러움, 스크롤 유도, 맵 토글 자연스러움 |
| **Core Value** | Spot 상세 첫인상 품질, 갤러리 몰입감, BottomBar 인터랙션 완성도 |

## 1. File Specifications

### 1.1 loading.tsx (수정)

**경로**: `src/app/spot/[slug]/loading.tsx`

현재: 모든 요소 개별 `animate-pulse` 동시 깜빡임, info 카드 형태 미반영 (평면적).

**변경 사항**:

1. **스태거드 딜레이**: 각 섹션에 `style={{ animationDelay }}` — 150ms 간격
2. **Hero 스켈레톤 + info 카드**: 실제 SpotHero와 동일한 `-mt-16` 겹침 카드 형태
3. **BottomBar 스켈레톤**: 하단 고정 바 자리 확보

**구조**:
```
┌──────────────────────────────┐
│  Hero image (h-64, bg-gray-200) │  delay: 0ms
│  ┌──────────────────────────┐│
│  │ Info card (-mt-16)       ││  delay: 150ms
���  │ [badge] [area]           ││
│  │ [title ████████]         ││
│  │ [address ██████]         ││
│  └──────────────────────────┘│
├──────────────────────────────┤
│ CrewNote skeleton             │  delay: 300ms
│ (border-blue-100 bg-blue-50)  │
├──────────────────────────────┤
│ PlaceInfo skeleton            │  delay: 450ms
��� (border-gray-100 bg-white)    │
├──────────────────────────────┤
│ Gallery skeleton (3-col grid) │  delay: 600ms
└──────────────────────────────┘
│ BottomBar placeholder (h-16)  │  (no animation, just spacer)
```

각 섹션에 개별 `animate-pulse` + `animationDelay`.

**주의**: `loading.tsx`는 서버 ��포넌트이므로 `"use client"` 불가.
inline `style` + `animationDelay`는 서��� 컴포넌트에서 사용 가능.

### 1.2 SpotHero.tsx (수정)

**경로**: `src/components/spot/SpotHero.tsx`

현재: 서버 컴포넌트, info 카드 (`-mt-16 rounded-2xl bg-white p-4 shadow-sm`)에 애니메이션 없음.

**변경**: info 카드 div에 fadeInUp CSS 클래스 추가.

```diff
- <div className="rounded-2xl bg-white p-4 shadow-sm">
+ <div className="animate-[fadeInUp_0.4s_ease-out] rounded-2xl bg-white p-4 shadow-sm">
```

서버 컴포넌트에서도 CSS 애니메이션 클래스는 사용 가능 (JS 불필요, 순수 CSS).
`@keyframes fadeInUp`은 `globals.css`에 이미 정의됨.

### 1.3 SpotImageGallery.tsx (���정)

**경로**: `src/components/spot/SpotImageGallery.tsx`

현재: 라이트박스 열기/닫기/좌우 이동 즉시 전환, `selectedIndex` state만 사용.

**변경 1 — 라이트박스 backdrop fade**:
```tsx
// 기존: className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
// 변경: animate-[fadeIn_0.2s_ease-out] 추가
className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-[fadeIn_0.2s_ease-out]"
```

`@keyframes fadeIn`은 `globals.css`에 이미 정의됨 (opacity 0→1).

**변경 2 — 이미지 전환 transition**:
이미지 컨테이너에 `key={selectedIndex}`로 재마운트 트리거 + fadeIn:
```tsx
<div key={selectedIndex} className="relative h-[80vh] w-[90vw] max-w-2xl animate-[fadeIn_0.15s_ease-out]">
  <OptimizedImage ... />
</div>
```

**변경 3 — 닫기 버튼 개선**:
닫기 버튼에 backdrop-blur 추가:
```diff
- className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
+ className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30"
```

좌우 버튼에도 동일 backdrop-blur:
```diff
- className="absolute left-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
+ className="absolute left-4 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30"
```

### 1.4 SpotNearby.tsx (수정)

**경로**: `src/components/spot/SpotNearby.tsx`

���재: `overflow-x-auto scrollbar-hide`만 적용, 스크롤 힌트 없음.
서버 컴포넌트 → **`"use client"` 전환 필요** (useState, useRef, onScroll 사용).

**변경**: Discover NearbySpotScroll과 동일한 스크롤 그래디언트 패턴.

```tsx
"use client";

import { useState, useRef } from "react";

// 기존 imports 유지...

export default function SpotNearby({ spots }: SpotNearbyProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(true);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftGradient(el.scrollLeft > 0);
    setShowRightGradient(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };
```

스크롤 컨테이너를 `relative` div로 감싸고 그래디언트 오버레이:
```tsx
<div className="relative">
  <div
    ref={scrollRef}
    onScroll={handleScroll}
    className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
  >
    {/* spot cards */}
  </div>
  {showLeftGradient && (
    <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-gray-50" />
  )}
  {showRightGradient && (
    <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-gray-50" />
  )}
</div>
```

**주의**: SpotNearby는 Spot 상세 페이지에 있어 배경이 `bg-gray-50`이므로 그래디언트도 `from-gray-50` (Discover는 `from-white`).

### 1.5 SpotBottomBar.tsx (수정)

**경로**: `src/components/spot/SpotBottomBar.tsx`

현재: `showMap` 토글 시 `{showMap && ...}` 조건부 렌더링 → 즉시 나타남/사라짐.

**변경**: CSS grid + transition으로 height 애니메이션.

기존:
```tsx
{showMap && (
  <div className="border-t border-gray-100 px-4 py-3">
    <div className="mx-auto max-w-lg">
      <ExternalMapButtons ... />
    </div>
  </div>
)}
```

변경:
```tsx
<div
  className={cn(
    "grid transition-all duration-200 ease-out",
    showMap ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
  )}
>
  <div className="overflow-hidden">
    <div className="border-t border-gray-100 px-4 py-3">
      <div className="mx-auto max-w-lg">
        <ExternalMapButtons ... />
      </div>
    </div>
  </div>
</div>
```

`grid-rows-[1fr]` ↔ `grid-rows-[0fr]` 전환으로 부드러운 height 애니메이션.
Tailwind 4에서 `grid-rows-[0fr]`과 `grid-rows-[1fr]` transition 지원됨.
`overflow-hidden` 내부에 콘텐츠를 감싸야 0fr일 때 올바르게 숨겨짐.

## 2. Implementation Order

| Step | File | Action | Dependencies |
|------|------|--------|-------------|
| 1 | `loading.tsx` | 스태거드 스켈레톤 + info 카드 형태 | 없음 |
| 2 | `SpotHero.tsx` | info 카드 fadeInUp | globals.css (이미 존재) |
| 3 | `SpotImageGallery.tsx` | 라이트박스 fadeIn + 이미지 key 전환 + backdrop-blur | globals.css (이미 존재) |
| 4 | `SpotNearby.tsx` | "use client" + 스크롤 그래디언트 | 없음 |
| 5 | `SpotBottomBar.tsx` | grid-rows 맵 패널 전환 | 없음 |

## 3. Component Tree (변경 후)

```
SpotPage (서버 컴포넌트)
├── SpotHero (서버)
│   └── info card (animate-[fadeInUp_0.4s_ease-out])  ← 수정
├── QrBanner (조건부)
├── SpotCrewNote (서버)
├── PartnerBenefit (서버)
├── SpotPlaceInfo (서버)
├── SpotImageGallery (클라이언트)
│   ├── grid gallery
│   └── lightbox (animate-[fadeIn_0.2s])  ← 수정
│       └── image container (key={index}, animate-[fadeIn_0.15s])  ��� 수정
├── SpotRoutes (서버)
├── SpotNearby (서버 → 클라이언트)  ← "use client" 전환
│   ├── scroll container (ref + onScroll)
│   ├── left gradient (조건부)  ← 신규
│   └── right gradient (조건부)  ← 신규
├── SocialHydrator (클라이언트)
└── SpotBottomBar (클라이언트)
    ├── action buttons
    └── map panel (grid-rows transition)  ← 수정
```

## 4. Verification Criteria

| # | 항목 | 기대 결과 |
|---|------|-----------|
| 1 | 로딩 스켈레톤 | Hero → Info 카드 → CrewNote → PlaceInfo → Gallery 순차 fade-in (150ms 간격) |
| 2 | SpotHero info | 카드가 아래에서 위로 12px fadeInUp (0.4s) |
| 3 | 라이트박스 열기 | 배경 fade-in (0.2s), 이미지 fade-in |
| 4 | ���이트박스 좌우 | key 변경 → 이미지 fade (0.15s) |
| 5 | 라이트박스 버튼 | 닫기/좌우 버튼에 backdrop-blur-sm |
| 6 | SpotNearby | 우측 `from-gray-50` 그래디언트, 스크롤 시 좌측도 표시 |
| 7 | BottomBar 맵 | 토글 시 grid-rows height 전환 (0.2s) + opacity |
| 8 | 빌드 | `pnpm build` 에러 없음 |

## 5. Dependencies

- 외부 라이브러리 추가 없음
- `globals.css`: `fadeInUp`, `fadeIn` keyframes 이미 존재 — 추가 불필요
