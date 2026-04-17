# spot-detail-page-v2 Design Document

> **Summary**: Spot 상세 페이지 UX/비주얼 품질 업그레이드 — Hero 캐러셀, 사진 병합, 정보 레이아웃 리디자인
>
> **Feature**: spot-detail-page-v2
> **Version**: 0.1.0
> **Date**: 2026-04-17
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | Spot 상세 페이지의 Hero 이미지가 1장 고정이고, 정보 섹션 간 시각적 계층이 부족하여 콘텐츠 중심 플랫폼의 상세 페이지로서 몰입감이 부족하다 |
| **Solution** | Hero를 CSS scroll-snap 캐러셀로 교체하고, PlaceInfo/CrewNote/SpotLines 섹션의 비주얼을 개선하여 정보 탐색 경험을 향상시킨다 |
| **Function/UX Effect** | 사진 탐색이 자연스러워지고, 각 섹션이 명확히 구분되어 사용자 체류 시간과 SpotLine 전환율이 향상된다 |
| **Core Value** | SEO 유입 사용자를 SpotLine 탐색으로 자연스럽게 유도하는 핵심 상세 페이지 품질 향상 |

---

## 1. Overview

### 1.1 Purpose

Plan 문서 `docs/01-plan/features/spot-detail-page-v2.plan.md`에 정의된 7개 FR을 구현하기 위한 상세 설계.

### 1.2 Reference

- Plan: `docs/01-plan/features/spot-detail-page-v2.plan.md`
- Current page: `src/app/spot/[slug]/page.tsx` (164 lines)
- Components: `src/components/spot/` (7 files MODIFY + 1 NEW)

---

## 2. Architecture

### 2.1 Component Structure

```
src/app/spot/[slug]/page.tsx (MODIFY)
├── SpotHero.tsx (MODIFY) — 캐러셀 통합
│   └── HeroCarousel.tsx (NEW) — "use client" 캐러셀 인터랙션
├── SpotCrewNote.tsx (MODIFY) — 인용 스타일
├── SpotPlaceInfo.tsx (MODIFY) — 카드형 레이아웃
├── SpotImageGallery.tsx (MODIFY) — 병합 사진 소스
├── SpotSpotLines.tsx (MODIFY) — 썸네일 추가
└── SpotBottomBar.tsx (MODIFY) — CTA 개선
```

### 2.2 Server/Client Boundary

| Component | Rendering | Reason |
|-----------|-----------|--------|
| `page.tsx` | Server | SSR + 사진 병합 연산 |
| `SpotHero` | Server | Hero 영역 SSR (이미지 SEO) |
| `HeroCarousel` | Client | 스와이프 인터랙션 + IntersectionObserver |
| `SpotPlaceInfo` | Client | DailyHoursAccordion 유지 |
| `SpotCrewNote` | Server | 정적 렌더링 |
| `SpotSpotLines` | Server | 정적 렌더링 |
| `SpotImageGallery` | Client | Lightbox 인터랙션 유지 |
| `SpotBottomBar` | Client | Social 인터랙션 유지 |

---

## 3. Detailed Design

### 3.1 FR-01: Hero 이미지 캐러셀 (HeroCarousel.tsx — NEW)

**CSS scroll-snap 기반, 라이브러리 없이 구현.**

```
┌──────────────────────────────┐
│  [←]  ┌────────────────┐     │
│       │                │     │
│       │   Image 1/5    │     │
│       │                │     │
│       └────────────────┘     │
│         ● ○ ○ ○ ○           │
└──────────────────────────────┘
```

**HeroCarousel.tsx** (`"use client"`):

```typescript
interface HeroCarouselProps {
  photos: string[];
  title: string;
}
```

**구현 방식:**
- Container: `overflow-x-auto snap-x snap-mandatory` + `scrollbar-hide`
- Items: `snap-center w-full shrink-0`
- 인디케이터: `IntersectionObserver`로 현재 슬라이드 감지 → dot 활성화
- 첫 장만 `priority`, 나머지 `loading="lazy"`
- 이미지 0장: MapPin placeholder 유지
- 이미지 1장: 캐러셀 없이 단일 이미지 (기존과 동일)
- 이미지 2~5장: 캐러셀 활성화
- 최대 5장까지만 표시 (성능 보호)

**키보드 접근성:**
- `tabIndex={0}` + `onKeyDown` → ArrowLeft/ArrowRight로 `scrollIntoView`
- `aria-roledescription="carousel"`, `aria-label="Spot 사진"`

### 3.2 FR-02 + FR-07: 사진 소스 병합 (page.tsx MODIFY)

**현재 상태**: `page.tsx:80-83`에서 이미 병합 로직 존재.

```typescript
// 현재 코드 (유지)
const allPhotos = [
  ...(spot.placeInfo?.photos || []),
  ...spot.media,
].filter(Boolean);
```

