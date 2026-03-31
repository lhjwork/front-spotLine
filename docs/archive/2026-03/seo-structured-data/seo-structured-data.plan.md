# Plan: SEO Structured Data & Sitemap

## Executive Summary

| Perspective | Description |
|-------------|-------------|
| **Problem** | Spot/Route 페이지에 JSON-LD 구조화 데이터가 없어 검색엔진이 콘텐츠 유형(장소, 코스)을 정확히 이해하지 못하고, sitemap이 없어 크롤러가 동적 페이지를 효율적으로 발견하지 못한다. |
| **Solution** | JSON-LD Schema.org 마크업 (LocalBusiness, TouristTrip, BreadcrumbList) + 동적 sitemap.xml + robots.txt를 Next.js 16 네이티브 기능으로 구현한다. |
| **Function UX Effect** | 검색 결과에 별점, 영업시간, 코스 정보가 리치 스니펫으로 표시되어 CTR이 향상되고, 모든 Spot/Route 페이지가 검색엔진에 빠르게 인덱싱된다. |
| **Core Value** | 콘텐츠 기반 Cold Start 전략의 핵심인 SEO 유입을 극대화하여, 광고 없이 자연 검색으로 사용자를 확보한다. |

| Item | Detail |
|------|--------|
| Feature | SEO Structured Data & Sitemap |
| Created | 2026-03-31 |
| Status | Planning |
| Level | Dynamic |
| Target Repo | front-spotLine |

---

## 1. Background & Context

### 1.1 현재 상태 (AS-IS)

front-spotLine에 이미 구현된 SEO 요소:
- `layout.tsx`: 기본 메타데이터 (title template, description, OpenGraph, Twitter Cards, robots)
- `/spot/[slug]/page.tsx`: 동적 `generateMetadata()` (title, description, OG image)
- `/route/[slug]/page.tsx`: 동적 `generateMetadata()` (title, description)
- Google Site Verification 설정 (env var)
- `robots` 설정: index/follow 허용, googleBot max-image-preview: large

### 1.2 부족한 부분 (Gap)

| 항목 | 현재 | 목표 |
|------|------|------|
| JSON-LD | 없음 | Spot: LocalBusiness / Route: TouristTrip |
| Breadcrumb | 없음 | BreadcrumbList schema |
| Sitemap | 없음 | 동적 sitemap.xml (모든 Spot/Route URL) |
| robots.txt | metadata 설정만 | 전용 robots.txt 파일 |
| Canonical URL | 미설정 | 모든 페이지 canonical URL |
| 도시/테마 메타데이터 | 기본만 | 지역별/테마별 최적화된 메타데이터 |

### 1.3 왜 지금 필요한가

- Cold Start 전략의 핵심은 "콘텐츠 + SEO 우선"
- 크루가 200~300개 Spot + 15~20개 Route를 큐레이션 중
- JSON-LD 없이는 검색 결과에 리치 스니펫 미표시 → 낮은 CTR
- Sitemap 없이는 새로 추가된 Spot/Route가 인덱싱에 수일~수주 소요

---

## 2. Feature Requirements

### 2.1 JSON-LD 구조화 데이터

#### Spot 페이지 (`/spot/[slug]`)

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "카페 이름",
  "description": "크루노트 또는 설명",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "주소",
    "addressLocality": "성수",
    "addressRegion": "서울"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 37.5,
    "longitude": 126.9
  },
  "image": ["사진 URL"],
  "telephone": "전화번호",
  "openingHours": "영업시간",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.5,
    "reviewCount": 100
  },
  "url": "canonical URL"
}
```

- PlaceInfo 데이터 활용 (rating, phone, businessHours, photos)
- PlaceInfo 없으면 최소 필드만 출력 (name, address, geo)
- `SpotCategory`에 따라 `@type` 세분화: cafe/restaurant/bar → `CafeOrCoffeeShop`/`Restaurant`/`BarOrPub`

#### Route 페이지 (`/route/[slug]`)

```json
{
  "@context": "https://schema.org",
  "@type": "TouristTrip",
  "name": "루트 이름",
  "description": "설명",
  "touristType": "테마",
  "itinerary": {
    "@type": "ItemList",
    "numberOfItems": 5,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "item": {
          "@type": "Place",
          "name": "Spot 이름",
          "address": "주소"
        }
      }
    ]
  }
}
```

#### Breadcrumb (모든 페이지)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "홈", "item": "/" },
    { "@type": "ListItem", "position": 2, "name": "성수", "item": "/city/성수" },
    { "@type": "ListItem", "position": 3, "name": "Spot 이름" }
  ]
}
```

### 2.2 Dynamic Sitemap

Next.js 16 `sitemap.ts` 사용:

```
sitemap.xml
├── 정적 페이지: /, /about, /feed
├── 도시 페이지: /city/[name] (큐레이션된 도시 목록)
├── 테마 페이지: /theme/[name] (7개 테마)
├── Spot 페이지: /spot/[slug] (전체 active Spot)
└── Route 페이지: /route/[slug] (전체 active Route)
```

- Backend API 호출로 slug 목록 조회 (새 API 엔드포인트 필요)
- `changeFrequency`: Spot/Route = weekly, 정적 = monthly
- `priority`: 홈 1.0, Spot/Route 0.8, 도시/테마 0.7, 정적 0.5
- `lastModified`: Backend의 updatedAt 필드 활용

