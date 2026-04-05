# Feed Hub Refinement Planning Document

> **Summary**: Feed 페이지 정렬/검색 추가, Theme/City 페이지 Spot 통합, SpotLine 만들기 CTA, 소셜 인디케이터 추가
>
> **Project**: Spotline (front-spotLine)
> **Version**: 0.1.0
> **Author**: Claude + hanjinlee
> **Date**: 2026-04-05
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | Feed에 정렬 옵션이 없고, Theme/City 페이지가 콘텐츠 부족으로 빈약하며, UGC 유도 CTA와 소셜 피드백이 부재하여 사용자가 콘텐츠를 발견하고 참여하기 어렵다 |
| **Solution** | Feed에 정렬 드롭다운 + 키워드 검색 추가, Theme 페이지에 Spot 그리드 통합, City 페이지에 통계 위젯 추가, SpotLine 만들기 CTA 카드, SpotPreviewCard에 좋아요 수 표시 |
| **Function/UX Effect** | 사용자가 인기순/최신순/조회순으로 Spot을 탐색하고, 테마별 Spot+SpotLine을 한 화면에서 확인하며, CTA 카드로 즉시 SpotLine 제작에 진입 가능 |
| **Core Value** | 콘텐츠 발견성(discoverability) 강화 → 체류시간 증가 + UGC 전환율 향상. Cold-start 단계에서 적은 콘텐츠로도 풍부한 탐색 경험 제공 |

---

## 1. Overview

### 1.1 Purpose

Feed/Theme/City 페이지의 탐색 경험을 개선하여 사용자가 원하는 콘텐츠를 빠르게 찾고, UGC(SpotLine 제작)에 자연스럽게 유도하는 것.

### 1.2 Background

- Feed 페이지는 area/category 필터는 있지만 **정렬 옵션**이 없어 항상 같은 순서로 표시
- Theme 페이지는 SpotLine만 보여주고 **Spot이 빠져있어** 콘텐츠가 빈약
- City 페이지에 **통계 정보**(Spot 수, SpotLine 수)가 없어 도시 매력을 전달하지 못함
- user-spotline-experience 완료 후 **SpotLine 만들기 CTA**가 Feed에 없음
- SpotPreviewCard에 **좋아요/저장 수**가 없어 인기도를 직관적으로 파악 불가
- Backend API는 이미 `sort` 파라미터, `keyword` 검색, 좋아요/저장 수를 모두 지원

### 1.3 Related Documents

- Plan: `docs/01-plan/features/experience-social-platform.plan.md`
- Archived: `docs/archive/2026-04/user-spotline-experience/` (SpotLine 제작 기능)

---

## 2. Scope

### 2.1 In Scope

- [ ] Feed 정렬 드롭다운 (인기순, 최신순, 조회순, 평점순)
- [ ] Feed 키워드 검색바
- [ ] Feed "나만의 SpotLine 만들기" CTA 카드
- [ ] Theme 페이지에 Spot 그리드 추가 (카테고리별 필터링)
- [ ] City 페이지에 콘텐츠 통계 위젯 추가
- [ ] SpotPreviewCard 좋아요 수 표시
- [ ] SpotLinePreviewCard 저장 수 표시
- [ ] 필터 초기화 버튼 (선택된 필터 한번에 클리어)

### 2.2 Out of Scope

- 전역 검색 페이지 (`/search`) — 별도 feature로 진행
- 개인화 추천 알고리즘 — Phase 6+ 소셜 기능과 함께
- City/Theme 페이지 히어로 이미지 — 이미지 에셋 확보 필요
- 지도 뷰 토글 — 별도 feature로 진행
- 소셜 액션 (좋아요/저장 버튼) in 카드 — 별도 feature로 진행

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | Feed 정렬 드롭다운: popular(기본), newest 2가지 옵션 (Backend 지원 범위) | High | Pending |
| FR-02 | Feed 키워드 검색: 디바운스 300ms, URL 쿼리 파라미터 동기화 | High | Pending |
| FR-03 | SpotLine 만들기 CTA 카드: FeedSpotLineSection 상단에 배치, `/create-spotline` 링크 | High | Pending |
| FR-04 | Theme 페이지 Spot 그리드: 해당 테마 관련 카테고리의 Spot 표시 (최대 12개) | High | Pending |
| FR-05 | City 페이지 통계 위젯: Spot 수, SpotLine 수, 인기 카테고리 Top 3 표시 | Medium | Pending |
| FR-06 | SpotPreviewCard 좋아요 수 표시: Heart 아이콘 + 숫자 | Medium | Pending |
| FR-07 | SpotLinePreviewCard 저장 수 표시: Bookmark 아이콘 + 숫자 | Medium | Pending |
| FR-08 | 필터 초기화 버튼: 지역+카테고리+검색어+정렬 한번에 리셋 | Medium | Pending |
| FR-09 | 정렬/검색/필터 변경 시 URL 쿼리 파라미터 동기화 | Medium | Pending |
| FR-10 | 빈 검색 결과 안내: 검색어 표시 + 필터 초기화 제안 | Low | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | Feed 페이지 FCP < 1.5초 | Lighthouse |
| Performance | 정렬 변경 시 컨텐츠 갱신 < 500ms | API response time |
| UX | 필터/정렬 상태가 URL에 반영되어 공유 가능 | 수동 검증 |
| SEO | Theme/City 페이지 SSR 유지 (revalidate 1h) | Build output 확인 |
| Responsive | 모바일 → 태블릿 → 데스크톱 모든 breakpoint 정상 | 수동 검증 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 10개 FR 구현 완료
- [ ] `pnpm type-check` 통과
- [ ] `pnpm lint` 에러 0개
- [ ] 모바일/데스크톱 반응형 정상
- [ ] URL 파라미터 동기화 동작 확인

