# Experience Social Platform Design Document

> **Summary**: QR Discovery + Experience Recording + Social Sharing 3축 플랫폼의 기술 설계
>
> **Project**: front-spotLine (+ backend-spotLine, admin-spotLine 연동)
> **Date**: 2026-03-15
> **Status**: Draft
> **Planning Doc**: [experience-social-platform.plan.md](../01-plan/features/experience-social-platform.plan.md)

## Executive Summary

| Perspective | Description |
|-------------|-------------|
| **Problem** | QR 매장 발견은 단발성이며, 유저 경험을 구조화/공유/재현할 수 없다. Place API 데이터를 매번 직접 호출하면 비효율적이다. |
| **Solution** | Spot/Route 데이터 모델 + Place API 프록시 캐싱 + SSR 상세 페이지 + 피드 시스템으로 경험의 기록-발견-재현 사이클을 구축한다. |
| **Function UX Effect** | SSR Spot/Route 페이지에서 crewNote + Place API 정보를 병합 표시하고, 피드에서 Route를 발견하여 내 일정으로 변환한다. |
| **Core Value** | 콘텐츠+SEO로 Cold Start를 극복하고, QR 발견 → 경험 기록 → 소셜 확산의 순환 생태계를 만든다. |

---

## 1. Overview

### 1.1 Design Goals

1. **Spot/Route 데이터 모델**: 기존 Store/SpotlineStore 타입을 확장하여 Spot/Route 체계 구축
2. **Place API 프록시 + 캐싱**: Backend에서 네이버/카카오 Place API를 24h 캐싱하여 안정적 제공
3. **SSR 상세 페이지**: Spot/Route 페이지를 Server Component로 구현, SEO 최적화
4. **점진적 마이그레이션**: 기존 QR Discovery (`/spotline/[qrId]`) 유지하면서 새 시스템과 연결
5. **3개 레포 연동 인터페이스**: front ↔ backend ↔ admin API 계약 명확화

### 1.2 Design Principles

- **Backend 병합 원칙**: Front는 렌더링만, DB + Place API 병합은 Backend 책임
- **점진적 확장**: 기존 코드 유지하면서 새 기능을 병렬로 추가
- **SSR First**: SEO가 필요한 페이지는 Server Component 기본
- **최소 DB 원칙**: DB에는 Spot 메타 + 외부 ID만, 매장 상세는 Place API에서 조회
- **기존 컴포넌트 재사용**: OptimizedImage, ExternalMapButtons, Layout 등 최대 활용

### 1.3 Design Scope

이 Design 문서는 **Phase 1~4**를 다룬다:

| Phase | Scope | 레포 | Design 포함 |
|-------|-------|------|:-----------:|
| **Phase 1** | 데이터 모델 + Place API 프록시 | backend | Yes (타입 + API 스펙) |
| **Phase 2** | 크루 큐레이션 도구 | admin | Yes (API 계약만) |
| **Phase 3** | Spot/Route 상세 SSR 페이지 | front | Yes (상세 설계) |
| **Phase 4** | 피드 + 탐색 UI | front | Yes (상세 설계) |
| Phase 5~9 | QR 통합, Social, Replication 등 | 혼합 | 후속 Design |

---

## 2. Architecture

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client Layer                                 │
│                                                                     │
│  ┌─────────────────────┐        ┌────────────────────────┐         │
│  │   front-spotLine    │        │   admin-spotLine       │         │
│  │   (Next.js 16)      │        │   (크루 큐레이션)       │         │
│  │                     │        │                        │         │
│  │  /spot/[slug]  SSR  │        │  Place API 검색        │         │
│  │  /route/[slug] SSR  │        │  Spot 선별+crewNote    │         │
│  │  /feed         CSR  │        │  Route 구성            │         │
│  │  /spotline/[qr] CSR │        │  대량 등록             │         │
│  └─────────┬───────────┘        └──────────┬─────────────┘         │
│            │                               │                        │
└────────────┼───────────────────────────────┼────────────────────────┘
             │ HTTP (fetch)                  │ HTTP (axios)
             ▼                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    backend-spotLine (Express, :4000)                  │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐        │
│  │ Spot/Route   │  │ Place API    │  │ QR Discovery      │        │
│  │ CRUD API     │  │ Proxy+Cache  │  │ API (기존 유지)    │        │
│  └──────┬───────┘  └──────┬───────┘  └───────────────────┘        │
│         │                 │                                         │
│         ▼                 ▼                                         │
│  ┌──────────────┐  ┌──────────────┐                                │
│  │   MongoDB    │  │ Cache Layer  │                                │
│  │   (Spot,     │  │ (In-Memory   │                                │
│  │    Route,    │  │  → Redis)    │                                │
│  │    User)     │  │ TTL: 24h     │                                │
│  └──────────────┘  └──────┬───────┘                                │
│                           │                                         │
│                    ┌──────▼───────┐                                 │
│                    │ Naver/Kakao  │                                 │
│                    │ Place API    │                                 │
│                    └──────────────┘                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow — Spot 상세 페이지

```
1. User visits /spot/{slug}
   │
2. Next.js Server Component
   │  fetch(`${API_BASE}/api/spots/${slug}`)
   │
3. Backend: GET /api/spots/:slug
   │  ├── DB에서 Spot 조회 (slug → Spot document)
   │  ├── Place API 캐시 확인 (key: place:{provider}:{placeId})
   │  │   ├── HIT → 캐시된 PlaceInfo 반환
   │  │   └── MISS → Naver/Kakao API 호출 → 캐시 저장 (TTL 24h)
   │  ├── Spot이 포함된 Route 목록 조회
   │  └── 근처 Spot 조회 (같은 area, 반경 1km)
   │
4. Backend Response (병합된 데이터)
   │  { spot, placeInfo, routes, nearbySpots }
   │
5. Server Component → Client 렌더링
   │  SpotHero + SpotCrewNote + SpotPlaceInfo + SpotRoutes + SpotNearby
   │
6. HTML 응답 (SSR, SEO 크롤링 가능)
```

### 2.3 Data Flow — Route 상세 페이지

```
1. User visits /route/{slug}
   │
2. Next.js Server Component
   │  fetch(`${API_BASE}/api/routes/${slug}`)
   │
3. Backend: GET /api/routes/:slug
   │  ├── DB에서 Route + RouteSpots 조회 (populate spots)
   │  ├── 각 Spot의 PlaceInfo 캐시 조회 (배치)
   │  ├── 이동 경로 정보 계산 (거리, 도보 시간)
   │  └── 변형 Route 목록 조회
   │
4. Backend Response
   │  { route, spots: [{spot, placeInfo}], variations }
   │
5. Server Component → Client 렌더링
   │  RouteHeader + RouteTimeline + RouteMapPreview + RouteVariations
```

### 2.4 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| front-spotLine (Spot page) | Backend GET /api/spots/:slug | Spot + PlaceInfo 병합 데이터 |
| front-spotLine (Route page) | Backend GET /api/routes/:slug | Route + Spots 병합 데이터 |
| front-spotLine (Feed) | Backend GET /api/feed | 피드 콘텐츠 (Route 우선) |
| Backend (Place Proxy) | Naver Place API, Kakao Place API | 매장 상세 정보 |
| Backend (Spot CRUD) | MongoDB | Spot/Route 영속화 |
| admin-spotLine | Backend POST /api/spots, /api/spots/bulk | Spot 등록/관리 |
| admin-spotLine | Backend GET /api/places/search | Place API 검색 (큐레이션) |

---

## 3. Data Model

