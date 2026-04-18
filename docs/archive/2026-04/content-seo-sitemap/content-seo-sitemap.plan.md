# content-seo-sitemap Planning Document

> **Summary**: robots.ts 크롤링 차단 버그 수정, 사이트맵 이미지 확장, WebSite/SearchAction 스키마 추가로 SEO 품질 향상
>
> **Project**: Spotline (front-spotLine)
> **Version**: 0.1
> **Author**: Claude
> **Date**: 2026-04-18
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | robots.ts가 `/spotline/` 경로를 차단하여 핵심 콘텐츠가 검색엔진에 인덱싱되지 않고, 사이트맵에 이미지 정보가 없어 검색 노출 기회를 놓치고 있음 |
| **Solution** | robots.ts 크롤링 규칙 수정, 사이트맵에 이미지 확장, WebSite+SearchAction JSON-LD 스키마 추가, explore/search/blogs 등 누락 페이지 사이트맵 포함 |
| **Function/UX Effect** | 검색엔진이 모든 Spot/SpotLine 페이지를 정상 크롤링하고, 이미지 검색에서도 노출되며, 검색결과에 사이트 검색 기능이 표시됨 |
| **Core Value** | Cold Start 전략의 핵심인 SEO 기반 오가닉 트래픽 확보를 극대화하여 콘텐츠 발견 가능성을 높임 |

---

## 1. Overview

### 1.1 Purpose

현재 SEO 인프라의 치명적 버그(robots.ts `/spotline/` 차단)를 수정하고, 사이트맵과 구조화 데이터를 강화하여 검색엔진 크롤링 효율과 인덱싱 품질을 높인다.

### 1.2 Background

- Spotline의 Cold Start 전략은 콘텐츠 + SEO 우선 접근
- 런칭 전 200~300 Spot + 15~20 SpotLine 확보 목표
- 현재 robots.ts가 `/spotline/` 전체를 disallow하여 SpotLine 상세 페이지가 검색에 노출되지 않는 치명적 버그 존재
- 사이트맵에 이미지 정보 미포함, WebSite 스키마 미적용 등 개선 여지 다수

### 1.3 Related Documents

- `docs/content-based_transition_strategic_proposal.md` — 콘텐츠 전환 전략
- `src/app/sitemap.ts` — 현재 사이트맵
- `src/app/robots.ts` — 현재 robots 설정
- `src/lib/seo/jsonld.ts` — 현재 JSON-LD 유틸리티

---

## 2. Scope

### 2.1 In Scope

- [x] robots.ts `/spotline/` 차단 제거 (Critical Bug Fix)
- [ ] 사이트맵에 explore, search, blogs, profile 페이지 추가
- [ ] WebSite + SearchAction JSON-LD 스키마 추가
- [ ] 사이트맵 priority 최적화 (콘텐츠 유형별 차등)
- [ ] not-found.tsx 메타데이터 추가

### 2.2 Out of Scope

- 이미지 사이트맵 (Next.js MetadataRoute.Sitemap에서 images 필드 미지원)
- 다국어 alternates (현재 한국어 단일 서비스)
- PWA manifest / favicon 리소스 (별도 피처)
- Google Tag Manager / 전환 추적 (별도 피처)
- 뉴스 사이트맵 / 비디오 사이트맵

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | robots.ts에서 `/spotline/` disallow 제거, `/api/`와 `/mockup/`만 유지 | Critical | Pending |
| FR-02 | sitemap.ts에 explore, search, blogs, my-spotlines, my-spots 페이지 추가 | High | Pending |
| FR-03 | WebSite + SearchAction JSON-LD 스키마를 루트 레이아웃에 추가 | High | Pending |
| FR-04 | sitemap.ts의 priority 값을 콘텐츠 유형별로 최적화 | Medium | Pending |
| FR-05 | not-found.tsx에 적절한 메타데이터 export 추가 | Low | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | sitemap.ts 빌드 시간 5초 이내 유지 | build log 확인 |
| SEO | Google Search Console 크롤링 오류 0건 | GSC 리포트 |
| Compatibility | 기존 generateMetadata 패턴과 일관성 유지 | 코드 리뷰 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [x] robots.ts에서 `/spotline/` 차단 해제됨
- [ ] 사이트맵에 모든 공개 페이지 포함
- [ ] WebSite JSON-LD 스키마가 루트에 렌더링됨
- [ ] `pnpm build` 성공
- [ ] `pnpm type-check` 통과

### 4.2 Quality Criteria

- [ ] Zero lint errors
- [ ] Build succeeds
- [ ] 기존 SEO 기능 regression 없음

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| sitemap API 호출 실패 시 빈 사이트맵 | High | Low | 이미 `.catch(() => [])` 패턴 적용됨 |
| 잘못된 robots 규칙으로 전체 차단 | High | Low | 변경 최소화, 테스트 빌드로 검증 |
| SearchAction URL이 실제 검색과 불일치 | Medium | Low | `/search?q={query}` 패턴 확인 후 적용 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites | ☐ |
| **Dynamic** | Feature-based modules, BaaS integration | Web apps with backend | ☑ |
| **Enterprise** | Strict layer separation, DI, microservices | High-traffic systems | ☐ |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Framework | Next.js 16 | Next.js 16 | 기존 프로젝트 |
| Sitemap | Next.js MetadataRoute | Next.js MetadataRoute | 기존 패턴 유지 |
| JSON-LD | 커스텀 컴포넌트 | 기존 JsonLd 컴포넌트 | `src/components/seo/JsonLd.tsx` 재사용 |
| Robots | Next.js MetadataRoute | Next.js MetadataRoute | 기존 패턴 유지 |

### 6.3 Clean Architecture Approach

```
Selected Level: Dynamic

변경 파일 예상:
┌─────────────────────────────────────────────────────┐
│ src/app/robots.ts          — disallow 규칙 수정      │
│ src/app/sitemap.ts         — 누락 페이지 추가         │
│ src/lib/seo/jsonld.ts      — WebSite 스키마 추가      │
│ src/app/layout.tsx         — WebSite JSON-LD 렌더링   │
│ src/app/not-found.tsx      — 메타데이터 추가           │
└─────────────────────────────────────────────────────┘
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions section
- [x] ESLint configuration
- [x] TypeScript configuration (`tsconfig.json`)
- [x] Tailwind CSS 4

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **SEO 패턴** | exists (generateMetadata, JsonLd) | 기존 패턴 따름 | High |
| **Import order** | exists (@/ 별칭) | 유지 | Medium |

### 7.3 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| `NEXT_PUBLIC_SITE_URL` | 사이트 URL (sitemap, robots) | Client | 기존 사용 |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | 구글 서치콘솔 인증 | Client | 기존 사용 |

---

## 8. Next Steps

1. [ ] Write design document (`content-seo-sitemap.design.md`)
2. [ ] Start implementation
3. [ ] Google Search Console에서 크롤링 변화 모니터링

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-18 | Initial draft | Claude |
