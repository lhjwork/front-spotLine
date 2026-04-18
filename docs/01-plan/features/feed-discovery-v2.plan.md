# feed-discovery-v2 Planning Document

> **Summary**: 피드 탐색 UX를 고도화하여 콘텐츠 발견성과 체류 시간을 개선하는 v2 업그레이드
>
> **Project**: front-spotLine (Next.js 16)
> **Version**: 0.1.0
> **Author**: Claude
> **Date**: 2026-04-18
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 현재 피드는 POPULAR/NEWEST 2가지 정렬만 제공하여, 사용자가 원하는 콘텐츠를 빠르게 발견하기 어렵고 트렌딩/시간대별 인기 콘텐츠 구분이 없음 |
| **Solution** | 트렌딩 섹션 추가, 시간 기반 정렬(주간/월간), 카테고리별 큐레이션 캐러셀, 무한스크롤 UX 개선, 피드 레이아웃 토글(그리드/리스트) 도입 |
| **Function/UX Effect** | 피드 진입 시 트렌딩 콘텐츠로 즉각적 흥미 유발, 다양한 정렬 옵션으로 탐색 효율 향상, 레이아웃 전환으로 브라우징 경험 개인화 |
| **Core Value** | 콘텐츠 발견성 극대화 → 체류 시간 증가 → Spot/SpotLine 상세 페이지 진입률 향상 |

---

## 1. Overview

### 1.1 Purpose

현재 피드 페이지(`/feed`)는 기본적인 필터링(지역/카테고리/키워드)과 정렬(인기순/최신순)만 제공한다. 사용자가 지금 뜨는 콘텐츠, 주간 인기 콘텐츠를 구분할 수 없고, 피드 레이아웃이 그리드 고정이라 선호에 맞는 브라우징이 어렵다. 이 feature는 피드 탐색 경험을 전면 업그레이드하여 콘텐츠 발견성과 사용자 체류 시간을 개선한다.

### 1.2 Background

- **현재 상태**: 15개 피드 컴포넌트, Zustand 기반 상태 관리, IntersectionObserver 무한스크롤
- **기존 정렬**: `POPULAR` (viewsCount DESC), `NEWEST` (createdAt DESC) — Backend FeedSort enum
- **추천 시스템**: `FeedRecommendationSection`에서 `/recommendations/feed` API로 10개 Spot 캐러셀 제공 (이미 구현 완료)
- **팔로잉 피드**: `FollowingFeed`로 인증 사용자 전용 탭 (이미 구현 완료)
- **콘텐츠 규모**: 런칭 전 200~300 Spot + 15~20 SpotLine 목표

### 1.3 Related Documents

- Plan: `docs/01-plan/features/experience-social-platform.plan.md`
- Archive: `docs/archive/2026-04/recommendation-engine/` (추천 엔진 구현 완료)
- CLAUDE.md: 프로젝트 아키텍처 및 코드 패턴

---

## 2. Scope

### 2.1 In Scope

- [ ] **FR-01**: 트렌딩 섹션 — 최근 24시간/7일 기준 급상승 Spot/SpotLine 표시
- [ ] **FR-02**: 시간 기반 정렬 확장 — 주간 인기, 월간 인기 추가 (WEEKLY_POPULAR, MONTHLY_POPULAR)
- [ ] **FR-03**: 피드 레이아웃 토글 — 그리드 뷰 / 리스트 뷰 전환 (사용자 선호 localStorage 저장)
- [ ] **FR-04**: 카테고리별 큐레이션 캐러셀 — 상단에 카테고리별 추천 Spot 수평 스크롤
- [ ] **FR-05**: 무한스크롤 UX 개선 — 스켈레톤 로더, 스크롤 복원, 새로고침 시 위치 유지
- [ ] **FR-06**: 빈 상태 개선 — 필터 결과 없을 때 관련 카테고리 추천, 인기 콘텐츠 폴백

### 2.2 Out of Scope

- Backend FeedSort enum 확장 (WEEKLY_POPULAR, MONTHLY_POPULAR 추가는 백엔드 레포에서 별도 작업)
- 알고리즘 기반 개인화 피드 (추천 엔진은 이미 구현됨, 개인화 알고리즘은 Phase 6 Social 이후)
- SSR/ISR 전환 (현재 CSR 유지, SEO는 Spot/SpotLine 상세 페이지에서 처리)
- 피드 Push 알림

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 트렌딩 섹션: 최근 인기 급상승 콘텐츠를 별도 섹션으로 피드 상단에 표시. 기존 `/spotlines/popular` API 활용 + 프론트엔드에서 최근 생성일 필터 적용 | High | Pending |
| FR-02 | 시간 기반 정렬: FeedSortDropdown에 "주간 인기" / "월간 인기" 옵션 추가. Backend에 기간 파라미터(`period=WEEKLY|MONTHLY`) 전달하여 createdAt 기간 내 인기순 정렬 | High | Pending |
| FR-03 | 레이아웃 토글: FeedSpotGrid에 그리드(2열)/리스트(1열) 전환 버튼 추가. 선택 값은 localStorage에 저장하여 재방문 시 유지 | Medium | Pending |
| FR-04 | 카테고리 캐러셀: 추천 섹션 하단에 카테고리별(카페/맛집/문화 등) 인기 Spot 3~5개씩 수평 스크롤 캐러셀 | Medium | Pending |
| FR-05 | 무한스크롤 개선: 로딩 중 SpotCardSkeleton 3개 표시, 스크롤 위치 복원(뒤로가기 시), 중복 요청 방지 debounce | Medium | Pending |
| FR-06 | 빈 상태 UX: 검색/필터 결과가 0건일 때 "이런 Spot은 어떠세요?" 섹션으로 관련 카테고리 인기 콘텐츠 4개 추천 | Low | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 피드 초기 로딩 < 1.5초 (LCP), 무한스크롤 추가 로딩 < 500ms | Lighthouse, DevTools Network |
| UX | 레이아웃 전환 시 깜빡임 없음 (CSS transition) | 수동 테스트 |
| 접근성 | 정렬/레이아웃 토글 버튼에 aria-label 제공 | 코드 리뷰 |
| 반응형 | 모바일(1열) → 태블릿(2열) → 데스크톱(3-4열) 그리드 유지 | 수동 테스트 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 6개 FR 모두 구현 완료
- [ ] 기존 15개 피드 컴포넌트와의 호환성 유지
- [ ] 타입 에러 없음 (`pnpm type-check` 통과)
- [ ] 린트 에러 없음 (`pnpm lint` 통과)
- [ ] 빌드 성공 (`pnpm build` 통과)

