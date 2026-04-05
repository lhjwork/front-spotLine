# User SpotLine Experience — Planning Document

> **Summary**: 유저가 Spot을 조합해 자신만의 SpotLine을 만들고, 다른 유저와 공유하며, 변형(Fork)하여 새로운 SpotLine으로 발전시키는 핵심 경험 루프
>
> **Project**: Spotline (front-spotLine + springboot-spotLine-backend)
> **Author**: Claude
> **Date**: 2026-04-04
> **Status**: Draft
> **Prerequisite for**: SpotLine Blog Builder

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | SpotLine 생성은 Admin 전용. 유저는 조회/복제만 가능하여 "발견 → 계획 → 공유 → 진화"의 핵심 루프가 끊어져 있다. 유저 생성 콘텐츠(UGC)가 0이고, 콘텐츠 확장이 크루 인력에 의존한다. |
| **Solution** | 유저용 SpotLine Builder UI + 공유 플로우 + Fork(변형) 기능을 구현하여, 유저가 Spot을 자유롭게 조합해 SpotLine을 만들고 → 공유하고 → 다른 유저가 Fork하여 자신만의 SpotLine으로 진화시키는 선순환 루프를 완성한다. |
| **Function/UX Effect** | 유저가 피드/Spot 상세에서 원클릭으로 SpotLine Builder 진입 → Spot 검색+추가 → DnD 정렬 → 저장 → 공유 링크 생성. 다른 유저는 SpotLine을 보고 "내 버전 만들기"로 Fork → Spot 추가/교체 → 새 SpotLine 탄생. |
| **Core Value** | 크루 의존에서 벗어나 유저 주도 콘텐츠 생산 구조로 전환. SpotLine의 Fork 체인이 콘텐츠를 기하급수적으로 증식. "경험의 진화" = Spotline의 핵심 차별화. |

---

## 1. Overview

### 1.1 Purpose

유저가 Spot을 자유롭게 조합하여 하루 데이트/일정 코스(SpotLine)를 만들고, 이를 공유하며, 다른 유저가 자신만의 버전으로 변형하는 **경험 루프**를 완성한다.

### 1.2 핵심 경험 루프

```
 ┌──────────────────────────────────────────────────────┐
 │                  SpotLine Experience Loop              │
 │                                                        │
 │  [발견] ─→ [계획] ─→ [실행] ─→ [공유] ─→ [진화]        │
 │    │         │         │         │         │           │
 │  피드/탐색   Builder   일정관리   링크/SNS   Fork       │
 │  Spot상세    DnD편집   완주기록   프로필     Spot교체    │
 │                                              │         │
 │                                              └──→ [발견]│
 └──────────────────────────────────────────────────────┘
```

### 1.3 현재 상태 vs 목표

| 기능 | 현재 | 목표 |
|------|------|------|
| SpotLine 생성 | Admin(크루) 전용 | **유저도 가능** |
| SpotLine Builder UI | Admin에만 존재 | **유저용 Builder 페이지** |
| SpotLine 복제 | 일정에 추가 (날짜 선택) | 유지 + **Fork(변형) 추가** |
| Fork/변형 | parentSpotLineId 추적만 | **Spot 추가/교체/삭제 UI** |
| 공유 | 없음 | **공유 시트 (링크 복사, SNS)** |
| 내가 만든 SpotLine | API만 존재 | **프로필 탭 + 관리 페이지** |
| Spot→SpotLine 진입 | 없음 | **Spot 상세에서 "코스에 추가" CTA** |

### 1.4 Related Documents

- `experience-social-platform.plan.md` — 전체 플랫폼 Plan
- `spotline-blog-builder.plan.md` — 이 기능 이후 진행할 Blog Builder
- Admin `SpotLineBuilder.tsx` — 참고 패턴 (DnD, Spot 선택)

---

## 2. Scope

### 2.1 In Scope

