# SEO Structured Data & Sitemap - Analysis Report

> **Analysis Type**: Gap Analysis (PDCA Check Phase)
>
> **Project**: front-spotLine + springboot-spotLine-backend
> **Analyst**: gap-detector
> **Date**: 2026-03-31
> **Design Doc**: [seo-structured-data.design.md](../02-design/features/seo-structured-data.design.md)

---

## 1. Analysis Overview

### 1.1 Analysis Purpose

Design-Implementation gap analysis for the "SEO Structured Data & Sitemap" feature. Compares the design document (Section 2.1~2.11) against actual implementation across 11 frontend files and 7 backend files.

### 1.2 Analysis Scope

- **Design Document**: `docs/02-design/features/seo-structured-data.design.md`
- **Frontend Implementation**: `src/lib/seo/`, `src/components/seo/`, `src/app/` (5 new + 6 modified)
- **Backend Implementation**: `com.spotline.api` (1 new DTO + 6 modified)
- **Analysis Date**: 2026-03-31

---

## 2. Gap Analysis (Design vs Implementation)

### 2.1 New Files

| Design File | Implementation File | Status | Notes |
|-------------|---------------------|--------|-------|
| `src/lib/seo/jsonld.ts` | `src/lib/seo/jsonld.ts` | ✅ Match | 4 functions, all present |
| `src/components/seo/JsonLd.tsx` | `src/components/seo/JsonLd.tsx` | ✅ Match | Exact match |
| `src/components/seo/Breadcrumb.tsx` | `src/components/seo/Breadcrumb.tsx` | ✅ Match | Exact match |
| `src/app/robots.ts` | `src/app/robots.ts` | ✅ Match | Exact match |
| `src/app/sitemap.ts` | `src/app/sitemap.ts` | ✅ Match | Exact match |

### 2.2 Modified Files

| Design Change | Implementation File | Status | Notes |
|---------------|---------------------|--------|-------|
| layout.tsx: Organization JSON-LD | `src/app/layout.tsx` | ✅ Match | JsonLd + import added |
| spot/[slug]/page.tsx: JsonLd + Breadcrumb + canonical | `src/app/spot/[slug]/page.tsx` | ✅ Match | All 3 additions present |
| route/[slug]/page.tsx: JsonLd + Breadcrumb + canonical | `src/app/route/[slug]/page.tsx` | ✅ Match | All 3 additions present |
| city/[name]/page.tsx: Breadcrumb + canonical | `src/app/city/[name]/page.tsx` | ✅ Match | Both additions present |
| theme/[name]/page.tsx: Breadcrumb + canonical | `src/app/theme/[name]/page.tsx` | ✅ Match | Both additions present |
| lib/api.ts: fetchAllSpotSlugs + fetchAllRouteSlugs | `src/lib/api.ts` | ✅ Match | Both functions present |

### 2.3 JSON-LD Utility Functions (`jsonld.ts`)

| Function | Design | Implementation | Status |
|----------|--------|----------------|--------|
| `generateSpotJsonLd` | LocalBusiness + CATEGORY_SCHEMA_MAP | Exact match | ✅ |
| `generateRouteJsonLd` | TouristTrip + ItemList | Exact match | ✅ |
| `generateOrganizationJsonLd` | Organization schema | Exact match | ✅ |
| `generateBreadcrumbJsonLd` | BreadcrumbList | Exact match | ✅ |
| `SITE_URL` constant | `process.env.NEXT_PUBLIC_SITE_URL \|\| "https://spotline.kr"` | Exact match | ✅ |
| `CATEGORY_SCHEMA_MAP` | 10 entries (cafe~other) | Exact 10 entries | ✅ |

**Spot JSON-LD field-level check:**

| Field | Design | Implementation | Status |
|-------|--------|----------------|--------|
| @context / @type | schema.org + CATEGORY_SCHEMA_MAP | Matched | ✅ |
| name / description / url | spot fields | Matched | ✅ |
| address (PostalAddress) | streetAddress, addressLocality, addressRegion, addressCountry | Matched | ✅ |
| geo (GeoCoordinates) | latitude, longitude | Matched | ✅ |
| image (conditional) | placeInfo.photos + media + mediaItems | Matched | ✅ |
| telephone (conditional) | placeInfo.phone | Matched | ✅ |
| openingHours (conditional) | placeInfo.businessHours | Matched | ✅ |
| aggregateRating (conditional) | rating + reviewCount > 0 | Matched | ✅ |

