# Landing Page Redesign Planning Document

> **Summary**: 현재 클라이언트 사이드 DiscoverPage를 SEO 최적화된 프로덕션급 랜딩 페이지로 재설계하여, 신규 유입 사용자에게 Spotline의 핵심 가치를 즉시 전달하고 전환율을 높인다
>
> **Project**: Spotline (front-spotLine)
> **Version**: 0.1.0
> **Author**: AI
> **Date**: 2026-04-16
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 현재 랜딩 페이지(`/`)가 `"use client"` DiscoverPage로, 위치 권한 요청 후에야 콘텐츠가 표시되며 SEO 크롤링이 불가능하고 첫 방문 사용자에게 서비스 가치를 전달하지 못함 |
| **Solution** | 서버 컴포넌트 기반 랜딩 페이지로 전환 — Hero 섹션, 인기 SpotLine 캐러셀, 도시/테마 탐색, 서비스 소개, CTA를 포함한 마케팅+SEO 최적 구조 |
| **Function/UX Effect** | 첫 로드 시 즉시 콘텐츠 표시 (위치 권한 불필요), 스크롤 기반 섹션 탐색, 인기 SpotLine/Spot 미리보기로 흥미 유발 |
| **Core Value** | SEO 유입 극대화 + 첫 방문 전환율 향상 — 콘텐츠 기반 Cold Start 전략의 핵심 실행 |

---

## 1. Overview

### 1.1 Purpose

신규 유입 사용자(검색엔진, 소셜 공유)에게 Spotline 서비스의 핵심 가치를 즉시 전달하고, 콘텐츠 탐색(SpotLine/Spot 상세)으로 유도하는 프로덕션급 랜딩 페이지를 구축한다. 기존 DiscoverPage(위치 기반 추천)는 별도 섹션 또는 탭으로 유지한다.

### 1.2 Background

- 현재 `/` 페이지는 `"use client"` DiscoverPage로 위치 권한을 먼저 요청하며, 권한 거부 시에도 API 호출 후에야 콘텐츠 표시
- SEO 크롤러는 클라이언트 사이드 렌더링된 콘텐츠를 제대로 인덱싱하지 못함
- Cold Start 전략상 콘텐츠+SEO 유입이 핵심인데, 랜딩 페이지 자체가 SEO 미지원
- 경쟁 서비스(마이리얼트립, 트리플 등)는 모두 SSR 기반 랜딩에 인기 콘텐츠를 노출
- 온보딩 플로우(최근 구현)가 서비스 소개를 담당하지만, SEO와 상시 노출 콘텐츠는 별도 필요

### 1.3 Related Documents

- Plan: `docs/01-plan/features/experience-social-platform.plan.md`
- 콘텐츠 전환 전략: `docs/content-based_transition_strategic_proposal.md`
- 온보딩 플로우: `docs/archive/2026-04/onboarding-flow/`
- About 페이지: `src/app/about/page.tsx`

---

## 2. Scope

### 2.1 In Scope

- [ ] Hero 섹션 — 서비스 핵심 메시지 + CTA (피드 탐색, 데모 체험)
- [ ] 인기 SpotLine 캐러셀 — `fetchPopularSpotLines` API 활용, SSR
- [ ] 도시/테마 탐색 섹션 — 서울 주요 5개 지역 + 7개 테마 카테고리 그리드
- [ ] 서비스 소개 섹션 — QR Discovery + SpotLine 개념 시각적 설명
- [ ] 최신 Spot 미리보기 — `fetchFeedSpots` API 활용, SSR
- [ ] 서버 컴포넌트 기반 SSR (SEO 최적화)
- [ ] 기존 DiscoverPage는 `/discover` 또는 ExploreNavBar 탭으로 이동
- [ ] 온보딩 오버레이 유지 (첫 방문 시에만)
- [ ] 모바일 퍼스트 반응형 디자인

### 2.2 Out of Scope

