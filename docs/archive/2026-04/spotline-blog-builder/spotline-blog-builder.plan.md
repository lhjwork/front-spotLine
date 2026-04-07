# SpotLine Blog Builder Planning Document

> **Summary**: 유저가 Spot을 클릭/드래그로 연결해 하루 코스를 짜고, 그 코스를 기반으로 블로그를 작성하는 통합 경험
>
> **Project**: Spotline (front-spotLine + springboot-spotLine-backend)
> **Author**: Claude
> **Date**: 2026-04-04
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 유저가 Spot을 발견해도 하루 코스로 엮거나, 실제 경험을 기록할 방법이 없다. 현재 SpotLine 생성은 Admin 전용이고, 블로그/일기 기능이 전혀 없다. |
| **Solution** | 3단계 플로우: (1) Spot 검색+선택 → (2) 드래그&드롭으로 코스 구성 → (3) 코스 기반 블록형 블로그 작성. 좌우 분할 에디터(좌: 블로그 작성, 우: Spot 블록 네비게이터)로 Spot별 글+사진 작성. |
| **Function/UX Effect** | 유저가 "계획 → 실행 → 기록"의 전체 경험 사이클을 플랫폼 안에서 완결. Spot 블록 단위 작성으로 구조화된 고품질 콘텐츠 자동 생성. 작성 중 코스 변경 가능으로 실제 활동 반영. |
| **Core Value** | 경험 기록의 허들을 극적으로 낮춰 UGC 콘텐츠 폭발. 구조화된 블로그가 SEO 트래픽 견인. "발견 → 계획 → 기록 → 공유"라는 Spotline 핵심 루프 완성. |

---

## 1. Overview

### 1.1 Purpose

유저가 Spot을 자유롭게 조합해 하루 데이트/일정 코스를 만들고, 그 코스를 실행한 뒤 블로그로 기록하는 End-to-End 경험 플로우를 제공한다.

핵심 3단계:
1. **SpotLine Builder** — Spot 검색 → 클릭으로 추가 → 드래그&드롭으로 순서 편집
2. **SpotLine to Blog** — 완성된 코스에서 "블로그 작성" 활성화
3. **Block Blog Editor** — Spot 블록 단위로 글+사진 작성, 좌우 분할 UI

### 1.2 Background

- 현재 SpotLine 생성은 **Admin(크루) 전용**이며 유저는 조회/복제만 가능
- 블로그/글쓰기 기능이 **전혀 없음** (리치 텍스트 에디터 미존재)
- Spotline의 핵심 가치 "경험 기록 + 소셜 공유"를 구현하는 마지막 퍼즐
- Cold Start 전략: 유저가 직접 만든 SpotLine + Blog가 SEO 콘텐츠로 축적

### 1.3 Related Documents

- `front-spotLine/docs/01-plan/features/experience-social-platform.plan.md` — 전체 플랫폼 Plan
- `CLAUDE.md` — Phase 구현 현황 (Phase 1~8 완료)
- Admin SpotLineBuilder (`admin-spotLine/src/pages/SpotLineBuilder.tsx`) — 참고 패턴

---

## 2. Scope

### 2.1 In Scope

- [ ] **유저 SpotLine Builder** — Spot 검색, 클릭 추가, 드래그&드롭 순서 편집, 코스 저장
- [ ] **블로그 에디터** — 좌우 분할(에디터 + Spot 블록 네비게이터), Spot별 텍스트+사진 작성
- [ ] **Spot 블록 시스템** — 블록 활성화/비활성화, 스크롤 연동, 블록 간 이동
- [ ] **코스 유연 수정** — 블로그 작성 중에도 Spot 추가/삭제/순서 변경 가능
- [ ] **블로그 공개/초안** — 초안 저장, 공개 발행, 수정
- [ ] **블로그 상세 페이지** — SSR, SEO 최적화, SpotLine Timeline 연동
- [ ] **Backend API** — Blog CRUD, BlogBlock CRUD, 이미지 업로드 연동

### 2.2 Out of Scope