### 3.1 Core Type Definitions (공유)

```typescript
// ============================================================
// Spot — 경험의 단위
// ============================================================

type SpotSource = "crew" | "user" | "qr";

type SpotCategory =
  | "cafe" | "restaurant" | "bar"
  | "nature" | "culture" | "exhibition"
  | "walk" | "activity" | "shopping" | "other";

interface SpotLocation {
  address: string;
  lat: number;
  lng: number;
  area: string;                    // "성수", "을지로", "연남" 등
}

interface ExternalPlace {
  naverPlaceId?: string;
  kakaoPlaceId?: string;
}

interface SpotStats {
  likeCount: number;
  saveCount: number;
  visitCount: number;
  routeCount: number;              // 이 Spot이 포함된 Route 수
}

interface QRInfo {
  qrId: string;
  isActive: boolean;
  scanCount: number;
}

interface UserRef {
  id: string;
  nickname: string;
  avatar: string;
}

// DB에 저장되는 Spot 문서
interface Spot {
  id: string;
  slug: string;
  title: string;
  description: string;
  location: SpotLocation;
  category: SpotCategory;
  tags: string[];
  source: SpotSource;
  crewNote?: string;               // 크루 한줄 추천 (큐레이션 핵심)
  externalPlace: ExternalPlace;    // 네이버/카카오 Place ID
  qrCode?: QRInfo;                 // QR 파트너 매장인 경우
  media?: SpotMedia[];             // 사진 (크루/유저 업로드)
  stats: SpotStats;
  creator: UserRef;
  createdAt: string;
  updatedAt: string;
}

interface SpotMedia {
  url: string;
  alt?: string;
  type: "image" | "video";
}

// ============================================================
// Route — 경험의 묶음
// ============================================================

type RouteTheme =
  | "date" | "travel" | "walk" | "hangout"
  | "food-tour" | "cafe-tour" | "culture";

interface RouteSpot {
  spotId: string;
  order: number;
  suggestedTime?: string;          // "17:30"
  stayDuration?: number;           // 분
  transitionToNext?: {
    walkingTime: number;           // 분
    distance: number;              // m
    note?: string;                 // "골목길로 5분"
  };
}

interface RouteStats {
  likeCount: number;
  saveCount: number;
  replicateCount: number;          // 일정 변환 수
  completionCount: number;         // 완주 수
}

interface RouteRef {
  id: string;
  slug: string;
  title: string;
}

// DB에 저장되는 Route 문서
interface Route {
  id: string;
  slug: string;
  title: string;
  description: string;
  spots: RouteSpot[];
  totalDuration?: number;          // 분
  totalDistance?: number;           // m
  area: string;                    // 대표 지역
  theme: RouteTheme;
  coverImage?: string;
  creator: UserRef;
  stats: RouteStats;
  parentRoute?: RouteRef;          // 원본 (변형인 경우)
  variations?: RouteRef[];         // 파생 변형들
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// PlaceInfo — Place API 응답 (캐싱 대상)
// ============================================================

interface PlaceInfo {
  provider: "naver" | "kakao";
  placeId: string;
  name: string;
  category?: string;
  phone?: string;
  address?: string;
  roadAddress?: string;
  businessHours?: string;          // "매일 10:00~22:00" (문자열)
  homepage?: string;
  imageUrls?: string[];
  rating?: number;
  reviewCount?: number;
  naverMapUrl?: string;
  kakaoMapUrl?: string;
  updatedAt: string;               // 캐시 갱신 시각
}

// ============================================================
// User — 경험의 주체 (Phase 6 확장)
// ============================================================

interface User {
  id: string;
  nickname: string;
  avatar: string;
  bio?: string;
  instagramId?: string;
  stats: {
    spotCount: number;
    routeCount: number;
    followerCount: number;
    followingCount: number;
  };
  createdAt: string;
}
```

### 3.2 Entity Relationships

```
[User] 1 ──── N [Spot]       (creator)
[User] 1 ──── N [Route]      (creator)
[Route] 1 ──── N [RouteSpot] (ordered spots)
[RouteSpot] N ──── 1 [Spot]  (spot reference)
[Spot] 1 ──── 1 [PlaceInfo]  (via externalPlace, cached)
[Route] 1 ──── N [Route]     (variations/parentRoute)
[User] N ──── N [User]       (follow, Phase 6)
[User] N ──── N [Spot]       (like/save, Phase 6)
[User] N ──── N [Route]      (like/save/replicate, Phase 6)
```

### 3.3 MongoDB Collection Design

**spots** collection:
```json
{
  "_id": "ObjectId",
  "slug": "han-river-sunset",
  "title": "한강 노을",
  "description": "마포대교 아래에서 본 노을",
  "location": { "address": "서울 마포구...", "lat": 37.5, "lng": 126.9, "area": "마포" },
  "category": "nature",
  "tags": ["노을", "한강", "산책"],
  "source": "crew",
  "crewNote": "해질녘 마포대교 아래가 서울 최고의 노을 포인트",
  "externalPlace": { "naverPlaceId": "1234567", "kakaoPlaceId": "7654321" },
  "stats": { "likeCount": 0, "saveCount": 0, "visitCount": 0, "routeCount": 0 },
  "creator": { "id": "crew-001", "nickname": "Spotline Crew", "avatar": "..." },
  "createdAt": "2026-03-15T00:00:00Z",
  "updatedAt": "2026-03-15T00:00:00Z"
}
```
- Index: `{ slug: 1 }` (unique), `{ "location.area": 1, category: 1 }`, `{ source: 1 }`

**routes** collection:
```json
{
  "_id": "ObjectId",
  "slug": "seongsu-date-course",
  "title": "성수 주말 데이트 코스",
  "description": "성수동에서 즐기는 반나절 데이트",
  "spots": [
    { "spotId": "spot-001", "order": 1, "suggestedTime": "15:00", "stayDuration": 60, "transitionToNext": { "walkingTime": 8, "distance": 600 } },
    { "spotId": "spot-002", "order": 2, "suggestedTime": "16:10", "stayDuration": 45 }
  ],
  "area": "성수",
  "theme": "date",
  "creator": { "id": "crew-001", "nickname": "Spotline Crew", "avatar": "..." },
  "stats": { "likeCount": 0, "saveCount": 0, "replicateCount": 0, "completionCount": 0 },
  "createdAt": "2026-03-15T00:00:00Z"
}
```
- Index: `{ slug: 1 }` (unique), `{ area: 1, theme: 1 }`, `{ "creator.id": 1 }`

### 3.4 기존 타입 → 신규 타입 마이그레이션 맵

| 기존 타입 | 신규 타입 | 전환 방식 |
|-----------|-----------|----------|
| `Store` | `Spot` (source: "qr") | storeInfo 필드로 매장 상세 유지 |
| `SpotlineStore` | `Spot` (source: "qr" \| "crew") | location, qrCode 매핑 |
| `NextSpot` | `RouteSpot` 내 Spot 참조 | walkingTime, distance → transitionToNext |
| `MockupSpot` | `Spot` | slug, source, tags 직접 매핑 |
| `SpotLineSummary` | `Route` (creator: crew) | 크루 라인 → Route로 표현 |
| `UserProfile` | `User` | stats 확장 (spotCount, routeCount 추가) |
| `SpotLineAffiliation` | `Spot.source + qrCode` | 제휴 정보를 Spot 필드로 분산 |

