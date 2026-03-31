# Design: SEO Structured Data & Sitemap

## Executive Summary

| Perspective | Description |
|-------------|-------------|
| **Problem** | JSON-LD 구조화 데이터, sitemap, robots.txt가 없어 검색엔진 최적화가 불완전하다. |
| **Solution** | 5개 신규 파일 + 6개 수정으로 Schema.org JSON-LD, 동적 sitemap, robots.txt를 구현한다. |
| **Function UX Effect** | 검색 결과에 리치 스니펫 표시, 빠른 인덱싱으로 자연 검색 유입이 증가한다. |
| **Core Value** | 콘텐츠 기반 Cold Start 전략의 SEO 유입을 극대화한다. |

| Item | Detail |
|------|--------|
| Feature | SEO Structured Data & Sitemap |
| Plan Reference | `docs/01-plan/features/seo-structured-data.plan.md` |
| Created | 2026-03-31 |
| Status | Design |

---

## 1. Architecture Overview

```
src/
├── app/
│   ├── layout.tsx              ← [수정] Organization JSON-LD 추가
│   ├── sitemap.ts              ← [신규] 동적 sitemap 생성
│   ├── robots.ts               ← [신규] robots.txt 생성
│   ├── spot/[slug]/page.tsx    ← [수정] SpotJsonLd + Breadcrumb + canonical
│   ├── route/[slug]/page.tsx   ← [수정] RouteJsonLd + Breadcrumb + canonical
│   ├── city/[name]/page.tsx    ← [수정] Breadcrumb + canonical
│   └── theme/[name]/page.tsx   ← [수정] Breadcrumb + canonical
├── lib/
│   ├── api.ts                  ← [수정] fetchAllSpotSlugs, fetchAllRouteSlugs 추가
│   └── seo/
│       └── jsonld.ts           ← [신규] JSON-LD 생성 순수 함수
└── components/
    └── seo/
        ├── JsonLd.tsx          ← [신규] JSON-LD script 렌더링 컴포넌트
        └── Breadcrumb.tsx      ← [신규] Breadcrumb JSON-LD 컴포넌트
```

---

## 2. Detailed File Designs

### 2.1 `src/lib/seo/jsonld.ts` — JSON-LD 생성 유틸리티

순수 함수 모듈. 각 함수는 Schema.org 호환 객체를 반환한다.