- [ ] **유저 SpotLine Builder 페이지** (`/create-spotline`) — Spot 검색, 추가, DnD 정렬, 메타 입력, 저장
- [ ] **Fork 플로우** — 기존 SpotLine에서 "내 버전 만들기" → Builder에 Spot 프리로딩 → 수정 → 새 SpotLine 저장
- [ ] **공유 기능** — 링크 복사, 카카오톡 공유, 네이티브 공유 API
- [ ] **내가 만든 SpotLine 관리** — 프로필 내 탭 + 수정/삭제
- [ ] **다양한 진입점** — 피드 CTA, Spot 상세 "코스에 추가", SpotLine 상세 "내 버전 만들기", 프로필 "새 SpotLine"
- [ ] **SpotLine 수정** — 자신이 만든 SpotLine의 Spot 추가/제거/순서 변경

### 2.2 Out of Scope

- 블로그/글쓰기 기능 (→ `spotline-blog-builder` 에서 구현)
- 멀티데이 코스 (1일 코스만)
- 협업 SpotLine 생성 (1인 작성)
- AI 추천 Spot 자동 채우기 (향후)
- 유저 Spot 생성 (크루 큐레이션 Spot만 사용)

---

## 3. Requirements

### 3.1 Functional Requirements

#### SpotLine Builder

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | `/create-spotline` 페이지: 좌측 Spot 검색 패널 + 우측 선택된 Spot 리스트 | High |
| FR-02 | Spot 검색: 키워드, 지역(area), 카테고리 필터 — 기존 Spot API 활용 | High |
| FR-03 | Spot 클릭으로 코스에 추가 (최대 10개, 이미 추가된 Spot은 비활성) | High |
| FR-04 | @dnd-kit으로 Spot 순서 드래그&드롭 변경 | High |
| FR-05 | Spot 제거 (X 버튼) | High |
| FR-06 | 메타 입력: 제목(필수), 테마(SpotLineTheme 선택), 지역(Spot에서 자동 추론) | High |
| FR-07 | 설명(description) 입력: 한줄 소개 (선택) | Medium |
| FR-08 | 각 Spot에 suggestedTime, stayDuration, transitionNote 입력 가능 | Medium |
| FR-09 | Spot 간 거리/도보 시간 자동 계산 (Haversine 또는 기존 API) | Medium |
| FR-10 | 코스 미리보기: 타임라인 형태 + 지도 미리보기 | Medium |
| FR-11 | 저장 → `POST /api/v2/spotlines` (creatorType: "user") | High |
| FR-12 | 저장 후 상세 페이지(`/spotline/[slug]`)로 이동 | High |

#### Fork (내 버전 만들기)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-20 | SpotLine 상세 → "내 버전 만들기" 버튼 (인증 필요) | High |
| FR-21 | Fork 시 Builder 진입 + 원본 Spot 전체 프리로딩 | High |
| FR-22 | 원본 정보 표시: "OOO의 '성수 데이트 코스'에서 영감을 받았어요" | Medium |
| FR-23 | Spot 추가/교체/삭제/순서 변경 자유롭게 | High |
| FR-24 | 저장 시 parentSpotLineId = 원본 SpotLine ID | High |
| FR-25 | 저장 후 원본의 variationsCount 증가 | High |

#### 공유

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-30 | SpotLine 상세 → 공유 버튼 → 공유 시트 | High |
| FR-31 | 링크 복사 (`https://spotline.kr/spotline/{slug}`) | High |
| FR-32 | Web Share API (모바일 네이티브 공유) | High |
| FR-33 | 카카오톡 공유 (Kakao JS SDK `sendDefault`) | Medium |

#### 내 SpotLine 관리

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-40 | 프로필 페이지 "내가 만든 SpotLine" 탭 (기존 API: `GET /users/me/spotlines-created`) | High |
| FR-41 | 내 SpotLine 카드: 제목, 테마, Spot 수, 좋아요/저장 수, 생성일 | High |
| FR-42 | 내 SpotLine 수정: 기존 Spot 데이터로 Builder 진입 → 수정 → `PUT /api/v2/spotlines/{slug}` | High |
| FR-43 | 내 SpotLine 삭제: 확인 다이얼로그 → `DELETE /api/v2/spotlines/{slug}` | Medium |

