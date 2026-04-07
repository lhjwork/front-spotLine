# SpotLine Blog Builder Design Document

> **Summary**: Spot 연결 → 코스 생성 → 블록형 블로그 작성의 통합 경험 설계
>
> **Project**: Spotline (front-spotLine + springboot-spotLine-backend)
> **Author**: Claude
> **Date**: 2026-04-04
> **Status**: Draft
> **Planning Doc**: [spotLine-blog-builder.plan.md](../01-plan/features/spotLine-blog-builder.plan.md)

---

## 1. Overview

### 1.1 Design Goals

1. 유저가 Spot을 클릭/드래그로 연결해 하루 코스를 만드는 **SpotLine Builder**
2. 코스 기반으로 Spot 블록 단위 블로그를 작성하는 **Block Blog Editor**
3. 좌우 분할(에디터 + 네비게이터) + 스크롤 동기화의 직관적 UX
4. 작성 중 코스 변경 가능 (실제 활동 반영)
5. SSR 블로그 상세 페이지로 SEO 트래픽 확보

### 1.2 Design Principles

- **기존 패턴 재사용**: Admin SpotLineBuilder(@dnd-kit), 기존 API 클라이언트, Zustand 스토어 패턴 활용
- **블록 단위 저장**: 각 Spot 블록을 독립적으로 저장 → 자동 저장 효율 + 부분 손실 방지
- **모바일 퍼스트**: 좌우 분할(desktop) → 상하 배치+칩 네비게이터(mobile)
- **점진적 향상**: 기본 텍스트 → 리치 텍스트(Tiptap) → 이미지 업로드 순서로 레이어링

---

## 2. Architecture

### 2.1 Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 16)                      │
│                                                               │
│  /spotLine-builder ──→ SpotLineBuilder (SpotSearch + DnD List)     │
│                         │                                     │
│                    [코스 저장] POST /api/v2/spotLines            │
│                         │                                     │
│                    [블로그 작성] POST /api/v2/blogs           │
│                         │                                     │
│  /blog/new?spotLineId=x ─→ BlogEditor (BlockEditor + Navigator)│
│                         │                                     │
│                    [자동 저장] PUT /api/v2/blogs/{id}/blocks  │
│                    [사진 업로드] POST .../blocks/{id}/media   │
│                         │                                     │
│  /blog/[slug] ────────→ BlogDetailView (SSR)                 │
└──────────────┬──────────────────────────────────────────────-┘
               │
┌──────────────▼──────────────────────────────────────────────-┐
│              Backend (Spring Boot 3.5)                        │
│                                                               │
│  BlogController ──→ BlogService ──→ BlogRepository           │
│                                  ──→ BlogBlockRepository     │
│                                  ──→ BlogBlockMediaRepository│
│                                                               │
│  SpotLineController (기존) ──→ SpotLineService (user 생성 확장)     │
│  MediaController (기존) ──→ S3 Presigned URL 발급             │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
SpotLine Builder:
  Spot 검색 (GET /spots) → 클릭 추가 → DnD 정렬 → 저장 (POST /spotLines)

Blog Editor:
  SpotLine 선택 → Blog 생성 (POST /blogs, spotLineId 연결)
  → Spot별 블록 자동 생성 (INTRO + SPOT×N + TRANSITION×(N-1) + OUTRO)
  → 블록별 글 작성 (Tiptap JSON)
  → 사진 업로드 (Presigned URL → S3)
  → 자동 저장 (PUT /blogs/{id}/blocks, 30초 debounce)
  → 발행 (PATCH /blogs/{slug}/publish)

Blog Detail (SSR):
  GET /blogs/{slug} → Blog + Blocks + Media + SpotLine 정보 → SSR 렌더링
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| SpotLineBuilder | @dnd-kit/core, @dnd-kit/sortable | Spot 순서 드래그&드롭 |
| BlockEditor | @tiptap/react, @tiptap/starter-kit | 리치 텍스트 블록 에디터 |
| BlogAutoSave | useBlogEditorStore (Zustand) | 자동 저장 상태 관리 |
| Image Upload | MediaController (기존) | S3 Presigned URL 발급 |
| Blog SSR | BlogController (신규) | 블로그 데이터 API |

---

## 3. Data Model

### 3.1 Backend Entity — Blog