```typescript
import type { SpotDetailResponse, RouteDetailResponse, SpotCategory } from "@/types";

// --- 상수 ---

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://spotline.kr";

const CATEGORY_SCHEMA_MAP: Record<SpotCategory, string> = {
  cafe: "CafeOrCoffeeShop",
  restaurant: "Restaurant",
  bar: "BarOrPub",
  nature: "Park",
  walk: "Park",
  culture: "Museum",
  exhibition: "Museum",
  activity: "TouristAttraction",
  shopping: "Store",
  other: "LocalBusiness",
};

// --- 함수 ---

/** Spot → LocalBusiness (또는 하위 타입) JSON-LD */
export function generateSpotJsonLd(spot: SpotDetailResponse): Record<string, unknown> {
  const schemaType = CATEGORY_SCHEMA_MAP[spot.category] || "LocalBusiness";
  const url = `${SITE_URL}/spot/${spot.slug}`;
  const description = spot.crewNote || spot.description || `${spot.area}의 ${spot.title}`;

  const images: string[] = [
    ...(spot.placeInfo?.photos || []),
    ...spot.media,
    ...spot.mediaItems.map((m) => m.url),
  ].filter(Boolean);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: spot.title,
    description,
    url,
    address: {
      "@type": "PostalAddress",
      streetAddress: spot.address,
      addressLocality: spot.area,
      addressRegion: spot.sido || "서울",
      addressCountry: "KR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: spot.latitude,
      longitude: spot.longitude,
    },
  };

  if (images.length > 0) {
    jsonLd.image = images;
  }

  // PlaceInfo 조건부 필드
  if (spot.placeInfo) {
    if (spot.placeInfo.phone) {
      jsonLd.telephone = spot.placeInfo.phone;
    }
    if (spot.placeInfo.businessHours) {
      jsonLd.openingHours = spot.placeInfo.businessHours;
    }
    if (spot.placeInfo.rating != null && spot.placeInfo.reviewCount != null && spot.placeInfo.reviewCount > 0) {
      jsonLd.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: spot.placeInfo.rating,
        reviewCount: spot.placeInfo.reviewCount,
      };
    }
  }

  return jsonLd;
}

/** Route → TouristTrip + ItemList JSON-LD */
export function generateRouteJsonLd(route: RouteDetailResponse): Record<string, unknown> {
  const url = `${SITE_URL}/route/${route.slug}`;
  const description = route.description || `${route.area}의 ${route.title} - ${route.spots.length}곳`;

  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: route.title,
    description,
    url,
    touristType: route.theme,
    itinerary: {
      "@type": "ItemList",
      numberOfItems: route.spots.length,
      itemListElement: route.spots.map((spot) => ({
        "@type": "ListItem",
        position: spot.order + 1,
        item: {
          "@type": "Place",
          name: spot.spotTitle,
          address: spot.spotAddress,
        },
      })),
    },
  };
}

/** Organization JSON-LD (layout.tsx에서 사용) */
export function generateOrganizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Spotline",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: "QR 기반 로컬 연결 서비스. 경험을 기록하고 공유하는 소셜 플랫폼.",
    sameAs: [],
  };
}

/** BreadcrumbList JSON-LD */
export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; url?: string }>
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.url ? { item: `${SITE_URL}${item.url}` } : {}),
    })),
  };
}
```

**설계 결정:**
- `Record<string, unknown>` 반환 — JSON.stringify와 호환, 불필요한 타입 정의 최소화
- SITE_URL env var 사용 — 환경별 URL 대응
- PlaceInfo 조건부 — 없는 데이터는 출력하지 않음 (Google 가이드라인 준수)
- `ratingValue` + `reviewCount`가 모두 있을 때만 aggregateRating 출력

---

### 2.2 `src/components/seo/JsonLd.tsx` — JSON-LD 렌더링 컴포넌트

서버 컴포넌트. `<script type="application/ld+json">`을 렌더링한다.

```typescript
interface JsonLdProps {
  data: Record<string, unknown>;
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

**설계 결정:**
- 단일 책임: JSON 직렬화 + script 태그 삽입만 수행
- 서버 컴포넌트 (기본) — `"use client"` 불필요
- `dangerouslySetInnerHTML` 사용 — JSON-LD의 표준 렌더링 패턴
- 데이터는 서버 사이드에서 생성된 안전한 객체이므로 XSS 위험 없음

---

### 2.3 `src/components/seo/Breadcrumb.tsx` — Breadcrumb 컴포넌트

JSON-LD만 출력 (시각적 breadcrumb UI는 Out of Scope).

```typescript
import JsonLd from "./JsonLd";
import { generateBreadcrumbJsonLd } from "@/lib/seo/jsonld";

