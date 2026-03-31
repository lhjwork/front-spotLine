# Plan: Spotline - Experience Based Social Platform

## Executive Summary

| Perspective | Description |
|-------------|-------------|
| **Problem** | 기존 소셜 미디어는 사진/영상 중심이며, 실제 "경험"을 구조화하여 공유하고 재현할 수 없다. 오프라인 장소 발견과 온라인 경험 공유가 단절되어 있다. |
| **Solution** | QR 기반 오프라인 Spot 발견 + 경험 Route 생성/공유 + 소셜 피드를 하나의 플랫폼에 통합한다. |
| **Function UX Effect** | QR 스캔으로 현장에서 Spot을 발견하고, 경험을 Route로 엮어 공유하며, 타인의 Route를 내 일정으로 변환하여 실행한다. |
| **Core Value** | "QR로 시작 → 경험으로 기록 → 공유로 확산 → 재현으로 순환"하는 오프라인-온라인 연결 생태계를 구축한다. |

| Item | Detail |
|------|--------|
| Feature | Experience Based Social Platform (Spotline v2) |
| Created | 2026-03-14 |
| Status | Planning |
| Level | Dynamic |

---

## 1. Background & Context

### 1.1 현재 상태 (AS-IS)

현재 Spotline은 **QR 코드 → 매장 정보 → 다음 장소 추천** 구조의 오프라인 연결 서비스:

- **QR 스캔 기반 매장 발견** (`/spotline/[qrId]`) — 핵심 기능
- 크루 큐레이션 SpotLine (성수, 을지로, 연남 등 라인별 제휴 매장)
- 유저 생태계 지도 통합 설계 (방문/좋아요/소개 활동)
- Instagram OAuth 인증 시스템
- 데모 시스템 (demo_cafe_001 등)

**기존 전략 문서**:
- `content-based_transition_strategic_proposal.md`: 영업 기반 → 콘텐츠 기반 전환
- `spotline_user_ecosystem_map_proposal.md`: SpotLine 제휴 + 유저 생태계 지도 통합

### 1.2 플랫폼 3대 핵심 축

Spotline은 세 가지 축이 유기적으로 연결된 플랫폼이다:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Spotline Platform                             │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │  Pillar 1    │  │  Pillar 2    │  │  Pillar 3          │    │
│  │  QR Discovery│→ │  Experience  │→ │  Social            │    │
│  │  (오프라인)   │  │  Recording   │  │  Sharing           │    │
│  │              │  │  (기록)       │  │  (확산)             │    │
│  │  QR 스캔으로 │  │  Spot 기록    │  │  Route 공유         │    │
│  │  Spot 발견   │  │  Route 구성   │  │  피드 탐색          │    │
│  │  매장 정보   │  │  경험 저장    │  │  일정 변환          │    │
│  │  다음 장소   │  │              │  │  경험 진화          │    │
│  └──────────────┘  └──────────────┘  └────────────────────┘    │
│         │                  │                   │                │
│         └─────── 순환 연결 ──┴───────────────────┘                │
│                                                                 │
│  QR로 발견 → 경험으로 기록 → 공유로 확산 → QR로 다시 발견       │
└─────────────────────────────────────────────────────────────────┘
```

**Pillar 1: QR Discovery (오프라인 발견)** — 기존 핵심 유지 + 강화
- QR 코드 스캔으로 현장에서 즉시 Spot 정보 확인
- 매장/장소의 상세 정보, 스토리, 사진 제공
- "다음 장소 추천" (NextSpot) → Route의 시작점
- 파트너 매장 제휴 시스템 (수익 모델)
- **새로운 연결**: QR 스캔한 Spot을 내 Route에 바로 추가

**Pillar 2: Experience Recording (경험 기록)**
- Spot: 장소 + 시간 + 활동이 결합된 순간
- Route: 여러 Spot을 순서대로 연결한 완전한 경험
- 수동 기록 (MVP) → GPS 자동 추적 (후속)

**Pillar 3: Social Sharing (소셜 확산)**
- 피드 기반 경험 발견
- Route 복제 → 내 일정으로 변환
- 경험 진화 (변형 Route 생성)
- 팔로우, 좋아요, 댓글

### 1.3 QR ↔ Experience 연결 시나리오

```
시나리오 1: QR에서 시작하는 경험
  카페에서 QR 스캔 → Spot 정보 확인 → "이 Spot을 내 Route에 추가"
  → 다음 장소도 QR 스캔 → Route 완성 → 공유