### 2.3 robots.txt

Next.js 16 `robots.ts` 사용:

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /mockup/
Disallow: /spotline/
Sitemap: https://spotline.kr/sitemap.xml
```

- `/spotline/[qrId]`는 QR 전용이므로 검색 인덱싱 제외
- `/api/` 내부 API 라우트 제외
- `/mockup/` 개발용 목업 제외

### 2.4 Canonical URL

모든 페이지에 canonical URL 명시적 설정:
- `generateMetadata()`에서 `alternates.canonical` 반환
- 중복 URL 방지 (query param 포함 URL → canonical은 clean URL)

---

## 3. Implementation Scope

### 3.1 신규 파일

| 파일 | 용도 |
|------|------|
| `src/app/sitemap.ts` | 동적 sitemap 생성 |
| `src/app/robots.ts` | robots.txt 생성 |
| `src/lib/seo/jsonld.ts` | JSON-LD 생성 유틸리티 함수 |
| `src/components/seo/JsonLd.tsx` | JSON-LD script 태그 렌더링 컴포넌트 |
| `src/components/seo/Breadcrumb.tsx` | Breadcrumb JSON-LD 컴포넌트 |

### 3.2 수정 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/app/spot/[slug]/page.tsx` | JSON-LD + Breadcrumb 추가, canonical URL |
| `src/app/route/[slug]/page.tsx` | JSON-LD + Breadcrumb 추가, canonical URL |
| `src/app/city/[name]/page.tsx` | Breadcrumb + canonical URL |
| `src/app/theme/[name]/page.tsx` | Breadcrumb + canonical URL |
| `src/app/layout.tsx` | Organization schema, metadataBase 확인 |
| `src/lib/api.ts` | sitemap용 slug 목록 API 함수 추가 |

### 3.3 Backend API (필요시)

| Endpoint | 용도 |
|----------|------|
| `GET /api/v2/spots/slugs` | 전체 active Spot slug + updatedAt 목록 (sitemap용) |
| `GET /api/v2/routes/slugs` | 전체 active Route slug + updatedAt 목록 (sitemap용) |

- 가벼운 응답 (slug, updatedAt만)
- 캐싱: ISR revalidate 1시간

---

## 4. Technical Decisions

### 4.1 JSON-LD 렌더링 방식

**서버 컴포넌트에서 `<script type="application/ld+json">`으로 직접 렌더링**
- Next.js의 `generateMetadata()`는 JSON-LD를 지원하지 않으므로 컴포넌트로 구현
- SSR 시점에 HTML에 포함 → 크롤러가 JavaScript 실행 없이 파싱 가능

### 4.2 Sitemap 크기 관리

- 현재 예상: 200~300 Spot + 20 Route + 정적 < 500 URL
- 단일 sitemap으로 충분 (Google 제한: 50,000 URL / 50MB)
- 1,000+ URL 초과 시 sitemap index 분할 고려 (현재 불필요)

### 4.3 Schema.org 타입 매핑

| SpotCategory | Schema.org @type |
|-------------|------------------|
| cafe | CafeOrCoffeeShop |
| restaurant | Restaurant |
| bar | BarOrPub |
| nature, walk | Park |
| culture, exhibition | Museum |
| activity | TouristAttraction |
| shopping | Store |
| other | LocalBusiness |

---

## 5. Out of Scope

- Open Graph 이미지 자동 생성 (`opengraph-image.tsx`) — 별도 feature
- Google Analytics / Search Console 연동 — 별도 feature
- AMP 페이지 — 불필요
- hreflang (다국어) — 현재 한국어만
- PWA manifest — 별도 feature

---

## 6. Implementation Order

1. `src/lib/seo/jsonld.ts` — JSON-LD 생성 유틸리티 (순수 함수)
2. `src/components/seo/JsonLd.tsx` — 렌더링 컴포넌트
3. `src/components/seo/Breadcrumb.tsx` — Breadcrumb 컴포넌트
4. `/spot/[slug]/page.tsx` 수정 — Spot JSON-LD + Breadcrumb + canonical
5. `/route/[slug]/page.tsx` 수정 — Route JSON-LD + Breadcrumb + canonical
6. `src/app/robots.ts` — robots.txt
7. `src/lib/api.ts` + Backend slugs API — sitemap용 데이터
8. `src/app/sitemap.ts` — 동적 sitemap
9. `/city/[name]`, `/theme/[name]` — Breadcrumb + canonical 추가
10. `layout.tsx` — Organization schema 추가

---

## 7. Success Criteria

| 항목 | 기준 |
|------|------|
| JSON-LD 유효성 | Google Rich Results Test 통과 |
| Sitemap | Google Search Console에서 정상 제출 |
| robots.txt | `/robots.txt` 접근 시 정상 응답 |
| Breadcrumb | Google Rich Results Test에서 Breadcrumb 감지 |
| Canonical | 모든 페이지에 canonical URL 설정 확인 |
| Build | `pnpm build` 성공, 타입 에러 없음 |

---

## 8. Risk & Mitigation

| 위험 | 대응 |
|------|------|
| Backend slugs API 미구현 시 | 정적 URL만 sitemap에 포함, API 추가 후 동적 전환 |
| Place API 데이터 없는 Spot | 최소 필드만 JSON-LD 출력 (name, address, geo) |
| Sitemap 생성 시 API 응답 지연 | ISR revalidate로 캐싱, timeout 설정 |