interface BreadcrumbProps {
  items: Array<{ name: string; url?: string }>;
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const breadcrumbItems = [{ name: "홈", url: "/" }, ...items];
  return <JsonLd data={generateBreadcrumbJsonLd(breadcrumbItems)} />;
}
```

**설계 결정:**
- "홈"은 항상 첫 번째 항목으로 자동 추가
- 마지막 항목은 `url` 없이 전달 (현재 페이지)
- 시각적 UI 없이 JSON-LD만 — 추후 UI 추가 가능

---

### 2.4 `src/app/spot/[slug]/page.tsx` — 수정사항

```diff
+ import JsonLd from "@/components/seo/JsonLd";
+ import Breadcrumb from "@/components/seo/Breadcrumb";
+ import { generateSpotJsonLd } from "@/lib/seo/jsonld";

  // generateMetadata 수정:
  export async function generateMetadata({ params }: SpotPageProps): Promise<Metadata> {
    const { slug } = await params;
    const spot = await fetchSpotDetail(slug);
    if (!spot) return { title: "Spot을 찾을 수 없습니다" };

    const description = spot.crewNote || spot.description || `${spot.area}의 ${spot.title}`;
    const imageUrl = spot.placeInfo?.photos?.[0] || spot.media?.[0];
+   const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://spotline.kr";

    return {
      title: spot.title,
      description,
+     alternates: {
+       canonical: `${siteUrl}/spot/${slug}`,
+     },
      openGraph: { /* 기존 유지 */ },
      twitter: { /* 기존 유지 */ },
    };
  }

  // 컴포넌트 수정:
  export default async function SpotPage({ params, searchParams }: SpotPageProps) {
    // ... 기존 로직 유지 ...

    return (
      <main className="min-h-screen bg-gray-50 pb-20">
+       <JsonLd data={generateSpotJsonLd(spot)} />
+       <Breadcrumb items={[
+         { name: spot.area, url: `/city/${spot.area}` },
+         { name: spot.title },
+       ]} />
        <SpotHero spot={spot} />
        {/* ... 나머지 기존 코드 유지 ... */}
      </main>
    );
  }
```

**변경 범위:**
- import 3줄 추가
- `generateMetadata`에 `alternates.canonical` 추가 (3줄)
- JSX에 `<JsonLd>` + `<Breadcrumb>` 추가 (5줄)
- 기존 코드 변경 없음

---

### 2.5 `src/app/route/[slug]/page.tsx` — 수정사항

```diff
+ import JsonLd from "@/components/seo/JsonLd";
+ import Breadcrumb from "@/components/seo/Breadcrumb";
+ import { generateRouteJsonLd } from "@/lib/seo/jsonld";

  // generateMetadata 수정:
+   alternates: {
+     canonical: `${siteUrl}/route/${slug}`,
+   },

  // 컴포넌트 수정:
  return (
    <main className="min-h-screen bg-gray-50 pb-20">
+     <JsonLd data={generateRouteJsonLd(route)} />
+     <Breadcrumb items={[
+       { name: route.area, url: `/city/${route.area}` },
+       { name: route.theme, url: `/theme/${route.theme}` },
+       { name: route.title },
+     ]} />
      <RouteHeader route={route} />
      {/* ... 나머지 기존 코드 유지 ... */}
    </main>
  );
```

**변경 범위:** Spot과 동일 패턴. Breadcrumb에 theme 단계 추가.

---

### 2.6 `src/app/city/[name]/page.tsx` — 수정사항

```diff
+ import Breadcrumb from "@/components/seo/Breadcrumb";

  // generateMetadata에 canonical 추가:
