# Spotline Front-End Changelog

> **Scope**: front-spotLine project feature completions and releases
>
> **Format**: [ISO 8601 Date] - Version / Feature
> **Reference**: PDCA completion reports in `docs/04-report/`

---

## [2026-03-15] - Location-Based Discovery v2.0.0

**Feature**: Location-based Spot discovery landing page (2-block layout)

**PDCA Cycle**: #1 — Plan → Design → Do → Check v0.1 → Act-1 → Check v0.2 → Report

**Match Rate**: 92% (13/14 FRs fully matched, 1 partial — Google Maps pre-existing limitation)

### Added

- **Landing Page Redesign**: Replaced static hero with GPS-based dynamic discovery
- **Geolocation API**: `useGeolocation()` hook with permission handling, accuracy tracking
- **Discover Endpoint**: `GET /api/v2/spots/discover` (Backend) — unified response with currentSpot, nextSpot, nearbySpots, popularRoutes
- **UI Components**:
  - DiscoverPage — composition root for discovery flow
  - LocationHeader — current location display + permission indicator
  - SpotBlock — unified component for current/next Spot display (variant prop)
  - TransitionInfo — walking time/distance between Spots
  - NearbySpotScroll — horizontal carousel of 6+ nearby Spots
  - PopularRoutesList — vertical list of 3 popular Routes in same area
  - LocationPermissionBanner — fallback UI when location denied
  - DiscoverSkeleton — loading animation
- **State Management**: Zustand store (`useDiscoverStore`) with single `data: DiscoverResponse` field
- **API Integration**: `fetchDiscover()` function in `src/lib/api.ts`
- **Map Integration**: External map buttons (Kakao Map + Naver Map)
- **Fallback Strategy**: Popular Spots-based fallback when location permission denied
- **Responsive Design**: Mobile 375px+, tablet 768px+, desktop support

### Changed

- `src/app/page.tsx`: Landing page now renders DiscoverPage (was static hero)
- `src/types/index.ts`: Added DiscoverResponse, DiscoverCurrentSpot, DiscoverNextSpot, RoutePreview types
- `src/lib/api.ts`: Added fetchDiscover() function

### Fixed

- **Check v0.1 → Act-1 Fixes**:
  - Missing `popularRoutes` field in Discover response
  - Missing area filter in nextSpot recommendation algorithm
  - Walking speed incorrect (80m/min → 67m/min)
  - Map integration incomplete (Kakao-only → Kakao + Naver via ExternalMapButtons reuse)

### Metrics

- **Files Created**: 11 (8 components, 1 hook, 1 store, 1 modified page)
- **Files Modified**: 2 (types, api, page)
- **TypeScript Check**: PASS (0 errors)
- **ESLint**: 0 new violations
- **Build**: PASS
- **FCP**: ~1.2s (target <1.5s)
- **API Response**: ~300ms (target <500ms)

### Known Limitations

- Google Maps option not included (ExternalMapButtons pre-existing limitation; low impact)
- `radius` query parameter optional (auto-expansion 1km→3km→5km implemented)
- E2E tests not included (noted for future TDD-first approach)

**Completion Report**: [location-based-discovery.report.md](location-based-discovery.report.md)

---

## Earlier Releases

(To be populated as features are completed)

---

## Notes for Next Cycles

### Phase 3 (Spot Detail Page)
- Build on Discovery landing page traffic
- SSR implementation for SEO
- PlaceInfo display + related Routes sidebar
- Expected start: 2026-03-16

### Phase 4 (Feed + Exploration)
- Builds on Phase 3 Spot pages
- Route detail page with saved sequences
- Expected start: 2026-03-20

### Phase 5 (QR Integration)
- Integrate QR `/spotline/[qrId]` with new discovery system
- Unified recommendation logic
- Expected start: 2026-03-24

---

**Last Updated**: 2026-03-15
**Author**: Claude Code (report-generator)