#### 진입점 (Entry Points)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-50 | 피드 페이지: "나만의 SpotLine 만들기" CTA 카드 (인증 안 된 유저에게 로그인 유도) | High |
| FR-51 | Spot 상세 → "이 Spot으로 코스 만들기" 버튼 → Builder에 해당 Spot 프리로딩 | High |
| FR-52 | SpotLine 상세 → "내 버전 만들기" (Fork) + "내 일정에 추가" (Replicate) 분리 | High |
| FR-53 | 프로필 → "새 SpotLine 만들기" 버튼 | Medium |
| FR-54 | BottomNavBar: "만들기" 탭 추가 또는 FloatingActionButton | High |

### 3.2 Non-Functional Requirements

| Category | Criteria |
|----------|----------|
| Performance | Builder 페이지 초기 로드 < 2초 |
| Performance | Spot 검색 응답 < 500ms |
| UX | 모바일 우선: 좌우 분할 → 상하 전환 (768px 기준) |
| UX | DnD는 터치 디바이스에서도 자연스럽게 동작 |
| Auth | 미인증 유저가 Builder 접근 시 로그인 페이지로 리다이렉트 |

---

## 4. User Flow

### 4.1 SpotLine 생성 플로우

```
유저가 "나만의 SpotLine 만들기" 클릭
  ↓
[인증 확인] ── 미인증 → 로그인 → 돌아오기
  ↓
/create-spotline 페이지 진입
  ↓
좌측: Spot 검색 (키워드/지역/카테고리)
  → Spot 카드 클릭 → 우측 리스트에 추가
  ↓
우측: 선택된 Spot 리스트
  → 드래그&드롭으로 순서 편집
  → X 버튼으로 제거
  → 메타 입력 (제목, 테마)
  ↓
[저장] → POST /api/v2/spotlines
  ↓
/spotline/{slug} 상세 페이지로 이동
  → 공유 버튼으로 SNS/링크 공유
```

### 4.2 Fork (변형) 플로우

```
유저가 다른 사람의 SpotLine 상세에서 "내 버전 만들기" 클릭
  ↓
[인증 확인]
  ↓
/create-spotline?fork={originalSlug} 페이지 진입
  → 원본 Spot 전부 프리로딩
  → "영감 배지" 표시: "OOO의 코스에서 영감"
  ↓
Spot 추가/교체/삭제/순서 변경
  → 제목/테마 수정
  ↓
[저장] → POST /api/v2/spotlines (parentSpotLineId = 원본 ID)
  ↓
/spotline/{newSlug} 상세 페이지
  → "원본 SpotLine" 링크 표시
  → 원본의 variationsCount +1
```

### 4.3 Builder UI (데스크톱)

```
┌──────────────────────────────────────────────────────────┐
│  나만의 SpotLine 만들기          [영감: 성수 데이트 코스]  │
├────────────────────────┬─────────────────────────────────┤
│  Spot 검색              │  내 코스 (3/10)                  │
│  ┌──────────────────┐  │                                  │
│  │ 🔍 성수 카페       │  │  ① 카페 어니언         ✕  ☰    │
│  └──────────────────┘  │     📍 성수 · ☕ 카페             │
│                        │     ⏱ 60분  🗒 골목길 인테리어    │
│  지역: 성수 ▾          │  ↕ 도보 5분 · 350m               │
│  카테고리: 전체 ▾      │  ② 성수 레스토랑        ✕  ☰    │
│                        │     📍 성수 · 🍽 레스토랑          │
│  ┌──────────────────┐  │     ⏱ 90분                       │
│  │ 카페 어니언  [추가됨]│  │  ↕ 도보 8분 · 500m               │
│  │ 대림창고    [+]    │  │  ③ 성수 바             ✕  ☰    │
│  │ 성수연방    [+]    │  │     📍 성수 · 🍸 바               │
│  │ 할아버지공장 [+]    │  │     ⏱ 60분                       │
│  └──────────────────┘  │                                  │
│                        │  ───────────────────────         │
│  페이지 1/3  < >       │  제목: 성수 카페&바 데이트         │
│                        │  테마: 데이트 ▾                   │
│                        │  지역: 성수 (자동)                │
│                        │  소개: 성수의 핫플만 모은 코스     │
│                        │                                  │
│                        │  [미리보기]  [SpotLine 저장]       │
└────────────────────────┴─────────────────────────────────┘
```