+   alternates: {
+     canonical: `${siteUrl}/city/${name}`,
+   },

  // 컴포넌트에 Breadcrumb 추가:
  return (
    <Layout showFooter>
      <div className="max-w-4xl mx-auto">
+       <Breadcrumb items={[{ name: city.name }]} />
        <CityHero city={city} />
```

---

### 2.7 `src/app/theme/[name]/page.tsx` — 수정사항

```diff
+ import Breadcrumb from "@/components/seo/Breadcrumb";

  // generateMetadata에 canonical 추가:
+   alternates: {
+     canonical: `${siteUrl}/theme/${name}`,
+   },

  // 컴포넌트에 Breadcrumb 추가:
+   <Breadcrumb items={[{ name: theme.name }]} />
```

---

### 2.8 `src/app/robots.ts` — robots.txt 생성

```typescript
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://spotline.kr";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/mockup/", "/spotline/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
```

**설계 결정:**
- `/spotline/[qrId]` 제외 — QR 전용 페이지는 검색 인덱싱 불필요
- `/api/` 제외 — 내부 API 라우트
- `/mockup/` 제외 — 개발용 목업 페이지

---

### 2.9 `src/lib/api.ts` — Sitemap용 API 함수 추가

```typescript
// --- Sitemap용 (slug + updatedAt만 조회) ---

export interface SlugEntry {
  slug: string;
  updatedAt: string;
}

/** 전체 active Spot slug 목록 (sitemap용) */
export async function fetchAllSpotSlugs(): Promise<SlugEntry[]> {
  try {
    const res = await apiClient.get<SlugEntry[]>("/api/v2/spots/slugs");
    return res.data;
  } catch {
    return [];
  }
}

/** 전체 active Route slug 목록 (sitemap용) */
export async function fetchAllRouteSlugs(): Promise<SlugEntry[]> {
  try {
    const res = await apiClient.get<SlugEntry[]>("/api/v2/routes/slugs");
    return res.data;
  } catch {
    return [];
  }
}
```

**설계 결정:**
- 실패 시 빈 배열 반환 — sitemap 생성이 전체 빌드를 중단시키지 않음
- Backend API 미구현 시에도 정적 URL만으로 sitemap 생성 가능

---

### 2.10 `src/app/sitemap.ts` — 동적 Sitemap

```typescript
import type { MetadataRoute } from "next";
import { fetchAllSpotSlugs, fetchAllRouteSlugs } from "@/lib/api";
import { CITIES } from "@/constants/cities";
import { THEMES } from "@/constants/themes";

export const revalidate = 3600; // 1시간마다 재생성

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://spotline.kr";

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/feed`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  // 도시 페이지
  const cityPages: MetadataRoute.Sitemap = CITIES.map((city) => ({
    url: `${siteUrl}/city/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // 테마 페이지
  const themePages: MetadataRoute.Sitemap = THEMES.map((theme) => ({
    url: `${siteUrl}/theme/${theme.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // 동적 페이지 (Backend API)
  const [spotSlugs, routeSlugs] = await Promise.all([
    fetchAllSpotSlugs(),
    fetchAllRouteSlugs(),
  ]);

  const spotPages: MetadataRoute.Sitemap = spotSlugs.map((entry) => ({
    url: `${siteUrl}/spot/${entry.slug}`,
    lastModified: new Date(entry.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const routePages: MetadataRoute.Sitemap = routeSlugs.map((entry) => ({
    url: `${siteUrl}/route/${entry.slug}`,
    lastModified: new Date(entry.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...cityPages, ...themePages, ...spotPages, ...routePages];
}
```

**설계 결정:**
- `revalidate = 3600` — ISR 1시간 캐싱 (새 Spot 추가 후 최대 1시간 내 반영)
- API 실패 시 정적 페이지만 포함 (graceful degradation)
- 우선순위: 홈 1.0 > Spot/Route/Feed 0.8 > City/Theme 0.7 > About 0.3

---

### 2.11 `src/app/layout.tsx` — Organization Schema 추가

```diff
+ import JsonLd from "@/components/seo/JsonLd";
+ import { generateOrganizationJsonLd } from "@/lib/seo/jsonld";

  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="ko">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
+         <JsonLd data={generateOrganizationJsonLd()} />
          <AuthInitializer />
          {children}
          <BottomNavBar />
        </body>
      </html>
    );
  }
```

---

## 3. Backend API (Spring Boot)

### 3.1 `GET /api/v2/spots/slugs`

**SpotController.java 추가:**

```java
@GetMapping("/slugs")
public ResponseEntity<List<SlugResponse>> getAllSpotSlugs() {
    List<SlugResponse> slugs = spotService.getAllActiveSlugs();
    return ResponseEntity.ok(slugs);
}
```

**SlugResponse DTO:**

```java
public record SlugResponse(String slug, LocalDateTime updatedAt) {}
```

**SpotRepository 추가:**

```java
@Query("SELECT new com.spotline.api.dto.response.SlugResponse(s.slug, s.updatedAt) FROM Spot s WHERE s.isActive = true")
List<SlugResponse> findAllActiveSlugs();
```

### 3.2 `GET /api/v2/routes/slugs`

동일 패턴으로 RouteController, RouteRepository에 추가.

---

## 4. Implementation Order (Checklist)

| # | Task | File | Type | Depends |
|---|------|------|------|---------|
| 1 | JSON-LD 유틸리티 함수 | `src/lib/seo/jsonld.ts` | 신규 | — |
| 2 | JsonLd 컴포넌트 | `src/components/seo/JsonLd.tsx` | 신규 | — |
| 3 | Breadcrumb 컴포넌트 | `src/components/seo/Breadcrumb.tsx` | 신규 | 1, 2 |
| 4 | Spot 페이지 적용 | `src/app/spot/[slug]/page.tsx` | 수정 | 1, 2, 3 |
| 5 | Route 페이지 적용 | `src/app/route/[slug]/page.tsx` | 수정 | 1, 2, 3 |
| 6 | robots.txt | `src/app/robots.ts` | 신규 | — |
| 7 | Sitemap API 함수 | `src/lib/api.ts` | 수정 | — |
| 8 | Backend slugs API | Spring Boot | 수정 | — |
| 9 | 동적 sitemap | `src/app/sitemap.ts` | 신규 | 7, 8 |
| 10 | City 페이지 적용 | `src/app/city/[name]/page.tsx` | 수정 | 3 |
| 11 | Theme 페이지 적용 | `src/app/theme/[name]/page.tsx` | 수정 | 3 |
| 12 | Organization schema | `src/app/layout.tsx` | 수정 | 1, 2 |

**병렬 가능 그룹:**
- Group A (독립): #1, #2, #6, #7, #8
- Group B (#1,2 완료 후): #3, #12
- Group C (#3 완료 후): #4, #5, #10, #11
- Group D (#7,8 완료 후): #9

---

## 5. Validation Criteria

| 항목 | 검증 방법 |
|------|----------|
| Spot JSON-LD | `pnpm build` 후 HTML 소스에서 `application/ld+json` 확인 |
| Route JSON-LD | 동일 |
| Breadcrumb | HTML 소스에서 `BreadcrumbList` 확인 |
| Organization | layout HTML에서 `Organization` 확인 |
| robots.txt | `curl localhost:3003/robots.txt` 정상 응답 |
| sitemap.xml | `curl localhost:3003/sitemap.xml` 정상 응답 |
| Canonical URL | HTML `<link rel="canonical">` 태그 확인 |
| TypeScript | `pnpm type-check` 통과 |
| Build | `pnpm build` 성공 |
| Rich Results | Google Rich Results Test (배포 후) |

---

## 6. File Summary

| 파일 | 줄 수 (예상) | 변경 유형 |
|------|-------------|----------|
| `src/lib/seo/jsonld.ts` | ~100 | 신규 |
| `src/components/seo/JsonLd.tsx` | ~12 | 신규 |
| `src/components/seo/Breadcrumb.tsx` | ~15 | 신규 |
| `src/app/robots.ts` | ~18 | 신규 |
| `src/app/sitemap.ts` | ~55 | 신규 |
| `src/app/spot/[slug]/page.tsx` | +11 | 수정 |
| `src/app/route/[slug]/page.tsx` | +12 | 수정 |
| `src/app/city/[name]/page.tsx` | +6 | 수정 |
| `src/app/theme/[name]/page.tsx` | +6 | 수정 |
| `src/app/layout.tsx` | +3 | 수정 |
| `src/lib/api.ts` | +25 | 수정 |
| **Total** | **~263줄** | **5 신규 + 6 수정** |

**Backend (Spring Boot):**
| 파일 | 변경 |
|------|------|
| `SlugResponse.java` | 신규 DTO (1 record) |
| `SpotController.java` | +1 endpoint |
| `SpotRepository.java` | +1 query method |
| `SpotService.java` | +1 method |
| `RouteController.java` | +1 endpoint |
| `RouteRepository.java` | +1 query method |
| `RouteService.java` | +1 method |