### 4.2 Quality Criteria

- [ ] Zero lint errors
- [ ] Build succeeds (`pnpm build`)
- [ ] Gap Analysis Match Rate >= 90%

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Backend sort 파라미터가 예상과 다른 경우 | Medium | Low | Swagger UI에서 사전 확인, fallback으로 클라이언트 정렬 |
| Theme→Category 매핑이 부정확할 수 있음 | Low | Medium | 매핑 테이블을 상수로 관리, 피드백 반영 용이 |
| 콘텐츠 부족 시 빈 상태가 많아짐 | Medium | High | EmptyFeed 컴포넌트 개선, CTA로 유도 |
| URL 파라미터 과다로 URL이 길어짐 | Low | Low | 기본값은 URL에서 생략 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Selected |
|-------|-----------------|:--------:|
| **Starter** | Simple structure | ☐ |
| **Dynamic** | Feature-based modules, BaaS integration | ☑ |
| **Enterprise** | Strict layer separation, microservices | ☐ |

### 6.2 Key Architectural Decisions

| Decision | Selected | Rationale |
|----------|----------|-----------|
| Framework | Next.js 16 App Router | 기존 프로젝트 |
| State Management | Zustand (useFeedStore 확장) | 기존 패턴 유지 |
| API Client | Axios (apiV2) | 기존 레이어 |
| Styling | Tailwind CSS 4 + cn() | 기존 패턴 |
| Backend | Spring Boot (기존 API 활용) | 백엔드 변경 없음 |

### 6.3 수정/추가 파일 계획

**수정 대상 (7개)**:
1. `src/store/useFeedStore.ts` — sort, keyword 상태 추가
2. `src/components/feed/FeedPage.tsx` — 정렬/검색 UI 추가, URL 동기화 확장
3. `src/lib/api.ts` — fetchFeedSpots에 sort, keyword 파라미터 추가
4. `src/components/shared/SpotPreviewCard.tsx` — 좋아요 수 표시
5. `src/components/shared/SpotLinePreviewCard.tsx` — 저장 수 표시
6. `src/app/theme/[name]/page.tsx` — Spot 그리드 데이터 페칭 추가
7. `src/app/city/[name]/page.tsx` — 통계 데이터 추가

**신규 생성 (5개)**:
1. `src/components/feed/FeedSortDropdown.tsx` — 정렬 드롭다운
2. `src/components/feed/FeedSearchBar.tsx` — 검색바
3. `src/components/feed/FeedCreateCTA.tsx` — SpotLine 만들기 CTA 카드
4. `src/components/feed/FeedFilterReset.tsx` — 필터 초기화 버튼
5. `src/components/theme/ThemeSpots.tsx` — 테마별 Spot 그리드

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions section
- [x] ESLint configuration
- [x] TypeScript strict mode (`tsconfig.json`)
- [x] Tailwind CSS 4 + cn() utility

### 7.2 Conventions to Follow

| Category | Rule |
|----------|------|
| Naming | Component: PascalCase, Props: `[Component]Props` |
| Import | `@/*` path alias, React → External → Internal → Types |
| Language | UI text: Korean, Code: English |
| Styling | Mobile-first, `cn()` for conditionals |
| State | Flat Zustand store, `set[Property]` setters |

### 7.3 Environment Variables Needed

없음 — 기존 환경 변수만 사용.

---

## 8. Implementation Details

### 8.1 Backend API 파라미터 (기존 지원 확인 필요)

```
GET /api/v2/spots
  ?area=성수
  &category=cafe
  &sort=popular|newest|views|rating   ← 확인 필요
  &keyword=커피                         ← 확인 필요
  &page=0&size=20

GET /api/v2/spotlines/popular
  ?area=성수
  &theme=CAFE_TOUR
  &sort=popular|newest                  ← 확인 필요
  &page=0&size=10
```

### 8.2 Theme → Category 매핑

```typescript
const THEME_CATEGORY_MAP: Record<string, SpotCategory[]> = {
  date: ["cafe", "restaurant", "culture"],
  travel: ["culture", "nature", "walk"],
  walk: ["walk", "nature", "cafe"],
  hangout: ["activity", "bar", "shopping"],
  "food-tour": ["restaurant"],
  "cafe-tour": ["cafe"],
  culture: ["culture", "exhibition"],
};
```

### 8.3 정렬 옵션

```typescript
const SORT_OPTIONS = [
  { label: "인기순", value: "popular" },
  { label: "최신순", value: "newest" },
  { label: "조회순", value: "views" },
  { label: "평점순", value: "rating" },
] as const;
```

### 8.4 useFeedStore 확장

```typescript
// 추가 상태
sort: SortOption;        // "popular" 기본값
keyword: string;         // "" 기본값
setSort: (sort: SortOption) => void;
setKeyword: (keyword: string) => void;
resetFilters: () => void; // area, category, sort, keyword 모두 초기화
```

---

## 9. Next Steps

1. [ ] Backend sort/keyword 파라미터 지원 여부 Swagger에서 확인
2. [ ] Design document 작성 (`/pdca design feed-hub-refinement`)
3. [ ] 구현 시작

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-05 | Initial draft | Claude + hanjinlee |
