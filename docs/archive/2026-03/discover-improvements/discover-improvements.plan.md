# discover-improvements Plan

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 발견 페이지의 스켈레톤이 개별 animate-pulse로 산만하고, 새로고침 시 콘텐츠 즉시 사라짐, SpotBlock 전환에 애니메이션 없음, 위치 거부 시 빈 상태 안내 부족 |
| **Solution** | 통합 스켈레톤 개선, 새로고침 시 dim+fade 전환, SpotBlock 등장 애니메이션, 위치 거부 빈 상태 개선 |
| **Function/UX Effect** | 로딩 중 자연스러운 시각 피드백, 새로고침 시 콘텐츠 연속성, Spot 카드 등장 시 생동감 |
| **Core Value** | 발견 페이지 첫인상 품질 향상, 새로고침 유도 증가, 위치 허용 전환율 개선 |

## 1. Problem Statement

현재 발견 페이지 (`/`, DiscoverPage) UX 문제점:
- **스켈레톤**: 각 요소가 개별 `animate-pulse` → 통일감 부족, 각 요소 크기 불일치
- **새로고침**: "다른 추천 보기" 클릭 시 기존 SpotBlock이 즉시 사라짐 → 깜빡임
- **SpotBlock 전환**: 새 데이터 도착 시 애니메이션 없이 즉시 교체
- **위치 거부 상태**: LocationPermissionBanner만 표시, 위치 없이도 제대로 작동한다는 피드백 부족
- **NearbySpotScroll**: 좌우 스크롤 가능하다는 시각적 힌트 없음

## 2. Solution

### 2.1 스켈레톤 개선 (DiscoverSkeleton)
- ExploreNavBar 영역 스켈레톤 추가 (현재 누락)
- 스태거드 딜레이 적용 (feed-improvements 패턴 재사용)
- SpotBlock 스켈레톤에 실제 카드와 동일한 border-color (blue/green)

### 2.2 새로고침 전환 효과 (DiscoverPage)
- `isRefreshing` 상태 추가 (기존 isLoading과 분리)
- 새로고침 시 기존 콘텐츠 유지 + opacity 0.5 dim
- 새 데이터 도착 후 fade-in 복구
- 새로고침 버튼 스피너는 유지

### 2.3 SpotBlock 등장 애니메이션 (SpotBlock)
- 새 데이터 렌더링 시 fade-in + translateY 애니메이션
- `key` prop으로 SpotBlock 재마운트 트리거
- Tailwind `animate-[fadeInUp]` 커스텀 또는 inline transition

### 2.4 NearbySpotScroll 스크롤 힌트
- 우측 페이드 그래디언트 (스크롤 가능 힌트)
- 스크롤 시 좌측 그래디언트도 표시

### 2.5 위치 거부 시 빈 상태 개선 (DiscoverPage)
- 위치 거부 시에도 "인기 Spot" 기반으로 정상 작동한다는 서브텍스트 추가
- LocationPermissionBanner에 "위치 없이도 둘러볼 수 있어요" 부연 텍스트

## 3. Scope

| # | 파일 | 작업 | 신규/수정 |
|---|------|------|-----------|
| 1 | `src/components/discover/DiscoverSkeleton.tsx` | 스태거드 + NavBar 스켈레톤 | 수정 |
| 2 | `src/components/discover/DiscoverPage.tsx` | isRefreshing + fade 전환 | 수정 |
| 3 | `src/components/discover/SpotBlock.tsx` | 등장 애니메이션 | 수정 |
| 4 | `src/components/discover/NearbySpotScroll.tsx` | 스크롤 힌트 그래디언트 | 수정 |
| 5 | `src/components/discover/LocationPermissionBanner.tsx` | 부연 텍스트 추가 | 수정 |

**총 5개 파일** (모두 수정)

## 4. Implementation Steps

| Step | 파일 | 설명 |
|------|------|------|
| 1 | `DiscoverSkeleton.tsx` | ExploreNavBar 스켈레톤 + 스태거드 딜레이 + border 색상 |
| 2 | `LocationPermissionBanner.tsx` | 부연 텍스트 추가 |
| 3 | `NearbySpotScroll.tsx` | 좌우 스크롤 힌트 그래디언트 |
| 4 | `SpotBlock.tsx` | fadeInUp 등장 애니메이션 |
| 5 | `DiscoverPage.tsx` | isRefreshing dim + SpotBlock key 기반 재마운트 |

## 5. Verification

| # | 항목 | 기대 결과 |
|---|------|-----------|
| 1 | 초기 로딩 | NavBar + SpotBlock 스켈레톤 순차 fade-in |
| 2 | 새로고침 | 기존 콘텐츠 dim → 새 SpotBlock fadeInUp |
| 3 | SpotBlock 등장 | 아래에서 위로 슬라이드+페이드 |
| 4 | NearbySpots | 우측 그래디언트로 스크롤 힌트 |
| 5 | 위치 거부 | "위치 없이도 둘러볼 수 있어요" 표시 |
| 6 | 빌드 | next build 에러 없음 |

## 6. Dependencies

- 없음 (기존 Tailwind CSS 애니메이션만 사용)

## 7. Out of Scope

- Pull-to-refresh (모바일 앱 Phase 9)
- 위치 기반 자동 새로고침 (백엔드 의존)
- Discover 검색 기능 (별도 feature: search-feature)