- AI 기반 블로그 자동 작성 (향후 확장)
- 다른 유저 블로그에 댓글/좋아요 (기존 Social 시스템으로 확장 가능하지만 본 스코프 외)
- 멀티데이 코스 (1일 코스만. 추후 확장)
- 협업 블로그 작성 (1인 작성만)

---

## 3. Requirements

### 3.1 Functional Requirements

#### SpotLine Builder (유저용)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | Spot 검색 (키워드, 지역, 카테고리 필터) — 기존 Spot API 활용 | High | Pending |
| FR-02 | Spot 클릭으로 코스에 추가 (최대 10개 Spot) | High | Pending |
| FR-03 | 드래그&드롭으로 Spot 순서 변경 (@dnd-kit 활용) | High | Pending |
| FR-04 | Spot 제거 (X 버튼) | High | Pending |
| FR-05 | 코스 메타 입력 — 제목, 테마, 지역 (자동 추론 + 수동 변경) | High | Pending |
| FR-06 | 코스 저장 → SpotLine 생성 API 호출 (creatorType: "user") | High | Pending |
| FR-07 | Spot 간 이동 정보 자동 계산 (거리, 도보 시간) | Medium | Pending |
| FR-08 | 코스 미리보기 (타임라인 형태) | Medium | Pending |

#### Blog Editor (블록형)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-10 | 코스 완성 후 "블로그 작성" 버튼 활성화 | High | Pending |
| FR-11 | 좌우 분할 레이아웃 — 좌: 블로그 에디터, 우: Spot 블록 네비게이터 | High | Pending |
| FR-12 | 우측 Spot 블록 리스트 — A→B→C 순서, 활성 블록 하이라이트 | High | Pending |
| FR-13 | Spot 블록 클릭 시 좌측 에디터가 해당 블록으로 스크롤 이동 | High | Pending |
| FR-14 | 좌측 에디터 스크롤 시 우측 활성 블록 자동 동기화 | High | Pending |
| FR-15 | 각 Spot 블록에서 텍스트 작성 (리치 텍스트 — 제목, 본문, 굵기, 리스트) | High | Pending |
| FR-16 | 각 Spot 블록에서 사진 업로드 (최대 10장/블록, S3 Presigned URL) | High | Pending |
| FR-17 | Spot 블록 사이에 "이동 메모" 작성 가능 (A에서 B로 가는 길에 대한 짧은 메모) | Medium | Pending |
| FR-18 | 블로그 인트로/아웃트로 블록 (코스 전체 소감) | Medium | Pending |

#### 코스 유연 수정

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-20 | 블로그 작성 중 Spot 추가 — 우측 블록 리스트에서 "+" 버튼 | High | Pending |
| FR-21 | 블로그 작성 중 Spot 삭제 — 블록에서 삭제 시 확인 다이얼로그 (작성 내용 경고) | High | Pending |
| FR-22 | 블로그 작성 중 Spot 순서 변경 — 우측 블록 드래그&드롭 | Medium | Pending |
| FR-23 | Spot 변경 시 블로그 블록 자동 재배치 (기존 작성 내용 유지) | High | Pending |

#### 발행 및 관리

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-30 | 초안 자동 저장 (30초마다 또는 블록 전환 시) | High | Pending |
| FR-31 | 블로그 발행 (공개) — 커버 이미지 선택, 한줄 소개 입력 | High | Pending |
| FR-32 | 발행된 블로그 수정 | Medium | Pending |
| FR-33 | 블로그 삭제 (soft delete) | Medium | Pending |
| FR-34 | 내 블로그 목록 (/my-blogs) | High | Pending |