```java
@Entity
@Table(name = "blogs", indexes = {
    @Index(name = "idx_blog_slug", columnList = "slug", unique = true),
    @Index(name = "idx_blog_user", columnList = "userId"),
    @Index(name = "idx_blog_spotLine", columnList = "spotLine_id"),
    @Index(name = "idx_blog_status", columnList = "status"),
    @Index(name = "idx_blog_active", columnList = "isActive")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Blog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String slug;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spotLine_id", nullable = false)
    private SpotLine spotLine;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String userName;

    private String userAvatarUrl;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String summary;

    private String coverImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BlogStatus status = BlogStatus.DRAFT;

    @OneToMany(mappedBy = "blog", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("blockOrder ASC")
    @Builder.Default
    private List<BlogBlock> blocks = new ArrayList<>();

    // Stats
    @Builder.Default
    private Integer viewsCount = 0;
    @Builder.Default
    private Integer likesCount = 0;
    @Builder.Default
    private Integer savesCount = 0;

    private LocalDateTime publishedAt;

    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

### 3.2 Backend Entity — BlogBlock

```java
@Entity
@Table(name = "blog_blocks", indexes = {
    @Index(name = "idx_block_blog", columnList = "blog_id"),
    @Index(name = "idx_block_order", columnList = "blog_id, blockOrder")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BlogBlock {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blog_id", nullable = false)
    private Blog blog;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spot_id")
    private Spot spot;  // nullable — INTRO/TRANSITION/OUTRO는 null

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BlogBlockType blockType;  // INTRO, SPOT, TRANSITION, OUTRO

    @Column(nullable = false)
    private Integer blockOrder;

    @Column(columnDefinition = "TEXT")
    private String content;  // Tiptap JSON string

    @OneToMany(mappedBy = "blogBlock", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("mediaOrder ASC")
    @Builder.Default
    private List<BlogBlockMedia> mediaItems = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

### 3.3 Backend Entity — BlogBlockMedia

```java
@Entity
@Table(name = "blog_block_media", indexes = {
    @Index(name = "idx_media_block", columnList = "blog_block_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BlogBlockMedia {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blog_block_id", nullable = false)
    private BlogBlock blogBlock;

    @Column(nullable = false)
    private String mediaUrl;

    @Column(nullable = false)
    @Builder.Default
    private Integer mediaOrder = 0;

    private String caption;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

### 3.4 Enums

```java
public enum BlogStatus {
    DRAFT, PUBLISHED
}

public enum BlogBlockType {
    INTRO, SPOT, TRANSITION, OUTRO
}
```

### 3.5 Entity Relationships

```
User ──1:N──→ Blog ──N:1──→ SpotLine
                │
                └──1:N──→ BlogBlock ──N:1──→ Spot (nullable)
                              │
                              └──1:N──→ BlogBlockMedia
```

### 3.6 Frontend Types (추가)

```typescript
// ============================================================
// Blog 타입 (SpotLine Blog Builder)
// ============================================================

export type BlogStatus = "DRAFT" | "PUBLISHED";
export type BlogBlockType = "INTRO" | "SPOT" | "TRANSITION" | "OUTRO";

export interface BlogResponse {
  id: string;
  slug: string;
  spotLineId: string;
  userId: string;
  userName: string;
  userAvatarUrl: string | null;
  title: string;
  summary: string | null;
  coverImageUrl: string | null;
  status: BlogStatus;
  viewsCount: number;
  likesCount: number;
  savesCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogDetailResponse extends BlogResponse {
  spotLine: SpotLineDetailResponse;
  blocks: BlogBlockResponse[];
}

export interface BlogBlockResponse {
  id: string;
  spotId: string | null;
  blockType: BlogBlockType;
  blockOrder: number;
  content: string | null;  // Tiptap JSON string
  mediaItems: BlogBlockMediaResponse[];
  // Spot 정보 (SPOT 블록일 때)
  spotTitle: string | null;
  spotCategory: string | null;
  spotArea: string | null;
  spotAddress: string | null;
  spotMedia: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BlogBlockMediaResponse {
  id: string;
  mediaUrl: string;
  mediaOrder: number;
  caption: string | null;
}

export interface BlogListItem {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  coverImageUrl: string | null;
  status: BlogStatus;
  userName: string;
  userAvatarUrl: string | null;
  spotLineTitle: string;
  spotLineArea: string;
  spotCount: number;
  viewsCount: number;
  likesCount: number;
  publishedAt: string | null;
  createdAt: string;
}

// 요청 DTO
export interface CreateBlogRequest {
  spotLineId: string;
  title: string;
}

export interface UpdateBlogRequest {
  title?: string;
  summary?: string;
  coverImageUrl?: string;
}

export interface SaveBlogBlocksRequest {
  blocks: {
    id?: string;          // 기존 블록 업데이트 시
    spotId?: string;
    blockType: BlogBlockType;
    blockOrder: number;
    content: string | null;
    mediaItems: {
      id?: string;
      mediaUrl: string;
      mediaOrder: number;
      caption?: string;
    }[];
  }[];
}
```

---

## 4. API Specification

### 4.1 Blog API Endpoints

| Method | Path | Description | Auth | Response |
|--------|------|-------------|------|----------|
| POST | `/api/v2/blogs` | 블로그 생성 (초안 + 블록 자동 생성) | Required | `201 BlogDetailResponse` |
| GET | `/api/v2/blogs/{slug}` | 블로그 상세 | Public (PUBLISHED) / Owner (DRAFT) | `200 BlogDetailResponse` |
| PUT | `/api/v2/blogs/{slug}` | 블로그 메타 수정 (제목, 소개, 커버) | Owner | `200 BlogResponse` |
| DELETE | `/api/v2/blogs/{slug}` | 블로그 삭제 (soft delete) | Owner | `204` |
| PATCH | `/api/v2/blogs/{slug}/publish` | 블로그 발행 | Owner | `200 BlogResponse` |
| PATCH | `/api/v2/blogs/{slug}/unpublish` | 블로그 비공개 전환 | Owner | `200 BlogResponse` |
| GET | `/api/v2/blogs` | 블로그 목록 (Published only) | Public | `Page<BlogListItem>` |
| GET | `/api/v2/users/me/blogs` | 내 블로그 (Draft+Published) | Required | `Page<BlogListItem>` |
| GET | `/api/v2/blogs/slugs` | 블로그 slug 목록 (SSR용) | Public | `List<String>` |
| PUT | `/api/v2/blogs/{blogId}/blocks` | 블록 일괄 저장 (자동 저장) | Owner | `200 List<BlogBlockResponse>` |

### 4.2 Detailed API Specs

#### `POST /api/v2/blogs` — 블로그 생성

SpotLine의 Spot 구성을 기반으로 블록을 자동 생성한다.

**Request:**
```json
{
  "spotLineId": "uuid",
  "title": "연남동 카페&와인 데이트"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "slug": "yeonnam-cafe-wine-date",
  "spotLineId": "uuid",
  "title": "연남동 카페&와인 데이트",
  "status": "DRAFT",
  "spotLine": { ... },
  "blocks": [
    { "id": "uuid", "blockType": "INTRO", "blockOrder": 0, "spotId": null, "content": null },
    { "id": "uuid", "blockType": "SPOT", "blockOrder": 1, "spotId": "spot-a-uuid", "spotTitle": "바모스커피", "content": null },
    { "id": "uuid", "blockType": "TRANSITION", "blockOrder": 2, "spotId": null, "content": null },
    { "id": "uuid", "blockType": "SPOT", "blockOrder": 3, "spotId": "spot-b-uuid", "spotTitle": "연남서점", "content": null },
    { "id": "uuid", "blockType": "TRANSITION", "blockOrder": 4, "spotId": null, "content": null },
    { "id": "uuid", "blockType": "SPOT", "blockOrder": 5, "spotId": "spot-c-uuid", "spotTitle": "연남동 와인바", "content": null },
    { "id": "uuid", "blockType": "OUTRO", "blockOrder": 6, "spotId": null, "content": null }
  ]
}
```

**블록 자동 생성 로직:**
```
blocks = [INTRO]
for each SpotLineSpot (ordered):
    if not first: blocks.add(TRANSITION)
    blocks.add(SPOT with spotId)
blocks.add(OUTRO)
reindex blockOrder 0..N
```

#### `PUT /api/v2/blogs/{blogId}/blocks` — 블록 일괄 저장

자동 저장 시 전체 블록 상태를 전송한다. 서버는 기존 블록을 교체(orphanRemoval)한다.

**Request:**
```json
{
  "blocks": [
    {
      "id": "existing-block-uuid",
      "blockType": "INTRO",
      "blockOrder": 0,
      "content": "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"오늘의 데이트 코스!\"}]}]}",
      "mediaItems": []
    },
    {
      "id": "existing-block-uuid",
      "spotId": "spot-a-uuid",
      "blockType": "SPOT",
      "blockOrder": 1,
      "content": "{\"type\":\"doc\",\"content\":[...]}",
      "mediaItems": [
        { "mediaUrl": "https://s3.../photo1.jpg", "mediaOrder": 0, "caption": "루프탑 뷰" }
      ]
    }
  ]
}
```

**Response (200):** 저장된 블록 리스트 반환

#### `PATCH /api/v2/blogs/{slug}/publish` — 블로그 발행

**Validation:**
- 최소 1개 SPOT 블록에 content가 있어야 발행 가능
- title 필수, summary 권장
- status → PUBLISHED, publishedAt 기록

**Response (200):** BlogResponse (status: "PUBLISHED")

---

## 5. UI/UX Design

### 5.1 SpotLine Builder 페이지 (`/spotLine-builder`)

```
Desktop (≥ 768px):
┌──────────────────────┬──────────────────────────────────┐
│  Spot 검색 (좌측)      │  내 코스 (우측)                    │
│                      │                                  │
│  [🔍 검색어 입력]     │  ┌────────────────────────────┐  │
│                      │  │ ☰ ① 바모스커피        ✕    │  │
│  지역: [연남/연희 ▾]  │  │ ↕ 도보 5분 · 350m         │  │
│  카테고리: [전체 ▾]   │  │ ☰ ② 연남서점          ✕    │  │
│                      │  │ ↕ 도보 8분 · 500m         │  │
│  ┌────────────────┐  │  │ ☰ ③ 연남동 와인바      ✕    │  │
│  │ 바모스커피  [+]  │  │  └────────────────────────────┘  │
│  │ 연남서점    [+]  │  │                                  │
│  │ 카페 레이어 [+]  │  │  제목: [연남동 카페&와인 데이트]   │
│  │ (무한 스크롤)    │  │  테마: [데이트 ▾]                 │
│  └────────────────┘  │  지역: 연남/연희 (자동 추론)       │
│                      │                                  │
│                      │  [코스 저장]  [블로그 작성 →]      │
└──────────────────────┴──────────────────────────────────┘

Mobile (< 768px):
┌──────────────────────────┐
│  코스 만들기               │
│  [🔍 Spot 검색...]        │
│  [연남/연희 ▾] [전체 ▾]    │
│                          │
│  검색 결과:               │
│  ┌────────────────────┐  │
│  │ 바모스커피 ··· [+]  │  │
│  │ 연남서점 ····· [+]  │  │
│  └────────────────────┘  │
│                          │
│  내 코스 (3개):           │
│  ┌────────────────────┐  │
│  │ ① 바모스커피 ✕ ☰   │  │
│  │ ↕ 도보 5분          │  │
│  │ ② 연남서점 ✕ ☰     │  │
│  └────────────────────┘  │
│                          │
│  [코스 저장] [블로그 작성] │
└──────────────────────────┘
```

### 5.2 Blog Editor 페이지 (`/blog/new?spotLineId=x` 또는 `/blog/edit/[slug]`)

```
Desktop (≥ 1024px):
┌───────────────────────────────────┬─────────────────────────┐
│  📝 블로그 에디터 (좌측 ~70%)      │  📍 코스 네비게이터 (우측) │
│                                   │                         │
│  [📷 커버 이미지 영역]             │  ● ① 바모스커피 ←활성   │
│                                   │  │  카페 · 연남동        │
│  ┌───────────────────────────┐    │  ○ ② 연남서점           │
│  │ ✨ 인트로                  │    │  │  서점 · 연남동        │
│  │ 오늘의 데이트 코스를 소개... │    │  ○ ③ 연남동 와인바      │
│  └───────────────────────────┘    │     바 · 연남동          │
│                                   │                         │
│  ┌───────────────────────────┐    │  ─────────────────      │
│  │ 📍 바모스커피              │    │  [+ Spot 추가]          │
│  │ 카페 · 연남동              │    │                         │
│  │ ─────────────────────── │    │  [코스 수정 ✏️]           │
│  │ 연남동에서 가장 좋아하는    │    │                         │
│  │ 카페. 루프탑에서 보는 뷰... │    │                         │
│  │                           │    │                         │
│  │ [📷 사진 추가]            │    │                         │
│  │ 🖼 🖼 🖼                  │    │                         │
│  └───────────────────────────┘    │                         │
│                                   │                         │
│  ↕ 바모스커피 → 연남서점           │                         │
│  [골목길로 5분, 벽화거리를 지나서] │                         │
│                                   │                         │
│  ┌───────────────────────────┐    │                         │
│  │ 📍 연남서점                │    │                         │
│  │ 서점 · 연남동              │    │                         │
│  │ ─────────────────────── │    │                         │
│  │ (여기에 글을 작성하세요)    │    │                         │
│  └───────────────────────────┘    │                         │
│                                   │                         │
│  [초안 저장]         [발행하기]    │                         │
├───────────────────────────────────┴─────────────────────────┤
│  💾 자동 저장됨 · 마지막 저장: 2분 전                          │
└─────────────────────────────────────────────────────────────┘

Tablet (768px ~ 1023px):
  우측 네비게이터를 접을 수 있는 토글 패널로 전환

Mobile (< 768px):
┌──────────────────────────┐
│  블로그 작성               │
│  ┌────────────────────┐  │
│  │ ●바모스 ○연남서점    │  │  ← 상단 고정, 수평 스크롤 칩
│  │ ○와인바              │  │
│  └────────────────────┘  │
│                          │
│  [📷 커버]               │
│                          │
│  📍 바모스커피             │
│  ────────────────────── │
│  연남동에서 가장 좋아하는  │
│  카페...                 │
│  [📷 사진 추가]           │
│                          │
│  ↕ → 연남서점 (도보 5분)  │
│                          │
│  📍 연남서점               │
│  (여기에 글을 작성하세요)  │
│                          │
│  [초안 저장]  [발행하기]   │
│                          │
│  💾 자동 저장: 2분 전      │
└──────────────────────────┘
```

### 5.3 Blog Detail 페이지 (`/blog/[slug]`) — SSR

```
┌─────────────────────────────────┐
│  [← 블로그 목록]                 │
│                                 │
│  📷 커버 이미지 (Hero)           │
│                                 │
│  연남동 카페&와인 데이트          │
│  by 유저닉네임 · 2026.04.04     │
│  ❤️ 12  🔖 5  👁️ 234           │
│                                 │
│  "오늘의 데이트 코스를 소개..."   │
│                                 │
│  ── 코스: 바모스커피 → 연남서점  │
│     → 연남동 와인바               │
│                                 │
│  ┌─────────────────────────┐    │
│  │ 📍 바모스커피  →상세보기  │    │
│  │ 카페 · 연남동             │    │
│  │                          │    │
│  │ 연남동에서 가장 좋아하는   │    │
│  │ 카페. 루프탑에서 보는 뷰.. │    │
│  │                          │    │
│  │ 🖼 🖼 🖼 (사진 갤러리)   │    │
│  └─────────────────────────┘    │
│                                 │
│  ↕ 골목길로 5분                  │
│                                 │
│  ┌─────────────────────────┐    │
│  │ 📍 연남서점  →상세보기    │    │
│  │ ...                      │    │
│  └─────────────────────────┘    │
│                                 │
│  "오늘 하루 정말 좋았다..."      │
│                                 │
│  [❤️ 좋아요] [🔖 저장] [↗ 공유] │
│  [💬 댓글 (향후)]                │
└─────────────────────────────────┘
```

---

## 6. Component Architecture

### 6.1 SpotLine Builder Components

| Component | Location | Responsibility |
|-----------|----------|----------------|
| `SpotLineBuilderPage` | `app/spotLine-builder/page.tsx` | 페이지 셸, auth 체크 |
| `SpotLineBuilder` | `components/spotLine-builder/SpotLineBuilder.tsx` | 2패널 레이아웃 오케스트레이터 |
| `SpotSearchPanel` | `components/spotLine-builder/SpotSearchPanel.tsx` | Spot 검색+필터+결과 리스트 |
| `SpotSearchCard` | `components/spotLine-builder/SpotSearchCard.tsx` | 검색 결과 Spot 카드 ([+] 버튼) |
| `SelectedSpotList` | `components/spotLine-builder/SelectedSpotList.tsx` | DnD 정렬 가능한 선택된 Spot 리스트 |
| `SelectedSpotCard` | `components/spotLine-builder/SelectedSpotCard.tsx` | 드래그 핸들 + 삭제 버튼 + Spot 요약 |
| `SpotTransitionInfo` | `components/spotLine-builder/SpotTransitionInfo.tsx` | Spot 간 거리/도보 시간 표시 |
| `SpotLineMetaForm` | `components/spotLine-builder/SpotLineMetaForm.tsx` | 제목, 테마, 지역 입력 |

### 6.2 Blog Editor Components

| Component | Location | Responsibility |
|-----------|----------|----------------|
| `BlogEditorPage` | `app/blog/new/page.tsx` | 페이지 셸, spotLineId 파라미터 처리 |
| `BlogEditPage` | `app/blog/edit/[slug]/page.tsx` | 기존 블로그 수정 페이지 |
| `BlogEditor` | `components/blog/BlogEditor.tsx` | 메인 2패널 레이아웃 (에디터 + 네비게이터) |
| `BlockEditor` | `components/blog/BlockEditor.tsx` | 단일 블록 Tiptap 에디터 (SPOT/INTRO/OUTRO) |
| `TransitionBlock` | `components/blog/TransitionBlock.tsx` | TRANSITION 블록 (이동 메모, 간단 textarea) |
| `BlockMediaUpload` | `components/blog/BlockMediaUpload.tsx` | 블록 내 이미지 업로드 + 갤러리 |
| `BlockNavigator` | `components/blog/BlockNavigator.tsx` | 우측 Spot 블록 네비게이터 |
| `BlockNavigatorItem` | `components/blog/BlockNavigatorItem.tsx` | 네비게이터 내 개별 Spot 아이템 |
| `BlockNavigatorChips` | `components/blog/BlockNavigatorChips.tsx` | 모바일 상단 수평 칩 바 |
| `BlogCoverEditor` | `components/blog/BlogCoverEditor.tsx` | 커버 이미지 선택/업로드 |
| `BlogPublishSheet` | `components/blog/BlogPublishSheet.tsx` | 발행 확인 바텀시트 (제목+소개+커버) |
| `BlogAutoSaveIndicator` | `components/blog/BlogAutoSaveIndicator.tsx` | 하단 자동 저장 상태 표시 |
| `SpotAddSheet` | `components/blog/SpotAddSheet.tsx` | 블로그 작성 중 Spot 추가 바텀시트 |

### 6.3 Blog Detail Components

| Component | Location | Responsibility |
|-----------|----------|----------------|
| `BlogDetailPage` | `app/blog/[slug]/page.tsx` | SSR 페이지, generateMetadata |
| `BlogHero` | `components/blog/BlogHero.tsx` | 커버 이미지 + 제목 + 작성자 + 통계 |
| `BlogSpotLineOverview` | `components/blog/BlogSpotLineOverview.tsx` | 코스 요약 (A → B → C) |
| `BlogSpotBlock` | `components/blog/BlogSpotBlock.tsx` | Spot 블록 렌더링 (Tiptap JSON → HTML) |
| `BlogTransitionBlock` | `components/blog/BlogTransitionBlock.tsx` | 이동 메모 렌더링 |
| `BlogBlockGallery` | `components/blog/BlogBlockGallery.tsx` | 블록 내 이미지 갤러리 |

### 6.4 My Blogs Page

| Component | Location | Responsibility |
|-----------|----------|----------------|
| `MyBlogsPage` | `app/my-blogs/page.tsx` | 내 블로그 목록 페이지 |
| `MyBlogsList` | `components/blog/MyBlogsList.tsx` | Draft/Published 탭 + 블로그 카드 리스트 |
| `BlogCard` | `components/blog/BlogCard.tsx` | 블로그 목록 카드 (커버+제목+상태 뱃지) |

---

## 7. State Management

### 7.1 useBlogEditorStore (Zustand)

```typescript
interface BlogEditorState {
  // Blog meta
  blogId: string | null;
  blogSlug: string | null;
  spotLineId: string | null;
  title: string;
  summary: string;
  coverImageUrl: string | null;
  status: BlogStatus;

  // Blocks
  blocks: EditorBlock[];
  activeBlockId: string | null;

  // Save state
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
  saveError: string | null;

  // Actions
  initFromBlog: (blog: BlogDetailResponse) => void;
  setTitle: (title: string) => void;
  setSummary: (summary: string) => void;
  setCoverImage: (url: string | null) => void;
  setActiveBlock: (blockId: string) => void;
  updateBlockContent: (blockId: string, content: string) => void;
  addBlockMedia: (blockId: string, media: BlogBlockMediaResponse) => void;
  removeBlockMedia: (blockId: string, mediaId: string) => void;

  // Spot mutation (코스 수정)
  addSpot: (spot: SpotForBuilder, afterBlockId?: string) => void;
  removeSpot: (spotId: string) => void;
  reorderSpots: (spotIds: string[]) => void;

  // Save
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  markDirty: () => void;
}

interface EditorBlock {
  id: string;
  blockType: BlogBlockType;
  blockOrder: number;
  spotId: string | null;
  spotTitle: string | null;
  spotCategory: string | null;
  spotArea: string | null;
  content: string | null;  // Tiptap JSON
  mediaItems: BlogBlockMediaResponse[];
}
```

### 7.2 자동 저장 로직

```typescript
// BlogAutoSave hook
function useBlogAutoSave() {
  const { isDirty, saveDraft, blogId } = useBlogEditorStore();

  useEffect(() => {
    if (!isDirty || !blogId) return;

    const timer = setTimeout(() => {
      saveDraft().catch((err) => {
        // 네트워크 실패 시 로컬스토리지 백업
        localStorage.setItem(`blog-backup-${blogId}`, JSON.stringify(getState()));
      });
    }, 30_000); // 30초 debounce

    return () => clearTimeout(timer);
  }, [isDirty, blogId]);
}
```

### 7.3 스크롤 동기화

```typescript
// 좌측 에디터 스크롤 → 우측 네비게이터 활성 블록 동기화
function useScrollSync(blockRefs: Map<string, HTMLElement>) {
  const { setActiveBlock } = useBlogEditorStore();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting && e.intersectionRatio > 0.3)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          const blockId = visible[0].target.getAttribute('data-block-id');
          if (blockId) setActiveBlock(blockId);
        }
      },
      { threshold: [0.3, 0.7], rootMargin: '-80px 0px -40% 0px' }
    );

    blockRefs.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [blockRefs]);
}

// 우측 네비게이터 클릭 → 좌측 에디터 스크롤
function scrollToBlock(blockId: string) {
  const el = document.querySelector(`[data-block-id="${blockId}"]`);
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
```

---

## 8. Backend Service Design

### 8.1 BlogService

```java
@Service
@RequiredArgsConstructor
public class BlogService {

    private final BlogRepository blogRepository;
    private final BlogBlockRepository blogBlockRepository;
    private final SpotLineRepository spotLineRepository;
    private final SpotRepository spotRepository;
    private final Slugify slugify;

    // 블로그 생성 + 블록 자동 생성
    public BlogDetailResponse create(UUID userId, CreateBlogRequest req) {
        SpotLine spotLine = spotLineRepository.findById(req.getSpotLineId())
            .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "SpotLine를 찾을 수 없습니다"));

        Blog blog = Blog.builder()
            .slug(generateSlug(req.getTitle()))
            .spotLine(spotLine)
            .userId(userId)
            .userName(getUserName(userId))
            .title(req.getTitle())
            .build();

        // 블록 자동 생성: INTRO + (SPOT + TRANSITION) × N + OUTRO
        List<BlogBlock> blocks = new ArrayList<>();
        int order = 0;

        blocks.add(BlogBlock.builder()
            .blog(blog).blockType(BlogBlockType.INTRO).blockOrder(order++).build());

        List<SpotLineSpot> spotLineSpots = spotLine.getSpots();
        for (int i = 0; i < spotLineSpots.size(); i++) {
            if (i > 0) {
                blocks.add(BlogBlock.builder()
                    .blog(blog).blockType(BlogBlockType.TRANSITION).blockOrder(order++).build());
            }
            blocks.add(BlogBlock.builder()
                .blog(blog).spot(spotLineSpots.get(i).getSpot())
                .blockType(BlogBlockType.SPOT).blockOrder(order++).build());
        }

        blocks.add(BlogBlock.builder()
            .blog(blog).blockType(BlogBlockType.OUTRO).blockOrder(order).build());

        blog.setBlocks(blocks);
        blogRepository.save(blog);

        return toDetailResponse(blog);
    }

    // 블록 일괄 저장 (자동 저장)
    @Transactional
    public List<BlogBlockResponse> saveBlocks(UUID blogId, UUID userId, SaveBlogBlocksRequest req) {
        Blog blog = blogRepository.findById(blogId)
            .orElseThrow(() -> new ResponseStatusException(NOT_FOUND));

        if (!blog.getUserId().equals(userId)) {
            throw new ResponseStatusException(FORBIDDEN, "본인 블로그만 수정 가능합니다");
        }

        // 기존 블록 제거 후 재생성 (orphanRemoval)
        blog.getBlocks().clear();

        for (var blockReq : req.getBlocks()) {
            Spot spot = blockReq.getSpotId() != null
                ? spotRepository.findById(blockReq.getSpotId()).orElse(null)
                : null;

            BlogBlock block = BlogBlock.builder()
                .blog(blog)
                .spot(spot)
                .blockType(blockReq.getBlockType())
                .blockOrder(blockReq.getBlockOrder())
                .content(blockReq.getContent())
                .build();

            // Media items
            if (blockReq.getMediaItems() != null) {
                for (var mediaReq : blockReq.getMediaItems()) {
                    block.getMediaItems().add(BlogBlockMedia.builder()
                        .blogBlock(block)
                        .mediaUrl(mediaReq.getMediaUrl())
                        .mediaOrder(mediaReq.getMediaOrder())
                        .caption(mediaReq.getCaption())
                        .build());
                }
            }

            blog.getBlocks().add(block);
        }

        blog.setUpdatedAt(LocalDateTime.now());
        blogRepository.save(blog);

        return blog.getBlocks().stream().map(this::toBlockResponse).toList();
    }

    // 발행
    public BlogResponse publish(String slug, UUID userId) {
        Blog blog = findBySlugAndOwner(slug, userId);

        // 최소 1개 SPOT 블록에 content가 있어야 함
        boolean hasContent = blog.getBlocks().stream()
            .anyMatch(b -> b.getBlockType() == BlogBlockType.SPOT
                        && b.getContent() != null
                        && !b.getContent().isBlank());

        if (!hasContent) {
            throw new ResponseStatusException(BAD_REQUEST, "최소 1개 Spot에 글을 작성해야 발행 가능합니다");
        }

        blog.setStatus(BlogStatus.PUBLISHED);
        blog.setPublishedAt(LocalDateTime.now());
        blogRepository.save(blog);

        return toResponse(blog);
    }
}
```

### 8.2 BlogController

```java
@RestController
@RequestMapping("/api/v2/blogs")
@RequiredArgsConstructor
@Tag(name = "Blog", description = "블로그 API")
public class BlogController {