시나리오 2: 피드에서 시작하는 현장 방문
  피드에서 Route 발견 → "내 일정에 추가" → 현장 방문
  → 각 Spot에서 QR 스캔하여 "체크인" → 완주 기록

시나리오 3: QR이 경험 콘텐츠로 확장
  매장 QR 스캔 → 매장 정보 + "이 매장이 포함된 인기 Route" 표시
  → Route 발견 → 따라가기
```

### 1.4 기존 타입 진화 방향

```
현재 SpotLine (크루 큐레이션 라인)
  ↓ 확장 (대체가 아님)
Spotline Route (크루 라인 + 유저 경험 루트 공존)

현재 Store/SpotlineStore (매장 정보)
  ↓ 확장
Spot (매장 = 장소의 한 유형, 시간+활동 추가)

현재 NextSpot (다음 장소 추천)
  ↓ 통합
RouteSpot (Route 내 순서가 있는 Spot, QR 추천도 Route로 표현)
```

---

## 2. Core Entities

### 2.1 Spot (경험의 단위)

하나의 장소에서 발생한 하나의 **순간(moment)**:

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique ID |
| slug | string | SEO-friendly URL slug |
| title | string | "한강 노을" |
| description | string | 순간에 대한 설명 |
| location | Location | 주소, 좌표, 지역 |
| time | TimeInfo | 시각, 시간대 (sunset, morning 등) |
| category | SpotCategory | cafe, restaurant, nature, culture, walk, activity |
| media | Media[] | 사진/짧은 영상 |
| tags | string[] | 해시태그 |
| creator | UserRef | 작성자 |
| stats | SpotStats | 좋아요, 방문, 저장 수 |
| createdAt | string | 생성일 |
| **qrCode** | **QRInfo?** | **QR 코드 연결 (파트너 매장인 경우)** |
| **storeInfo** | **StoreDetail?** | **매장 상세 정보 (영업시간, 연락처 등)** |
| **spotlineStory** | **SpotlineStory?** | **크루 큐레이션 스토리 (기존 유지)** |
| **source** | **SpotSource** | **"qr" \| "user" \| "crew" — 생성 경로** |

```typescript
// Spot 데이터 구조 — DB에는 최소 정보만, 나머지는 외부 API 연동
interface Spot {
  id: string;
  slug: string;
  title: string;
  description: string;
  location: {
    address: string;
    lat: number;
    lng: number;
    area: string;                   // "성수", "을지로" 등
  };
  category: SpotCategory;
  tags: string[];
  source: SpotSource;
  crewNote?: string;                // 크루의 한줄 추천 (큐레이션 핵심)

  // 외부 Place API 연동 (매장 정보 소스)
  externalPlace: {
    naverPlaceId?: string;          // 네이버 플레이스 ID
    kakaoPlaceId?: string;          // 카카오맵 장소 ID
  };
  // → 영업시간, 전화번호, 리뷰수, 평점, 사진 등은
  //   DB 저장 없이 네이버/카카오 API에서 실시간(+캐싱) 조회

  // QR 연동 (향후 파트너 매장 확보 시)
  qrCode?: QRInfo;

  stats: SpotStats;
  creator: UserRef;
  createdAt: string;
}

type SpotSource = "crew" | "user" | "qr";
// crew: 크루가 큐레이션한 Spot (초기 주력)
// user: 일반 유저가 생성한 Spot (향후)
// qr: QR 파트너 매장 Spot (파트너 확보 후)

type SpotCategory =
  | "cafe" | "restaurant" | "bar"
  | "nature" | "culture" | "exhibition"
  | "walk" | "activity" | "shopping" | "other";

interface QRInfo {
  qrId: string;
  isActive: boolean;
  scanCount: number;
}
```

**외부 Place API 연동 전략**:

```
Spot 페이지 렌더링 시:

┌─ DB (Spotline 자체) ──────────────────────┐
│ slug, title, category, tags, crewNote     │
│ lat, lng, area, source                    │
│ naverPlaceId, kakaoPlaceId                │
└───────────────┬───────────────────────────┘
                │