**마이그레이션 원칙**: 기존 타입은 삭제하지 않고 유지. 새 타입을 별도로 추가하고, 기존 QR 시스템(`/spotline/[qrId]`)은 기존 타입 그대로 사용. Phase 5에서 QR 시스템과 새 Spot 시스템을 통합할 때 점진적으로 교체.

---

## 4. API Specification

### 4.1 Endpoint Overview

| Method | Path | Description | Auth | Phase |
|--------|------|-------------|------|-------|
| **GET** | `/api/spots/:slug` | Spot 상세 (DB + PlaceInfo 병합) | - | 1 |
| **GET** | `/api/spots/nearby` | 근처 Spot 검색 | - | 1 |
| **GET** | `/api/spots?area=&category=` | Spot 목록 (필터) | - | 1 |
| **POST** | `/api/spots` | Spot 생성 | Crew/Admin | 1 |
| **POST** | `/api/spots/bulk` | Spot 대량 등록 | Admin | 1 |
| **GET** | `/api/routes/:slug` | Route 상세 (Spots populate) | - | 1 |
| **GET** | `/api/routes?area=&theme=` | Route 목록 (필터) | - | 1 |
| **GET** | `/api/routes/popular` | 인기 Route | - | 1 |
| **POST** | `/api/routes` | Route 생성 | Crew/Admin | 1 |
| **GET** | `/api/places/search?query=&provider=` | Place API 검색 | Admin | 1 |
| **GET** | `/api/places/:provider/:placeId` | Place 상세 (캐싱) | Internal | 1 |
| **GET** | `/api/feed?area=&theme=&page=` | 피드 (Route 우선) | - | 4 |
| **GET** | `/api/city/:name` | 도시별 경험 | - | 4 |
| **GET** | `/api/theme/:name` | 테마별 경험 | - | 4 |

### 4.2 핵심 API 상세

#### `GET /api/spots/:slug`

Front의 SSR 페이지에서 호출하는 핵심 엔드포인트.

**Response (200):**
```typescript
interface SpotDetailResponse {
  spot: Spot;
  placeInfo: PlaceInfo | null;     // Place API 실패 시 null
  routes: RoutePreview[];          // 이 Spot이 포함된 Route (최대 5)
  nearbySpots: SpotPreview[];      // 근처 Spot (최대 6)
}

interface RoutePreview {
  id: string;
  slug: string;
  title: string;
  theme: RouteTheme;
  spotCount: number;
  area: string;
  coverImage?: string;
  creator: UserRef;
  stats: Pick<RouteStats, "likeCount" | "replicateCount">;
}

interface SpotPreview {
  id: string;
  slug: string;
  title: string;
  category: SpotCategory;
  area: string;
  crewNote?: string;
  thumbnailUrl?: string;           // PlaceInfo에서 첫 번째 이미지
  source: SpotSource;
}
```

**Error Responses:**
- `404 Not Found`: Spot slug 없음
- `500 Internal Server Error`: DB 또는 Place API 오류 (placeInfo: null로 graceful)

#### `GET /api/routes/:slug`

**Response (200):**
```typescript
interface RouteDetailResponse {
  route: Route;
  spots: RouteSpotDetail[];        // Spot + PlaceInfo 병합
  variations: RoutePreview[];      // 변형 Route (최대 5)
}

interface RouteSpotDetail {
  spot: Spot;
  placeInfo: PlaceInfo | null;
  order: number;
  suggestedTime?: string;
  stayDuration?: number;
  transitionToNext?: {
    walkingTime: number;
    distance: number;
    note?: string;
  };
}
```

#### `GET /api/feed`

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| area | string? | 지역 필터 ("성수", "을지로" 등) |
| theme | RouteTheme? | 테마 필터 |
| page | number | 페이지 (기본 1) |
| limit | number | 페이지 크기 (기본 20) |

**Response (200):**
```typescript
interface FeedResponse {
  items: FeedItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}

type FeedItem =
  | { type: "route"; data: RoutePreview }
  | { type: "spot"; data: SpotPreview };
```

#### `POST /api/spots` (Admin/Crew)

**Request:**
```json
{
  "title": "성수 카페 XYZ",
  "description": "공장 건물을 개조한 카페",
  "location": { "address": "서울 성동구...", "lat": 37.544, "lng": 127.056, "area": "성수" },
  "category": "cafe",
  "tags": ["성수", "카페", "인테리어"],
  "source": "crew",
  "crewNote": "2층 루프탑에서 보는 성수동 전경이 최고",
  "externalPlace": { "naverPlaceId": "1234567", "kakaoPlaceId": "7654321" }
}
```

#### `POST /api/spots/bulk` (Admin, 대량 등록)

**Request:**
```json
{
  "spots": [
    { "title": "...", "location": {...}, "category": "...", "externalPlace": {...}, "crewNote": "..." },
    { "title": "...", "location": {...}, "category": "...", "externalPlace": {...}, "crewNote": "..." }
  ]
}
```

**Response (201):**
```json
{
  "created": 48,
  "failed": 2,
  "errors": [{ "index": 12, "error": "duplicate slug" }]
}
```

#### `GET /api/places/search` (Admin 큐레이션 도구용)

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| query | string | 검색어 ("성수동 카페") |
| provider | "naver" \| "kakao" | API 제공자 |
| page | number? | 페이지 |

**Response (200):**
```typescript
interface PlaceSearchResponse {
  places: PlaceSearchResult[];
  total: number;
  page: number;
}

interface PlaceSearchResult {
  placeId: string;
  provider: "naver" | "kakao";
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  imageUrl?: string;
  // 이미 Spot으로 등록되었는지 여부
  alreadyRegistered: boolean;
  existingSpotSlug?: string;
}
```

### 4.3 Place API 캐싱 설계

```
Cache Key Format: place:{provider}:{placeId}
Cache Value: PlaceInfo JSON
TTL: 24 hours (86400s)

Phase 1: Node.js In-Memory (Map or node-cache)
  - 장점: 설정 없음, 즉시 사용
  - 단점: 서버 재시작 시 소멸, 메모리 한계
  - 적합: 초기 300 Spot × 2 provider = 600 entries (충분)

Phase 2+: Redis
  - 장점: 영속, 공유, 분산 캐시
  - 전환 시점: 트래픽 증가 또는 서버 다중화 시

API Rate Limits:
  - 네이버 Place: 25,000/일 (초기 300 Spot 충분)
  - 카카오 Place: 100,000/일 (여유)

Fallback:
  - Place API 실패 → placeInfo: null
  - Front: placeInfo null 시 해당 섹션 숨김 (graceful degradation)
```

---

## 5. UI/UX Design

### 5.1 Spot 상세 페이지 (`/spot/[slug]`)

