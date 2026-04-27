# curated-collections Planning Document

> **Summary**: 큐레이션 컬렉션 시스템 — 테마/지역/시즌별 Spot·SpotLine 모음집 + 시간 기반 발견 기능
>
> **Project**: Spotline
> **Author**: Claude
> **Date**: 2026-04-22
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 현재 피드는 POPULAR/NEWEST 정렬과 지역·테마 필터만 제공하여, 크루가 선별한 큐레이션 콘텐츠를 묶어서 보여줄 방법이 없고, "이 주의 인기" 같은 시간 기반 발견이 불가능함 |
| **Solution** | Collection 엔티티를 도입하여 크루가 Spot/SpotLine을 테마별로 묶은 컬렉션을 생성하고, 시간 기반 트렌딩(주간/월간 인기) + Featured 섹션을 피드에 추가 |
| **Function/UX Effect** | 홈 피드에 Featured 컬렉션 캐러셀, 시간 기반 인기 Spot/SpotLine 섹션, 컬렉션 상세 페이지(`/collection/[slug]`), Admin에서 컬렉션 관리 도구 |
| **Core Value** | 콘텐츠 발견성 극대화 — Cold Start에서 크루 큐레이션의 가치를 컬렉션으로 극대화하고, 시간 기반 콘텐츠 순환으로 재방문 동기 부여 |

---

## 1. Overview

### 1.1 Purpose

크루가 큐레이션한 Spot/SpotLine을 의미 있는 단위(컬렉션)로 묶어 사용자에게 제공하고, 시간 기반 트렌딩으로 콘텐츠 신선도를 유지한다.

- **컬렉션**: "성수동 맛집 Best 10", "봄 데이트 코스 모음", "을지로 카페 투어" 등
- **시간 기반 발견**: "이번 주 인기 Spot", "새로 등록된 SpotLine", "월간 Best"
- **Featured**: 홈 피드 상단 에디터 픽 / 시즌 추천

### 1.2 Background

- 현재 36개 피처 완료, 피드/탐색/추천 엔진 구축됨
- 크루 큐레이션 도구(admin-spotLine)로 Spot/SpotLine 등록 가능하나, 묶음 단위 관리 불가
- POPULAR 정렬은 전체 기간 누적 → 신규 콘텐츠 노출 기회 제한
- trendingSearches.ts가 하드코딩 → 동적 트렌딩 필요

### 1.3 Related Documents

- `src/components/feed/` — 기존 피드 컴포넌트
- `src/components/explore/` — 탐색 UI
- `src/constants/themes.ts` — 7개 테마 정의
- `springboot-spotLine-backend/` — Backend API (72+ endpoints)

---

## 2. Scope

### 2.1 In Scope

- [ ] **Collection 엔티티** — Backend: Collection + CollectionItem 테이블
- [ ] **Collection CRUD API** — Backend: 생성/조회/수정/삭제 엔드포인트
- [ ] **시간 기반 트렌딩 API** — Backend: 주간/월간 인기 Spot·SpotLine 조회
- [ ] **Admin 컬렉션 관리** — admin-spotLine: 컬렉션 생성/편집/발행 도구
- [ ] **피드 컬렉션 섹션** — front-spotLine: Featured 캐러셀 + 트렌딩 섹션
- [ ] **컬렉션 상세 페이지** — front-spotLine: `/collection/[slug]` SSR 페이지

### 2.2 Out of Scope

- 유저가 직접 컬렉션 생성 (북마크 폴더) — 별도 feature
- 컬렉션 추천 알고리즘 (ML 기반) — 향후 확장
- 컬렉션 공유 QR 코드 — spotline-sharing에서 확장
- 컬렉션 댓글/좋아요 — 별도 social feature

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Repo |
|----|-------------|----------|------|
| FR-01 | Collection 엔티티: title, slug, description, coverImage, type(CURATED/TRENDING/SEASONAL), area, theme, isPublished, isFeatured, displayOrder | High | backend |
| FR-02 | CollectionItem 엔티티: collectionId, itemType(SPOT/SPOTLINE), itemId, itemOrder, editorNote | High | backend |
| FR-03 | Collection CRUD API: POST/GET/PUT/DELETE `/api/v2/collections` | High | backend |
| FR-04 | Published 컬렉션 목록 API: GET `/api/v2/collections?type=&area=&featured=true` | High | backend |
| FR-05 | 시간 기반 트렌딩 API: GET `/api/v2/trending?period=WEEK&type=SPOT` (viewsCount 기준 주간/월간 랭킹) | High | backend |
| FR-06 | Admin 컬렉션 빌더: 컬렉션 생성, Spot/SpotLine 검색 후 추가, 순서 드래그, editorNote 작성, 발행 토글 | High | admin |
| FR-07 | 피드 Featured 캐러셀: 홈 상단 `isFeatured=true` 컬렉션 슬라이드 | High | front |
| FR-08 | 피드 트렌딩 섹션: "이번 주 인기 Spot" + "새로 등록된 SpotLine" 수평 스크롤 | High | front |
| FR-09 | 컬렉션 상세 페이지: `/collection/[slug]` SSR, Spot/SpotLine 리스트, SEO 메타 | Medium | front |
| FR-10 | 컬렉션 목록 페이지: `/collections` 전체 컬렉션 그리드 | Medium | front |
| FR-11 | 동적 트렌딩 검색어: trendingSearches를 Backend 트렌딩 데이터 기반으로 교체 | Low | front |