┌───────────────▼───────────────────────────┐
│ 네이버 Place API (naverPlaceId로 조회)     │
│ → 매장명, 주소, 영업시간, 전화번호         │
│ → 리뷰 수, 평점, 사진                     │
│ → 블로그 리뷰 연결                        │
├───────────────────────────────────────────┤
│ 카카오 Place API (kakaoPlaceId로 조회)     │
│ → 장소 상세, 카테고리                     │
│ → 전화번호, 홈페이지 URL                  │
│ → 길찾기 연동                             │
└───────────────────────────────────────────┘

DB에 저장하는 것: Spot 기본 정보 + 외부 ID + 크루 큐레이션만
매장 상세 정보: 외부 API 실시간 조회 + 서버 캐싱 (TTL 24h)
```

**대량 Spot 사전 등록 프로세스**:

```
Step 1: 네이버/카카오 Place API로 지역별 장소 일괄 수집
  → "성수동 카페" 검색 → 50개 장소 리스트 자동 생성
  → "을지로 맛집" 검색 → 40개 장소 리스트 자동 생성
  → 각 장소의 placeId, 좌표, 기본 정보 저장

Step 2: 크루가 리스트에서 큐레이션 (선별)
  → 50개 중 20개 선택
  → 각각에 crewNote (한줄 추천) 작성
  → 태그, 카테고리 지정

Step 3: Route 구성
  → 큐레이션한 Spot들을 테마별로 묶어 Route 생성
  → "성수 주말 데이트 코스", "을지로 레트로 탐방" 등

결과: 크루 1명이 하루 20~30개 Spot 큐레이션 가능
  → 2~3명 × 2주 = 서울 주요 지역 200~300개 Spot 확보
```

**기존 타입과의 관계**:
- `SpotlineStore` → `Spot` (source: "qr" | "crew") + `storeInfo` 필드
- `MockupSpot` → `Spot`으로 진화 (time, creator, qrCode 추가)
- `NextSpot` → Route 내 `RouteSpot` 참조로 대체
- `Store` (레거시) → `Spot` + `storeInfo`로 마이그레이션
- **QR 기반 Spot은 storeInfo와 qrCode가 채워진 Spot**

### 2.2 Route (경험의 묶음)

여러 Spot을 순서대로 연결한 **완전한 경험**:

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique ID |
| slug | string | SEO-friendly URL slug |
| title | string | "성수 데이트 코스" |
| description | string | 경험 전체 설명 |
| spots | RouteSpot[] | 순서가 있는 Spot 목록 |
| totalDuration | number | 총 소요시간 (분) |
| totalDistance | number | 총 거리 (m) |
| area | string | 대표 지역 |
| theme | RouteTheme | date, travel, walk, hangout, food-tour |
| creator | UserRef | 작성자 |
| stats | RouteStats | 좋아요, 저장, 복제, 완주 수 |
| variations | RouteRef[] | 이 Route에서 파생된 변형들 |
| parentRoute | RouteRef? | 원본 Route (변형인 경우) |
| createdAt | string | 생성일 |

```typescript
interface RouteSpot {
  spot: SpotRef;
  order: number;
  suggestedTime: string;      // "17:30"
  stayDuration: number;       // 분
  transitionToNext?: {
    walkingTime: number;
    distance: number;
    note?: string;             // "골목길로 5분"
  };
}
```

**핵심**: Route가 Spotline의 **가장 가치 있는 콘텐츠**. 단일 Spot은 영감을 주고, Route는 실행 가능한 경험을 제공한다.

### 2.3 User (경험의 주체)

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique ID |
| nickname | string | 표시 이름 |
| avatar | string | 프로필 이미지 |
| bio | string | 자기소개 |
| stats | UserStats | 활동 통계 |
| following | UserRef[] | 팔로잉 |
| followers | UserRef[] | 팔로워 |
| savedRoutes | RouteRef[] | 저장한 루트 |
| scheduledRoutes | Schedule[] | 일정으로 추가한 루트 |

**기존 타입과의 관계**:
- `UserProfile` → `User`로 확장 (following, savedRoutes, scheduledRoutes 추가)
- `InstagramUser` → 소셜 로그인 연동 유지

---

## 3. Core Features

### 3.1 QR Discovery (QR 기반 발견) — Pillar 1

**기존 핵심 기능을 유지하면서 새 시스템과 연결:**

```
기존 플로우 (유지):
  QR 스캔 → /spotline/[qrId] → 매장 정보 + 스토리 + 다음 장소 추천