```
┌─────────────────────────────────┐
│  SpotHero                       │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │     대표 이미지           │  │
│  │     (Place API 사진)      │  │
│  │                           │  │
│  │  ┌─────────────────────┐  │  │
│  │  │ 카테고리 | 지역      │  │  │
│  │  │ Spot 제목           │  │  │
│  │  │ 태그 #성수 #카페    │  │  │
│  │  └─────────────────────┘  │  │
│  └───────────────────────────┘  │
│                                 │
│  SpotCrewNote  ← 차별화 핵심    │
│  ┌───────────────────────────┐  │
│  │ Spotline Crew 추천         │  │
│  │ "2층 루프탑에서 보는       │  │
│  │  성수동 전경이 최고"       │  │
│  └───────────────────────────┘  │
│                                 │
│  SpotPlaceInfo                  │
│  ┌───────────────────────────┐  │
│  │ 매장명 (Place API)        │  │
│  │ 주소                      │  │
│  │ 영업시간                  │  │
│  │ 전화번호                  │  │
│  │ 평점 ⭐ 4.3 (리뷰 128)  │  │
│  │ [네이버지도] [카카오맵]   │  │
│  └───────────────────────────┘  │
│                                 │
│  SpotImageGallery               │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐          │
│  │  │ │  │ │  │ │  │           │
│  └──┘ └──┘ └──┘ └──┘          │
│                                 │
│  SpotRoutes                     │
│  ┌───────────────────────────┐  │
│  │ 이 Spot이 포함된 Route    │  │
│  │ ┌─────────────────────┐   │  │
│  │ │ 성수 데이트 코스     │   │  │
│  │ │ 3곳 · date · ♥ 24   │   │  │
│  │ └─────────────────────┘   │  │
│  └───────────────────────────┘  │
│                                 │
│  SpotNearby                     │
│  ┌───────────────────────────┐  │
│  │ 근처 Spot                 │  │
│  │ ┌──┐ ┌──┐ ┌──┐           │  │
│  │ │  │ │  │ │  │           │  │
│  │ └──┘ └──┘ └──┘           │  │
│  └───────────────────────────┘  │
│                                 │
│  SpotBottomBar (고정)           │
│  ┌───────────────────────────┐  │
│  │  ♥ 좋아요  ★ 저장  📎 공유│  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### 5.2 Route 상세 페이지 (`/route/[slug]`)

```
┌─────────────────────────────────┐
│  RouteHeader                    │
│  ┌───────────────────────────┐  │
│  │ 성수 주말 데이트 코스      │  │
│  │ #date · 성수 · 3시간      │  │
│  │ 3곳 · 4.2km              │  │
│  │ by Spotline Crew          │  │
│  └───────────────────────────┘  │
│                                 │
│  RouteTimeline  ← 핵심 UI      │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │  ① 15:00                 │  │
│  │  ┌─────────────────────┐  │  │
│  │  │ 성수 카페 XYZ       │  │  │
│  │  │ cafe · 60분         │  │  │
│  │  │ 크루: "루프탑 최고"  │  │  │
│  │  └─────────────────────┘  │  │
│  │  │                        │  │
│  │  │ 도보 8분 (600m)       │  │
│  │  │                        │  │
│  │  ② 16:10                 │  │
│  │  ┌─────────────────────┐  │  │
│  │  │ 성수 레트로 골목     │  │  │
│  │  │ walk · 45분         │  │  │
│  │  └─────────────────────┘  │  │
│  │  │                        │  │
│  │  │ 도보 5분 (350m)       │  │
│  │  │                        │  │
│  │  ③ 17:00                 │  │
│  │  ┌─────────────────────┐  │  │
│  │  │ 성수 선셋 스팟       │  │  │
│  │  │ nature · 30분       │  │  │
│  │  └─────────────────────┘  │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  RouteMapPreview                │
│  ┌───────────────────────────┐  │
│  │  [지도에 경로 표시]        │  │
│  │  ①──②──③                │  │
│  └───────────────────────────┘  │
│                                 │
│  RouteVariations                │
│  ┌───────────────────────────┐  │
│  │ 이 Route의 변형 (2)       │  │
│  │ ┌───────────────────────┐ │  │
│  │ │ 성수 카페 + 디저트 ver│ │  │
│  │ └───────────────────────┘ │  │
│  └───────────────────────────┘  │
│                                 │
│  RouteBottomBar (고정)          │
│  ┌───────────────────────────┐  │
│  │  [내 일정에 추가]  ♥  📎  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### 5.3 피드 페이지 (`/feed`)

```
┌─────────────────────────────────┐
│  FeedHeader                     │
│  ┌───────────────────────────┐  │
│  │ 지역: [전체|성수|을지로|..] │ │
│  │ 테마: [전체|데이트|산책|..] │ │
│  └───────────────────────────┘  │
│                                 │
│  FeedList                       │
│  ┌───────────────────────────┐  │
│  │ RoutePreviewCard           │  │
│  │ ┌───────────────────────┐  │  │
│  │ │ [커버 이미지]          │  │  │
│  │ │ 성수 주말 데이트 코스  │  │  │
│  │ │ #date · 3곳 · 4.2km  │  │  │
│  │ │ by Crew · ♥ 24       │  │  │
│  │ └───────────────────────┘  │  │
│  │                            │  │
│  │ SpotPreviewCard            │  │
│  │ ┌───────────────────────┐  │  │
│  │ │ [이미지] 한강 노을     │  │  │
│  │ │ nature · 마포         │  │  │
│  │ └───────────────────────┘  │  │
│  │                            │  │
│  │ RoutePreviewCard           │  │
│  │ ┌───────────────────────┐  │  │
│  │ │ ...                   │  │  │
│  │ └───────────────────────┘  │  │
│  └───────────────────────────┘  │
│                                 │
│  [더 보기] (infinite scroll)    │
└─────────────────────────────────┘
```

### 5.4 Component List

| Component | Location | Layer | Responsibility |
|-----------|----------|-------|----------------|
| **Spot 페이지** |||
| `SpotDetailPage` | `src/app/spot/[slug]/page.tsx` | Presentation (Server) | SSR 데이터 페칭 + 컴포넌트 조합 |
| `SpotHero` | `src/components/spot/SpotHero.tsx` | Presentation | 히어로 이미지 + 기본 정보 오버레이 |
| `SpotCrewNote` | `src/components/spot/SpotCrewNote.tsx` | Presentation | 크루 한줄 추천 (차별화) |
| `SpotPlaceInfo` | `src/components/spot/SpotPlaceInfo.tsx` | Presentation | Place API 매장 정보 표시 |
| `SpotImageGallery` | `src/components/spot/SpotImageGallery.tsx` | Presentation | 사진 갤러리 (가로 스크롤) |
| `SpotRoutes` | `src/components/spot/SpotRoutes.tsx` | Presentation | 포함된 Route 목록 |
| `SpotNearby` | `src/components/spot/SpotNearby.tsx` | Presentation | 근처 Spot 목록 |
| `SpotBottomBar` | `src/components/spot/SpotBottomBar.tsx` | Presentation (Client) | 하단 고정 액션 바 |
| **Route 페이지** |||
| `RouteDetailPage` | `src/app/route/[slug]/page.tsx` | Presentation (Server) | SSR 데이터 페칭 + 컴포넌트 조합 |
| `RouteHeader` | `src/components/route/RouteHeader.tsx` | Presentation | 제목, 테마, 요약 통계 |
| `RouteTimeline` | `src/components/route/RouteTimeline.tsx` | Presentation | 경로 타임라인 (핵심 UI) |
| `RouteTimelineItem` | `src/components/route/RouteTimelineItem.tsx` | Presentation | 각 Spot 카드 + 이동 정보 |
| `RouteMapPreview` | `src/components/route/RouteMapPreview.tsx` | Presentation (Client) | 경로 지도 시각화 |
| `RouteVariations` | `src/components/route/RouteVariations.tsx` | Presentation | 변형 Route 목록 |
| `RouteBottomBar` | `src/components/route/RouteBottomBar.tsx` | Presentation (Client) | 내 일정에 추가 + 액션 |
| **공유 카드** |||
| `SpotMiniCard` | `src/components/shared/SpotMiniCard.tsx` | Presentation | Spot 최소 카드 (리스트용) |
| `SpotPreviewCard` | `src/components/shared/SpotPreviewCard.tsx` | Presentation | Spot 프리뷰 카드 (피드/근처) |
| `RoutePreviewCard` | `src/components/shared/RoutePreviewCard.tsx` | Presentation | Route 프리뷰 카드 (피드) |
| `TagList` | `src/components/shared/TagList.tsx` | Presentation | 태그 목록 |
| **위치 기반 발견 (랜딩)** |||
| `DiscoverPage` | `src/app/page.tsx` (랜딩 교체) | Presentation (Client) | Geolocation + Discover API + 2-블록 렌더링 |
| `LocationHeader` | `src/components/discover/LocationHeader.tsx` | Presentation (Client) | 현재 위치 area 표시, 재탐색 |
| `CurrentSpotBlock` | `src/components/discover/CurrentSpotBlock.tsx` | Presentation (Client) | Block 1: 현재 Spot 카드 |
| `NextSpotBlock` | `src/components/discover/NextSpotBlock.tsx` | Presentation (Client) | Block 2: 다음 Spot 카드 |
| `TransitionInfo` | `src/components/discover/TransitionInfo.tsx` | Presentation (Client) | 두 블록 사이 이동 정보 |
| `DiscoverActions` | `src/components/discover/DiscoverActions.tsx` | Presentation (Client) | 다른 추천/Route 시작 버튼 |
| `NearbySpotScroll` | `src/components/discover/NearbySpotScroll.tsx` | Presentation (Client) | 근처 Spot 가로 스크롤 |
| `LocationPermissionBanner` | `src/components/discover/LocationPermissionBanner.tsx` | Presentation (Client) | 위치 미허용 유도 배너 |
| **피드** |||
| `FeedPage` | `src/app/feed/page.tsx` | Presentation (Client) | 피드 메인 (CSR, 개인화) |
| `FeedHeader` | `src/components/feed/FeedHeader.tsx` | Presentation | 필터 (지역, 테마) |
| `FeedList` | `src/components/feed/FeedList.tsx` | Presentation | 피드 아이템 목록 + 무한 스크롤 |