    @PostMapping
    @Operation(summary = "블로그 생성 (초안)")
    public ResponseEntity<BlogDetailResponse> create(@AuthUser UUID userId,
                                                      @Valid @RequestBody CreateBlogRequest req) {
        return ResponseEntity.status(201).body(blogService.create(userId, req));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "블로그 상세 조회")
    public BlogDetailResponse getBySlug(@PathVariable String slug,
                                         @AuthUser(required = false) UUID userId) {
        return blogService.getBySlug(slug, userId);
    }

    @PutMapping("/{slug}")
    @Operation(summary = "블로그 메타 수정")
    public BlogResponse update(@PathVariable String slug,
                                @AuthUser UUID userId,
                                @Valid @RequestBody UpdateBlogRequest req) {
        return blogService.update(slug, userId, req);
    }

    @DeleteMapping("/{slug}")
    @Operation(summary = "블로그 삭제")
    public ResponseEntity<Void> delete(@PathVariable String slug, @AuthUser UUID userId) {
        blogService.delete(slug, userId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{slug}/publish")
    @Operation(summary = "블로그 발행")
    public BlogResponse publish(@PathVariable String slug, @AuthUser UUID userId) {
        return blogService.publish(slug, userId);
    }

    @PatchMapping("/{slug}/unpublish")
    @Operation(summary = "블로그 비공개 전환")
    public BlogResponse unpublish(@PathVariable String slug, @AuthUser UUID userId) {
        return blogService.unpublish(slug, userId);
    }

    @GetMapping
    @Operation(summary = "블로그 목록 (공개)")
    public Page<BlogListItem> list(@RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "20") int size,
                                    @RequestParam(required = false) String area) {
        return blogService.listPublished(page, size, area);
    }

    @GetMapping("/slugs")
    @Operation(summary = "블로그 slug 목록")
    public List<String> getSlugs() {
        return blogService.getAllSlugs();
    }

    @PutMapping("/{blogId}/blocks")
    @Operation(summary = "블록 일괄 저장")
    public List<BlogBlockResponse> saveBlocks(@PathVariable UUID blogId,
                                               @AuthUser UUID userId,
                                               @Valid @RequestBody SaveBlogBlocksRequest req) {
        return blogService.saveBlocks(blogId, userId, req);
    }
}
```

---

## 9. Tiptap Editor Configuration

### 9.1 Extensions (최소 구성)

```typescript
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';

const extensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },   // h2, h3만 허용
    bulletList: true,
    orderedList: true,
    bold: true,
    italic: true,
    blockquote: true,
  }),
  Placeholder.configure({
    placeholder: '여기에 글을 작성하세요...',
  }),
  Image.configure({
    inline: false,
    allowBase64: false,  // S3 URL만 허용
  }),
];
```

### 9.2 Dynamic Import (번들 최적화)

```typescript
// components/blog/BlockEditor.tsx
import dynamic from 'next/dynamic';