### 4.4 Builder UI (모바일)

```
┌────────────────────────┐
│  나만의 SpotLine 만들기  │
│                        │
│  [Spot 검색] [내 코스 3]│  ← 탭 전환
│                        │
│  🔍 성수 카페           │
│  지역: 성수 ▾  전체 ▾   │
│                        │
│  ┌──────────────────┐  │
│  │ 카페 어니언  [추가됨]│  │
│  │ 대림창고    [+]    │  │
│  │ 성수연방    [+]    │  │
│  └──────────────────┘  │
│                        │
│  [SpotLine 저장 (3곳)]  │  ← 하단 고정
└────────────────────────┘
```

모바일에서는 "Spot 검색"과 "내 코스" 탭으로 전환. 하단에 저장 버튼 고정.

### 4.5 SpotLine 상세 — 액션 버튼 변경

```
현재:
  [❤️ 좋아요] [🔖 저장] [📋 내 일정에 추가]

변경 후:
  [❤️ 좋아요] [🔖 저장] [📤 공유] [🔀 내 버전 만들기] [📋 일정 추가]
```

- **공유**: 링크 복사, 카카오톡, 네이티브 공유
- **내 버전 만들기** (Fork): Builder에 Spot 프리로딩
- **일정 추가** (Replicate): 기존 날짜 선택 시트

---

## 5. Data Model Changes

### 5.1 기존 모델 활용 (변경 없음)

Backend의 SpotLine 생성 API는 이미 `creatorType: "user"`를 지원하므로 **신규 엔티티/테이블 필요 없음.**

| 엔티티 | 변경 | 비고 |
|--------|------|------|
| SpotLine | 없음 | `creatorType: "user"`, `parentSpotLineId` 이미 존재 |
| SpotLineSpot | 없음 | Spot 연결 이미 존재 |
| UserSpotLine | 없음 | 복제(일정 추가) 이미 존재 |
| SpotLineLike/Save | 없음 | 소셜 이미 존재 |

### 5.2 Frontend 신규 타입

```typescript
// Builder에서 사용하는 로컬 상태 타입
interface SpotLineBuilderSpot {
  spot: SpotDetailResponse;          // 기존 Spot 타입
  order: number;
  suggestedTime: string | null;
  stayDuration: number | null;
  transitionNote: string | null;
  // 거리/시간은 자동 계산
  walkingTimeToNext: number | null;
  distanceToNext: number | null;
}

interface SpotLineBuilderState {
  spots: SpotLineBuilderSpot[];
  title: string;
  description: string;
  theme: SpotLineTheme | null;
  area: string;                      // Spot에서 자동 추론
  parentSpotLineId: string | null;   // Fork 시
  parentInfo: { title: string; creatorName: string } | null;
}
```

---

## 6. API Usage

### 6.1 기존 API 활용 (신규 엔드포인트 불필요)

