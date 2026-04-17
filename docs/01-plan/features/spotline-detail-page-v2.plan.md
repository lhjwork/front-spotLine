# SpotLine Detail Page v2 — Plan Document

> Feature: `spotline-detail-page-v2`
> Created: 2026-04-17
> Status: Plan

## Executive Summary

| Perspective | Description |
|-------------|-------------|
| **Problem** | SpotLine 상세 페이지가 Spot v2 대비 시각적으로 밀리며, 히어로 이미지 없고 크리에이터 정보 부족, 타임라인 카드가 텍스트 중심이라 코스의 매력을 충분히 전달하지 못함 |
| **Solution** | Spot v2에서 검증된 HeroCarousel 재사용, 크리에이터 프로필 섹션 강화, 타임라인 카드 비주얼 확대, 지도 미리보기 상시 표시로 코스 전체 경험을 시각적으로 전달 |
| **Function UX Effect** | 첫 화면에서 코스의 분위기를 바로 파악 가능, 타임라인에서 각 Spot의 사진과 추천 코멘트를 한눈에 확인, 지도에서 동선 파악 |
| **Core Value** | SpotLine의 "경험 코스" 가치를 시각적으로 극대화하여 복제율(Replication)과 체류 시간 증가 |

---

## 1. Background

### 1.1 Current State

SpotLine 상세 페이지(`/spotline/[slug]`)는 기능적으로 완성되어 있으나, 최근 완료된 Spot Detail v2와 비교하면 시각적 품질이 부족함:

- **헤더**: 히어로 이미지 없이 테마 배지 + 제목 + 텍스트 통계만 표시
- **크리에이터**: `by {creatorName}` 한 줄만 표시 (아바타, 프로필 링크 없음)
- **타임라인**: 16x16 작은 썸네일, 텍스트 중심의 카드
- **지도**: 접히는 버튼 → 외부 링크만 (임베디드 지도 없음)
- **데스크톱**: 모바일과 동일한 단일 컬럼 레이아웃

### 1.2 Goal

Spot Detail v2 수준의 시각적 품질로 SpotLine 상세 페이지를 업그레이드하여, 코스의 매력을 첫 화면에서 전달하고 사용자 참여(좋아요, 저장, 복제)를 높인다.

### 1.3 Scope

- **In Scope**: front-spotLine 내 SpotLine 상세 페이지 UI/UX 개선
- **Out of Scope**: 백엔드 API 변경, 새로운 데이터 모델 추가, SpotLine 생성/편집 플로우

---

## 2. Functional Requirements

### FR-01: Hero Carousel Section

**기존 HeroCarousel 컴포넌트 재사용**으로 SpotLine 상세 페이지 상단에 히어로 이미지 캐러셀 추가.

- SpotLine의 각 Spot에서 `spotMedia[0]`을 수집하여 캐러셀 이미지 배열 구성
- CSS scroll-snap + IntersectionObserver 기반 (기존 `HeroCarousel.tsx` 그대로 사용)
- 이미지 없는 SpotLine은 테마별 그라데이션 배경 + Route 아이콘 폴백
- 높이: 모바일 h-56, md:h-72

**수정 대상**: `SpotLineHeader.tsx`, `page.tsx`

### FR-02: Enhanced Header Layout

히어로 캐러셀 아래로 재배치된 헤더 정보 영역.

- 테마 배지 + 제목 + 설명 (기존 유지)
- 통계 행: Spot 수, 소요 시간, 총 거리를 아이콘+텍스트로 표시 (기존 유지)
- 소셜 통계: 좋아요, 복제, 완주 수 (기존 유지)
- 뒤로가기 버튼을 히어로 이미지 위 반투명 오버레이로 이동

**수정 대상**: `SpotLineHeader.tsx`

### FR-03: Creator Profile Section

크리에이터 정보를 별도 섹션으로 강화.

- 아바타 (이니셜 폴백) + 이름 + creatorType 배지 ("크루"/"유저")
- 프로필 페이지 링크 (`/profile/{creatorId}`)
- 헤더 하단에 구분선과 함께 배치

**수정 대상**: `SpotLineHeader.tsx`

### FR-04: Enhanced Timeline Cards