const TiptapEditor = dynamic(() => import('./TiptapEditor'), {
  ssr: false,
  loading: () => <div className="h-32 animate-pulse bg-gray-100 rounded-lg" />,
});
```

---

## 10. SpotLine Builder — 코스 수정 로직 (블로그 작성 중)

### 10.1 Spot 추가 시

```
현재 블록: [INTRO, SPOT-A, TRANS, SPOT-B, OUTRO]
사용자가 A와 B 사이에 Spot-C 추가:
결과: [INTRO, SPOT-A, TRANS, SPOT-C, TRANS, SPOT-B, OUTRO]

로직:
1. 삽입 위치 결정 (afterBlockId 기준)
2. 새 SPOT 블록 + 필요 시 TRANSITION 블록 추가
3. blockOrder 재계산 (0부터 재인덱싱)
4. 기존 블록의 content/mediaItems 유지
5. isDirty = true → 자동 저장 트리거
```

### 10.2 Spot 삭제 시

```
현재 블록: [INTRO, SPOT-A, TRANS, SPOT-B, TRANS, SPOT-C, OUTRO]
사용자가 SPOT-B 삭제:
결과: [INTRO, SPOT-A, TRANS, SPOT-C, OUTRO]

로직:
1. 확인 다이얼로그 표시 ("작성한 내용이 삭제됩니다")
2. SPOT 블록 + 인접 TRANSITION 1개 제거
3. blockOrder 재계산
4. isDirty = true
```

### 10.3 Spot 순서 변경 시

```
현재: A → B → C
변경: A → C → B

