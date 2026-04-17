# spot-detail-page-v2 Planning Document

> **Summary**: Spot 상세 페이지 UX/비주얼 품질 업그레이드 — 사진 병합, Hero 개선, 정보 레이아웃 리디자인
>
> **Project**: front-spotLine
> **Version**: 0.1.0
> **Author**: Claude
> **Date**: 2026-04-17
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 현재 Spot 상세 페이지는 기능적으로 동작하지만, Hero 이미지가 1장 고정이고 Place API 사진과 사용자 업로드 사진이 분리되어 있으며, 정보 섹션 간 시각적 계층이 부족하여 콘텐츠 중심 플랫폼의 상세 페이지로서 몰입감이 부족하다 |
| **Solution** | Hero 영역을 스와이프 가능한 이미지 캐러셀로 교체하고, Place API 사진 + mediaItems를 병합한 통합 갤러리를 구성하며, 섹션 간 비주얼 계층을 개선하여 매장 정보를 더 직관적으로 전달한다 |
| **Function/UX Effect** | 사진 탐색이 자연스러워지고, 영업 상태/평점/crewNote가 한눈에 보이며, 각 정보 섹션이 명확히 구분되어 사용자 체류 시간과 SpotLine 전환율이 향상된다 |
| **Core Value** | 콘텐츠 중심 플랫폼의 핵심 상세 페이지 품질을 높여, SEO 유입 사용자를 SpotLine 탐색으로 자연스럽게 유도한다 |

---

## 1. Overview

### 1.1 Purpose

현재 Spot 상세 페이지(`/spot/[slug]`)는 20개 이상의 컴포넌트로 모든 기능이 구현되어 있으나, 비주얼 품질과 사용자 경험에 개선이 필요하다:

- **Hero 이미지**: 단일 이미지 고정 → 여러 사진을 탐색할 수 없음
- **사진 소스 분리**: `placeInfo.photos`와 `spot.mediaItems`가 각각 독립적으로 사용됨
- **정보 밀도**: 섹션 간 구분이 약하고, 모바일에서 정보 탐색이 불편
- **SpotLine 연결**: 포함된 SpotLine 카드가 텍스트 중심으로 시각적 매력 부족

### 1.2 Background

- Cold Start 전략에서 SEO 유입 → Spot 상세 → SpotLine 탐색이 핵심 퍼널
- 200~300 Spot 큐레이션 목표를 향해 콘텐츠가 쌓이는 중
- 상세 페이지 품질이 체류 시간과 SpotLine 전환율에 직결
- Place API에서 풍부한 사진/정보가 제공되지만 현재 활용도가 낮음

### 1.3 Related Documents

- Plan: `docs/01-plan/features/experience-social-platform.plan.md`
- Archive: `docs/archive/2026-04/spot-detail-enhancement/`
- Archive: `docs/archive/2026-04/spot-detail-improvements/`

---

## 2. Scope

### 2.1 In Scope

- [ ] Hero 이미지 → 스와이프 캐러셀로 교체 (최대 5장)
- [ ] Place API 사진 + mediaItems 병합 로직 통합
- [ ] SpotPlaceInfo 섹션 비주얼 리디자인 (카드형, 아이콘 강화)
- [ ] SpotCrewNote 비주얼 개선 (인용 스타일, 시각적 강조)
- [ ] SpotSpotLines 카드에 썸네일 추가
- [ ] 섹션 간 비주얼 계층 정리 (간격, 구분선, 순서)
- [ ] SpotBottomBar CTA 개선 (SpotLine 추가 유도)

### 2.2 Out of Scope