#### 블로그 상세 페이지

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-40 | SSR 블로그 상세 페이지 (/blog/[slug]) | High | Pending |
| FR-41 | Spot 블록 렌더링 — Spot 카드 + 본문 + 사진 갤러리 + 이동 메모 | High | Pending |
| FR-42 | 연결된 SpotLine 타임라인 표시 | Medium | Pending |
| FR-43 | SEO 메타데이터 (OG, JSON-LD BlogPosting schema) | High | Pending |
| FR-44 | 블로그에서 각 Spot 상세로 링크 | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 블로그 에디터 초기 로드 < 2초 | Lighthouse |
| Performance | 이미지 업로드 Presigned URL 발급 < 500ms | API 응답 시간 |
| Performance | 자동 저장 debounce 30초, 네트워크 실패 시 로컬 백업 | 동작 검증 |
| UX | 모바일에서 좌우 분할 → 상하 전환 (반응형) | 768px breakpoint |
| SEO | 블로그 상세 페이지 LCP < 2.5초 | Core Web Vitals |
| Accessibility | 키보드로 블록 이동 가능, 포커스 관리 | 수동 테스트 |

---

## 4. User Flow

### 4.1 전체 플로우

```
[Spot 탐색/피드] → [코스 만들기] → [Spot 추가/정렬] → [코스 저장]
                                                          ↓
                            [블로그 작성] ← [내 코스 목록에서 선택]
                                 ↓
                    [Spot 블록별 글+사진 작성]
                                 ↓
                 [초안 저장 / 발행] → [블로그 상세 페이지]
```

### 4.2 SpotLine Builder 플로우

```
┌─────────────────────────────────────────────────────────┐
│  코스 만들기                                              │
├──────────────────────┬──────────────────────────────────┤
│  Spot 검색            │  내 코스                          │
│  ┌─────────────────┐ │  ┌────────────────────────────┐  │
│  │ 🔍 연남동 카페    │ │  │  ① 바모스커피        ✕  ☰  │  │
│  └─────────────────┘ │  │  ↕ 도보 5분 (350m)         │  │
│                      │  │  ② 연남서점          ✕  ☰  │  │
│  지역: 연남/연희      │  │  ↕ 도보 8분 (500m)         │  │
│  카테고리: 전체  ▾    │  │  ③ 연남동 와인바      ✕  ☰  │  │
│                      │  └────────────────────────────┘  │
│  ┌─────────────────┐ │                                  │
│  │ 바모스커피    [+] │ │  제목: 연남동 카페&와인 데이트     │
│  │ 연남서점      [+] │ │  테마: 데이트 ▾                  │
│  │ 카페 레이어   [+] │ │  지역: 연남/연희 (자동)           │
│  │ ...              │ │                                  │
│  └─────────────────┘ │  [코스 저장]  [블로그 작성 →]      │
└──────────────────────┴──────────────────────────────────┘
```

- 좌측: Spot 검색 패널 (기존 Spot API 활용)
- 우측: 선택된 Spot 리스트 (드래그&드롭 정렬, ✕ 제거, ☰ 핸들)
- 하단: 메타 정보 + 액션 버튼
- "블로그 작성 →" 버튼은 최소 1개 Spot 추가 시 활성화

### 4.3 Blog Editor 플로우

```
┌─────────────────────────────────────────────────────────────────┐
│  블로그 작성 — 연남동 카페&와인 데이트                              │
├────────────────────────────────────┬────────────────────────────┤
│  📝 블로그 에디터 (좌측)            │  📍 코스 블록 (우측)         │
│                                    │                            │
│  [커버 이미지 영역]                 │  ● ① 바모스커피  ◄── 활성   │
│                                    │  │                         │
│  ┌──────────────────────────────┐  │  ○ ② 연남서점              │
│  │ 📍 바모스커피                 │  │  │                         │
│  │ ─────────────────────────── │  │  ○ ③ 연남동 와인바          │
│  │ 연남동에서 가장 좋아하는       │  │                            │
│  │ 카페. 루프탑에서 보는 뷰가     │  │  ──────────────────       │
│  │ 정말 좋다.                   │  │  [+ Spot 추가]             │
│  │                              │  │                            │
│  │ [📷 사진 추가]               │  │  코스 수정:                │
│  │ 🖼 🖼 🖼                     │  │  Spot 드래그로 순서 변경    │
│  └──────────────────────────────┘  │  ✕ 클릭으로 Spot 제거      │
│                                    │                            │
│  ↕ 바모스커피 → 연남서점            │                            │
│  "골목길로 5분, 벽화거리 지나서"     │                            │
│                                    │                            │
│  ┌──────────────────────────────┐  │                            │
│  │ 📍 연남서점                   │  │                            │
│  │ ─────────────────────────── │  │                            │
│  │ (여기에 글을 작성하세요...)     │  │                            │
│  └──────────────────────────────┘  │                            │
│                                    │                            │
│  [초안 저장]        [발행하기]      │                            │
├────────────────────────────────────┴────────────────────────────┤
│  자동 저장됨 · 마지막 저장: 2분 전                                 │
└─────────────────────────────────────────────────────────────────┘
```