**변경 사항:**
1. 중복 URL 제거 추가
2. Hero용 최대 5장 슬라이스
3. Gallery에는 전체 전달

```typescript
// 변경 후
const allPhotos = [...new Set([
  ...(spot.placeInfo?.photos || []),
  ...spot.media,
].filter(Boolean))];

const heroPhotos = allPhotos.slice(0, 5);
```

**Props 변경:**
- `SpotHero`: `spot` → `spot` + `heroPhotos: string[]` 추가
- `SpotImageGallery`: `photos` → 변경 없음 (이미 `allPhotos` 전달 중)

### 3.3 FR-03: SpotPlaceInfo 카드형 리디자인 (MODIFY)

**현재**: 아이콘+텍스트 세로 리스트
**변경**: 상단에 핵심 정보 요약 카드, 하단에 상세

```
┌──────────────────────────────────┐
│ 매장 정보                         │
│                                  │
│ ┌─────────┐ ┌─────────┐         │
│ │ 🕐      │ │ ⭐      │         │
│ │ 영업 중  │ │ 4.5     │         │
│ │ 21:00종료│ │ 리뷰 234│         │
│ └─────────┘ └─────────┘         │
│                                  │
│ 📞 02-1234-5678                  │
│ 🌐 네이버 플레이스 보기            │
│                                  │
│ ▼ 주간 영업시간                   │
│   월 11:00~21:00                 │
│   화 11:00~21:00 (오늘) ●         │
│   ...                            │
└──────────────────────────────────┘
```

**변경 내용:**
- 상단: 영업상태 + 평점을 2-column grid 카드로 배치
- 영업상태 카드: `SpotBusinessStatus` 로직 인라인으로 가져와 카드 내 표시
- 평점 카드: 별 아이콘 + 점수 + 리뷰 수
- 하단: 전화, Place URL, 주간 영업시간 (기존 DailyHoursAccordion 유지)
- 카드 배경: `bg-gray-50 rounded-xl p-3`

### 3.4 FR-04: SpotCrewNote 인용 스타일 (MODIFY)

**현재**: 단순 blue-50 박스
**변경**: blockquote 인용 스타일 + 비주얼 강조

```
┌──────────────────────────────────┐
│ ┃  "이 카페는 루프탑에서 보는       │
│ ┃   한강 뷰가 진짜 최고예요"       │
│ ┃                                │
│ ┃           — Spotline 크루 추천   │
└──────────────────────────────────┘
```

**변경 내용:**
- 왼쪽 border: `border-l-4 border-blue-400`
- 본문: `italic text-base` + 큰따옴표 감싸기
- 하단: 출처 표시 (`— Spotline 크루 추천` or `— 한줄 소개`)
- 배경: `bg-gradient-to-r from-blue-50/80 to-white` 그라데이션
- Sparkles 아이콘: 유지하되 크루일 때만 표시

### 3.5 FR-05: SpotSpotLines 썸네일 추가 (MODIFY)

**현재**: 보라색 원형 아이콘 (Route icon)
**변경**: `coverImageUrl`이 있으면 썸네일 이미지로 교체

```
┌──────────────────────────────────┐
│ 이 Spot이 포함된 SpotLine         │
│                                  │
│ ┌──────┐ 강남 카페 투어           │
│ │ 📷   │ 카페투어 · 5곳 · 3시간   │
│ └──────┘                         │
│                                  │
│ ┌──────┐ 홍대 데이트 코스          │
│ │ 📷   │ 데이트 · 4곳 · 2시간     │
│ └──────┘                         │
└──────────────────────────────────┘
```

**변경 내용:**
- `SpotLinePreview.coverImageUrl` 존재 시: `OptimizedImage` (40x40, rounded-xl, object-cover)
- `coverImageUrl` 없을 때: 기존 보라색 Route 아이콘 원형 유지 (폴백)
- 썸네일 크기: `h-12 w-12` (48px, 기존 40px에서 약간 증가)

### 3.6 FR-06: SpotBottomBar CTA 개선 (MODIFY)

**현재**: `Route` 아이콘 + "코스" 버튼 (SpotLine 생성 링크)
**변경**: SpotLine이 있을 때 "SpotLine 보기" CTA 추가

**변경 내용:**
- `SpotBottomBar`에 `spotLinesCount: number` prop 추가
- `spotLinesCount > 0`일 때: 코스 버튼 옆에 "SpotLine N" 배지 표시
- 배지 스타일: `bg-purple-100 text-purple-700 text-xs rounded-full px-1.5`
- 클릭 시: 페이지 내 SpotSpotLines 섹션으로 스크롤 (`#spotlines` anchor)

### 3.7 SpotHero 수정 (MODIFY)

**현재**: 단일 이미지 + 그라데이션 + 정보 오버레이
**변경**: 이미지 영역만 HeroCarousel로 교체