| 기능 | Method | Endpoint | 상태 |
|------|--------|----------|------|
| Spot 검색 | GET | `/api/v2/spots?area=&category=&keyword=` | ✅ 존재 |
| SpotLine 생성 | POST | `/api/v2/spotlines` | ✅ 존재 |
| SpotLine 수정 | PUT | `/api/v2/spotlines/{slug}` | ✅ 존재 |
| SpotLine 삭제 | DELETE | `/api/v2/spotlines/{slug}` | ✅ 존재 |
| SpotLine 상세 | GET | `/api/v2/spotlines/{slug}` | ✅ 존재 |
| 내 SpotLine 목록 | GET | `/api/v2/users/me/spotlines-created` | ✅ 존재 |
| Spot 상세 | GET | `/api/v2/spots/{slug}` | ✅ 존재 |
| 일정 추가(복제) | POST | `/api/v2/spotlines/{id}/replicate` | ✅ 존재 |
| 변형 목록 | GET | `/api/v2/spotlines/{id}/variations` | ✅ 존재 |
| 좋아요/저장 | POST | `/api/v2/spotlines/{id}/like\|save` | ✅ 존재 |

### 6.2 Frontend 신규 API 함수

```typescript
// lib/api.ts에 추가
createSpotLine(request: CreateSpotLineRequest): Promise<SpotLineDetailResponse>
updateSpotLine(slug: string, request: UpdateSpotLineRequest): Promise<SpotLineDetailResponse>
deleteSpotLine(slug: string): Promise<void>
searchSpots(params: { keyword?, area?, category?, page?, size? }): Promise<PaginatedResponse<SpotDetailResponse>>
```

---

## 7. Tech Stack

| Decision | Selected | Rationale |
|----------|----------|-----------|
| Drag & Drop | **@dnd-kit** | Admin SpotLineBuilder에서 이미 사용, 코드 참조 가능 |
| 상태 관리 | **Zustand** (`useSpotLineBuilderStore`) | 기존 패턴 |
| 거리 계산 | **Haversine formula** (클라이언트) | Admin `geo.ts`에 이미 구현 |
| 공유 | **Web Share API** + **Kakao JS SDK** | 네이티브 우선, 폴백 링크 복사 |
| 모바일 반응형 | **Tailwind CSS 4** breakpoints | 기존 패턴 |

---

## 8. Architecture

### 8.1 폴더 구조 (신규 추가분)

```
front-spotLine/src/
├── app/
│   ├── create-spotline/
│   │   └── page.tsx              — SpotLine Builder (인증 필수)
│   └── spotline/
│       └── [slug]/
│           └── edit/page.tsx     — SpotLine 수정 (인증+소유자)
├── components/
│   ├── spotline-builder/
│   │   ├── SpotLineBuilder.tsx        — 메인 Builder (2패널 or 탭)
│   │   ├── SpotSearchPanel.tsx        — Spot 검색 패널
│   │   ├── SpotSearchCard.tsx         — 검색 결과 Spot 카드
│   │   ├── SelectedSpotList.tsx       — 선택된 Spot DnD 리스트
│   │   ├── SelectedSpotCard.tsx       — 선택된 개별 Spot 카드
│   │   ├── SpotLineMetaForm.tsx       — 메타 정보 입력 (제목, 테마)
│   │   ├── SpotLinePreviewSheet.tsx   — 미리보기 시트
│   │   └── ForkBadge.tsx              — Fork 영감 배지
│   ├── spotline/
│   │   ├── SpotLineBottomBar.tsx      — (수정) Fork + 공유 버튼 추가
│   │   └── ShareSheet.tsx             — 공유 시트 (링크, 카카오, 네이티브)
│   └── common/
│       └── AuthGuard.tsx              — 인증 가드 (리다이렉트)
├── store/
│   └── useSpotLineBuilderStore.ts     — Builder 상태
└── lib/
    └── share.ts                       — 공유 유틸 (Web Share API, Kakao SDK)
```

### 8.2 컴포넌트 구조