**동작 규칙:**
1. 우측 블록 클릭 → 좌측 에디터가 해당 Spot 블록으로 스크롤
2. 좌측 에디터 스크롤 → 우측 활성 블록 자동 동기화 (Intersection Observer)
3. 블록 사이 "이동 메모" = Spot 간 전환 경험 기록
4. 우측에서 Spot 추가/삭제/순서 변경 → 좌측 블록 실시간 재배치 (기존 내용 유지)

### 4.4 모바일 반응형 (< 768px)

```
┌──────────────────────────┐
│  블로그 작성               │
│  ┌────────────────────┐  │
│  │ ① 바모스  ② 연남서점│  │  ← 수평 스크롤 Spot 칩
│  │ ③ 와인바            │  │
│  └────────────────────┘  │
│                          │
│  📍 바모스커피             │
│  ────────────────────── │
│  연남동에서 가장 좋아하는  │
│  카페...                 │
│                          │
│  [📷 사진 추가]           │
│  🖼 🖼 🖼                 │
│                          │
│  ↕ → 연남서점 (도보 5분)  │
│                          │
│  📍 연남서점               │
│  (여기에 글을 작성하세요)  │
│                          │
│  [초안 저장]  [발행하기]   │
└──────────────────────────┘
```

- 우측 블록 패널 → 상단 수평 Spot 칩 바로 전환
- 칩 탭 = 해당 블록으로 스크롤
- 코스 수정은 별도 시트(BottomSheet)에서

---

## 5. Data Model (신규)

### 5.1 Blog Entity

```
Blog
├── id (UUID, PK)
├── slug (String, unique)
├── spotLineId (UUID, FK → SpotLine)
├── userId (UUID, FK → Supabase Auth)
├── title (String) — 블로그 제목
├── summary (String, nullable) — 한줄 소개
├── coverImageUrl (String, nullable)
├── status (Enum: DRAFT / PUBLISHED)
├── publishedAt (Timestamp, nullable)
├── createdAt (Timestamp)
├── updatedAt (Timestamp)
└── isActive (Boolean, default true)
```

### 5.2 BlogBlock Entity

```
BlogBlock
├── id (UUID, PK)
├── blogId (UUID, FK → Blog)
├── spotId (UUID, FK → Spot, nullable) — null이면 인트로/아웃트로/이동 블록
├── blockType (Enum: INTRO / SPOT / TRANSITION / OUTRO)
├── blockOrder (Integer) — 블록 순서
├── content (Text) — 본문 (JSON 또는 HTML)
├── createdAt (Timestamp)
└── updatedAt (Timestamp)
```

### 5.3 BlogBlockMedia Entity

```
BlogBlockMedia
├── id (UUID, PK)
├── blogBlockId (UUID, FK → BlogBlock)
├── mediaUrl (String) — S3 URL
├── mediaOrder (Integer)
├── caption (String, nullable)
└── createdAt (Timestamp)
```

### 5.4 관계도

```
User ──1:N──→ Blog ──1:1──→ SpotLine
                 │
                 └──1:N──→ BlogBlock ──N:1──→ Spot (nullable)
                              │
                              └──1:N──→ BlogBlockMedia
```

---

## 6. API Design (신규 엔드포인트)

