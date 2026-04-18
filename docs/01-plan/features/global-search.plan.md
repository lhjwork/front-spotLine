# global-search Planning Document

> **Summary**: 통합 검색 자동완성 + Blog 탭 추가 + 인기 검색어로 검색 경험 강화
>
> **Project**: Spotline
> **Author**: Crew
> **Date**: 2026-04-18
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 검색 시 타이핑 중 결과 미리보기가 없고, Blog 콘텐츠는 검색 불가하며, 인기/트렌딩 검색어 안내가 없어 콘텐츠 발견이 비효율적 |
| **Solution** | 검색 입력 시 자동완성 드롭다운(Spot+SpotLine+Blog 통합), 검색 결과에 Blog 탭 추가, 인기 검색어 표시 |
| **Function/UX Effect** | 타이핑 2글자부터 실시간 자동완성 표시, 3탭(Spot/SpotLine/Blog) 통합 검색, 트렌딩 검색어로 탐색 시작점 제공 |
| **Core Value** | 콘텐츠 200~300개 시대에 효과적인 발견 경험을 제공하여 사용자 체류시간과 콘텐츠 소비율 향상 |

---

## 1. Overview

### 1.1 Purpose

현재 검색 페이지(/search)는 Spot/SpotLine 탭으로 분리된 LIKE 기반 키워드 검색을 제공한다. `search-refinement` 피처로 area/category/theme 필터, 정렬, URL 동기화, 최근 검색어가 이미 구현되었다. 하지만 다음 기능이 부족하다:

1. **자동완성**: 타이핑 중 실시간 결과 미리보기 없음 → 검색어를 완성해야만 결과 확인 가능
2. **Blog 검색 누락**: Blog 콘텐츠(현재 별도 피드에만 존재)를 검색 페이지에서 찾을 수 없음
3. **인기 검색어**: 신규 사용자가 무엇을 검색할지 모를 때 가이드 없음

### 1.2 Background

- Cold Start 전략으로 200~300 Spot + 15~20 SpotLine + Blog 콘텐츠 목표
- Backend API가 keyword 검색을 spots, spotlines/popular, blogs 모두 지원
- `search-refinement` 완료로 필터/정렬 기반은 준비됨
- FeedSearchBar(피드)와 SearchPageClient(검색)가 별도로 존재하나 자동완성 미구현

### 1.3 Related Documents

- Archived: `docs/archive/2026-04/search-refinement/`
- Plan: `docs/01-plan/features/experience-social-platform.plan.md`

---

## 2. Scope

### 2.1 In Scope

- [ ] 자동완성 드롭다운 컴포넌트 (2글자 이상, 300ms debounce)
- [ ] 자동완성에서 Spot/SpotLine/Blog 통합 미리보기 (각 최대 3개)
- [ ] 검색 결과 페이지에 Blog 탭 추가 (3탭: Spot/SpotLine/Blog)
- [ ] 인기 검색어 표시 (검색 전 초기 화면)
- [ ] FeedSearchBar에도 자동완성 적용 (피드 페이지 검색)
- [ ] 피드 페이지 "Route" → "SpotLine" 텍스트 수정

### 2.2 Out of Scope

- PostgreSQL full-text search (tsvector) 마이그레이션
- AI/시맨틱 검색, 한국어 형태소 분석
- 검색 분석 대시보드 (admin)
- 자모 분리 검색 (ㅋㅍ → 카페)
- 백엔드 자동완성 전용 API (기존 list API 활용)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | SearchAutocomplete 컴포넌트: 2글자 이상 입력 시 Spot/SpotLine/Blog 각 3개 미리보기 표시 | High | Pending |
| FR-02 | 자동완성 항목 클릭 시 해당 상세 페이지로 이동 | High | Pending |
| FR-03 | 자동완성 "전체 결과 보기" 링크로 /search 페이지 이동 | High | Pending |
| FR-04 | 검색 결과 페이지에 Blog 탭 추가 (fetchBlogs API 활용) | High | Pending |
| FR-05 | 인기 검색어 목록 표시 (검색 전 화면, 정적 데이터 기반) | Medium | Pending |
| FR-06 | FeedSearchBar를 SearchAutocomplete로 교체 | Medium | Pending |
| FR-07 | 키보드 네비게이션 (↑/↓ 화살표, Enter 선택, Escape 닫기) | Medium | Pending |
| FR-08 | 피드 페이지 "Route" → "SpotLine" 텍스트 수정 | Low | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 자동완성 응답 < 500ms (3개 API 병렬 호출) | Network tab 확인 |
| UX | 자동완성 드롭다운 300ms debounce, 타이핑 중 깜빡임 없음 | 사용자 테스트 |
| 반응형 | 모바일에서 자동완성이 전체 너비, 스크롤 가능 | 모바일 뷰포트 테스트 |
| 접근성 | 키보드로 자동완성 탐색 가능 (ARIA combobox 패턴) | 키보드 테스트 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 모든 FR 구현 완료
- [ ] 자동완성이 Spot/SpotLine/Blog 통합 결과 표시
- [ ] Blog 탭에서 검색 + 필터 + 정렬 동작
- [ ] 모바일/데스크톱 반응형 확인
- [ ] 기존 검색 기능(필터, 최근 검색어) 회귀 없음