로직:
1. SPOT 블록의 spotId 매핑 유지한 채 순서만 변경
2. TRANSITION 블록은 위치에 따라 재배치
3. 각 블록의 content/mediaItems 완전 유지
4. blockOrder 재계산
```

---

## 11. Security Considerations

- [x] Blog CRUD는 Owner 인증 필수 (userId 비교)
- [x] DRAFT 블로그는 Owner만 조회 가능
- [x] 이미지 업로드는 기존 MediaController Presigned URL 사용 (인증 필수)
- [x] Tiptap content는 JSON으로 저장 → XSS 위험 없음 (렌더링 시 Tiptap 자체 sanitize)
- [x] Slug 생성 시 중복 충돌 방지 (suffix -1, -2, ...)
- [x] Blog 삭제는 soft delete (isActive = false)

---

## 12. SEO Strategy (Blog Detail)

```typescript
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const blog = await getBlogBySlug(params.slug);
  const firstSpotBlock = blog.blocks.find(b => b.blockType === 'SPOT');

  return {
    title: `${blog.title} | Spotline 블로그`,
    description: blog.summary || `${blog.spotLine.area} ${blog.spotLine.theme} 코스 블로그`,
    openGraph: {
      title: blog.title,
      description: blog.summary,
      images: blog.coverImageUrl ? [blog.coverImageUrl] : [],
      type: 'article',
      publishedTime: blog.publishedAt,
      authors: [blog.userName],
    },
  };
}