### 5.5 위치 기반 발견 페이지 (`/` 랜딩 재설계)

**핵심 컨셉**: 앱/웹 진입 시 유저의 GPS 위치를 기반으로 **두 블록**을 보여준다.

- **Block 1 — "지금 여기" (Current Spot)**: 현재 위치에서 가장 가까운/관련성 높은 Spot
- **Block 2 — "다음은 여기" (Next Spot)**: Block 1에서 이동하기 좋은 추천 Spot

```
┌─────────────────────────────────────────┐
│  Header                                 │
│  ┌───────────────────────────────────┐  │
│  │ 📍 성수동 · 현재 위치 기준        │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ═══ Block 1: 지금 여기 ═══════════════ │
│  ┌───────────────────────────────────┐  │
│  │ ┌─────────────────────────────┐   │  │
│  │ │                             │   │  │
│  │ │     대표 이미지              │   │  │
│  │ │     (Place API / 크루 사진)  │   │  │
│  │ │                             │   │  │
│  │ └─────────────────────────────┘   │  │
│  │                                   │  │
│  │  🏷️ cafe · 성수                   │  │
│  │  카페 어니언 성수                  │  │
│  │                                   │  │
│  │  Crew 추천                        │  │
│  │  "빵이 맛있고 2층 테라스 최고"     │  │
│  │                                   │  │
│  │  ⭐ 4.5 · 리뷰 1,523 · 📍 120m   │  │
│  │  영업중 · 08:00~22:00             │  │
│  │                                   │  │
│  │  [자세히 보기]  [길찾기]           │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ─ ─ ─ 도보 8분 · 600m ─ ─ ─ ─ ─ ─ ─  │
│                                         │
│  ═══ Block 2: 다음은 여기 ═════════════ │
│  ┌───────────────────────────────────┐  │
│  │ ┌─────────────────────────────┐   │  │
│  │ │                             │   │  │
│  │ │     대표 이미지              │   │  │
│  │ │                             │   │  │
│  │ └─────────────────────────────┘   │  │
│  │                                   │  │
│  │  🏷️ culture · 성수                │  │
│  │  대림창고 갤러리                   │  │
│  │                                   │  │
│  │  Crew 추천                        │  │
│  │  "카페 후 산책하며 들르기 딱"      │  │
│  │                                   │  │
│  │  ⭐ 4.2 · 📍 도보 8분             │  │
│  │                                   │  │
│  │  [자세히 보기]  [길찾기]           │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  🔄 다른 추천 보기                │  │
│  │  📋 이 둘을 Route로 시작하기      │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ═══ 이 근처 다른 Spot ════════════════ │
│  ┌──────┐ ┌──────┐ ┌──────┐           │
│  │ Spot │ │ Spot │ │ Spot │  → 스크롤  │
│  │ Card │ │ Card │ │ Card │           │
│  └──────┘ └──────┘ └──────┘           │
│                                         │
│  ═══ 인기 Route ═══════════════════════ │
│  ┌──────────────────────────────────┐  │
│  │ RoutePreviewCard                  │  │
│  │ "성수 주말 데이트 코스"           │  │
│  └──────────────────────────────────┘  │
│                                         │
│  BottomNav                              │
│  ┌───────────────────────────────────┐  │
│  │  🏠 홈  🔍 탐색  ➕ 기록  👤 내정보│  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

#### 5.5.1 위치 기반 발견 Data Flow

```
1. 유저가 / (랜딩) 진입
   │
2. 브라우저 Geolocation API 호출
   │  navigator.geolocation.getCurrentPosition()
   │
   ├─ 위치 허용:
   │  │
   │  3a. Backend API 호출
   │  │   GET /api/v2/spots/discover?lat={lat}&lng={lng}
   │  │
   │  4a. Backend 처리:
   │  │   ├── 가장 가까운 활성 Spot 1개 조회 (currentSpot)
   │  │   ├── currentSpot과 같은 area에서 다른 카테고리 Spot 1개 추천 (nextSpot)
   │  │   │   (추천 우선순위: 도보 15분 이내 + 카테고리 다양성 + viewsCount)
   │  │   ├── currentSpot ↔ nextSpot 도보 시간/거리 계산
   │  │   ├── 각 Spot의 PlaceInfo 캐시 조회
   │  │   └── 근처 다른 Spot 목록 (최대 6개, 가까운 순)
   │  │
   │  5a. 응답 렌더링:
   │      Block 1 (currentSpot + placeInfo)
   │      ── 이동 정보 ──
   │      Block 2 (nextSpot + placeInfo)
   │      ── 근처 Spot 가로 스크롤 ──
   │      ── 인기 Route ──
   │
   └─ 위치 거부 / 불가:
      │
      3b. 위치 없이 인기 Spot 기반 폴백
      │   GET /api/v2/spots/discover (lat/lng 없음)
      │
      4b. Backend: 서울 전체 기준 인기 Spot 2개 + 인기 Route 반환
      │
      5b. "위치를 허용하면 근처 Spot을 추천해 드려요" 배너 표시
```

#### 5.5.2 Backend API — Discover Endpoint

```
GET /api/v2/spots/discover
```

**Query Parameters:**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `lat` | double | No | null | 유저 위도 |
| `lng` | double | No | null | 유저 경도 |
| `radius` | double | No | 1.0 | 탐색 반경 (km) |
| `excludeSpotId` | UUID | No | null | 제외할 Spot (새로고침 시) |

**Response (200):**
```typescript
interface DiscoverResponse {
  // Block 1: 지금 여기
  currentSpot: {
    spot: SpotDetailResponse;       // DB + 기본 정보
    placeInfo: PlaceInfo | null;    // Place API (캐시)
    distanceFromUser: number;       // m
  } | null;