### 2.4 Component Check

| Component | Design Spec | Implementation | Status |
|-----------|-------------|----------------|--------|
| JsonLd | `<script type="application/ld+json">` with `dangerouslySetInnerHTML` | Exact match | ✅ |
| Breadcrumb | Auto-prepend "홈", JsonLd-only (no visual UI) | Exact match | ✅ |

### 2.5 Page Integration Check

**spot/[slug]/page.tsx:**

| Item | Design | Implementation | Status |
|------|--------|----------------|--------|
| Import JsonLd | Added | Line 4 | ✅ |
| Import Breadcrumb | Added | Line 5 | ✅ |
| Import generateSpotJsonLd | Added | Line 6 | ✅ |
| canonical URL in generateMetadata | `${siteUrl}/spot/${slug}` | Lines 40-42 | ✅ |
| `<JsonLd data={generateSpotJsonLd(spot)} />` | In JSX | Line 80 | ✅ |
| `<Breadcrumb items={[area, title]} />` | In JSX | Lines 81-84 | ✅ |

**route/[slug]/page.tsx:**

| Item | Design | Implementation | Status |
|------|--------|----------------|--------|
| Import JsonLd + Breadcrumb + generateRouteJsonLd | Added | Lines 4-6 | ✅ |
| canonical URL | `${siteUrl}/route/${slug}` | Lines 32-34 | ✅ |
| `<JsonLd data={generateRouteJsonLd(route)} />` | In JSX | Line 58 | ✅ |
| Breadcrumb with area + theme + title | 3 items | Lines 59-63 | ✅ |

**city/[name]/page.tsx:**

| Item | Design | Implementation | Status |
|------|--------|----------------|--------|
| Import Breadcrumb | Added | Line 4 | ✅ |
| canonical URL | `${siteUrl}/city/${name}` | Lines 32-34 | ✅ |
| Breadcrumb with city name | 1 item | Line 56 | ✅ |

**theme/[name]/page.tsx:**

| Item | Design | Implementation | Status |
|------|--------|----------------|--------|
| Import Breadcrumb | Added | Line 4 | ✅ |
| canonical URL | `${siteUrl}/theme/${name}` | Lines 32-34 | ✅ |
| Breadcrumb with theme name | 1 item | Line 53 | ✅ |

### 2.6 robots.ts Check

| Rule | Design | Implementation | Status |
|------|--------|----------------|--------|
| userAgent: "*" | Allow: "/", Disallow: ["/api/", "/mockup/", "/spotline/"] | Exact match | ✅ |
| sitemap | `${siteUrl}/sitemap.xml` | Exact match | ✅ |

### 2.7 sitemap.ts Check

| Item | Design | Implementation | Status |
|------|--------|----------------|--------|
| revalidate = 3600 | 1-hour ISR | Line 6 | ✅ |
| Static pages (3) | home, feed, about with priorities 1.0/0.8/0.3 | Lines 11-15 | ✅ |
| City pages | CITIES mapped, priority 0.7 | Lines 17-22 | ✅ |
| Theme pages | THEMES mapped, priority 0.7 | Lines 24-29 | ✅ |
| Spot dynamic pages | fetchAllSpotSlugs, priority 0.8 | Lines 36-41 | ✅ |
| Route dynamic pages | fetchAllRouteSlugs, priority 0.8 | Lines 43-48 | ✅ |
| Graceful degradation | API failure returns [] | Via api.ts catch | ✅ |

### 2.8 layout.tsx Check

| Item | Design | Implementation | Status |
|------|--------|----------------|--------|
| Import JsonLd | Added | Line 5 | ✅ |
| Import generateOrganizationJsonLd | Added | Line 6 | ✅ |
| `<JsonLd data={generateOrganizationJsonLd()} />` in body | Inside `<body>` before AuthInitializer | Line 74 | ✅ |

### 2.9 API Functions (api.ts)

| Function | Design | Implementation | Status | Notes |
|----------|--------|----------------|--------|-------|
| SlugEntry interface | `{ slug: string; updatedAt: string }` | Lines 1095-1098 | ✅ | |
| fetchAllSpotSlugs | `apiClient.get("/api/v2/spots/slugs")` → return [] on error | Lines 1101-1108 | ✅ | |
| fetchAllRouteSlugs | `apiClient.get("/api/v2/routes/slugs")` → return [] on error | Lines 1111-1118 | ✅ | |