새로운 연결:
  QR 스캔 → /spotline/[qrId] → 매장 Spot 상세
  → "이 Spot을 내 Route에 추가" 버튼
  → "이 매장이 포함된 Route" 섹션 표시
  → 다음 장소 추천 = 관련 Route의 다음 Spot
```

**QR → Route 자동 생성 시나리오**:
```
유저가 하루 동안 QR 3개 스캔:
  10:00 카페 QR → Spot A 자동 기록
  12:30 식당 QR → Spot B 자동 기록
  15:00 전시 QR → Spot C 자동 기록

하루 끝에 알림:
  "오늘 3곳을 방문했어요! Route로 만들까요?"
  → 자동으로 Route 초안 생성 (시간, 이동 거리 계산)
  → 유저가 제목/설명 추가하고 공유
```

**파트너 매장 차별화**:
- QR이 있는 Spot은 `source: "qr"` + 파트너 배지
- 매장 상세 정보 (영업시간, 연락처, 외부 링크)
- "이 매장의 특별한 점" 크루 스토리 (spotlineStory)
- 다른 유저 Spot 대비 신뢰도 높은 정보

### 3.2 Experience Capture (경험 기록) — Pillar 2

사용자가 외출 중 순간을 기록:

```
방법 1 — QR 기반 (자동):
  매장 QR 스캔 → Spot 자동 생성 → Route에 자동 추가

방법 2 — 수동 기록:
  현재 위치 감지 → Spot 생성 (사진 + 설명 + 태그)
  → 여러 Spot을 Route로 연결

방법 3 — 하이브리드:
  일부는 QR로, 일부는 수동으로 → 하나의 Route에 통합
```

**MVP 범위**: QR 스캔 Spot + 수동 Spot 생성 + 수동 Route 구성
**후속**: GPS 트래킹 기반 자동 Route 생성, QR 스캔 기반 자동 Route 초안

### 3.3 Feed & Discovery (발견) — Pillar 3

피드 구성:

| Content Type | Purpose | Priority |
|-------------|---------|----------|
| Route | 실행 가능한 경험 | 높음 |
| Spot | 영감, 순간 공유 | 중간 |
| Activity | 팔로잉 유저 활동 | 낮음 |

피드 랭킹 요소:
- 팔로잉 크리에이터의 새 콘텐츠
- 내 위치 근처 인기 경험
- 인기 급상승 Route
- 개인화 추천 (좋아한 카테고리/지역 기반)

### 3.4 Experience Replication (경험 복제 → 일정화)

**핵심 차별화 기능**: 다른 사람의 Route를 내 일정으로 변환

```
Route 발견 → "내 일정에 추가" 클릭
→ 날짜/시간 선택
→ 개인 스케줄 생성:
   17:30 한강 노을 Spot
   18:30 성수 카페
   20:00 야간 산책
```

### 3.5 Experience Evolution (경험 진화)

Route 변형 시스템:

```
원본 Route (User A)
  Sunset → Cafe → Walk

변형 1 (User B)
  Sunset → Better Cafe → Dessert

변형 2 (User C)
  Sunset → Cafe → Night Market → Walk
```

- 변형은 원본 Route와 연결 (`parentRoute`)
- 어떤 Spot이 대체/추가되었는지 비교 가능
- 시간이 지나면 **경험 그래프** 형성

### 3.6 Social Interactions

| Action | Target | Description |
|--------|--------|-------------|
| Follow | User | 크리에이터 팔로우 |
| Like | Spot, Route | 좋아요 |
| Save | Route | 나중에 보기 위해 저장 |
| Replicate | Route | 내 일정으로 변환 |
| Comment | Spot, Route | 댓글 |
| Share | Spot, Route | 외부 공유 |

---

## 4. URL & Page Structure

### 4.1 URL 설계

```
# QR Discovery (핵심 진입점)
/spotline/[qrId]            — QR 스캔 → Spot 상세 (기존 핵심, 확장)
/qr/[qrId]                  — QR 리다이렉트 → /spotline/[qrId]

