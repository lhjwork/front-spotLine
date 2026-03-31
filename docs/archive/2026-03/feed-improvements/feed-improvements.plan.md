# feed-improvements Plan

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 피드 페이지의 스켈레톤 로딩이 단순하고, 필터 전환 시 시각적 피드백 부족, 무한 스크롤 로딩 표시 미약, 빈 상태 UI 개선 필요 |
| **Solution** | 스태거드 스켈레톤 로딩, 카테고리 필터 칩 애니메이션, 로딩 인디케이터 개선, 빈 상태 일러스트레이션 추가 |
| **Function/UX Effect** | 콘텐츠 로딩 중 지루함 감소, 필터 인터랙션 즉각적 시각 피드백, 무한 스크롤 진행 상태 명확화 |
| **Core Value** | 피드 탐색 경험 품질 향상으로 체류 시간 증가, 콘텐츠 소비량 확대 |

## 1. Problem Statement

현재 피드 페이지의 UX 문제점:
- **스켈레톤**: 전체 페이지가 동시에 `animate-pulse` → 부자연스러움
- **필터 전환**: 필터 변경 시 콘텐츠 즉시 사라짐 → 깜빡임(flash) 느낌
- **무한 스크롤**: 하단에 작은 Loader2 스피너만 표시 → 로딩 중인지 불명확
- **빈 상태**: 텍스트만 있는 단조로운 빈 상태 → 탐색 유도 부족
- **스크롤 위치**: 필터 변경 후 스크롤 위치 리셋되지 않는 경우 있음

## 2. Solution

### 2.1 스태거드 스켈레톤 (FeedSkeleton 개선)
- 각 스켈레톤 항목에 순차적 fade-in 딜레이 적용
- `animation-delay`를 `nth-child`로 설정 (0ms, 100ms, 200ms...)
- 카드 개별 크기/형태 랜덤화 → 실제 콘텐츠 예시

### 2.2 필터 전환 시 로딩 상태 (FeedPage 개선)
- 필터 변경 시 기존 콘텐츠 유지하면서 opacity 0.5 + 스켈레톤 오버레이
- 새 데이터 도착 후 fade-in 전환
- `isFiltering` 상태 추가 (isLoading과 분리)

### 2.3 무한 스크롤 로딩 인디케이터 (FeedSpotGrid 개선)
- 하단에 2x2 스켈레톤 카드 그리드 표시 (스피너 대신)
- "더 불러오는 중..." 텍스트 추가

### 2.4 빈 상태 일러스트레이션 (EmptyFeed 신규)
- Spot 빈 상태: Compass 아이콘 + "아직 이 지역에 Spot이 없어요" + 피드 둘러보기 CTA
- Route 빈 상태: MapPin 아이콘 + 적절한 메시지

### 2.5 스크롤 위치 관리 (FeedPage 개선)
- 필터 변경 시 콘텐츠 영역 top으로 `scrollIntoView`

## 3. Scope

| # | 파일 | 작업 | 신규/수정 |
|---|------|------|-----------|
| 1 | `src/components/feed/FeedSkeleton.tsx` | 스태거드 애니메이션 | 수정 |
| 2 | `src/components/feed/FeedSpotGrid.tsx` | 로딩 인디케이터 개선 | 수정 |
| 3 | `src/components/feed/FeedPage.tsx` | 필터 전환 로딩, 스크롤 관리 | 수정 |
| 4 | `src/components/feed/EmptyFeed.tsx` | 빈 상태 컴포넌트 | 신규 |
| 5 | `src/components/feed/SpotCardSkeleton.tsx` | 카드형 스켈레톤 | 신규 |

**총 5개 파일** (신규 2 + 수정 3)

## 4. Implementation Steps

| Step | 파일 | 설명 |
|------|------|------|
| 1 | `SpotCardSkeleton.tsx` | 재사용 가능한 카드 스켈레톤 컴포넌트 |
| 2 | `FeedSkeleton.tsx` | 스태거드 애니메이션 적용 |
| 3 | `EmptyFeed.tsx` | 빈 상태 UI (아이콘 + 메시지 + CTA) |
| 4 | `FeedSpotGrid.tsx` | 스켈레톤 카드 로딩 + EmptyFeed 사용 |
| 5 | `FeedPage.tsx` | 필터 전환 UX + 스크롤 관리 |

## 5. Verification

| # | 항목 | 기대 결과 |
|---|------|-----------|
| 1 | 초기 로딩 | 스태거드 스켈레톤 (순차 fade-in) |
| 2 | 무한 스크롤 | 하단에 스켈레톤 카드 2~4개 표시 |
| 3 | 필터 전환 | 기존 콘텐츠 dim + 새 데이터 fade-in |
| 4 | 빈 상태 | 아이콘 + 메시지 + CTA 버튼 |
| 5 | 스크롤 리셋 | 필터 변경 시 콘텐츠 영역 top |
| 6 | 빌드 | next build 에러 없음 |

## 6. Dependencies

- 없음 (기존 Tailwind CSS 애니메이션만 사용, 외부 라이브러리 불필요)

## 7. Out of Scope

- framer-motion 도입 (Tailwind CSS로 충분)
- Pull-to-refresh (모바일 앱 전환 Phase 9에서)
- 피드 개인화/추천 알고리즘 (백엔드 의존)
