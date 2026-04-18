# content-seo-sitemap Design Document

> **Summary**: robots.ts 크롤링 차단 버그 수정, 사이트맵 확장, WebSite+SearchAction JSON-LD 스키마 추가
>
> **Project**: Spotline (front-spotLine)
> **Version**: 0.1
> **Author**: Claude
> **Date**: 2026-04-18
> **Status**: Draft
> **Planning Doc**: [content-seo-sitemap.plan.md](../../01-plan/features/content-seo-sitemap.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- robots.ts의 `/spotline/` 차단 버그를 수정하여 핵심 콘텐츠 크롤링 정상화
- 사이트맵에 누락된 공개 페이지를 추가하여 인덱싱 커버리지 확대
- WebSite + SearchAction JSON-LD 스키마로 검색엔진 SERP 표시 개선
- 기존 SEO 패턴(generateMetadata, JsonLd 컴포넌트)과 완전한 일관성 유지

### 1.2 Design Principles

- 기존 코드 패턴 최대한 유지 (최소 변경 원칙)
- Next.js MetadataRoute API 활용
- 검색엔진 가이드라인(Google, Naver) 준수

---

## 2. Architecture

### 2.1 Component Diagram

```
┌──────────────────────────────────────────────────────────┐
│ Search Engine Crawler                                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  1. /robots.txt  ←── src/app/robots.ts (규칙 수정)       │
│  2. /sitemap.xml ←── src/app/sitemap.ts (페이지 확장)    │
│  3. JSON-LD      ←── src/app/layout.tsx                  │
│         ↑                    ↑                           │
│         └── src/lib/seo/jsonld.ts (WebSite 스키마 추가)  │
│                                                          │
│  4. 404 meta     ←── src/app/not-found.tsx               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
Build Time:
  robots.ts → /robots.txt (static)
  sitemap.ts → /sitemap.xml (ISR, 1h revalidation)

Runtime (SSR):
  layout.tsx → Organization JSON-LD + WebSite JSON-LD (every page)
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| `sitemap.ts` | `@/lib/api` (fetchAllSpotSlugs 등) | 동적 slug 목록 조회 |
| `sitemap.ts` | `@/constants/cities`, `@/constants/themes` | 정적 도시/테마 목록 |
| `layout.tsx` | `@/lib/seo/jsonld` | JSON-LD 생성 함수 |
| `layout.tsx` | `@/components/seo/JsonLd` | JSON-LD 렌더링 컴포넌트 |

---

## 3. Design Items

### DI-01: robots.ts — disallow 규칙 수정 (FR-01, Critical)

**현재 코드:**
```typescript
disallow: ["/api/", "/mockup/", "/spotline/"],
```

**변경 후:**
```typescript
disallow: ["/api/", "/mockup/"],
```

**이유:** `/spotline/`을 차단하면 SpotLine 상세 페이지가 검색엔진에 인덱싱되지 않음. 이는 Cold Start SEO 전략에 치명적.

**파일:** `src/app/robots.ts`
**타입:** MODIFY

---

### DI-02: sitemap.ts — 누락 페이지 추가 (FR-02, High)

**현재 staticPages:**
- `/` (home)
- `/feed`
- `/about`

**추가할 페이지:**
```typescript
const staticPages: MetadataRoute.Sitemap = [
  { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
  { url: `${siteUrl}/feed`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  { url: `${siteUrl}/explore`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  { url: `${siteUrl}/search`, lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
  { url: `${siteUrl}/blogs`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
  { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
];
```

**주의:** `/my-spotlines`, `/my-spots`, `/saves` 등 인증 필요 페이지는 사이트맵에서 제외 (크롤러가 접근 불가).

**파일:** `src/app/sitemap.ts`
**타입:** MODIFY

---

### DI-03: jsonld.ts — WebSite + SearchAction 스키마 추가 (FR-03, High)

**새 함수 추가:**
```typescript
/** WebSite + SearchAction JSON-LD (루트 레이아웃용) */
export function generateWebSiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Spotline",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
```

**Google Search docs 준수:** `SearchAction` + `EntryPoint` 패턴으로 검색 결과에 사이트 내 검색 박스가 표시될 수 있음.

**파일:** `src/lib/seo/jsonld.ts`
**타입:** MODIFY

---

### DI-04: layout.tsx — WebSite JSON-LD 렌더링 (FR-03, High)

**현재:** Organization JSON-LD만 렌더링
**변경:** WebSite JSON-LD를 추가로 렌더링

```tsx
import { generateOrganizationJsonLd, generateWebSiteJsonLd } from "@/lib/seo/jsonld";

// body 내부
<JsonLd data={generateOrganizationJsonLd()} />
<JsonLd data={generateWebSiteJsonLd()} />
```

**파일:** `src/app/layout.tsx`
**타입:** MODIFY

---

### DI-05: not-found.tsx — 메타데이터 추가 (FR-05, Low)

**문제:** `not-found.tsx`가 `'use client'`로 되어 있어 `export const metadata`를 직접 사용 불가.

**해결 방안:** Next.js App Router에서 `not-found.tsx`는 `'use client'`여도 상위 `layout.tsx`의 메타데이터가 적용됨. 별도 메타데이터 export 불필요. 대신 페이지 제목을 `<title>` 태그 없이 layout 기본값(`Spotline - QR 기반 로컬 연결 서비스`)이 적용되므로 충분.

**결론:** 현재 상태 유지. 404 페이지에 별도 메타데이터 변경 불필요 (layout 기본값 사용).

**파일:** `src/app/not-found.tsx`
**타입:** SKIP (변경 불필요)

---

### DI-06: sitemap.ts — priority 최적화 (FR-04, Medium)

**현재 priority 체계:**

| 페이지 유형 | 현재 priority | 변경 priority | 근거 |
|------------|:------------:|:------------:|------|
| Home `/` | 1.0 | 1.0 | 유지 |
| Feed `/feed` | 0.8 | 0.8 | 유지 |
| Explore `/explore` | - | 0.8 | 주요 탐색 허브 |
| Spot `/spot/*` | 0.8 | 0.9 | 핵심 콘텐츠, SEO 최우선 |
| SpotLine `/spotline/*` | 0.8 | 0.9 | 핵심 콘텐츠, SEO 최우선 |
| City `/city/*` | 0.7 | 0.7 | 유지 |
| Theme `/theme/*` | 0.7 | 0.7 | 유지 |
| Blogs `/blogs` | - | 0.7 | 블로그 리스트 |
| Blog `/blog/*` | 0.6 | 0.6 | 유지 |
| Search `/search` | - | 0.6 | 도구 페이지 |
| About `/about` | 0.3 | 0.3 | 유지 |

**근거:** Spot/SpotLine은 Cold Start 전략의 핵심 콘텐츠이므로 priority를 0.8→0.9로 상향.

**파일:** `src/app/sitemap.ts`
**타입:** MODIFY

---

## 4. Implementation Guide

### 4.1 Implementation Order

1. [ ] **DI-01**: `robots.ts` — `/spotline/` disallow 제거 (Critical, 1줄 변경)
2. [ ] **DI-03**: `jsonld.ts` — `generateWebSiteJsonLd()` 함수 추가 (~15줄)
3. [ ] **DI-04**: `layout.tsx` — WebSite JSON-LD 렌더링 추가 (import 수정 + 1줄)
4. [ ] **DI-02 + DI-06**: `sitemap.ts` — 누락 페이지 추가 + priority 최적화 (~10줄)

### 4.2 File Change Summary

| File | Type | Change Description | LOC |
|------|------|--------------------|-----|
| `src/app/robots.ts` | MODIFY | disallow에서 `/spotline/` 제거 | ~1 |
| `src/lib/seo/jsonld.ts` | MODIFY | `generateWebSiteJsonLd()` 함수 추가 | ~15 |
| `src/app/layout.tsx` | MODIFY | WebSite JSON-LD import 및 렌더링 | ~3 |
| `src/app/sitemap.ts` | MODIFY | explore/search/blogs 추가, priority 조정 | ~10 |

**총 변경:** 4 files (0 NEW, 4 MODIFY), ~29 LOC

---

## 5. Test Plan

### 5.1 Test Scope

| Type | Target | Tool |
|------|--------|------|
| Build Test | `pnpm build` 성공 확인 | Next.js |
| Type Check | `pnpm type-check` 통과 | TypeScript |
| Manual | `/robots.txt` 응답에서 `/spotline/` 미포함 확인 | curl/브라우저 |
| Manual | `/sitemap.xml` 응답에 explore/search/blogs 포함 확인 | curl/브라우저 |
| Manual | 페이지 소스에서 WebSite JSON-LD 확인 | 브라우저 DevTools |

### 5.2 Test Cases

- [ ] `pnpm build` 성공
- [ ] `pnpm type-check` 통과
- [ ] robots.txt에 `/spotline/` disallow 미포함
- [ ] sitemap.xml에 `/explore`, `/search`, `/blogs` URL 포함
- [ ] sitemap.xml에 Spot/SpotLine priority가 0.9
- [ ] 페이지 HTML에 WebSite + SearchAction JSON-LD 포함

---

## 6. Coding Convention Reference

### 6.1 This Feature's Conventions

| Item | Convention Applied |
|------|-------------------|
| Import order | React/Next → 외부 → 내부 → 타입 |
| Path alias | `@/*` 사용 |
| JSON-LD 패턴 | 기존 `generateXxxJsonLd()` 함수 패턴 따름 |
| Sitemap 패턴 | `MetadataRoute.Sitemap` 타입 사용 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-18 | Initial draft | Claude |
