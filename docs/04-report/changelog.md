# Spotline Front-End Changelog

> **Scope**: front-spotLine project feature completions and releases
>
> **Format**: [ISO 8601 Date] - Version / Feature
> **Reference**: PDCA completion reports in `docs/04-report/`

---

## [2026-04-07] - Blog Public Feed v1.0.0

**Feature**: Public blog discovery pathways — feed section, dedicated /blogs page, profile tab

**PDCA Cycle**: #5 — Plan (0.5d) → Design (0.5d) → Do (0.5d) → Check v1.0.0 → Report

**Match Rate**: 100%

**Status**: PRODUCTION-READY — Completes content discovery loop

### Added

- **FeedBlogSection** component: Blog cards section in main feed (2x2 grid, "더보기" link, 0-guard)
- **/blogs page**: Server component with SSR initial data, ISR revalidation (3600s), SEO metadata
- **BlogsPageClient** component: Client-side infinite scroll, area filtering via FeedAreaTabs, pagination state
- **Profile "블로그" tab**: Tab entry in ProfileTabs (meOnly: true, routes to /my-blogs)
- **fetchBlogs API integration**: Previously dead code, now actively called in FeedPage + BlogsPageClient

### Changed

- `src/components/feed/FeedPage.tsx` — Added blogs state + useEffect(area) + FeedBlogSection render
- `src/components/profile/ProfileTabs.tsx` — Added "블로그" tab with BookOpen icon, router.push("/my-blogs")

### Metrics

- **Files Created**: 3 (FeedBlogSection.tsx, blogs/page.tsx, BlogsPageClient.tsx)
- **Files Modified**: 2 (FeedPage.tsx, ProfileTabs.tsx)
- **Match Rate**: 100% (59/59 items)
- **FRs**: 6/6 (100%)
- **Lines Added**: ~160
- **TypeScript**: 0 errors, Build: PASS
- **Iterations**: 0 (first-pass 100%)

### Design Highlights

- FeedBlogSection mirrors FeedSpotLineSection pattern (exact structure reuse)
- /blogs page uses SSR + client infinite scroll (FeedPage pattern)
- ISR caching (revalidate: 3600) ensures build stability
- ProfileTabs blog tab navigates without data loading (existing /my-blogs page used)
- Zero backend changes (reuses existing GET /api/v2/blogs endpoint)

**Completion Report**: [blog-public-feed.report.md](blog-public-feed.report.md)

---

## [2026-04-07] - Profile Edit Fix v1.0.0

**Feature**: Critical bug fixes for profile system + profile editing UI

**PDCA Cycle**: #4 — Plan (0.5d) → Design (0.5d) → Do (same day) → Check v1.0.0 → Report

**Match Rate**: 100%

**Status**: PRODUCTION-READY — Unblocks social features

### Added

- **ProfileEditSheet** component: Bottom sheet for profile editing (nickname, bio, Instagram, avatar)
- **Avatar presigned URL upload**: Direct S3 upload with presigned URL (no server relay)
- **API Functions** (3): `updateMyProfile()`, `requestAvatarUploadUrl()`, `deleteMyAvatar()`
- **ProfileHeader edit button**: "프로필 편집" button visible when `isMe=true`

### Fixed

- **Critical Bug**: `profile/me/page.tsx` — `user.instagramId` → `user.id` (blocked profile access for 90% of users without Instagram)
- **Bug**: `ProfileClient.tsx` — `user?.instagramId === profile.id` → `user?.id === profile.id` (isMe comparison always false)
- **Bug**: `FollowListSheet.tsx` — `currentUser?.instagramId === u.id` → `currentUser?.id === u.id` (self-detection broken)

### Metrics

- **Files Modified**: 6
- **Files Created**: 1 (ProfileEditSheet)
- **Lines Changed**: ~220
- **FRs**: 10/10 (100%)
- **Match Rate**: 100%
- **Iterations**: 0 (first-pass 100%)
- **TypeScript**: 0 errors, ESLint: 0 violations

**Completion Report**: [profile-edit-fix.report.md](profile-edit-fix.report.md)

---

## [2026-04-07] - Social Features v1.0.0

**Feature**: Card-level social interactions, Following feed, Spot sharing, Profile data

**PDCA Cycle**: #3 — Plan (1d) → Design (1d) → Do (1d) → Check v2 (1d) → Report

**Match Rate**: 96%

### Added

- **SocialActionButtons** component: Reusable Heart/Bookmark toggles for cards (sizes: sm/md, auth guard, optimistic updates)
- **FollowingFeed** component: Tab showing followed user crew list (3 states: unauthenticated, 0 following, crew cards)
- **SpotShareSheet** component: Bottom sheet for Spot sharing (Kakao talk, link copy, native Web Share API)
- **FeedPage feed tabs**: "all" vs "following" pill-style tabs above FeedAreaTabs
- **ProfileTabs "my-spots" tab**: User-created Spots via fetchMySpots API
- **Enhanced ProfileTabs**: Integrated fetchMySpots, fetchUserLikedSpots, fetchUserSavedSpotLines data
- **useFeedStore.feedTab**: State management for current feed tab
- **useSocialStore.batchInitSocialStatus**: Initialize social counts on card render

### Changed

- `SpotPreviewCard` — Integrated SocialActionButtons (replaced standalone Heart)
- `SpotLinePreviewCard` — Integrated SocialActionButtons
- `SpotBottomBar` — SpotShareSheet for Spot-level sharing
- `FeedPage` — Conditional FollowingFeed vs traditional feed rendering
- `api.ts` — Added fetchMySpots(page, size) function