- 사용자 로그인/인증 플로우
- 개인화 추천 (로그인 기반)
- A/B 테스트 인프라
- 애니메이션 라이브러리 (framer-motion 등) 도입
- 기존 DiscoverPage 로직 수정 (이동만)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | Hero 섹션: 서비스 핵심 메시지 + "SpotLine 둘러보기" / "데모 체험" CTA | High | Pending |
| FR-02 | 인기 SpotLine 캐러셀: 서버에서 데이터 fetch, 카드 형태로 3~6개 표시 | High | Pending |
| FR-03 | 도시/테마 탐색: 서울 5개 지역 + 7개 테마를 그리드/칩으로 표시, 클릭 시 피드 필터 | High | Pending |
| FR-04 | 서비스 소개: QR 스캔 → Spot → SpotLine 플로우를 시각적으로 설명 | Medium | Pending |
| FR-05 | 최신 Spot 미리보기: 최근 추가된 Spot 4~6개를 카드로 표시 | Medium | Pending |
| FR-06 | SSR 렌더링: 페이지 전체를 서버 컴포넌트로 구성, 검색엔진 크롤링 가능 | High | Pending |
| FR-07 | DiscoverPage를 `/discover` 경로로 분리 또는 ExploreNavBar 내 탭 유지 | High | Pending |
| FR-08 | 온보딩 오버레이 유지: 첫 방문 감지 + 오버레이 표시 (기존 로직) | Medium | Pending |
| FR-09 | Footer에 서비스 링크 (소개, 피드, 지도 탐색 등) | Low | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | LCP < 2.5s, FID < 100ms (Core Web Vitals) | Lighthouse |
| SEO | 구조화 데이터 (WebSite, ItemList) 포함 | Google Rich Results Test |
| Accessibility | 키보드 네비게이션, alt 텍스트, 시맨틱 HTML | Lighthouse a11y score ≥ 90 |
| Responsiveness | 모바일(360px) ~ 데스크톱(1440px) 정상 렌더링 | 수동 테스트 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 서버 컴포넌트 기반 랜딩 페이지 구현 및 `/` 경로 적용
- [ ] Hero, 인기 SpotLine, 도시/테마, 서비스 소개, 최신 Spot 섹션 모두 구현
- [ ] 기존 DiscoverPage가 별도 경로로 정상 작동
- [ ] 모바일/데스크톱 반응형 확인
- [ ] SEO 메타데이터 및 구조화 데이터 적용

### 4.2 Quality Criteria

- [ ] Zero lint errors
- [ ] Build succeeds (`pnpm build`)
- [ ] Lighthouse Performance ≥ 80, SEO ≥ 90

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| SSR 데이터 fetch 실패 시 빈 페이지 | High | Low | 정적 폴백 콘텐츠 + error.tsx 활용 |
| 기존 DiscoverPage 이동으로 사용자 혼란 | Medium | Medium | ExploreNavBar에서 "내 주변" 탭으로 자연스럽게 유도 |
| 인기 SpotLine 데이터 부족 (Cold Start) | Medium | Medium | 크루 큐레이션 SpotLine 먼저 확보, 부족 시 "서비스 소개" 섹션 비중 확대 |
| 랜딩 페이지 로드 시간 증가 | Medium | Low | 이미지 lazy loading, 데이터 캐싱, 섹션별 Suspense |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites, portfolios | ☐ |
| **Dynamic** | Feature-based modules, BaaS integration | Web apps with backend | ☑ |
| **Enterprise** | Strict layer separation, DI | High-traffic systems | ☐ |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Rendering | SSR / SSG / ISR | SSR (서버 컴포넌트) | SEO + 실시간 인기 데이터 반영 |
| Framework | Next.js 16 | Next.js 16 | 기존 프로젝트 |
| Styling | Tailwind CSS 4 | Tailwind CSS 4 | 기존 컨벤션 |
| Data Fetching | 서버 컴포넌트 async fetch | 서버 컴포넌트 async fetch | RSC에서 직접 API 호출, 클라이언트 번들 최소화 |
| DiscoverPage 위치 | `/discover` 별도 페이지 / 탭 | `/discover` 별도 페이지 | URL 분리로 명확한 역할 구분 |
| 온보딩 통합 | 랜딩에 유지 / 제거 | 랜딩에 유지 | 첫 방문 사용자 가이드 역할 |