// JSON-LD
const blogJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: blog.title,
  description: blog.summary,
  image: blog.coverImageUrl,
  author: { '@type': 'Person', name: blog.userName },
  datePublished: blog.publishedAt,
  dateModified: blog.updatedAt,
  publisher: { '@type': 'Organization', name: 'Spotline' },
};
```

---

## 13. Implementation Order

| Step | Task | Files | Dependencies | Est. Complexity |
|------|------|-------|-------------|-----------------|
| **1** | Backend: Blog Entity + Enum + Repository | `Blog.java`, `BlogBlock.java`, `BlogBlockMedia.java`, `BlogStatus.java`, `BlogBlockType.java`, `BlogRepository.java`, `BlogBlockRepository.java`, `BlogBlockMediaRepository.java` | 없음 | Low |
| **2** | Backend: DTO + BlogService + BlogController | `CreateBlogRequest.java`, `UpdateBlogRequest.java`, `SaveBlogBlocksRequest.java`, `BlogResponse.java`, `BlogListItem.java`, `BlogDetailResponse.java`, `BlogBlockResponse.java`, `BlogService.java`, `BlogController.java` | Step 1 | Medium |
| **3** | Frontend: 타입 정의 + API 클라이언트 | `types/index.ts` (Blog 타입 추가), `lib/blog-api.ts` | Step 2 | Low |
| **4** | Frontend: SpotLine Builder 페이지 | `app/create-spotline/page.tsx`, `components/spotline-builder/*` (7 컴포넌트) — **이미 구현됨** ✅ `useSpotLineBuilderStore` + `@dnd-kit` 포함 | 없음 | ~~High~~ Done |
| **5** | Frontend: Blog Editor 코어 | `app/blog/new/page.tsx`, `components/blog/BlogEditor.tsx`, `BlockEditor.tsx`, `BlockNavigator.tsx`, `BlockNavigatorItem.tsx`, `TransitionBlock.tsx`, `store/useBlogEditorStore.ts`, `tiptap` 의존성 설치 | Step 3, 4 | High |
| **6** | Frontend: 스크롤 동기화 + 이미지 업로드 + 자동 저장 | `BlockMediaUpload.tsx`, `BlogAutoSaveIndicator.tsx`, `BlockNavigatorChips.tsx`, `useBlogAutoSave` hook | Step 5 | Medium |
| **7** | Frontend: 코스 수정 (블로그 작성 중) | `SpotAddSheet.tsx`, useBlogEditorStore에 addSpot/removeSpot/reorderSpots 로직 | Step 6 | Medium |
| **8** | Frontend: 발행 + 상세 페이지 (SSR + SEO) | `BlogPublishSheet.tsx`, `BlogCoverEditor.tsx`, `app/blog/[slug]/page.tsx`, `BlogHero.tsx`, `BlogSpotBlock.tsx`, `BlogTransitionBlock.tsx`, `BlogBlockGallery.tsx`, `BlogSpotLineOverview.tsx` | Step 7 | Medium |
| **9** | Frontend: 내 블로그 목록 + 수정 페이지 | `app/my-blogs/page.tsx`, `MyBlogsList.tsx`, `BlogCard.tsx`, `app/blog/edit/[slug]/page.tsx` | Step 8 | Low |

---

## 14. New Dependencies

### Frontend (front-spotLine)

```bash
# Tiptap (리치 텍스트 에디터)
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-image @tiptap/pm

# @dnd-kit은 front-spotLine에 이미 설치됨 (create-spotline에서 사용 중)
# pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities  ← 불필요
```

### Backend (springboot-spotLine-backend)

추가 의존성 없음 — 기존 Spring Data JPA, Slugify, S3 인프라 활용

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-04 | Initial draft | Claude |
| 0.2 | 2026-04-07 | Step 4 완료 반영 (SpotLineBuilder 이미 구현), @dnd-kit 설치 상태 수정 | Claude |