**Minor deviations (non-breaking):**

| Item | Design | Implementation | Impact |
|------|--------|----------------|--------|
| API client used | `apiClient.get<SlugEntry[]>("/api/v2/spots/slugs")` | `apiV2.get<SlugEntry[]>("/spots/slugs", { timeout: 10000 })` | None - `apiV2` baseURL is `/api/v2`, equivalent path. Implementation adds timeout. |

### 2.10 Backend API Check

**SlugResponse DTO:**

| Item | Design | Implementation | Status | Notes |
|------|--------|----------------|--------|-------|
| Type | `record SlugResponse(String slug, LocalDateTime updatedAt)` | Class with `@Getter @Builder` | ⚠️ Minor | Functionally equivalent; class vs record is a style difference. JSON serialization is identical. |

**SpotController - GET /api/v2/spots/slugs:**

| Item | Design | Implementation | Status |
|------|--------|----------------|--------|
| Endpoint | `@GetMapping("/slugs")` | Line 80-83 | ✅ |
| Return type | `ResponseEntity<List<SlugResponse>>` | Matched | ✅ |
| Method name | `getAllSpotSlugs()` (design) vs `slugs()` (impl) | ⚠️ Minor | Controller method name differs but endpoint is correct |
| Service call | `spotService.getAllActiveSlugs()` (design) vs `spotService.getAllSlugs()` (impl) | ⚠️ Minor | Method name differs |

**SpotRepository:**

| Item | Design | Implementation | Status | Notes |
|------|--------|----------------|--------|-------|
| Query | JPQL `SELECT new SlugResponse(s.slug, s.updatedAt)` | `SELECT s FROM Spot s WHERE s.isActive = true ORDER BY s.updatedAt DESC` | ⚠️ Changed | Design uses DTO projection; implementation fetches full entity, maps in service. Functionally equivalent but less efficient. |

**SpotService.getAllSlugs():**

| Item | Design | Implementation | Status |
|------|--------|----------------|--------|
| Method exists | `getAllActiveSlugs()` | `getAllSlugs()` (lines 440-447) | ✅ |
| Logic | Query + map to SlugResponse | Fetches entities, maps with builder | ✅ |

**RouteController - GET /api/v2/routes/slugs:**

| Item | Design | Implementation | Status |
|------|--------|----------------|--------|
| Endpoint | `@GetMapping("/slugs")` | Lines 39-42 | ✅ |
| Return type | `ResponseEntity<List<SlugResponse>>` | Matched | ✅ |

**RouteRepository:**

| Item | Design | Implementation | Status | Notes |
|------|--------|----------------|--------|-------|
| Query | DTO projection (implied) | Full entity query, service-level mapping | ⚠️ Changed | Same pattern as SpotRepository |

**RouteService.getAllSlugs():**

| Item | Design | Implementation | Status |
|------|--------|----------------|--------|
| Method exists | Yes | Lines 120-127 | ✅ |
| Logic | Map to SlugResponse | Correct builder pattern | ✅ |

---

## 3. Differences Summary

### 3.1 Missing Features (Design O, Implementation X)

**None found.** All 12 design tasks are implemented.

### 3.2 Added Features (Design X, Implementation O)

| Item | Implementation Location | Description | Impact |
|------|------------------------|-------------|--------|
| Timeout on slug API calls | `src/lib/api.ts:1103,1113` | `timeout: 10000` added to slug fetch calls | Low - Beneficial addition |

### 3.3 Changed Features (Design != Implementation)

| Item | Design | Implementation | Impact |
|------|--------|----------------|--------|
| SlugResponse type | Java `record` | `@Getter @Builder` class | None - JSON output identical |
| Repository query strategy | DTO projection (`SELECT new SlugResponse(...)`) | Full entity fetch + service mapping | Low - Less efficient but functionally correct |
| Controller method name | `getAllSpotSlugs()` / implied | `slugs()` | None - Endpoint URL matches |
| Service method name | `getAllActiveSlugs()` | `getAllSlugs()` | None - Internal naming only |
| API client reference | `apiClient` | `apiV2` (pre-existing client with `/api/v2` base) | None - Same effective URL |

---

## 4. Match Rate Summary