### 6.3 Clean Architecture Approach

```
Selected Level: Dynamic

Modified/New Files:
src/
├── app/
│   ├── page.tsx                         — (수정) SSR 랜딩 페이지로 전환
│   ├── discover/
│   │   └── page.tsx                     — (신규) 기존 DiscoverPage 이동
│   └── (layout.tsx 메타데이터 업데이트)
├── components/
│   └── landing/
│       ├── HeroSection.tsx              — Hero 영역
│       ├── PopularSpotLinesSection.tsx   — 인기 SpotLine 캐러셀
│       ├── CityThemeSection.tsx          — 도시/테마 탐색 그리드
│       ├── ServiceIntroSection.tsx       — 서비스 소개 (QR→Spot→SpotLine)
│       ├── LatestSpotsSection.tsx        — 최신 Spot 미리보기
│       └── LandingCTA.tsx               — 하단 CTA
└── lib/
    └── api.ts                           — (수정 불필요, 기존 API 함수 활용)
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
| **Naming** | exists | `Landing` 접두사 또는 `landing/` 디렉토리 컴포넌트 | High |
| **Folder structure** | exists | `components/landing/` 디렉토리 | High |
| **Import order** | exists | 기존 규칙 유지 | Medium |

### 7.3 Environment Variables Needed

추가 환경 변수 불필요. 기존 `NEXT_PUBLIC_API_BASE_URL` 활용.

---

## 8. Landing Page Section Design

### Section 1: Hero
- **제목**: "다음 장소, Spotline이 추천해요"
- **부제**: "지금 있는 장소에서 다음에 가기 좋은 곳을 발견하세요"
- **CTA 1**: "SpotLine 둘러보기" → `/feed`
- **CTA 2**: "데모 체험하기" → `/qr/demo_cafe_001`
- **배경**: 그라데이션 또는 일러스트 패턴

### Section 2: 인기 SpotLine
- **제목**: "지금 인기 있는 SpotLine"
- **데이터**: `fetchPopularSpotLines()` — 6개
- **UI**: 가로 스크롤 카드 (썸네일 + 제목 + Spot 수 + 테마 태그)
- **링크**: 각 카드 → `/spotline/[slug]`

### Section 3: 도시/테마 탐색
- **제목**: "어디로 떠나볼까요?"
- **도시**: 강남, 홍대, 성수, 이태원, 종로 (5개 칩/카드)
- **테마**: date, travel, walk, hangout, food-tour, cafe-tour, culture
- **링크**: 각 칩 → `/feed?area={city}` 또는 `/feed?theme={theme}`

### Section 4: 서비스 소개
- **3단계 플로우**: QR 스캔 → Spot 발견 → SpotLine 따라가기
- **UI**: 아이콘 + 짧은 설명 텍스트 (3열 그리드)
- `/about` 페이지 내용의 축약판

### Section 5: 최신 Spot
- **제목**: "새로 추가된 Spot"
- **데이터**: `fetchFeedSpots({ sort: 'latest', limit: 6 })`
- **UI**: 2×3 그리드 카드 (이미지 + 이름 + 카테고리 + 지역)
- **링크**: 각 카드 → `/spot/[slug]`

### Section 6: 하단 CTA
- **메시지**: "나만의 SpotLine을 만들어보세요"
- **CTA**: "시작하기" → `/feed`

---

## 9. Next Steps

1. [ ] Write design document (`landing-page-redesign.design.md`)
2. [ ] Review and approval
3. [ ] Start implementation

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-16 | Initial draft | AI |