타임라인 아이템의 시각적 품질 향상.

- 썸네일 크기 확대: 16x16 → 20x20 (h-20 w-20)
- `spotMedia`가 2장 이상인 경우 작은 "+N" 배지 표시
- crewNote를 최대 2줄까지 표시 (`line-clamp-2`)
- 카테고리 라벨을 칩 스타일로 변경 (배경색 추가)
- 체류 시간 표시 개선

**수정 대상**: `SpotLineTimelineItem.tsx`

### FR-05: Always-visible Map Section

지도 미리보기를 접기/펼치기 대신 항상 표시.

- 정적 지도 이미지 또는 Spot 목록 + 번호 마커를 항상 표시
- 외부 지도 앱 버튼 (카카오맵, 네이버지도) 하단 유지
- "전체 경로 보기" 텍스트 대신 Spot 이름 리스트와 번호 표시

**수정 대상**: `SpotLineMapPreview.tsx`

### FR-06: Desktop Two-Column Layout

md(768px) 이상에서 2컬럼 레이아웃 적용.

- 좌측: 타임라인 (스크롤)
- 우측: 지도 미리보기 + 코스 요약 정보 (sticky)
- 모바일에서는 기존 단일 컬럼 유지

**수정 대상**: `page.tsx`

### FR-07: Visual Polish

전체적인 디자인 일관성 향상.

- 섹션 간 간격 통일 (mt-6)
- 카드 그림자 및 border 스타일 Spot v2와 통일
- 댓글 섹션과 변형 섹션 사이 구분 강화
- 바텀바 pb-20 여유 공간 확인

**수정 대상**: `page.tsx`, 각 컴포넌트

---

## 3. Non-Functional Requirements

| NFR | Description |
|-----|-------------|
| **Performance** | 히어로 이미지 첫 장만 `priority` 로딩, 나머지 lazy load |
| **Accessibility** | 캐러셀 aria-roledescription, 키보드 네비게이션 (기존 HeroCarousel 이미 지원) |
| **SEO** | 기존 generateMetadata, JSON-LD 유지, OG image에 첫 번째 spotMedia 사용 |
| **Mobile First** | 기본 모바일 → md: 데스크톱 확장 |

---

## 4. Implementation Order

| Order | FR | Component | Type |
|:-----:|------|-----------|------|
| 1 | FR-01 | SpotLineHeader.tsx — Hero Carousel 통합 | MODIFY |
| 2 | FR-02 | SpotLineHeader.tsx — 헤더 레이아웃 재구성 | MODIFY |
| 3 | FR-03 | SpotLineHeader.tsx — 크리에이터 프로필 | MODIFY |
| 4 | FR-04 | SpotLineTimelineItem.tsx — 카드 비주얼 강화 | MODIFY |
| 5 | FR-05 | SpotLineMapPreview.tsx — 상시 표시 지도 | MODIFY |
| 6 | FR-06 | page.tsx — 데스크톱 2컬럼 레이아웃 | MODIFY |
| 7 | FR-07 | page.tsx + 각 컴포넌트 — 비주얼 폴리시 | MODIFY |

**예상 파일 수**: 4 MODIFY (SpotLineHeader, SpotLineTimelineItem, SpotLineMapPreview, page.tsx)
**신규 파일**: 없음 (HeroCarousel 기존 재사용)

---

## 5. Risk & Mitigation

| Risk | Mitigation |
|------|------------|
| SpotLine에 이미지가 하나도 없는 경우 | 테마별 그라데이션 폴백 처리 (FR-01) |
| 데스크톱 레이아웃에서 타임라인이 길어지는 경우 | sticky 우측 패널로 스크롤 경험 유지 |
| HeroCarousel props 변경 필요 | 기존 인터페이스(photos, title) 그대로 호환 |

---

## 6. Dependencies

- `HeroCarousel` 컴포넌트 (`src/components/spot/HeroCarousel.tsx`) — 이미 구현됨, 변경 없이 재사용
- `OptimizedImage` 컴포넌트 — 기존 사용 유지
- Backend API 변경 없음 — `SpotLineDetailResponse.spots[].spotMedia` 이미 제공됨