  // Block 2: 다음은 여기
  nextSpot: {
    spot: SpotDetailResponse;
    placeInfo: PlaceInfo | null;
    distanceFromCurrent: number;    // m (currentSpot 기준)
    walkingTime: number;            // 분
  } | null;

  // 근처 추가 Spot
  nearbySpots: SpotPreview[];       // 최대 6개

  // 인기 Route (같은 area)
  popularRoutes: RoutePreview[];    // 최대 3개

  // 메타
  area: string | null;              // 감지된 지역 ("성수", "을지로" 등)
  locationGranted: boolean;
}
```

**Next Spot 추천 알고리즘 (간단):**
```
1. currentSpot과 같은 area 내 활성 Spot 목록 조회
2. currentSpot 제외
3. 필터: 도보 15분 이내 (약 1.0km)
4. 우선순위 정렬:
   a. 카테고리 다양성 (currentSpot과 다른 카테고리 우선)
   b. crewNote가 있는 Spot 우선
   c. viewsCount 내림차순
5. 상위 1개 선택
```

#### 5.5.3 위치 기반 발견 컴포넌트 목록

| Component | Location | Type | Responsibility |
|-----------|----------|------|----------------|
| `DiscoverPage` | `src/app/page.tsx` (기존 랜딩 교체) | Client | Geolocation 요청 + Discover API 호출 + 상태 관리 |
| `LocationHeader` | `src/components/discover/LocationHeader.tsx` | Client | 현재 위치 표시 (area명), 위치 재탐색 버튼 |
| `CurrentSpotBlock` | `src/components/discover/CurrentSpotBlock.tsx` | Client | Block 1: 현재 Spot 카드 (이미지, 정보, crewNote, PlaceInfo) |
| `NextSpotBlock` | `src/components/discover/NextSpotBlock.tsx` | Client | Block 2: 다음 Spot 카드 (이미지, 정보, 이동 시간) |
| `TransitionInfo` | `src/components/discover/TransitionInfo.tsx` | Client | 두 블록 사이 이동 정보 (도보 N분, Nm) |
| `DiscoverActions` | `src/components/discover/DiscoverActions.tsx` | Client | "다른 추천", "Route로 시작하기" 버튼 |
| `NearbySpotScroll` | `src/components/discover/NearbySpotScroll.tsx` | Client | 근처 Spot 가로 스크롤 |
| `LocationPermissionBanner` | `src/components/discover/LocationPermissionBanner.tsx` | Client | 위치 미허용 시 유도 배너 |

#### 5.5.4 위치 기반 발견 상태 관리

```typescript
// src/store/useDiscoverStore.ts
interface DiscoverState {
  // 위치
  userLocation: { lat: number; lng: number } | null;
  locationStatus: "pending" | "granted" | "denied" | "unavailable";
  detectedArea: string | null;

  // Discover 데이터
  currentSpot: DiscoverResponse["currentSpot"];
  nextSpot: DiscoverResponse["nextSpot"];
  nearbySpots: SpotPreview[];
  popularRoutes: RoutePreview[];

  // UI 상태
  isLoading: boolean;
  error: string | null;

  // Actions
  requestLocation: () => Promise<void>;
  fetchDiscover: (lat?: number, lng?: number) => Promise<void>;
  refreshRecommendation: () => Promise<void>;  // 다른 추천 보기
  clearAll: () => void;
}
```

### 5.6 User Flow (조정됨)

```
위치 기반 발견 플로우 (신규 — 메인 진입):
  / (랜딩) → 위치 허용 → Block 1 (현재 Spot) + Block 2 (다음 Spot)
                        → [자세히 보기] → /spot/{slug} (Spot 상세)
                        → [길찾기] → 외부 지도 앱
                        → [다른 추천] → 새로운 Spot 쌍 표시
                        → [Route로 시작] → /create/route (Route 생성, 2 Spot 프리로드)
           → 위치 거부 → 인기 Spot 기반 폴백 + 위치 허용 유도 배너
                        → /feed (피드 탐색)

피드 플로우:
  /feed → 스크롤 → Route 클릭 → /route/{slug} (Route 상세)
                  → Spot 클릭 → /spot/{slug} (Spot 상세)

QR 플로우 (기존 유지):
  QR 스캔 → /qr/[qrId] → /spotline/[qrId] (기존 매장 상세)
                         (Phase 5에서 → /spot/{slug}로 연결)

SEO 진입:
  검색 → /spot/{slug} 또는 /route/{slug} (SSR)
       → /city/{name} 또는 /theme/{name}

Spot 상세 → 다음 Spot 연결:
  /spot/{slug} → SpotNearby 섹션 → 다른 /spot/{slug}
               → SpotRoutes 섹션 → /route/{slug}
               → [하단 바] → 길찾기, 좋아요, 공유
```

#### 5.6.1 전체 유저 여정 시나리오

```
시나리오 A: 위치 기반 자연 탐색
  1. 유저가 성수동에서 앱 접속
  2. 위치 허용 → "지금 여기: 카페 어니언 (120m)" 표시
  3. "다음은 여기: 대림창고 갤러리 (도보 8분)" 표시
  4. 카페 어니언 [자세히 보기] → Spot 상세 페이지에서 crewNote, PlaceInfo 확인
  5. [길찾기] → 카카오맵으로 이동
  6. 카페 방문 후 다시 앱 → "다음은 여기" 블록의 대림창고로 이동
  7. [이 둘을 Route로 시작하기] → Route 초안 자동 생성

시나리오 B: QR + 위치 연계
  1. 매장에서 QR 스캔 → /spotline/[qrId] (기존 매장 상세)
  2. "이 매장이 포함된 Route" 섹션에서 Route 발견
  3. Route 상세 → 다음 Spot까지의 이동 정보 확인
  4. 홈으로 돌아오면 → 현재 위치 기반으로 다음 추천 갱신

시나리오 C: 위치 미허용
  1. 위치 거부 → "서울 인기 Spot" 기반 폴백 표시
  2. 상단 배너: "위치를 허용하면 근처 Spot을 추천해 드려요"
  3. /feed로 이동하여 지역/테마 필터로 탐색
```

---

## 6. Error Handling

### 6.1 Error Scenarios

| Scenario | Handling | User Message |
|----------|----------|-------------|
| Spot slug 없음 | 404 페이지 | "해당 Spot을 찾을 수 없습니다" |
| Route slug 없음 | 404 페이지 | "해당 Route를 찾을 수 없습니다" |
| Place API 실패 | placeInfo: null (graceful) | 매장 정보 섹션 숨김, DB 데이터만 표시 |
| Place API 타임아웃 | 3초 타임아웃, null 반환 | 동일 (graceful degradation) |
| Backend 연결 실패 | error.tsx | "서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요" |
| 피드 로드 실패 | 재시도 버튼 | "피드를 불러올 수 없습니다" |
| 이미지 로드 실패 | SVG 플레이스홀더 | OptimizedImage 기존 로직 재사용 |
| **위치 권한 거부** | 인기 Spot 폴백 + 배너 | "위치를 허용하면 근처 Spot을 추천해 드려요" |
| **위치 API 불가** (HTTP) | 인기 Spot 폴백 | 동일 (HTTPS 아닌 환경에서 Geolocation 불가) |
| **Discover API 실패** | 재시도 버튼 | "주변 Spot을 불러올 수 없습니다" |
| **근처 Spot 없음** (반경 1km 내 0개) | 반경 확대 후 재시도, 없으면 인기 폴백 | "근처에 등록된 Spot이 없습니다. 인기 Spot을 보여드릴게요" |
| **Next Spot 추천 불가** (Spot 1개뿐) | Block 2 숨김, Block 1만 표시 | Block 2 자리에 "곧 더 많은 Spot이 추가됩니다" |

### 6.2 Server Component 에러 처리

```typescript
// src/app/spot/[slug]/page.tsx
export default async function SpotPage({ params }: { params: { slug: string } }) {
  const data = await fetchSpotDetail(params.slug);

  if (!data) {
    notFound(); // Next.js not-found.tsx 렌더링
  }

  return <SpotDetailView data={data} />;
}