### 4.2 Quality Criteria

- [ ] 새로 추가되는 컴포넌트에 Props 인터페이스 정의
- [ ] `cn()` 유틸리티로 조건부 스타일 처리
- [ ] 모바일 퍼스트 반응형 디자인
- [ ] 한국어 UI 텍스트

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Backend에 WEEKLY/MONTHLY 정렬 API 미지원 | High | Medium | 프론트엔드에서 `createdAfter` 파라미터로 기간 필터링, 또는 기존 POPULAR 정렬 + 클라이언트 필터 |
| 콘텐츠 부족으로 트렌딩 섹션이 비어 보임 | Medium | High | 최소 콘텐츠 임계값(5개) 미달 시 섹션 숨김, 인기 콘텐츠로 폴백 |
| 무한스크롤 + 레이아웃 전환 시 스크롤 위치 오류 | Medium | Medium | `scrollRestoration` + 레이아웃 전환 시 현재 위치 기억 후 복원 |
| localStorage 사용 불가 환경 (시크릿 모드) | Low | Low | try-catch로 감싸고 기본값 그리드 사용 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites | ☐ |
| **Dynamic** | Feature-based modules, BaaS integration | Web apps with backend | ☒ |
| **Enterprise** | Strict layer separation, DI, microservices | High-traffic systems | ☐ |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Framework | Next.js 16 | Next.js 16 | 기존 프로젝트 스택 유지 |
| State Management | Zustand | Zustand | 기존 `useFeedStore` 확장 |
| API Client | Axios | Axios | 기존 `src/lib/api.ts` 레이어 유지 |
| Styling | Tailwind CSS 4 | Tailwind CSS 4 | 기존 스택 유지, `cn()` 유틸 |
| Layout Preference Storage | localStorage | localStorage | 서버 불필요, 간단 |

### 6.3 Clean Architecture Approach

```
Selected Level: Dynamic

변경/추가 파일 구조:
┌─────────────────────────────────────────────────────┐
│ src/components/feed/                                │
│   ├── FeedTrendingSection.tsx       (NEW)           │
│   ├── FeedCategoryCuration.tsx      (NEW)           │
│   ├── FeedLayoutToggle.tsx          (NEW)           │
│   ├── FeedEmptyFallback.tsx         (NEW)           │
│   ├── FeedPage.tsx                  (MODIFY)        │
│   ├── FeedSpotGrid.tsx              (MODIFY)        │
│   ├── FeedSortDropdown.tsx          (MODIFY)        │
│   ├── EmptyFeed.tsx                 (MODIFY)        │
│   └── FeedSkeleton.tsx              (MODIFY)        │
│ src/store/useFeedStore.ts           (MODIFY)        │
│ src/lib/api.ts                      (MODIFY)        │
│ src/types/index.ts                  (MODIFY)        │
└─────────────────────────────────────────────────────┘
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions section
- [x] `src/CLAUDE.md` — import/naming/style 규칙
- [x] `src/components/CLAUDE.md` — 컴포넌트 작성 규칙
- [x] `src/store/CLAUDE.md` — Zustand 패턴
- [x] ESLint configuration (`.eslintrc.*`)
- [x] TypeScript configuration (`tsconfig.json`)

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **Naming** | exists | 기존 Feed* 접두사 패턴 유지 | High |
| **Folder structure** | exists | `src/components/feed/` 하위에 추가 | High |
| **Import order** | exists | React → 외부 → 내부 → 타입 | Medium |
| **Error handling** | exists | fire-and-forget 분석, try-catch API | Medium |

### 7.3 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| `NEXT_PUBLIC_API_BASE_URL` | 메인 백엔드 URL | Client | ☐ (기존) |

추가 환경변수 필요 없음. 기존 API 레이어 활용.

---

## 8. Next Steps

1. [ ] Design 문서 작성 (`/pdca design feed-discovery-v2`)
2. [ ] Backend API 확인: `period` 파라미터 지원 여부 (SpotController, SpotLineController)
3. [ ] 구현 시작

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-18 | Initial draft | Claude |
