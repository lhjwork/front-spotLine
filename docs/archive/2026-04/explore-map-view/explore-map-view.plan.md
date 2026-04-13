# explore-map-view Planning Document

> **Summary**: 카카오맵 SDK 기반 인터랙티브 지도 탐색 페이지 (`/explore`)
>
> **Project**: front-spotLine (Next.js 16)
> **Version**: 0.1
> **Author**: Claude
> **Date**: 2026-04-13
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 현재 Spot 탐색이 리스트 기반(피드)으로만 가능하여 공간적 맥락(위치, 거리, 밀집도)을 파악하기 어렵다 |
| **Solution** | 카카오맵 SDK를 통합한 `/explore` 페이지에 지도+리스트 병렬 뷰를 제공하고, 지역·카테고리 필터와 현재 위치 기반 탐색을 지원한다 |
| **Function/UX Effect** | 지도 핀 클릭으로 Spot 미리보기, 카테고리별 핀 색상 구분, 현위치 중심 자동 이동, 리스트↔지도 상호 연동으로 직관적 공간 탐색 경험 제공 |
| **Core Value** | "내 주변의 경험을 눈으로 발견한다" — 위치 기반 탐색으로 Spot 발견율을 높이고 서비스 체류 시간을 증가시킨다 |

---

## 1. Overview

### 1.1 Purpose

사용자가 지도 위에서 Spot을 시각적으로 탐색할 수 있는 인터랙티브 페이지를 제공한다. 기존 리스트 피드의 한계(공간 맥락 부재)를 보완하여, 위치 관계·거리·밀집 지역을 직관적으로 파악할 수 있게 한다.

### 1.2 Background

- 현재 `/feed` 페이지는 리스트 기반으로만 Spot을 보여주어 공간 맥락이 부족하다
- 기존 `/mockup/a/explore`에 ~2000줄의 목업이 있지만 SVG 기반 시뮬레이션이며 실제 지도 SDK 미통합
- `NEXT_PUBLIC_KAKAO_MAP_API_KEY` 환경변수가 이미 설정되어 있어 카카오맵 연동 준비 완료
- Phase 4 (피드 + 탐색 UI) 범위에 해당하는 핵심 기능

### 1.3 Related Documents

- 목업 참고: `src/app/mockup/a/explore/SpotLineMapView.tsx`
- 전체 Plan: `docs/01-plan/features/experience-social-platform.plan.md`
- 기존 피드: `src/components/feed/FeedPage.tsx`

---

## 2. Scope

### 2.1 In Scope

- [ ] 카카오맵 SDK 통합 (react-kakao-maps-sdk)
- [ ] `/explore` 라우트 생성 (App Router)
- [ ] 지도 뷰 + 하단 리스트 패널 (모바일 레이아웃)
- [ ] 카테고리 필터 칩 (기존 FeedCategoryChips 재사용)
- [ ] 지역(Area) 필터 탭 (기존 FeedAreaTabs 재사용)
- [ ] 카테고리별 핀 색상 구분
- [ ] 핀 클릭 → Spot 미리보기 카드 표시
- [ ] 현재 위치 버튼 (useGeolocation 훅 활용)
- [ ] 지도 영역 변경 시 Spot 데이터 재조회
- [ ] ExploreNavBar에 탐색 탭 추가/연동

### 2.2 Out of Scope

- 데스크톱 split-view 레이아웃 (향후 반응형 확장)
- SpotLine 코스 경로 오버레이 (별도 피처)
- 클러스터링 (Spot 수 증가 시 별도 피처)
- 지도 스타일 커스터마이징 (카카오 기본 스타일 사용)
- 길찾기/내비게이션 기능

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 카카오맵 SDK를 로드하고 지도를 렌더링한다 | High | Pending |
| FR-02 | Spot 데이터를 지도 위 마커(핀)로 표시한다 | High | Pending |
| FR-03 | 카테고리별 마커 색상을 구분한다 (cafe=amber, restaurant=red, culture=indigo 등) | Medium | Pending |
| FR-04 | 마커 클릭 시 Spot 미리보기 카드를 표시한다 (이름, 카테고리, 사진, 크루노트 요약) | High | Pending |
| FR-05 | 미리보기 카드에서 Spot 상세 페이지로 이동할 수 있다 | High | Pending |
| FR-06 | 카테고리 필터로 표시 마커를 필터링한다 | High | Pending |
| FR-07 | 지역(Area) 필터로 지도 중심을 이동하고 해당 지역 Spot을 로드한다 | High | Pending |
| FR-08 | 현재 위치 버튼 클릭 시 사용자 위치로 지도를 이동한다 | Medium | Pending |
| FR-09 | 지도 하단에 현재 보이는 Spot 리스트를 스크롤 패널로 표시한다 | High | Pending |
| FR-10 | 지도 영역(bounds) 변경 시 해당 영역의 Spot을 조회한다 | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 지도 초기 로딩 < 2초 (SDK 포함) | Lighthouse |
| Performance | 마커 100개 이하에서 부드러운 인터랙션 | 수동 테스트 |
| UX | 모바일 터치 제스처 자연스러움 (pinch zoom, drag) | 수동 테스트 |
| SEO | 서버 컴포넌트 래퍼 + 클라이언트 지도 분리 | 코드 리뷰 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 카카오맵 SDK가 정상 로드되어 지도가 렌더링된다
- [ ] Spot 마커가 지도에 표시되고 클릭 시 미리보기가 나타난다
- [ ] 카테고리·지역 필터가 동작한다
- [ ] 현재 위치 버튼이 동작한다
- [ ] type-check, lint 통과