### Fixed

- Social state sync between cards and detail pages via useSocialStore
- Event propagation in nested card buttons (stopPropagation + preventDefault)

### Metrics

- **Files Created**: 3 (SocialActionButtons, FollowingFeed, SpotShareSheet)
- **Files Modified**: 6 (cards, page, stores, API)
- **Match Rate**: 96% (21.5/22 items)
- **FRs**: 11/11 (100%)
- **TypeScript**: 0 errors, ESLint: 0 violations

**Completion Report**: [social-features.report.md](social-features.report.md)

---

## [2026-04-05] - User SpotLine Experience v1.0.0

**Feature**: User-driven SpotLine creation, fork, and social sharing

**PDCA Cycle**: #2 — Plan (1d) → Design (1d) → Do (2d) → Check v0.1 (93% match)

**Match Rate**: 93%

### Added

- **SpotLine Builder Page** (`/create-spotline`): Spot search + DnD composition + metadata form. Desktop 2-column, mobile tab switching. Max 10 Spots per course.
- **Builder Components** (10 total): SpotLineBuilder, SpotSearchPanel, SpotSearchCard, SelectedSpotList, SelectedSpotCard, SpotLineMetaForm, ForkBadge, ShareSheet, AuthGuard, FloatingCreateButton
- **Builder Store** (`useSpotLineBuilderStore`): Full CRUD state + 15 actions, max 10 spots, auto-area-inference, duplicate prevention
- **Fork Flow**: `/create-spotline?fork={slug}` with original Spots pre-loaded, attribution badge, variationsCount tracking
- **Edit Flow**: `/spotline/{slug}/edit` with full Spot CRUD, PUT API integration
- **Share Options**: Link copy, Kakao talk, Web Share API (graceful degradation)
- **Entry Points**: FloatingCreateButton, Spot detail CTA, SpotLine fork/share buttons
- **Utilities**: `lib/geo.ts` (Haversine, walking time), `lib/share.ts` (clipboard, native share, Kakao)
- **API Functions** (4): createSpotLine, updateSpotLine, deleteSpotLine, searchSpots
- **Types** (5): SpotLineBuilderSpot, CreateSpotLineRequest, UpdateSpotLineRequest, SpotSearchParams, and embedded state types

### Changed

- `SpotLineBottomBar` — [📤 공유] + [🔀 내 버전] buttons
- `SpotBottomBar` — "이 Spot으로 코스 만들기" button
- `layout.tsx` — FloatingCreateButton added globally
- Spot search category auto-uppercase for backend enum

### Fixed

- DnD smooth on touch (PointerSensor distance:8)
- Area inference from Spot locations (most frequent)
- Walking time calculation (4km/h baseline)

### Metrics

- **Files Created**: 15 (10 components, 1 store, 2 utilities, 2 pages)
- **Files Modified**: 5
- **Match Rate**: 93% (77/82 items)
- **FCP**: ~1.6s (target <2s)
- **Search API**: ~350ms (target <500ms)
- **TypeScript**: 0 errors, ESLint: 0 new violations

### Known Limitations

- FeedPage CTA card deferred (Phase 4 enhancement)
- Toast notifications planned (currently alert)
- Kakao SDK fallback pending (minor)
- Area "기타" option missing (patch)

**Completion Report**: [user-spotline-experience.report.md](user-spotline-experience.report.md)

---

## [2026-04-07] - Location-Based Discovery v1.0.0 (Final)

**Feature**: Location-based Spot discovery landing page (2-block layout) — FINAL COMPLETION

**PDCA Cycle**: #1 — Plan v3.0.0 → Design v3.0.0 → Do (0 iterations) → Check v1.0.0 → Report v1.0.0

**Match Rate**: 99% (14/14 FRs, 13/13 components, 1 low-impact text rename deferred)

**Status**: PRODUCTION-READY — Approved for deployment

### Summary

Location-based discovery feature achieved 99% design-implementation match with zero implementation iterations required. Backend pre-completion (API, DTOs, types) enabled fast-tracked frontend development. All 14 FRs implemented across 13 files (~871 lines). Single outstanding gap: text terminology rename ("Route" → "SpotLine") in DiscoverPage:190 — deferred to v1.1 batch updates (not blocking release).

**Key Metrics**:
- FRs: 14/14 (100%)
- Components: 9 ✅ (DiscoverPage, SpotBlock, LocationHeader, LocationPermissionBanner, TransitionInfo, NearbySpotScroll, PopularSpotLinesList, DiscoverSkeleton)
- Hooks: 1 ✅ (useGeolocation, 83 lines, auto-trigger via Promise.resolve().then())
- Store: 1 ✅ (useDiscoverStore, 29 lines, Zustand)
- Integration: 2 ✅ (fetchDiscover in api.ts, Discover types in types/index.ts)
- Lines of code: 871 (avg ~70 per component)
- Performance: FCP ~1.2s, LCP ~2.0s, API ~300ms (all targets met)
- Code quality: 0 lint errors, TypeScript strict mode ✅, build succeeds ✅

### Completion Report
[location-based-discovery.report.md](location-based-discovery.report.md) (v1.0.0)

---

## [2026-03-15] - Location-Based Discovery v2.0.0

**Feature**: Location-based Spot discovery landing page (2-block layout) — ARCHIVED

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

**Last Updated**: 2026-04-07
**Author**: Claude Code (report-generator)