// src/app/spot/[slug]/not-found.tsx
export default function SpotNotFound() {
  return (
    <div>
      <h1>Spot을 찾을 수 없습니다</h1>
      <p>삭제되었거나 잘못된 주소입니다.</p>
      <Link href="/feed">피드로 돌아가기</Link>
    </div>
  );
}

// src/app/spot/[slug]/error.tsx
"use client";
export default function SpotError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h1>문제가 발생했습니다</h1>
      <button onClick={reset}>다시 시도</button>
    </div>
  );
}
```

---

## 7. Security Considerations

- [x] Input validation: slug는 alphanumeric + hyphen만 허용 (정규식 검증)
- [x] Place API 키: Backend 서버에서만 사용 (환경변수, 클라이언트 노출 없음)
- [x] Rate Limiting: Place API 프록시에 rate limit 적용 (Backend)
- [ ] 인증: Phase 1~4는 읽기 전용 (인증 불필요), Phase 6부터 Social 기능에 인증 추가
- [x] HTTPS: 프로덕션 환경에서 강제
- [x] XSS: crewNote는 텍스트만 (HTML 렌더링 금지)
- [x] API 키 보호: NAVER_PLACE_API_KEY, KAKAO_PLACE_API_KEY는 Backend .env에만

---

## 8. Test Plan

### 8.1 Test Scope

| Type | Target | Tool | Phase |
|------|--------|------|-------|
| Manual | Spot/Route 페이지 렌더링 | 브라우저 | 3 |
| Manual | Place API 캐싱 동작 확인 | curl/Postman | 1 |
| Manual | SEO 메타태그 확인 | Lighthouse | 3 |
| Manual | 모바일 반응형 | DevTools | 3 |
| Manual | 피드 스크롤 + 필터 | 브라우저 | 4 |
| Zero Script QA | Backend API 로그 기반 검증 | Docker logs | 1 |

### 8.2 Key Test Cases

- [ ] Spot 상세: slug로 접근 시 SSR 렌더링, Place API 데이터 포함
- [ ] Spot 상세: Place API 실패 시 crewNote + DB 데이터만 표시 (graceful)
- [ ] Spot 상세: 존재하지 않는 slug → 404 페이지
- [ ] Route 상세: Timeline에 Spot 순서대로 표시, 이동 정보 포함
- [ ] Route 상세: 변형 Route 목록 표시
- [ ] 피드: 지역/테마 필터 동작, 무한 스크롤
- [ ] 피드: Route 카드 > Spot 카드 비율 (Route 우선)
- [ ] Place API 캐시: 첫 호출 → MISS → 캐시 저장, 재호출 → HIT
- [ ] SEO: /spot/{slug} 페이지 소스에 제목, 설명, 이미지 메타태그 포함
- [ ] 모바일: 모든 컴포넌트 375px 이상에서 정상 렌더링

---

## 9. Clean Architecture

### 9.1 Layer Structure

| Layer | Responsibility | Location |
|-------|---------------|----------|
| **Presentation** | Server/Client Components, Pages | `src/app/`, `src/components/` |
| **Application** | 데이터 페칭 함수, 상태 관리 | `src/lib/api.ts`, `src/store/` |
| **Domain** | 타입 정의, 비즈니스 룰 | `src/types/` |
| **Infrastructure** | HTTP 클라이언트 (axios) | `src/lib/api.ts` |

### 9.2 This Feature's Layer Assignment

| Component | Layer | Location |
|-----------|-------|----------|
| DiscoverPage | Presentation (Client) | `src/app/page.tsx` |
| CurrentSpotBlock, NextSpotBlock, etc. | Presentation (Client) | `src/components/discover/` |
| SpotDetailPage | Presentation (Server) | `src/app/spot/[slug]/page.tsx` |
| RouteDetailPage | Presentation (Server) | `src/app/route/[slug]/page.tsx` |
| FeedPage | Presentation (Client) | `src/app/feed/page.tsx` |
| SpotHero, SpotCrewNote, etc. | Presentation | `src/components/spot/` |
| RouteTimeline, etc. | Presentation | `src/components/route/` |
| Spot, Route, PlaceInfo, DiscoverResponse types | Domain | `src/types/index.ts` |
| fetchDiscover(), fetchSpotDetail(), fetchRouteDetail() | Application | `src/lib/api.ts` |
| axios instance | Infrastructure | `src/lib/api.ts` |
| useDiscoverStore | Application (State) | `src/store/useDiscoverStore.ts` |
| useFeedStore | Application (State) | `src/store/useFeedStore.ts` |

### 9.3 Server Component vs Client Component 분리

```
Server Components (SSR, SEO):
  ├── src/app/spot/[slug]/page.tsx      ← fetch 후 props 전달
  ├── src/app/route/[slug]/page.tsx     ← fetch 후 props 전달
  ├── src/components/spot/SpotHero.tsx   ← props만 받아 렌더
  ├── src/components/spot/SpotCrewNote.tsx
  ├── src/components/spot/SpotPlaceInfo.tsx
  ├── src/components/spot/SpotRoutes.tsx
  ├── src/components/spot/SpotNearby.tsx
  ├── src/components/route/RouteHeader.tsx
  └── src/components/route/RouteTimeline.tsx