```
CreateSpotLinePage (client, AuthGuard)
  ├── SpotLineBuilder
  │   ├── SpotSearchPanel (좌측 / 모바일 탭1)
  │   │   ├── 검색 입력 + 필터
  │   │   └── SpotSearchCard[] (클릭 → 추가)
  │   ├── SelectedSpotList (우측 / 모바일 탭2)
  │   │   ├── SelectedSpotCard[] (DnD + 메타 입력)
  │   │   └── 거리/시간 자동 계산 표시
  │   ├── SpotLineMetaForm (제목, 테마, 지역, 소개)
  │   ├── ForkBadge (Fork 시에만 표시)
  │   └── SpotLinePreviewSheet (미리보기)
  └── 저장 버튼 → POST /api/v2/spotlines

SpotLinePage (수정)
  └── SpotLineBottomBar (수정)
      ├── [❤️ 좋아요]
      ├── [🔖 저장]
      ├── [📤 공유] → ShareSheet
      ├── [🔀 내 버전] → /create-spotline?fork={slug}
      └── [📋 일정] → ReplicateSpotLineSheet
```

---

## 9. Implementation Phases

| Step | Scope | Repo | Priority |
|------|-------|------|----------|
| **Step 1** | Frontend — Builder 코어 (SpotLineBuilder, SpotSearchPanel, SelectedSpotList, DnD) | front | High |
| **Step 2** | Frontend — Builder 완성 (메타 입력, 거리 계산, 미리보기, 저장 연동) | front | High |
| **Step 3** | Frontend — Fork 플로우 (?fork={slug} 파라미터, Spot 프리로딩, parentSpotLineId) | front | High |
| **Step 4** | Frontend — SpotLine 수정 기능 (/spotline/{slug}/edit, PUT API 연동) | front | High |
| **Step 5** | Frontend — 공유 기능 (ShareSheet, Web Share API, 카카오톡 공유) | front | High |
| **Step 6** | Frontend — BottomBar 리뉴얼 (Fork + 공유 버튼), 진입점 추가 (피드 CTA, Spot 상세) | front | High |
| **Step 7** | Frontend — 내가 만든 SpotLine 관리 (프로필 탭, 삭제 기능) | front | Medium |
| **Step 8** | Frontend — 모바일 최적화 (탭 전환, 터치 DnD, 반응형) | front | Medium |

---

## 10. Success Criteria

### 10.1 Definition of Done

- [ ] 유저가 Spot 검색 → 클릭 추가 → DnD 정렬 → 메타 입력 → 저장으로 SpotLine 생성 가능
- [ ] Fork: 다른 유저의 SpotLine에서 "내 버전 만들기" → Spot 수정 → 새 SpotLine 저장
- [ ] 공유: 링크 복사, 웹 공유 API, 카카오톡 공유 동작
- [ ] 수정: 자신이 만든 SpotLine의 Spot 추가/제거/순서 변경 가능
- [ ] 모바일 반응형 동작 (탭 전환 UI)
- [ ] 생성된 SpotLine이 피드/검색에서 발견 가능

### 10.2 Quality Criteria

- [ ] Builder 초기 로드 < 2초
- [ ] Spot 검색 응답 < 500ms
- [ ] DnD가 터치 디바이스에서 자연스러움
- [ ] 미인증 상태에서 Builder 접근 시 로그인으로 리다이렉트 후 복귀

---

## 11. Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| 유저가 저품질 SpotLine 대량 생성 | Medium | 최소 2개 Spot 필수, 제목 필수, 신고 시스템 활용 |
| 모바일 DnD UX 어려움 | High | @dnd-kit touch sensor, 길게 누르기 인터랙션, 충분한 핸들 영역 |
| Fork 체인이 너무 깊어짐 | Low | 상세 페이지에서 원본(최초) SpotLine만 표시 |
| Spot 검색 결과 부족 | Medium | 크루 큐레이션 Spot이 충분히 있어야 함 (200+ 목표) |

---

## 12. 이후 단계

이 기능 완성 후 → **SpotLine Blog Builder** 구현:
1. 유저가 SpotLine을 만들고 실행한 뒤
2. 블로그로 경험을 기록 (`spotline-blog-builder.plan.md`)
3. "발견 → 계획 → 실행 → 기록 → 공유" 전체 루프 완성

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-04 | Initial draft | Claude |