### 4.2 Quality Criteria

- [ ] Zero lint errors (신규 파일)
- [ ] Build succeeds
- [ ] 모바일 뷰포트에서 정상 동작

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 카카오맵 SDK 번들 크기가 크다 | Medium | Medium | Script 태그 동적 로드 + react-kakao-maps-sdk 사용으로 lazy load |
| 대량 마커 렌더링 시 성능 저하 | Medium | Low | 현재 Spot 수 < 300개, 문제 발생 시 클러스터링 추가 |
| 위치 권한 거부 시 UX 저하 | Low | Medium | 기본 중심 좌표(성수)로 폴백, 위치 권한 안내 |
| API 호출 과다 (지도 이동마다) | Medium | Medium | debounce 적용 (300ms), 캐시 활용 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites | ☐ |
| **Dynamic** | Feature-based modules, BaaS | Web apps | ☒ |
| **Enterprise** | Strict layer separation | High-traffic | ☐ |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Map SDK | Kakao / Naver / Google Maps | Kakao | API 키 이미 설정, 한국 서비스 최적화 |
| React Wrapper | react-kakao-maps-sdk / 직접 연동 | react-kakao-maps-sdk | React 선언적 API, 커뮤니티 검증 |
| State | 새 store / useFeedStore 확장 | useExploreStore (신규) | 지도 상태(center, zoom, bounds)는 피드와 분리 필요 |
| 레이아웃 | Split-view / 지도+하단패널 | 지도+하단 드래그 패널 | 모바일 퍼스트, 목업 참고 |
| Data Fetching | 기존 fetchFeedSpots / 신규 API | fetchFeedSpots 재사용 | 이미 area, category, sort 파라미터 지원 |
| 마커 미리보기 | InfoWindow / 커스텀 오버레이 | 커스텀 오버레이 (CustomOverlayMap) | 자유로운 스타일링, Tailwind 적용 가능 |

### 6.3 Clean Architecture Approach

```
Selected Level: Dynamic

Key Files:
┌─────────────────────────────────────────────────────────┐
│ src/app/explore/page.tsx         — 서버 컴포넌트 래퍼    │
│ src/components/explore/          — Explore 전용 컴포넌트  │
│   ├── ExplorePage.tsx            — 메인 클라이언트 컴포넌트│
│   ├── ExploreMap.tsx             — 카카오맵 래퍼          │
│   ├── ExploreMarker.tsx          — Spot 마커 + 색상 로직  │
│   ├── ExploreSpotPreview.tsx     — 마커 클릭 미리보기     │
│   ├── ExploreBottomPanel.tsx     — 하단 Spot 리스트 패널  │
│   └── ExploreLocationButton.tsx  — 현재 위치 버튼        │
│ src/store/useExploreStore.ts     — 지도 상태 (center,    │
│                                    zoom, selectedSpot)   │
│ src/lib/kakao-map.ts             — SDK 로드 유틸리티      │
└─────────────────────────────────────────────────────────┘
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions section
- [x] ESLint configuration
- [x] TypeScript configuration (`tsconfig.json`)
- [x] Tailwind CSS 4 설정

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **Naming** | exists | Explore 접두사 컴포넌트명 | High |
| **Folder structure** | exists | `components/explore/` 디렉토리 | High |
| **Import order** | exists | react-kakao-maps-sdk 외부 라이브러리 순서 | Medium |
| **Map constants** | missing | 기본 좌표, 줌 레벨, 카테고리 색상 상수 | Medium |

### 7.3 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| `NEXT_PUBLIC_KAKAO_MAP_API_KEY` | 카카오맵 JavaScript API 키 | Client | ☒ (이미 존재) |

### 7.4 Dependencies to Install

| Package | Purpose | Version |
|---------|---------|---------|
| `react-kakao-maps-sdk` | 카카오맵 React 래퍼 | latest |
| `kakao.maps.d.ts` | 타입 정의 (react-kakao-maps-sdk에 포함) | — |

---

## 8. Next Steps

1. [ ] Write design document (`explore-map-view.design.md`)
2. [ ] Install `react-kakao-maps-sdk` 패키지
3. [ ] Start implementation

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-13 | Initial draft | Claude |