### 6.1 Blog API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v2/blogs` | 블로그 생성 (초안) | Required |
| GET | `/api/v2/blogs/{slug}` | 블로그 상세 (공개) | Public |
| PUT | `/api/v2/blogs/{slug}` | 블로그 수정 | Owner |
| DELETE | `/api/v2/blogs/{slug}` | 블로그 삭제 | Owner |
| PATCH | `/api/v2/blogs/{slug}/publish` | 블로그 발행 | Owner |
| GET | `/api/v2/blogs` | 블로그 목록 (피드) | Public |
| GET | `/api/v2/users/me/blogs` | 내 블로그 목록 | Required |
| GET | `/api/v2/blogs/slugs` | 블로그 slug 목록 (SSR) | Public |

### 6.2 BlogBlock API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| PUT | `/api/v2/blogs/{blogId}/blocks` | 블록 일괄 저장 (자동 저장) | Owner |
| POST | `/api/v2/blogs/{blogId}/blocks/{blockId}/media` | 블록 이미지 업로드 URL 발급 | Owner |

### 6.3 User SpotLine API (확장)

기존 SpotLine 생성 API (`POST /api/v2/spotLines`)를 유저도 사용 가능하도록 확장.
`creatorType: "user"` + `creatorId: userId`로 생성.

---

## 7. Tech Stack Decisions

| Decision | Selected | Rationale |
|----------|----------|-----------|
| Rich Text Editor | **Tiptap** (ProseMirror 기반) | 블록형 에디터에 최적, 확장성 우수, React 지원, 무료 Core |
| Drag & Drop | **@dnd-kit** | Admin SpotLineBuilder에서 이미 사용 중, 일관성 유지 |
| Image Upload | **S3 Presigned URL** (기존 MediaController) | 이미 구현된 인프라 활용 |
| Auto Save | **Zustand + debounce** | 기존 패턴 활용, 로컬 백업 포함 |
| 에디터 직렬화 | **JSON** (Tiptap native) | HTML보다 구조적, 블록 단위 저장에 유리 |
| 스크롤 동기화 | **Intersection Observer API** | 네이티브 API, 성능 우수 |
| 모바일 반응형 | **Tailwind CSS 4 breakpoints** | 기존 프로젝트 패턴 |

---

## 8. Architecture Considerations

### 8.1 Project Level

| Level | Selected |
|-------|:--------:|
| **Dynamic** | ✅ |

### 8.2 폴더 구조 (신규 추가분)

```
front-spotLine/src/
├── app/
│   ├── blog/
│   │   ├── [slug]/page.tsx          — 블로그 상세 (SSR)
│   │   └── new/page.tsx             — 블로그 작성 (SpotLine 선택 or Builder 연동)
│   ├── my-blogs/page.tsx            — 내 블로그 목록
│   └── spotLine-builder/page.tsx       — 유저 코스 만들기
├── components/
│   ├── spotLine-builder/
│   │   ├── SpotLineBuilder.tsx         — 메인 빌더 (2패널)
│   │   ├── SpotSearchPanel.tsx      — Spot 검색 좌측 패널
│   │   ├── SelectedSpotList.tsx     — 선택된 Spot 우측 리스트 (DnD)
│   │   ├── SelectedSpotCard.tsx     — 개별 Spot 카드
│   │   └── SpotLineMetaForm.tsx        — 코스 메타 정보 입력
│   └── blog/
│       ├── BlogEditor.tsx           — 메인 에디터 (2패널)
│       ├── BlockEditor.tsx          — 개별 Spot 블록 에디터 (Tiptap)
│       ├── BlockNavigator.tsx       — 우측 Spot 블록 네비게이터
│       ├── BlockNavigatorItem.tsx   — 개별 블록 아이템
│       ├── TransitionBlock.tsx      — Spot 간 이동 메모 블록
│       ├── BlogCoverSelector.tsx    — 커버 이미지 선택
│       ├── BlogPublishSheet.tsx     — 발행 시트 (제목, 소개, 커버)
│       ├── BlogDetailView.tsx       — 블로그 상세 렌더링
│       ├── BlogSpotBlock.tsx        — 상세 페이지 Spot 블록 렌더링
│       └── BlogAutoSave.tsx         — 자동 저장 로직
├── store/
│   └── useBlogEditorStore.ts        — 블로그 에디터 상태 (Zustand)
└── lib/
    └── blog-api.ts                  — Blog API 클라이언트

springboot-spotLine-backend/src/main/java/com/spotline/api/
├── domain/
│   ├── entity/
│   │   ├── Blog.java
│   │   ├── BlogBlock.java
│   │   └── BlogBlockMedia.java
│   ├── enums/
│   │   ├── BlogStatus.java          — DRAFT, PUBLISHED
│   │   └── BlogBlockType.java       — INTRO, SPOT, TRANSITION, OUTRO
│   └── repository/
│       ├── BlogRepository.java
│       ├── BlogBlockRepository.java
│       └── BlogBlockMediaRepository.java
├── controller/
│   └── BlogController.java
├── service/
│   └── BlogService.java
└── dto/
    ├── request/
    │   ├── CreateBlogRequest.java
    │   ├── UpdateBlogRequest.java
    │   └── SaveBlogBlocksRequest.java
    └── response/
        ├── BlogResponse.java
        ├── BlogListResponse.java
        └── BlogDetailResponse.java
```

