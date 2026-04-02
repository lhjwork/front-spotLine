# spot-detail-improvements Plan

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | Spot 상세 로딩 스켈레톤에 스태거드 없이 모든 요소 동시 깜빡임, Hero 이미지/Info 카드 등장 애니메이션 없음, 이미지 갤러리 라이트박스 전환이 즉시 교체, SpotNearby 스크롤 힌트 없음, BottomBar 길찾기 토글 전환 효��� 없음 |
| **Solution** | loading.tsx 스태거드 스켈레톤, Hero+섹션 fadeInUp 등장 애니메이션, 라이트박스 fade 전환, SpotNearby 스크롤 그래디언트, BottomBar 맵 패널 슬라이드 |
| **Function/UX Effect** | 로딩 시 자연스러운 순차 표시, 페이지 진입 시 콘텐츠 생동감, 갤러리 탐색 부드러움, 주변 Spot 스크롤 유도 |
| **Core Value** | Spot 상세 페이지 첫인상 품질 향상, 사진 탐색 몰입감, BottomBar 인터랙션 자연스러움 |

## 1. Problem Statement

현재 Spot 상세 페이지 (`/spot/[slug]`) UX 문제점:

- **로딩 스켈레톤**: `loading.tsx`에 모든 요소가 `animate-pulse` 동시 깜빡임 → 통일감 부족
- **섹션 등장**: Hero 카드, CrewNote, PlaceInfo, Routes, Nearby 등 모든 섹션이 즉시 렌더링 → 등장감 없음
- **이미지 갤러리 라이트박스**: 열기/닫기/좌우 이동 시 애니메이션 없이 즉시 전환
- **SpotNearby 스크롤**: 좌우 스크롤 가능하다는 시각적 힌트 없음 (Discover NearbySpotScroll과 불일치)
- **BottomBar 맵 패널**: 길찾기 버튼 클릭 시 ExternalMapButtons가 즉시 나타남/사라짐

## 2. Solution

### 2.1 스켈레톤 개선 (loading.tsx)
- 스태거드 딜레이 적용 (feed/discover 패턴 재사용)
- Hero → Title → CrewNote → PlaceInfo 순서로 150ms 간격 fade-in
- Hero 스켈레톤 하단에 info 카드 스켈레톤 (실제 SpotHero의 -mt-16 카드 형태 반영)

### 2.2 섹션 등장 애니메이션 (SpotHero 등)
- SpotHero info 카드에 fadeInUp 적용 (globals.css 기존 keyframes 재사용)
- SSR 페이지이므로 서버 컴포넌트에는 애니메이션 불가 → SpotHero info 카드만 CSS 애니메이션 적용

### 2.3 라이트박스 전환 효과 (SpotImageGallery)
- 배경 오버레이 fade-in/out 전환
- 이미지 전환 시 opacity transition (기존 이미지 fade-out → 새 이��지 fade-in)
- 열기/닫기 시 scale + opacity 전환

### 2.4 SpotNearby 스크롤 힌트
- Discover NearbySpotScroll과 동일한 좌우 그래디언트 패턴 적용
- `useRef` + `onScroll` + 조건부 그래디언트 (이미 구현된 패턴 재사용)

### 2.5 BottomBar 맵 패널 전환
- ExternalMapButtons 영역에 height transition (접힘/펼침 애니메이션)
- grid row height transition 또는 max-height + opacity

## 3. Scope

| # | 파일 | 작업 | 신규/수정 |
|---|------|------|-----------|
| 1 | `src/app/spot/[slug]/loading.tsx` | 스태거드 스켈레톤 + info 카드 형태 | 수정 |
| 2 | `src/components/spot/SpotHero.tsx` | info 카드 fadeInUp | 수정 |
| 3 | `src/components/spot/SpotImageGallery.tsx` | 라이트박스 fade/scale 전환 | 수정 |
| 4 | `src/components/spot/SpotNearby.tsx` | 스크롤 힌트 그래디언트 | ���정 |
| 5 | `src/components/spot/SpotBottomBar.tsx` | 맵 패널 height 전환 | 수정 |

**총 5개 파일** (모두 수정)

## 4. Implementation Steps

| Step | 파일 | 설명 |
|------|------|------|
| 1 | `loading.tsx` | 스태거드 딜레이 + info 카드 스켈레톤 형태 개선 |
| 2 | `SpotHero.tsx` | info 카드에 fadeInUp 애니메이션 |
| 3 | `SpotImageGallery.tsx` | 라이트박스 backdrop fade + 이��지 전환 효과 |
| 4 | `SpotNearby.tsx` | 좌우 스크롤 그래디언트 힌트 |
| 5 | `SpotBottomBar.tsx` | 맵 패널 슬라이드 전환 |

## 5. Verification

| # | 항목 | 기대 결과 |
|---|------|-----------|
| 1 | 로딩 | Hero → Title → CrewNote → PlaceInfo 순차 fade-in |
| 2 | SpotHero | info ��드 아래에서 위로 fadeInUp |
| 3 | 라이트박스 열기 | backdrop fade-in + 이미지 scale-up |
| 4 | 라이트박스 좌우 | 이미지 전환 시 fade transition |
| 5 | SpotNearby | 우측 그래디언트 힌트, 스크롤 시 좌측 표시 |
| 6 | BottomBar 맵 | 길찾기 토글 시 부드러운 height 전환 |
| 7 | 빌드 | `pnpm build` 에러 없음 |

## 6. Dependencies

- 없음 (`globals.css` fadeInUp keyframes 이미 존재)

## 7. Out of Scope

- 이미지 갤러리 swipe 제스처 (모바일 앱 Phase 9)
- SpotHero 이미지 parallax 스크롤 효과
- BottomBar 스크롤 기반 자동 숨김
