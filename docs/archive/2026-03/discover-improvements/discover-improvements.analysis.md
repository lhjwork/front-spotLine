# discover-improvements Gap Analysis

## Executive Summary

| 항목 | 값 |
|------|-----|
| **Feature** | discover-improvements |
| **분석일** | 2026-03-28 |
| **Match Rate** | 100% |
| **설계 항목** | 20 |
| **일치** | 20 |
| **차이** | 0 |

## 1. 파일별 비교

### 1.1 globals.css — fadeInUp keyframes

| # | 설계 항목 | 구현 | 일치 |
|---|----------|------|------|
| 1 | `@keyframes fadeInUp` 정의 | ✅ from: opacity 0, translateY(12px) → to: opacity 1, translateY(0) | ✅ |

### 1.2 DiscoverSkeleton.tsx

| # | 설계 항목 | 구현 | 일치 |
|---|----------|------|------|
| 2 | ExploreNavBar 스켈레톤 (sticky top-0 z-20) | ✅ nav 태그, sticky top-0 z-20, border-b border-gray-100 | ✅ |
| 3 | Tab pills 2개 (h-8 w-14 rounded-full bg-gray-200) | ✅ 2개 pill 구현 | ✅ |
| 4 | Chips 6개 (h-7 w-12 rounded-full bg-gray-200) | ✅ 6개 chip 구현 | ✅ |
| 5 | Current spot border-blue-100 | ✅ `border-blue-100` 적용 | ✅ |
| 6 | Next spot border-green-100 | ✅ `border-green-100` 적용 | ✅ |
| 7 | 스태거드 딜레이 (150ms 간격) | ✅ 0/150/300/450/600ms | ✅ |
| 8 | 각 섹션 개별 animate-pulse | ✅ 각 섹션에 animate-pulse 적용 | ✅ |

### 1.3 LocationPermissionBanner.tsx

| # | 설계 항목 | 구현 | 일치 |
|---|----------|------|------|
| 9 | 부연 텍스트 추가 | ✅ `text-xs text-blue-600/70` | ✅ |
| 10 | "위치 없이도 인기 Spot을 둘러볼 수 있어요" 텍스트 | ✅ 정확히 일치 | ✅ |

### 1.4 NearbySpotScroll.tsx

| # | 설계 항목 | 구현 | 일치 |
|---|----------|------|------|
| 11 | scrollRef + onScroll 핸들러 | ✅ useRef + handleScroll | ✅ |
| 12 | showLeftGradient / showRightGradient state | ✅ useState(false) / useState(true) | ✅ |
| 13 | 스크롤 위치 기반 조건 판단 | ✅ scrollLeft > 0 / scrollLeft < scrollWidth - clientWidth - 1 | ✅ |
| 14 | 우측 gradient (bg-gradient-to-l from-white, pointer-events-none) | ✅ absolute right-0, w-8 | ✅ |
| 15 | 좌측 gradient (bg-gradient-to-r from-white, pointer-events-none) | ✅ absolute left-0, w-8 | ✅ |

### 1.5 SpotBlock.tsx

| # | 설계 항목 | 구현 | 일치 |
|---|----------|------|------|
| 16 | animate-[fadeInUp_0.4s_ease-out] 클래스 | ✅ className에 적용 | ✅ |
| 17 | overflow-hidden + transition-shadow hover:shadow-md | ✅ 기존 스타일과 통합 | ✅ |

### 1.6 DiscoverPage.tsx

| # | 설계 항목 | 구현 | 일치 |
|---|----------|------|------|
| 18 | isRefreshing 상태 + async handleRefresh | ✅ useState(false), await loadDiscover | ✅ |
| 19 | SpotBlock 영역 dim 래퍼 (transition-opacity duration-200, opacity-50) | ✅ cn() 조건부 적용 | ✅ |
| 20 | SpotBlock key={spot.id} 기반 재마운트 | ✅ key={data.currentSpot.spot.id}, key={data.nextSpot.spot.id} | ✅ |

## 2. Verification Criteria 검증

| # | 항목 | 결과 |
|---|------|------|
| 1 | NavBar + SpotBlock 스켈레톤 순차 fade-in, border 색상 | ✅ Pass |
| 2 | 새로고침 opacity 50% → 새 데이터 후 fadeInUp | ✅ Pass |
| 3 | SpotBlock 12px translateY + 0.4s fade-in | ✅ Pass |
| 4 | NearbySpots 우측 그래디언트, 스크롤 시 좌측 표시 | ✅ Pass |
| 5 | "위치 없이도 인기 Spot을 둘러볼 수 있어요" 부연 텍스트 | ✅ Pass |
| 6 | pnpm build 에러 없음 | ✅ Pass |

## 3. 결론

**Match Rate: 100%** — 설계 문서의 모든 항목이 구현에 정확히 반영됨.
추가 개선(iterate) 불필요, 바로 Report 단계로 진행 가능.