```
┌──────────────────────────────────┐
│ [←]                              │
│      ┌────────────────────┐      │
│      │  HeroCarousel      │      │
│      │  (scroll-snap)     │      │
│      └────────────────────┘      │
│        ● ○ ○ ○ ○                │
│ ┌──────────────────────────────┐ │
│ │ 카페  영업중   강남             │ │
│ │ 루프탑 카페 라운지              │ │
│ │ 서울 강남구 역삼동 123-4       │ │
│ │ ⭐ 4.5 (234) 👁 1,234        │ │
│ │ #루프탑 #카페 #한강뷰          │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

**변경 사항:**
- 이미지 영역 (`div.relative.h-64`) → `HeroCarousel` 컴포넌트로 교체
- 그라데이션 오버레이: HeroCarousel 내부로 이동
- 뒤로가기 버튼: HeroCarousel 위에 absolute 배치 유지
- 정보 오버레이 (`-mt-16` 카드): 변경 없음
- `heroPhotos` prop 수신하여 HeroCarousel에 전달

---

## 4. Implementation Guide

### 4.1 Implementation Order

| Step | File | Task | LOC Est. |
|------|------|------|----------|
| 1 | `src/components/spot/HeroCarousel.tsx` | NEW — CSS scroll-snap 캐러셀 | ~70 |
| 2 | `src/app/spot/[slug]/page.tsx` | 사진 중복 제거 + heroPhotos 슬라이스 + props | ~10 |
| 3 | `src/components/spot/SpotHero.tsx` | heroPhotos prop + HeroCarousel 통합 | ~20 |
| 4 | `src/components/spot/SpotCrewNote.tsx` | 인용 스타일 리디자인 | ~15 |
| 5 | `src/components/spot/SpotPlaceInfo.tsx` | 카드형 레이아웃 리디자인 | ~40 |
| 6 | `src/components/spot/SpotSpotLines.tsx` | 썸네일 이미지 추가 | ~15 |
| 7 | `src/components/spot/SpotBottomBar.tsx` | SpotLine count CTA | ~10 |
| 8 | `src/components/spot/SpotImageGallery.tsx` | 변경 최소 (allPhotos 이미 전달됨) | ~5 |
| **Total** | | | **~185** |

### 4.2 Dependencies

- 신규 패키지 설치 없음 (CSS scroll-snap 네이티브)
- `OptimizedImage` 컴포넌트 재사용
- `IntersectionObserver` API (브라우저 네이티브)

### 4.3 CSS Utility 추가

`tailwind.config` 또는 글로벌 CSS에 scrollbar-hide 유틸리티:

```css
/* globals.css에 추가 */
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
```

---

## 5. Error Handling

| Scenario | Handling |
|----------|----------|
| 사진 0장 | MapPin placeholder 표시 (기존 동일) |
| 사진 1장 | 캐러셀 비활성화, 단일 이미지 표시 |
| 이미지 로딩 실패 | OptimizedImage 내장 폴백 (SVG placeholder) |
| coverImageUrl 없는 SpotLine | Route 아이콘 원형 폴백 |
| placeInfo null | PlaceInfo 섹션 미표시 (기존 동일) |
| IntersectionObserver 미지원 | 인디케이터 첫 번째 dot 활성 고정 |

---

## 6. Test Plan

### 6.1 Manual Test Checklist

- [ ] Hero 캐러셀 터치 스와이프 (모바일)
- [ ] Hero 캐러셀 마우스 드래그 (데스크톱)
- [ ] Hero 캐러셀 키보드 ←/→ 탐색
- [ ] 인디케이터 dot 활성 상태 동기화
- [ ] 사진 0장/1장/2장/5장+ 각 케이스
- [ ] SpotPlaceInfo 카드 레이아웃 반응형
- [ ] SpotCrewNote 인용 스타일 렌더링
- [ ] SpotSpotLines 썸네일 표시/폴백
- [ ] BottomBar CTA SpotLine 섹션 스크롤
- [ ] QR 모드 진입 시 레이아웃 정상
- [ ] 빌드 성공 (`pnpm build`)
- [ ] Lighthouse Performance > 90

### 6.2 Responsive Breakpoints

| Breakpoint | Hero Height | 확인 사항 |
|------------|-------------|----------|
| Mobile (< 768px) | `h-64` (256px) | 터치 스와이프 정상 |
| Desktop (>= 768px) | `h-80` (320px) | 마우스 드래그 정상 |

---

## 7. Coding Convention

- `"use client"` 디렉티브: HeroCarousel만 클라이언트 (최소화)
- 이미지: `OptimizedImage` 컴포넌트 사용
- 클래스: `cn()` 유틸리티로 조건부 처리
- 네이밍: PascalCase 컴포넌트, camelCase props
- UI 텍스트: 한국어
- 경로: `@/*` 별칭

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-17 | Initial design | Claude |
