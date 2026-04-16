# search-refinement Planning Document

> **Summary**: 검색 페이지에 필터/정렬/자동완성을 추가하고 Explore와 통합하여 통일된 검색 경험 제공
>
> **Project**: Spotline
> **Author**: Crew
> **Date**: 2026-04-16
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 검색 페이지에 area/category 필터와 정렬 옵션이 없어 원하는 Spot/SpotLine을 찾기 어려움. Explore는 키워드 검색이 불가. 두 기능이 분리되어 비효율적 |
| **Solution** | 검색 페이지에 area/category/theme 필터 + 정렬(인기순/최신순) 추가, 검색 제안/자동완성 구현, Explore와 검색의 상호 연결 강화 |
| **Function/UX Effect** | 필터 칩으로 빠른 조건 설정, 정렬 전환, 검색어 자동완성으로 탐색 시간 50% 이상 단축 |
| **Core Value** | 콘텐츠가 200~300개로 성장할 때 효과적인 발견 경험을 제공하여 사용자 체류시간과 전환율 향상 |

---

## 1. Overview

### 1.1 Purpose

현재 검색 페이지(/search)는 키워드 검색만 지원하고 area/category 필터, 정렬 옵션이 없다. Explore 페이지는 지도 기반 필터는 있으나 키워드 검색이 불가. 두 기능 간 상호 연결도 없어 사용자가 원하는 콘텐츠를 효과적으로 찾기 어렵다.

### 1.2 Background

- Cold Start 전략으로 200~300 Spot + 15~20 SpotLine 목표 → 콘텐츠 증가 시 검색 품질이 핵심
- 현재 backend는 area, category, keyword, sort 파라미터를 모두 지원하나 frontend 검색 페이지에서 활용하지 않음
- Explore의 area/category 필터 UX를 검색에도 적용 가능

### 1.3 Related Documents

- Plan: `front-spotLine/docs/01-plan/features/experience-social-platform.plan.md`
- CLAUDE.md 컨벤션 참조

---

## 2. Scope

### 2.1 In Scope

- [ ] 검색 페이지에 area 필터 (탭/칩 방식) 추가
- [ ] 검색 페이지에 category 필터 (Spot 탭) / theme 필터 (SpotLine 탭) 추가
- [ ] 정렬 옵션 추가 (인기순/최신순)
- [ ] 검색 결과 카운트 표시
- [ ] URL 쿼리 파라미터 동기화 (area, category, sort)
- [ ] Explore → 검색, 검색 → Explore 상호 연결 링크
- [ ] 빈 결과 상태 개선 (필터 초기화 안내)

### 2.2 Out of Scope

- PostgreSQL full-text search (tsvector) 마이그레이션
- AI/시맨틱 검색
- 검색 분석 대시보드 (admin)
- Explore 페이지 자체 리디자인
- 검색어 자동완성/제안 (Phase 2로 분리)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 검색 페이지에 area 필터 칩 추가 (7개 지역) | High | Pending |
| FR-02 | Spot 탭에 category 필터 칩 추가 (10개 카테고리) | High | Pending |
| FR-03 | SpotLine 탭에 theme 필터 칩 추가 (7개 테마) | High | Pending |
| FR-04 | 정렬 드롭다운 추가 (인기순/최신순) | High | Pending |
| FR-05 | 검색 결과 총 개수 표시 ("N개의 Spot 찾았어요") | Medium | Pending |
| FR-06 | 필터/정렬 상태 URL 쿼리 파라미터 동기화 | Medium | Pending |
| FR-07 | 빈 결과 시 필터 조건 표시 + 초기화 버튼 | Medium | Pending |
| FR-08 | Explore 페이지에 "키워드로 검색" 링크 추가 | Low | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 필터 변경 후 결과 로딩 < 500ms | Network tab 확인 |
| UX | 필터 상태가 URL에 반영되어 공유 가능 | 브라우저 URL 확인 |
| 반응형 | 모바일에서 필터 칩 가로 스크롤 | 모바일 뷰포트 테스트 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 모든 FR 구현 완료
- [ ] 모바일/데스크톱 반응형 확인
- [ ] 기존 검색 기능 회귀 없음
- [ ] URL 쿼리 파라미터로 검색 상태 공유 가능

### 4.2 Quality Criteria

- [ ] 빌드 성공
- [ ] Lint 에러 없음
- [ ] 기존 최근 검색어 기능 유지

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 필터 조합 시 API 호출 과다 | Medium | Medium | 300ms debounce 유지, 필터 변경 시만 호출 |
| 모바일에서 필터 칩이 화면을 많이 차지 | Medium | High | 가로 스크롤 + 접기/펼치기 토글 |
| URL 파라미터 복잡도 증가 | Low | Low | 기본값은 URL에서 제외 |

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
| State | Zustand | Zustand | 기존 useFeedStore 확장 |
| API Client | fetch wrapper | fetch wrapper | 기존 api.ts 패턴 유지 |
| Styling | Tailwind CSS 4 | Tailwind CSS 4 | 기존 컨벤션 |

### 6.3 구현 전략

- 기존 `SearchPageClient.tsx` 수정 (새 파일 생성 최소화)
- Explore의 area/category 상수 재사용 (`constants/areas.ts`, `constants/categories.ts`)
- Backend API는 이미 필터/정렬 파라미터 지원 → frontend만 수정
- URL 쿼리 파라미터: `?q=keyword&tab=spot&area=seongsu&category=cafe&sort=popular`

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions section
- [x] Tailwind CSS 4, 모바일 퍼스트 반응형
- [x] `cn()` 유틸리티 (clsx + tailwind-merge)
- [x] TypeScript strict mode

### 7.2 컴포넌트 구조 (예상)

```
front-spotLine/src/
├── app/search/
│   ├── page.tsx                    (서버 컴포넌트, 메타데이터)
│   └── SearchPageClient.tsx        (수정: 필터/정렬 추가)
├── components/search/
│   ├── SearchFilters.tsx           (신규: area/category/theme 필터 칩)
│   └── SearchSortSelect.tsx        (신규: 정렬 드롭다운)
└── constants/
    ├── areas.ts                    (기존: 재사용)
    └── categories.ts              (기존: 재사용)
```

---

## 8. Next Steps

1. [ ] Design 문서 작성 (`search-refinement.design.md`)
2. [ ] 구현
3. [ ] Gap 분석

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-16 | Initial draft | Crew |