```
+---------------------------------------------+
|  Overall Match Rate: 97%                    |
+---------------------------------------------+
|  Total Items Checked:   35                  |
|  ✅ Exact Match:         30 items (86%)     |
|  ⚠️ Minor Deviation:      5 items (14%)     |
|  ❌ Not Implemented:      0 items  (0%)     |
|  ⚠️ Added (not in design): 1 item           |
+---------------------------------------------+
```

### Score Breakdown

| Category | Score | Status |
|----------|:-----:|:------:|
| Frontend - New Files (5) | 100% | ✅ |
| Frontend - Modified Files (6) | 100% | ✅ |
| Frontend - JSON-LD Functions | 100% | ✅ |
| Frontend - Page Integration | 100% | ✅ |
| Backend - Endpoints | 100% | ✅ |
| Backend - DTO | 95% | ⚠️ (class vs record) |
| Backend - Repository | 85% | ⚠️ (query strategy) |
| Backend - Service | 95% | ⚠️ (method naming) |
| **Overall** | **97%** | ✅ |

---

## 5. Convention Compliance

### 5.1 Naming Convention

| Category | Convention | Status | Notes |
|----------|-----------|--------|-------|
| Components | PascalCase | ✅ | `JsonLd.tsx`, `Breadcrumb.tsx` |
| Functions | camelCase | ✅ | `generateSpotJsonLd`, `fetchAllSpotSlugs` |
| Constants | UPPER_SNAKE_CASE | ✅ | `SITE_URL`, `CATEGORY_SCHEMA_MAP` |
| Files (component) | PascalCase.tsx | ✅ | |
| Files (utility) | camelCase.ts | ✅ | `jsonld.ts` |
| Folders | kebab-case | ✅ | `seo/` |

### 5.2 Import Order

All files follow the correct order:
1. External libraries (`next`)
2. Internal absolute imports (`@/lib/seo/jsonld`, `@/components/seo/JsonLd`)
3. Type imports (`import type`)

### 5.3 Architecture Compliance

| Rule | Status | Notes |
|------|--------|-------|
| `lib/seo/jsonld.ts` is pure utility (no side effects) | ✅ | Only uses env var + pure transforms |
| Components use lib functions, not direct API calls | ✅ | `Breadcrumb` calls `generateBreadcrumbJsonLd` |
| Pages call API functions from `lib/api.ts` | ✅ | `sitemap.ts` imports from `@/lib/api` |
| Server components (no `"use client"`) | ✅ | All SEO components are server-rendered |

---

## 6. Recommended Actions

### 6.1 Optional Improvements (Low Priority)

| Priority | Item | File | Rationale |
|----------|------|------|-----------|
| Low | Consider DTO projection query | `SpotRepository.java:38-39` | Current full-entity fetch works but is slightly less efficient for large datasets |
| Low | Rename `getAllSlugs` to `getAllActiveSlugs` | `SpotService.java:440` | Align method name with design for clarity |
| Low | Convert `SlugResponse` to Java record | `SlugResponse.java` | Matches design intent; records are idiomatic for immutable DTOs |

### 6.2 Design Document Updates Needed

**None.** Implementation faithfully follows the design. Minor deviations are implementation details that do not warrant design updates.

---

## 7. Validation Checklist

| # | Validation Item | Method | Status |
|---|----------------|--------|--------|
| 1 | Spot JSON-LD in HTML source | Build + inspect `application/ld+json` | Pending |
| 2 | Route JSON-LD in HTML source | Build + inspect | Pending |
| 3 | BreadcrumbList in HTML source | Build + inspect | Pending |
| 4 | Organization in layout HTML | Build + inspect | Pending |
| 5 | robots.txt response | `curl localhost:3003/robots.txt` | Pending |
| 6 | sitemap.xml response | `curl localhost:3003/sitemap.xml` | Pending |
| 7 | Canonical URL `<link>` tags | HTML inspect | Pending |
| 8 | TypeScript type-check | `pnpm type-check` | Pending |
| 9 | Production build | `pnpm build` | Pending |
| 10 | Google Rich Results Test | Post-deployment | Pending |

---

## 8. Next Steps

- [x] Gap analysis complete
- [ ] Run `pnpm type-check` and `pnpm build` to verify compilation
- [ ] Manual verification of JSON-LD output in browser dev tools
- [ ] Proceed to Report phase: `/pdca report seo-structured-data`

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-31 | Initial analysis - 97% match rate | gap-detector |