### 3.2 Non-Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-01 | 트렌딩 API 응답 ≤ 300ms (캐싱 활용) | High |
| NFR-02 | 컬렉션 상세 페이지 SSR — SEO 크롤링 가능 | High |
| NFR-03 | 모바일 퍼스트 반응형 UI | High |
| NFR-04 | Featured 캐러셀 autoplay + swipe 지원 | Medium |

---

## 4. Technical Approach

### 4.1 Backend (springboot-spotLine-backend)

**새 엔티티:**

```
Collection
├── id (UUID)
├── slug (unique)
├── title
├── description
├── coverImageUrl
├── type: CURATED | TRENDING | SEASONAL
├── area (nullable — 지역 한정 컬렉션)
├── theme (nullable — 테마 한정 컬렉션)
├── isPublished (boolean)
├── isFeatured (boolean)
├── displayOrder (int)
├── itemCount (int — denormalized)
├── viewsCount (long)
├── createdAt / updatedAt
└── isActive (boolean)

CollectionItem
├── id (UUID)
├── collection (FK → Collection)
├── itemType: SPOT | SPOTLINE
├── itemId (UUID)
├── itemOrder (int)
├── editorNote (nullable — 한줄 소개)
├── createdAt
└── isActive (boolean)
```

**새 API 엔드포인트:**

```
# Collection CRUD (Admin)
POST   /api/v2/collections
GET    /api/v2/collections/{slug}
PUT    /api/v2/collections/{id}
DELETE /api/v2/collections/{id}

# Collection Items (Admin)
POST   /api/v2/collections/{id}/items
PUT    /api/v2/collections/{id}/items/reorder
DELETE /api/v2/collections/{id}/items/{itemId}

# Public
GET    /api/v2/collections?type=&area=&featured=&page=&size=
GET    /api/v2/collections/{slug}/items?page=&size=

# Trending
GET    /api/v2/trending/spots?period=WEEK|MONTH&area=&limit=10
GET    /api/v2/trending/spotlines?period=WEEK|MONTH&theme=&limit=10
GET    /api/v2/trending/searches?limit=8
```

**트렌딩 로직:**
- `WEEK`: 최근 7일 내 viewsCount 증가량 기준 정렬
- `MONTH`: 최근 30일 내 viewsCount 증가량
- viewsCount 스냅샷은 별도 테이블 or createdAt 기반 필터 + 정렬
- 캐싱: 트렌딩 결과 1시간 캐시 (Spring Cache)

### 4.2 Frontend (front-spotLine)

**새 페이지:**
- `/collection/[slug]/page.tsx` — 컬렉션 상세 (SSR)
- `/collections/page.tsx` — 컬렉션 목록

**새 컴포넌트:**
- `src/components/collection/CollectionCard.tsx` — 컬렉션 카드
- `src/components/collection/CollectionDetailHeader.tsx` — 상세 헤더
- `src/components/collection/CollectionItemList.tsx` — 아이템 리스트
- `src/components/feed/FeaturedCarousel.tsx` — Featured 캐러셀
- `src/components/feed/TrendingSection.tsx` — 트렌딩 섹션

**API 함수 추가 (lib/api.ts):**
- `fetchCollections()`, `fetchCollectionBySlug()`, `fetchCollectionItems()`
- `fetchTrendingSpots()`, `fetchTrendingSpotLines()`, `fetchTrendingSearches()`

**타입 추가 (types/index.ts):**
- `Collection`, `CollectionItem`, `CollectionType`, `TrendingPeriod`

### 4.3 Admin (admin-spotLine)

**새 페이지:**
- `src/pages/CollectionManagement.tsx` — 컬렉션 목록 + CRUD
- `src/pages/CollectionBuilder.tsx` — 컬렉션 빌더 (아이템 추가/순서/편집)

**기능:**
- Spot/SpotLine 검색 → 컬렉션에 추가
- 드래그 앤 드롭 순서 변경
- editorNote 인라인 편집
- 발행/Featured 토글
- coverImage 업로드

---

## 5. Implementation Order

| Step | Task | Repo | Depends On |
|------|------|------|------------|
| 1 | Collection + CollectionItem 엔티티 + Repository | backend | — |
| 2 | Collection CRUD API (Controller + Service) | backend | Step 1 |
| 3 | Trending API (spots, spotlines, searches) | backend | Step 1 |
| 4 | Admin 컬렉션 관리 페이지 + 빌더 | admin | Step 2 |
| 5 | Frontend 타입 + API 함수 추가 | front | Step 2, 3 |
| 6 | FeaturedCarousel + TrendingSection (피드 통합) | front | Step 5 |
| 7 | 컬렉션 상세/목록 페이지 (SSR + SEO) | front | Step 5 |
| 8 | 동적 트렌딩 검색어 교체 | front | Step 3 |

---

## 6. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| 트렌딩 계산 쿼리 성능 | 대량 데이터 시 느려질 수 있음 | 1시간 캐시 + 인덱스 최적화 |
| 컬렉션 콘텐츠 부족 | 런칭 시 빈 컬렉션 노출 | isPublished로 준비된 것만 노출 |
| Featured 캐러셀 UX | 과도한 자동재생은 사용성 저하 | 터치 시 멈춤, 인디케이터 표시 |

---

## 7. Success Metrics

| Metric | Target |
|--------|--------|
| 런칭 시 발행 컬렉션 수 | ≥ 5개 |
| 컬렉션 페이지 평균 체류 시간 | ≥ 60초 |
| 트렌딩 섹션 CTR | ≥ 15% |
| Featured 캐러셀 클릭률 | ≥ 10% |