# Experience Content (SEO 최적화)
/                           — 랜딩 (Hero + 피드 프리뷰)
/feed                       — 메인 피드
/spot/{spot-slug}           — Spot 상세 (SSR)
/route/{route-slug}         — Route 상세 (SSR)
/city/{city-name}           — 도시별 인기 경험 (SSR)
/theme/{theme-name}         — 테마별 경험 (SSR)

# User
/user/{user-id}             — 유저 프로필
/user/{user-id}/routes      — 유저의 Route 목록
/schedule                   — 내 일정 (인증 필요)

# Creation
/create/spot                — Spot 생성
/create/route               — Route 생성

# Legacy (점진적 마이그레이션)
/mockup/*                   — 프로토타입 (추후 제거)
```

**핵심**: `/spotline/[qrId]`는 기존대로 QR 스캔의 메인 랜딩이면서, 신규 시스템의 Spot 상세 페이지와 자연스럽게 연결된다. QR로 도달한 매장 Spot 페이지에 "이 Spot이 포함된 Route", "이 Spot을 내 Route에 추가" 등 새로운 기능이 추가된다.

### 4.3 SSR 전략

| Page | Rendering | Reason |
|------|-----------|--------|
| `/spot/{slug}` | SSR | SEO 크롤링 |
| `/route/{slug}` | SSR | SEO 크롤링 |
| `/city/{name}` | SSR + ISR | SEO + 성능 |
| `/feed` | CSR | 개인화 피드 |
| `/schedule` | CSR | 인증 필요 |
| `/create/*` | CSR | 인터랙티브 |

---

## 5. Data Architecture

### 5.1 기존 → 신규 데이터 모델 매핑

| 기존 (AS-IS) | 신규 (TO-BE) | 전환 방식 |
|-------------|-------------|----------|
| `Store` / `SpotlineStore` | `Spot` (source: "qr") | 매장 정보 → Spot + storeInfo, **QR 기능 완전 유지** |
| `QRCode` | `Spot.qrCode` | QR 정보가 Spot의 속성으로 통합 |
| `NextSpot` | `RouteSpot` | 다음 장소 추천 → Route 시스템으로 확장 (기존 추천도 유지) |
| `SpotLineSummary` | `Route` (source: "crew") | 크루 라인 → 크루가 만든 Route |
| `MockupSpot` | `Spot` | 1:1 매핑, qrCode/storeInfo/source 추가 |
| `UserProfile` | `User` | 확장 (social, schedule 추가) |
| `SpotLineAffiliation` | `Spot.storeInfo.isPartner` | 제휴 정보가 Spot 내부로 이동 |
| `ExperienceSession` | `RouteSession` | 체험 세션 → Route 진행 세션으로 확장 |

### 5.2 핵심 관계도

```
                    ┌── QR Scan ──→ Spot (source: "qr")
                    │
User ──creates──→ Spot (source: "user")
                    │
Crew ──curates──→ Spot (source: "crew")

User ──creates──→ Route ──contains──→ Spot (ordered, mixed sources)
                    │
                    ├── Route can contain QR Spots + User Spots together
                    │
User ──follows──→ User
User ──likes────→ Spot | Route
User ──saves────→ Route
User ──replicates→ Route ──becomes──→ Schedule
User ──scans-QR─→ Spot ──auto-adds─→ in-progress Route
Route ──varies──→ Route (experience evolution graph)
```

---

## 6. Technical Architecture

### 6.1 프로젝트 구조

```
front-spotLine (이 레포 — 유저 대면)
├── Spot 상세 페이지 (SSR + SEO)
├── Route 상세 페이지 (SSR + SEO)
├── 피드 / 탐색 UI
├── 도시/테마 페이지
├── QR Discovery (기존 유지)
└── 소셜 기능 (팔로우, 좋아요 등)

admin-spotLine (별도 레포 — 크루 어드민)
├── 크루 큐레이션 도구
│   ├── Place API 검색 (네이버/카카오)
│   ├── Spot 선별 + crewNote 작성
│   ├── 대량 Spot 등록/관리
│   └── Route 구성 (Spot 순서 배치)
├── 콘텐츠 관리 대시보드
└── 분석/통계

Backend (localhost:4000 — 공유)
├── Place API 프록시 + 캐싱
├── Spot/Route CRUD
├── QR Discovery API (기존)
└── 피드/탐색 API
```

**front-spotLine 기술 스택** (현재 유지):
- **Framework**: Next.js 16 App Router
- **State**: Zustand (스토어 확장)
- **Styling**: Tailwind CSS 4
- **Auth**: Instagram OAuth (현재) + 추가 소셜 로그인 검토
- **Map**: 카카오맵/네이버지도 (Route 시각화 추가)

### 6.1.1 front-spotLine 컴포넌트 구조

```
src/
├── app/
│   ├── spot/[slug]/page.tsx         ← Spot 상세 (서버 컴포넌트, SSR)
│   ├── route/[slug]/page.tsx        ← Route 상세 (서버 컴포넌트, SSR)
│   ├── feed/page.tsx                ← 메인 피드
│   ├── city/[name]/page.tsx         ← 도시별 (SSR + ISR)
│   ├── theme/[name]/page.tsx        ← 테마별 (SSR + ISR)
│   └── spotline/[qrId]/page.tsx     ← QR Discovery (기존 유지)
│
├── components/
│   ├── spot/                        ← Spot 전용
│   │   ├── SpotHero.tsx             (히어로 이미지 + 기본 정보 오버레이)
│   │   ├── SpotImageGallery.tsx     (Place API 사진 갤러리)
│   │   ├── SpotCrewNote.tsx         (크루 추천 — 차별화 핵심)
│   │   ├── SpotPlaceInfo.tsx        (Place API 매장 정보)
│   │   ├── SpotRoutes.tsx           (포함된 Route 목록)
│   │   ├── SpotNearby.tsx           (근처 Spot)
│   │   └── SpotBottomBar.tsx        (하단 고정 액션)
│   │
│   ├── route/                       ← Route 전용
│   │   ├── RouteHeader.tsx          (제목, 테마, 요약 통계)
│   │   ├── RouteTimeline.tsx        (경로 타임라인 — Route의 핵심 UI)
│   │   ├── RouteTimelineItem.tsx    (각 Spot 카드 + 이동 정보)
│   │   ├── RouteMapPreview.tsx      (경로 지도 시각화)
│   │   ├── RouteVariations.tsx      (변형 Route 목록)
│   │   └── RouteBottomBar.tsx       (내 일정에 추가)
│   │
│   ├── shared/                      ← Spot/Route 공유 카드
│   │   ├── SpotMiniCard.tsx
│   │   ├── SpotPreviewCard.tsx
│   │   ├── RoutePreviewCard.tsx
│   │   ├── TagList.tsx
│   │   └── RatingBadge.tsx
│   │
│   ├── map/                         ← 기존 유지 + 확장
│   ├── common/                      ← 기존 유지
│   ├── spotline/                    ← 기존 유지 (QR 시스템)
│   └── layout/                      ← 기존 유지
```

**핵심 설계 원칙**:
- Spot/Route 상세 = 서버 컴포넌트(SSR) → SEO 최적화
- Backend가 DB + Place API를 병합하여 응답 → Front는 렌더링만
- crewNote가 Place API 정보보다 위에 배치 → 차별화
- 기존 컴포넌트(ExternalMapButtons, OptimizedImage 등) 최대 재사용

### 6.1.2 Backend Place API 캐싱

```
Front → Backend GET /api/spots/:slug
                  ↓
        DB에서 Spot 조회 (naverPlaceId, kakaoPlaceId)
                  ↓
        캐시 확인 (키: place:{provider}:{placeId})
          ├─ 히트 → 캐시된 PlaceInfo 반환
          └─ 미스 → 네이버/카카오 API 호출 → 캐시 저장 (TTL 24h)
                  ↓
        Spot + PlaceInfo + Routes + NearbySpots 병합 응답
```

| 항목 | 설정 |
|------|------|
| 캐시 대상 | PlaceInfo (영업시간, 평점, 사진, 전화번호) |
| TTL | 24시간 |
| 캐시 저장소 | Phase 1: 인메모리, Phase 2+: Redis |
| Rate Limit | 네이버 25K/일, 카카오 100K/일 — 300 Spot은 충분 |
| 폴백 | Place API 실패 시 placeInfo: null (DB 데이터만 표시) |

### 6.2 Backend API 확장 필요 사항

```
# Place API 프록시 (네이버/카카오 → 캐싱)
GET    /api/places/search      — 장소 검색 (크루 큐레이션 도구용)
GET    /api/places/:placeId    — 장소 상세 (Spot 페이지 렌더링용, 24h 캐싱)
  → 네이버 Place: 매장명, 영업시간, 전화번호, 리뷰수, 평점, 사진
  → 카카오 Place: 장소 상세, 카테고리, 길찾기

# Spot CRUD
POST   /api/spots              — Spot 생성 (crew 큐레이션 / user)
GET    /api/spots/:slug        — Spot 상세 (내부 데이터 + Place API 병합)
GET    /api/spots/nearby       — 근처 Spot 검색
POST   /api/spots/bulk         — Spot 대량 등록 (크루 도구용)

# Route CRUD
POST   /api/routes             — Route 생성
GET    /api/routes/:slug       — Route 상세
GET    /api/routes/popular     — 인기 Route
POST   /api/routes/:id/replicate — Route 복제 → Schedule

# Feed & Discovery
GET    /api/feed               — 피드 (지역/테마 필터)
GET    /api/city/:name         — 도시별 경험
GET    /api/theme/:name        — 테마별 경험

# QR Discovery (기존 + 확장, 파트너 확보 후 활성화)
GET    /api/spotline/:qrId     — QR 스캔 → Spot 상세 (기존 유지)
POST   /api/spotline/:qrId/checkin — QR 체크인

# Social (Phase 6)
POST   /api/users/:id/follow   — 팔로우

# Analytics (기존 유지)
POST   /api/analytics          — 이벤트 로깅
```

### 6.3 구현 우선순위 (Phase) — 콘텐츠+SEO 우선 전략

| Phase | Scope | 레포 | Description |
|-------|-------|------|-------------|
| **Phase 1** | 데이터 모델 + Place API | Backend + 공통 | Spot/Route 타입 정의, 네이버/카카오 Place API 프록시+캐싱 |
| **Phase 2** | 크루 큐레이션 도구 | admin-spotLine | Place API 검색 → Spot 선별 → crewNote → Route 구성 |
| **Phase 3** | Spot/Route 상세 (SSR) | front-spotLine | SEO 페이지, Place API 데이터+crewNote 조합 렌더링 |
| **Phase 4** | 피드 + 탐색 UI | front-spotLine | 메인 피드, 지역/테마 필터, 도시별 페이지 |
| **Phase 5** | QR 시스템 통합 | front-spotLine | 기존 QR 페이지에 Route 연결, "포함된 Route" 섹션 |
| **Phase 6** | Social Features | front-spotLine | 좋아요, 저장, 댓글, 팔로우 |
| **Phase 7** | Experience Replication | front-spotLine | Route → Schedule 변환, 일정 관리 |
| **Phase 8** | QR 파트너 시스템 | admin + front | 파트너 대시보드, 매장 관리, 분석 |
| **Phase 9** | App 전환 | 신규 | 웹 안정화 후 React Native / PWA |

**Phase 1~2가 선행되어야** Phase 3의 Spot 페이지에 표시할 데이터가 확보됩니다.

---

## 7. Discussion Points

기획을 더 구체화하기 위해 논의가 필요한 항목들:

### 7.1 QR Discovery ↔ Experience 통합 깊이

- QR 스캔 시 자동으로 "진행 중인 Route"에 Spot을 추가할 것인가?
- 아니면 QR 스캔은 독립적이고, Route 추가는 명시적 행동으로 할 것인가?
- QR이 없는 장소(유저 Spot)와 QR 매장(파트너 Spot)의 UI 차별화 수준은?
- 기존 "다음 장소 추천(NextSpot)" 로직을 Route 기반 추천으로 전환할 것인가, 병행할 것인가?

### 7.2 Cold Start 전략 (확정)

**상황**: QR 파트너 매장 0개, 크루 인력 있음

**전략**: 콘텐츠 + SEO 우선 → 트래픽으로 매장 설득 → QR 파트너 확보

```
Stage 0: 크루 큐레이션으로 Spot 대량 등록 (런칭 전)
  → 네이버/카카오 Place API로 지역별 장소 일괄 수집
  → 크루가 선별 + 한줄 추천(crewNote) 작성
  → Route로 묶어서 테마 콘텐츠 구성
  → 목표: 서울 주요 5개 지역 200~300 Spot + 15~20 Route

Stage 1: SEO 유입 확보 (런칭 후 1~3개월)
  → SSR Spot/Route 페이지가 검색에 노출
  → "성수 데이트 코스", "을지로 카페 추천" 등 키워드 점유
  → 매장 상세 정보는 네이버/카카오 API 실시간 연동

Stage 2: 트래픽 기반 매장 설득 (3~6개월)
  → "귀하 매장이 포함된 Route가 월 N회 조회됩니다"
  → QR 파트너 계약 → 파트너 배지, 매장 관리 권한, 분석 데이터 제공
```

**결정 사항**:
- 크루 역할 = 큐레이션 (선별 + 한줄 추천 + 태그), 콘텐츠 직접 생산 아님
- 매장 정보 소스 = 네이버/카카오 Place API (DB에 매장 상세 저장 안 함)
- Instagram oEmbed = 제외
- 웹 우선 → 앱은 웹 방향 확정 후 발전

### 7.3 Spot 생성 UX

- 외출 중 실시간으로 Spot을 기록하는 방식 vs 사후 기록 방식?
- GPS 자동 추적 기능의 범위와 타이밍?
- 사진 없이 텍스트만으로도 Spot 생성이 가능한가?

### 7.4 Route 추천 알고리즘

- 어떤 기준으로 Route를 추천할 것인가?
  - 위치 근접성, 카테고리 선호, 팔로잉 크리에이터, 인기도, 시간대
- 경험 진화 그래프에서 "가장 좋은 변형"을 어떻게 판별할 것인가?

### 7.5 수익 모델

- 제휴 매장 (기존 SpotLine 파트너) 프리미엄 표시?
- Route 내 스폰서 Spot 삽입?
- 프리미엄 크리에이터 기능?

### 7.6 플랫폼 전략 (확정)

- **웹 우선**: 웹에서 방향성을 잡은 후 앱으로 발전
- Phase 1~7: 웹 (Next.js SSR + 모바일 반응형)
- Phase 9: 앱 전환 (React Native 또는 PWA)
- 모바일 웹에서도 Spot 생성이 가능하도록 반응형 UX 설계

### 7.7 프라이버시

- 현재 "익명/프라이버시 우선 설계" 원칙을 어느 수준까지 유지?
- Route 공개 범위 설정 (전체공개, 팔로워만, 비공개)?
- 위치 정보의 정밀도 제어?

---

## 8. Appendix: Concept Comparison

### 기존 Spotline vs 통합 Spotline

| Aspect | 기존 (QR + 크루) | 통합 (QR + Experience + Social) |
|--------|-----------------|-------------------------------|
| 콘텐츠 생산자 | 크루만 | 크루 + 모든 사용자 + QR 매장 |
| 핵심 콘텐츠 | 매장 정보 | 경험 (Spot + Route), QR 매장은 Spot의 한 유형 |
| 진입점 | QR 코드 스캔 | **QR 스캔 (유지)** + 피드 탐색 + 검색 + 지도 |
| 핵심 가치 | 다음 장소 제안 | QR 발견 + 경험 기록 + 복제-진화 |
| QR 역할 | 매장 정보 표시 | 매장 정보 + Route 연결 + 자동 체크인 |
| 소셜 요소 | 없음 | 팔로우, 코멘트, 복제, 변형 |
| 지도 역할 | 매장 위치 표시 | Route 시각화 + QR Spot 하이라이트 |
| SEO | 없음 | 핵심 성장 채널 |
| 수익 | QR 제휴 | QR 제휴 (강화) + 광고 + 프리미엄 |

### 경쟁/참고 서비스 비교

| Service | 공통점 | 차별점 |
|---------|--------|--------|
| Instagram | 사진/영상 공유 | Spotline은 경험 구조화 (시간+순서+이동) |
| 네이버 플레이스 | 장소 정보 | Spotline은 장소의 연결(Route)이 핵심 |
| 마이리얼트립 | 여행 코스 | Spotline은 여행뿐 아니라 일상 경험 포함 |
| AllTrails | 경로 추적 | Spotline은 하이킹뿐 아닌 모든 활동 |
| Komoot | 루트 공유 | Spotline은 경험 복제→일정화가 핵심 |