---

## 9. Implementation Phases

| Step | Scope | Repo | Dependency |
|------|-------|------|------------|
| **Step 1** | Backend — Blog/BlogBlock/BlogBlockMedia 엔티티 + Repository + Enum | backend | 없음 |
| **Step 2** | Backend — BlogController + BlogService + DTO (CRUD + 블록 저장 + 발행) | backend | Step 1 |
| **Step 3** | Frontend — SpotLine Builder 페이지 (Spot 검색 + 선택 + DnD 정렬 + 저장) | front | 없음 |
| **Step 4** | Frontend — Blog Editor 코어 (좌우 분할, BlockEditor with Tiptap, BlockNavigator) | front | Step 3 |
| **Step 5** | Frontend — 스크롤 동기화 + 블록 활성화 + 이미지 업로드 + 자동 저장 | front | Step 4 |
| **Step 6** | Frontend — 블로그 작성 중 코스 수정 (Spot 추가/삭제/순서 변경) | front | Step 5 |
| **Step 7** | Frontend — 블로그 발행 + 상세 페이지 (SSR + SEO) + 내 블로그 목록 | front | Step 6 |

---

## 10. Success Criteria

### 10.1 Definition of Done

- [ ] 유저가 Spot 검색 → 클릭으로 코스 추가 → DnD로 순서 편집 가능
- [ ] 코스 저장 후 블로그 작성 버튼 활성화
- [ ] 좌우 분할 에디터에서 Spot 블록별 글+사진 작성 가능
- [ ] 우측 블록 클릭 ↔ 좌측 에디터 스크롤 양방향 동기화
- [ ] 블로그 작성 중 Spot 추가/삭제/순서 변경 가능 (기존 내용 유지)
- [ ] 자동 저장 동작 (30초 debounce + 블록 전환 시)
- [ ] 블로그 발행 → SSR 상세 페이지 렌더링
- [ ] 모바일 반응형 동작

### 10.2 Quality Criteria

- [ ] 에디터 초기 로드 < 2초
- [ ] 자동 저장 실패 시 로컬 백업
- [ ] 블로그 상세 LCP < 2.5초

---

## 11. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Tiptap 번들 사이즈 | Medium | Medium | Dynamic import, 필요 extension만 포함 |
| 자동 저장 충돌 | High | Low | Optimistic lock (updatedAt 비교), 로컬 백업 |
| 모바일 에디터 UX | High | Medium | 모바일은 단순화 (상하 배치, 칩 네비게이터) |
| 이미지 업로드 실패 | Medium | Low | 재시도 로직, 업로드 진행률 표시 |
| 블록 순서 변경 시 데이터 정합성 | High | Medium | blockOrder 재계산, 트랜잭션 처리 |

---

## 12. Next Steps

1. [ ] Design 문서 작성 (`/pdca design spotLine-blog-builder`)
2. [ ] Tiptap 라이브러리 PoC (에디터 커스터마이징 범위 확인)
3. [ ] 구현 시작

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-04 | Initial draft | Claude |