- 새로운 API 엔드포인트 추가 (백엔드 변경 없음)
- 리뷰/댓글 UI 변경 (별도 피처)
- 지도 컴포넌트 변경 (SpotMapPreview 유지)
- QR 모드 관련 변경
- 새로운 데이터 필드 추가

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | Hero 영역에 이미지 캐러셀 구현 (터치 스와이프 + 인디케이터) | High | Pending |
| FR-02 | Place API photos + mediaItems 병합하여 통합 사진 소스 생성 | High | Pending |
| FR-03 | SpotPlaceInfo 영업시간/전화/평점을 카드형 레이아웃으로 리디자인 | High | Pending |
| FR-04 | SpotCrewNote를 인용(blockquote) 스타일로 시각 개선 | Medium | Pending |
| FR-05 | SpotSpotLines 카드에 대표 이미지 썸네일 표시 | Medium | Pending |
| FR-06 | SpotBottomBar에 "이 Spot이 포함된 SpotLine 보기" CTA 추가 | Medium | Pending |
| FR-07 | SpotImageGallery에 병합된 사진 소스 전달 (중복 제거) | High | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | Hero 캐러셀 FCP < 1.5초, LCP < 2.5초 | Lighthouse |
| Performance | 이미지 lazy loading (Hero 첫 장만 priority) | Network tab 확인 |
| Accessibility | 캐러셀 키보드 탐색 지원 (←/→ 화살표) | Manual test |
| SEO | 기존 메타데이터/JsonLd 유지 | Google Rich Results Test |
| Mobile | 터치 스와이프 반응 지연 < 100ms | Manual test |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 모든 FR 구현 완료
- [ ] 모바일/데스크톱 반응형 정상 작동
- [ ] 빌드 성공 (`pnpm build`)
- [ ] 기존 SSR/SEO 메타데이터 유지

### 4.2 Quality Criteria

- [ ] Lint 에러 0건
- [ ] TypeScript 에러 0건
- [ ] Lighthouse Performance > 90

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 캐러셀 라이브러리 번들 사이즈 | Medium | Medium | CSS-only 스크롤 스냅 기반 구현 (라이브러리 없이) |
| Place API 사진 없는 Spot | Low | Medium | mediaItems 우선, 둘 다 없으면 현재 placeholder 유지 |
| Hero 이미지 로딩 성능 저하 | Medium | Low | 첫 장만 priority, 나머지 lazy + srcSet |
| 기존 QR 모드 레이아웃 깨짐 | High | Low | QR 모드 진입 시 수동 테스트 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites | |
| **Dynamic** | Feature-based, BaaS | Web apps, SaaS MVPs | **v** |
| **Enterprise** | Strict layers, DI | High-traffic systems | |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| 캐러셀 구현 | Swiper / Embla / CSS scroll-snap | CSS scroll-snap | 의존성 추가 없이 네이티브 성능, 번들 0KB |
| 사진 병합 위치 | page.tsx (서버) / 컴포넌트 (클라이언트) | page.tsx (서버) | SSR에서 병합 후 props 전달, 클라이언트 연산 제거 |
| 캐러셀 인터랙션 | use client 전체 / 인디케이터만 client | 인디케이터만 client | Hero 영역 SSR 유지, 인디케이터 상태만 client |

### 6.3 Clean Architecture Approach

```
Selected Level: Dynamic

수정 대상 파일:
┌─────────────────────────────────────────────────────┐
│ src/app/spot/[slug]/page.tsx      (MODIFY) 사진 병합 │
│ src/components/spot/SpotHero.tsx  (MODIFY) 캐러셀    │
│ src/components/spot/SpotPlaceInfo.tsx (MODIFY) 리디자인│
│ src/components/spot/SpotCrewNote.tsx (MODIFY) 스타일  │
│ src/components/spot/SpotSpotLines.tsx (MODIFY) 썸네일 │
│ src/components/spot/SpotBottomBar.tsx (MODIFY) CTA   │
│ src/components/spot/SpotImageGallery.tsx (MODIFY) 병합│
│ src/components/spot/HeroCarousel.tsx  (NEW) 캐러셀   │
└─────────────────────────────────────────────────────┘
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions section
- [x] ESLint configuration
- [x] TypeScript configuration (`tsconfig.json`)
- [x] Tailwind CSS 4 + `cn()` utility

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **Naming** | Exists (PascalCase components) | 유지 | - |
| **Folder structure** | Exists (`src/components/spot/`) | 유지 | - |
| **Import order** | Exists (React → libs → internal → types) | 유지 | - |
| **Image handling** | OptimizedImage 컴포넌트 | 캐러셀 이미지도 동일 패턴 | Medium |

### 7.3 Environment Variables Needed

기존 환경변수만 사용, 추가 불필요.

| Variable | Purpose | Scope | Status |
|----------|---------|-------|:------:|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API | Client | Exists |

---

## 8. Next Steps

1. [ ] Design 문서 작성 (`/pdca design spot-detail-page-v2`)
2. [ ] 컴포넌트별 구현
3. [ ] 모바일/데스크톱 테스트
4. [ ] Gap Analysis

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-17 | Initial draft | Claude |
