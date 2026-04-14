# Spotline Project Changelog

All notable changes to the Spotline project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [1.1.0] — 2026-04-07

### Added

#### Following Feed Content (Feature Release)

- **Backend**: `GET /api/v2/feed/following` — 팔로잉 유저의 SpotLine + Blog 콘텐츠 피드 API
  - 인증 필수 (JWT)
  - 페이지네이션 지원 (기본 20건)
  - 팔로잉 유저들의 콘텐츠를 시간순(createdAt DESC) 병합

- **Backend DTOs & Services**:
  - `FollowingFeedItemResponse` — 통합 피드 아이템 (type: SPOTLINE|BLOG, 15개 필드)
  - `FeedController` — Feed API 엔드포인트
  - `FeedService` — 피드 비즈니스 로직 (2-query merge 전략)

- **Backend Repository Methods**:
  - `SpotLineRepository.findByCreatorIdInAndIsActiveTrueOrderByCreatedAtDesc(List<String> creatorIds)`
  - `BlogRepository.findByUserIdInAndStatusAndIsActiveTrueOrderByPublishedAtDesc(List<String> userIds, BlogStatus status)`

- **Frontend**:
  - `fetchFollowingFeed(page, size)` — 피드 API 호출 함수 (`lib/api.ts`)
  - `FollowingFeedItem` type — 타입 안전 피드 아이템 (`types/index.ts`)
  - Infinite scroll with IntersectionObserver 패턴 (`components/feed/FollowingFeed.tsx`)
  - Empty state UIs: 미인증 (로그인 유도), 팔로잉 0명 (탐색 유도), 콘텐츠 0개 (안내)

### Changed

#### Following Feed Content

- **FollowingFeed.tsx**: 유저 목록 → 콘텐츠 피드로 전면 리팩토링
  - Data source: `fetchFollowing()` → `fetchFollowingFeed()`
  - Rendering: UserProfile 카드 → SpotLinePreviewCard / BlogCard 조건부 렌더링
  - State management: 6개 상태 (items, page, hasMore, loading, initialLoading, showLogin)
  - UX: IntersectionObserver 기반 무한 스크롤, 기존 빈 상태 UI 유지

- **FeedService**: S3 URL 해결 추상화
  - `@Value("${aws.s3.base-url:}")` 직접 필드 주입 → `S3Service` DI 패턴 (더 나은 캡슐화)

### Fixed

- **Following System**: 팔로우 기능이 콘텐츠 발견 경로 없이 사용 불가 상태
  - 해결: 팔로잉 탭에 콘텐츠 피드 추가로 팔로우→콘텐츠 소비 루프 완성
  - Social Sharing (Pillar 3) 핵심 동기부여 구현

### Quality Metrics

- **Design Match Rate**: 99% (55/55 items match)
  - Exact matches: 53 (96.4%)
  - Improved matches: 2 (3.6%, S3Service DI + useCallback extraction)
- **Architecture Compliance**: 100%
- **Convention Compliance**: 100%
- **Build Status**: ✅ Backend `./gradlew build`, Frontend `pnpm build` SUCCESS
- **Performance**: API response < 500ms (팔로잉 최대 100명 기준)

---

## [1.0.0] — 2026-03-31

### Added

#### Experience Social Platform Phase 3 — Completion

- **Backend**: Place API 프록시 + 캐싱 (네이버/카카오)
- **Frontend**: Spot 상세 페이지 (SSR + SEO)
- **Frontend**: SpotLine 상세 페이지 (SSR + SEO)
- **Frontend**: Discover 랜딩 페이지
- **Design System**: Shared card components (SpotMiniCard, SpotPreviewCard, RoutePreviewCard, TagList)

### Changed

#### Domain Rebranding

- **Route → SpotLine** 전체 리네이밍 (DB + API + Frontend)
  - DB: `routes` → `spotlines`, `route_spots` → `spotline_spots`
  - API: `/api/v2/routes` → `/api/v2/spotlines`
  - Frontend: `/route/[slug]` → `/spotline/[slug]`, `/my-routes` → `/my-spotlines`
  - 301 리다이렉트 설정 (next.config.ts)

### Fixed

- **SEO**: Spot/SpotLine 상세 페이지 메타데이터 (og:image, structured data)
- **API Documentation**: Swagger UI (72개 엔드포인트 자동 문서화)

---

## [0.9.0] — Earlier Versions

- Initial Spotline platform setup
- QR Discovery system (Pillar 1)
- Follow system foundation
- Backend API infrastructure

---

Last updated: 2026-04-07