### 4.2 Quality Criteria

- [ ] 빌드 성공 (`pnpm build`)
- [ ] Lint 에러 없음 (`pnpm lint`)
- [ ] 타입 에러 없음 (`pnpm type-check`)

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 3개 API 병렬 호출 시 성능 부담 | Medium | Medium | Promise.allSettled + 각 size=3으로 최소화, AbortController로 이전 요청 취소 |
| 자동완성 깜빡임 (빠른 타이핑) | Medium | High | 300ms debounce + 이전 결과 유지 (stale-while-revalidate 패턴) |
| 인기 검색어 데이터 없음 (Cold Start) | Low | High | 초기에는 크루가 수동 설정한 추천 검색어 사용, 추후 분석 기반 전환 |
| Blog API에 keyword 파라미터 미지원 | Medium | Low | Backend에서 이미 blogs 리스트에 area/sort 지원, keyword 추가 필요 시 별도 확인 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Selected |
|-------|-----------------|:--------:|
| **Starter** | Simple structure | ☐ |
| **Dynamic** | Feature-based modules, BaaS integration | ☑ |
| **Enterprise** | Strict layer separation, microservices | ☐ |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Framework | Next.js 16 | Next.js 16 | 기존 프로젝트 |
| State | Component state / Zustand | Component state | 자동완성은 로컬 상태로 충분 |
| API Client | axios wrapper | axios wrapper | 기존 api.ts 패턴 유지 |
| Styling | Tailwind CSS 4 | Tailwind CSS 4 | 기존 컨벤션 |
| 자동완성 라이브러리 | Headless UI / 커스텀 | 커스텀 | 외부 의존성 최소화, ARIA combobox 직접 구현 |

### 6.3 구현 전략

```
Selected Level: Dynamic

구현 파일 구조:
src/
├── components/search/
│   ├── SearchAutocomplete.tsx    (NEW: 자동완성 드롭다운 + 입력)
│   ├── AutocompleteResults.tsx   (NEW: 통합 미리보기 결과)
│   ├── TrendingSearches.tsx      (NEW: 인기 검색어 칩)
│   └── SearchFilters.tsx         (기존 유지)
├── app/
│   ├── search/SearchPageClient.tsx (MODIFY: Blog 탭 추가)
│   └── feed/page.tsx              (MODIFY: "Route" → "SpotLine" 텍스트 수정)
├── components/feed/
│   └── FeedSearchBar.tsx          (MODIFY: SearchAutocomplete 사용)
├── constants/
│   └── trendingSearches.ts        (NEW: 인기 검색어 데이터)
└── lib/
    └── api.ts                     (확인: Blog keyword 검색 지원 여부)
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions section
- [x] Tailwind CSS 4, 모바일 퍼스트 반응형
- [x] `cn()` 유틸리티 (clsx + tailwind-merge)
- [x] TypeScript strict mode

### 7.2 Conventions to Follow

| Category | Rule |
|----------|------|
| **Naming** | 컴포넌트: PascalCase, Props: `[Component]Props` |
| **Import** | `@/*` 경로 별칭, 상대경로 지양 |
| **UI Text** | 한국어, 코드는 영어 |
| **Debounce** | 검색 입력 300ms (기존 패턴 유지) |

### 7.3 Environment Variables Needed

추가 환경 변수 없음 — 기존 `NEXT_PUBLIC_API_BASE_URL` 사용.

---

## 8. Next Steps

1. [ ] Design 문서 작성 (`global-search.design.md`)
2. [ ] 구현
3. [ ] Gap 분석

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-18 | Initial draft | Crew |