Client Components ("use client"):
  ├── src/app/page.tsx                          ← 위치 기반 발견 (Geolocation API)
  ├── src/components/discover/*                 ← 위치 발견 전체 (8개 컴포넌트)
  ├── src/components/spot/SpotBottomBar.tsx     ← 인터랙션 (좋아요, 공유)
  ├── src/components/spot/SpotImageGallery.tsx  ← 스와이프 갤러리
  ├── src/components/route/RouteMapPreview.tsx  ← 지도 (Kakao SDK)
  ├── src/components/route/RouteBottomBar.tsx   ← 인터랙션
  ├── src/app/feed/page.tsx                     ← 무한 스크롤, 필터
  └── src/components/feed/FeedList.tsx          ← 동적 로딩
```

---

## 10. Coding Convention Reference

### 10.1 This Feature's Conventions

| Item | Convention |
|------|-----------|
| Component naming | PascalCase, `[컴포넌트명]Props` interface |
| File organization | `src/components/spot/`, `src/components/route/`, `src/components/shared/`, `src/components/feed/` |
| State management | Zustand: `useFeedStore` (피드용), 기존 `useSpotlineStore` 유지 |
| Error handling | Server Component: `notFound()` + `error.tsx`, Client: 에러 상태 |
| Styling | Tailwind CSS 4, `cn()` 유틸리티, 모바일 퍼스트 |
| Data fetching | Server Component: `fetch()` 직접 호출, Client: Zustand action 또는 `useEffect` |
| Images | `OptimizedImage` 컴포넌트 재사용, SVG 폴백 |
| Maps | `ExternalMapButtons` 재사용 (카카오맵/네이버지도 외부 링크) |
| i18n | UI 텍스트 한국어, 코드 영어 |
| Path alias | `@/*` → `./src/*` |

### 10.2 New Environment Variables

| Variable | Purpose | Scope |
|----------|---------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL (기존) | Client + Server |
| `NAVER_PLACE_CLIENT_ID` | 네이버 Place API | Backend only |
| `NAVER_PLACE_CLIENT_SECRET` | 네이버 Place API | Backend only |
| `KAKAO_REST_API_KEY` | 카카오 Place API | Backend only |

---

## 11. Implementation Guide

### 11.1 File Structure (신규 추가분)

```
src/
├── app/
│   ├── page.tsx                   ← 랜딩 (위치 기반 발견, CSR) ★ 교체
│   ├── spot/
│   │   └── [slug]/
│   │       ├── page.tsx           ← Phase 3: Spot 상세 SSR
│   │       ├── not-found.tsx
│   │       ├── error.tsx
│   │       └── loading.tsx
│   ├── route/
│   │   └── [slug]/
│   │       ├── page.tsx           ← Phase 3: Route 상세 SSR
│   │       ├── not-found.tsx
│   │       ├── error.tsx
│   │       └── loading.tsx
│   ├── feed/
│   │   └── page.tsx               ← Phase 4: 피드 (CSR)
│   ├── city/
│   │   └── [name]/
│   │       └── page.tsx           ← Phase 4: 도시별 (SSR)
│   └── theme/
│       └── [name]/
│           └── page.tsx           ← Phase 4: 테마별 (SSR)
│
├── components/
│   ├── discover/                  ← ★ 위치 기반 발견 (신규)
│   │   ├── LocationHeader.tsx     (현재 위치 area 표시)
│   │   ├── CurrentSpotBlock.tsx   (Block 1: 지금 여기)
│   │   ├── NextSpotBlock.tsx      (Block 2: 다음은 여기)
│   │   ├── TransitionInfo.tsx     (블록 간 이동 정보)
│   │   ├── DiscoverActions.tsx    (다른 추천/Route 시작 버튼)
│   │   ├── NearbySpotScroll.tsx   (근처 Spot 가로 스크롤)
│   │   ├── LocationPermissionBanner.tsx (위치 미허용 유도)
│   │   └── DiscoverSkeleton.tsx   (로딩 스켈레톤)
│   ├── spot/                      ← Phase 3
│   │   ├── SpotHero.tsx
│   │   ├── SpotCrewNote.tsx
│   │   ├── SpotPlaceInfo.tsx
│   │   ├── SpotImageGallery.tsx
│   │   ├── SpotRoutes.tsx
│   │   ├── SpotNearby.tsx
│   │   └── SpotBottomBar.tsx
│   ├── route/                     ← Phase 3
│   │   ├── RouteHeader.tsx
│   │   ├── RouteTimeline.tsx
│   │   ├── RouteTimelineItem.tsx
│   │   ├── RouteMapPreview.tsx
│   │   ├── RouteVariations.tsx
│   │   └── RouteBottomBar.tsx
│   ├── shared/                    ← Phase 3-4
│   │   ├── SpotMiniCard.tsx
│   │   ├── SpotPreviewCard.tsx
│   │   ├── RoutePreviewCard.tsx
│   │   └── TagList.tsx
│   └── feed/                      ← Phase 4
│       ├── FeedHeader.tsx
│       └── FeedList.tsx
│
├── types/
│   └── index.ts                   ← Spot, Route, PlaceInfo, DiscoverResponse 등 추가
│
├── store/
│   ├── useDiscoverStore.ts        ← ★ 위치 기반 발견 상태 (신규)
│   └── useFeedStore.ts            ← Phase 4: 피드 상태
│
├── hooks/
│   └── useGeolocation.ts          ← ★ Geolocation API 커스텀 훅 (신규)
│
└── lib/
    └── api.ts                     ← fetchDiscover, fetchSpotDetail, fetchRouteDetail 등 추가
```

### 11.2 Implementation Order

**Phase 1: Backend — 데이터 모델 + Place API (backend-spotLine)**
1. [ ] MongoDB Spot/Route 스키마 + 인덱스 정의
2. [ ] Place API 프록시 엔드포인트 (`GET /api/places/search`, `GET /api/places/:provider/:placeId`)
3. [ ] In-Memory 캐시 레이어 (TTL 24h)
4. [ ] Spot CRUD API (`POST /api/spots`, `POST /api/spots/bulk`, `GET /api/spots/:slug`)
5. [ ] Route CRUD API (`POST /api/routes`, `GET /api/routes/:slug`)
6. [ ] Spot 상세 응답에 PlaceInfo + Routes + NearbySpots 병합 로직

**Phase 2: Admin — 크루 큐레이션 도구 (admin-spotLine)**
7. [ ] Place API 검색 UI (네이버/카카오 선택, 키워드 검색)
8. [ ] 검색 결과 → Spot 등록 (crewNote 입력, 태그/카테고리 선택)
9. [ ] 대량 Spot 등록 (bulk)
10. [ ] Route 구성 도구 (등록된 Spot을 순서 배치, 이동 정보 입력)

**Phase 3: Front — 위치 기반 발견 + Spot/Route 상세 SSR (front-spotLine, 이 레포)**
11. [ ] `src/types/index.ts`에 Spot, Route, PlaceInfo, DiscoverResponse 등 신규 타입 추가
12. [ ] `src/lib/api.ts`에 `fetchDiscover()`, `fetchSpotDetail()`, `fetchRouteDetail()` 추가
13. [ ] `src/hooks/useGeolocation.ts` — Geolocation API 커스텀 훅
14. [ ] `src/store/useDiscoverStore.ts` — 위치 기반 발견 상태 관리
15. [ ] `src/app/page.tsx` — 위치 기반 발견 랜딩 (기존 랜딩 교체)
16. [ ] `src/components/discover/` — 8개 컴포넌트 구현
    - LocationHeader, CurrentSpotBlock, NextSpotBlock, TransitionInfo
    - DiscoverActions, NearbySpotScroll, LocationPermissionBanner, DiscoverSkeleton
17. [ ] `src/app/spot/[slug]/page.tsx` — Spot 상세 SSR 페이지
18. [ ] `src/components/spot/` — 7개 컴포넌트 구현
19. [ ] `src/app/route/[slug]/page.tsx` — Route 상세 SSR 페이지
20. [ ] `src/components/route/` — 6개 컴포넌트 구현
21. [ ] `src/components/shared/` — 공유 카드 컴포넌트 4개
22. [ ] SEO 메타데이터 (`generateMetadata`)

**Phase 4: Front — 피드 + 탐색 (front-spotLine)**
23. [ ] `src/lib/api.ts`에 `fetchFeed()`, `fetchCitySpots()` 등 추가
24. [ ] `src/store/useFeedStore.ts` — 피드 상태 관리
25. [ ] `src/app/feed/page.tsx` — CSR 피드 페이지
26. [ ] `src/components/feed/` — FeedHeader + FeedList
27. [ ] `src/app/city/[name]/page.tsx` — 도시별 SSR
28. [ ] `src/app/theme/[name]/page.tsx` — 테마별 SSR
29. [ ] 무한 스크롤 구현

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-15 | Initial draft — Phase 1~4 설계 | Claude Code |
| 0.2 | 2026-03-15 | 위치 기반 발견 설계 추가 — DiscoverPage(2-블록: currentSpot+nextSpot), Discover API, useDiscoverStore, 8개 discover 컴포넌트, User Flow 조정 | Claude Code |
