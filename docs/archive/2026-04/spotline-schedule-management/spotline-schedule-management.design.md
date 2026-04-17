# spotline-schedule-management Design Document

> **Summary**: 내 일정 페이지 UX 고도화 — 캘린더 뷰, 날짜 수정, Spot 체크리스트, 완주 통계
>
> **Project**: front-spotLine (Spotline)
> **Version**: 0.1.0
> **Author**: Claude
> **Date**: 2026-04-17
> **Status**: Draft
> **Planning Doc**: [spotline-schedule-management.plan.md](../01-plan/features/spotline-schedule-management.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- 내 일정 페이지를 단순 리스트에서 캘린더 기반 일정 관리 도구로 진화
- 날짜 수정, Spot 체크리스트, 완주 통계를 추가하여 복제→경험→완주 전환율 향상
- Backend 변경 최소화: localStorage 기반 체크리스트, 프론트 계산 통계

### 1.2 Design Principles

- **점진적 개선**: 기존 MySpotLinesList/Card 컴포넌트에 기능을 추가하되, 기존 동작을 깨뜨리지 않는다
- **오프라인 우선**: 체크리스트 상태는 localStorage에 저장하여 네트워크 없이도 동작
- **낙관적 업데이트**: 날짜 수정 등 mutation은 즉시 UI에 반영하고 API는 비동기 호출

---

## 2. Architecture

### 2.1 Component Diagram

```
┌──────────────────────────────────────────┐
│         MySpotLinesList (수정)            │
│  ┌──────────────────────────────────┐    │
│  │  ScheduleStatsCard (NEW)         │    │
│  ├──────────────────────────────────┤    │
│  │  [리스트|캘린더] 뷰 토글          │    │
│  ├──────────────────────────────────┤    │
│  │  ScheduleCalendar (NEW)          │    │
│  │  - 월간 그리드                    │    │
│  │  - 도트 마커 (일정 있는 날)        │    │
│  │  - 날짜 클릭 → 필터링             │    │
│  ├──────────────────────────────────┤    │
│  │  MySpotLineCard (수정)           │    │
│  │  ├─ 날짜 탭 → EditDateSheet      │    │
│  │  └─ 아코디언 → SpotChecklist     │    │
│  └──────────────────────────────────┘    │
└──────────────────────────────────────────┘

별도 바텀시트:
  EditDateSheet (NEW) — 날짜 수정용
```

### 2.2 Data Flow

```
fetchMySpotLines API
  → useMySpotLinesStore (Zustand)
    → MySpotLinesList (뷰 분기)
      → ScheduleCalendar (월 계산: date-fns)
      → ScheduleStatsCard (완주 통계: store 데이터 계산)
      → MySpotLineCard
        → SpotChecklist (체크 상태: localStorage)
        → EditDateSheet (날짜 수정 → updateScheduledDate → API PATCH)
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| ScheduleCalendar | date-fns (기존 설치됨) | 월 시작/끝 날짜 계산 |
| EditDateSheet | useMySpotLinesStore | scheduledDate 업데이트 |
| SpotChecklist | localStorage | 체크 상태 저장/읽기 |
| ScheduleStatsCard | useMySpotLinesStore | 완주 수 계산 |

---

## 3. Data Model

### 3.1 기존 타입 (변경 없음)

```typescript
// src/types/index.ts — 이미 존재
export interface MySpotLine {
  id: string;
  spotLineId: string;
  spotLineSlug: string;
  title: string;
  area: string;
  spotsCount: number;
  scheduledDate: string | null;
  status: "scheduled" | "completed" | "cancelled";
  completedAt: string | null;
  parentSpotLineId: string;
  createdAt: string;
}
```

### 3.2 새로운 타입

```typescript
// src/types/index.ts에 추가

// Spot 체크리스트 아이템
export interface SpotCheckItem {
  spotId: string;
  name: string;
  checked: boolean;
}

// 완주 통계
export interface ScheduleStats {
  totalCompleted: number;       // 총 완주 수
  thisMonthCompleted: number;   // 이번 달 완주
  averageSpots: number;         // 평균 Spot 수
}
```

### 3.3 localStorage 스키마

```typescript
// Key: `spotline_checklist_{mySpotLineId}`
// Value:
{
  spotId: string;
  checked: boolean;
}[]

// 예시:
localStorage.setItem(
  "spotline_checklist_abc123",
  JSON.stringify([
    { spotId: "spot1", checked: true },
    { spotId: "spot2", checked: false }
  ])
);
```

---

## 4. API Specification

### 4.1 기존 API (변경 없음)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/users/me/spotlines` | 내 SpotLine 목록 |
| PATCH | `/users/me/spotlines/{id}` | 상태 변경 (완주/취소) |

### 4.2 API 확장 (Backend 요청 필요)

#### `PATCH /users/me/spotlines/{id}` — scheduledDate 지원 추가

**현재 Request:**
```json
{ "status": "completed" }
```

**확장 Request:**
```json
{ "scheduledDate": "2026-04-20" }
```

**Frontend 대응**: Backend가 scheduledDate PATCH를 지원할 때까지, 프론트에서 낙관적 업데이트 + localStorage 저장으로 대응. API 실패 시 로컬 상태 유지.

```typescript
// api.ts에 추가
export const updateMySpotLineDate = async (
  mySpotLineId: string,
  scheduledDate: string | null
): Promise<MySpotLine> => {
  const response = await apiV2.patch<MySpotLine>(
    `/users/me/spotlines/${mySpotLineId}`,
    { scheduledDate },
    { headers: { Authorization: `Bearer ${getAuthToken()}` }, timeout: 5000 }
  );
  return response.data;
};
```

---

## 5. UI/UX Design

### 5.1 Screen Layout — 내 일정 페이지

```
┌─────────────────────────────────┐
│ Header (내 일정)                 │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │  통계 카드                   │ │
│ │  완주 12 · 이번달 3 · 평균 5 │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ [예정 (5)] [완료 (12)]          │
│                   [리스트|캘린더]│
├─────────────────────────────────┤
│ ┌ 캘린더 뷰 (toggle) ─────────┐ │
│ │     ← 2026년 4월 →          │ │
│ │ 일 월 화 수 목 금 토         │ │
│ │        1  2  3  4  5         │ │
│ │  6  7  8  9 10 11 12         │ │
│ │ 13 14 15 16[17]18 19         │ │
│ │ 20 21 22 23 24 25 26         │ │
│ │ 27 28 29 30                  │ │
│ │  ● = 일정 있음  [●] = 선택   │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ ┌ MySpotLineCard ─────────────┐ │
│ │ 홍대 카페투어    D-3        │ │
│ │ 홍대 · 4곳   📅 4/20 (일)   │ │
│ │ ▼ Spot 체크리스트            │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ ☑ 카페 온도  ☐ 만월회관  │ │ │
│ │ │ ☐ 연남서가  ☐ 어글리베이커│ │ │
│ │ │ 진행률: 1/4 ████░░░░ 25% │ │ │
│ │ └─────────────────────────┘ │ │
│ │ [완주] [삭제]    원본 보기   │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### 5.2 EditDateSheet — 날짜 수정 바텀시트

```
┌─────────────────────────────────┐
│ ──── (drag handle)              │
│                            [X]  │
│ 📅 날짜 수정                    │
│ 홍대 카페투어 · 현재: 4/20 (일)  │
│                                 │
│ [오늘]  [내일]  [이번 주말]      │
│  4/17    4/18     4/19          │
│                                 │
│ [📅 다른 날짜 선택]              │
│                                 │
│ [    4/20로 변경하기    ]        │
│                                 │
│      날짜 삭제 (미정으로)        │
└─────────────────────────────────┘
```

### 5.3 User Flow

```
내 일정 페이지 진입
  ├─ 통계 카드 확인 (총 완주, 이번 달, 평균)
  ├─ 뷰 전환: 리스트 ↔ 캘린더
  │   └─ 캘린더: 날짜 클릭 → 해당 날짜 일정만 필터
  ├─ 카드 날짜 탭 → EditDateSheet 열기
  │   └─ 빠른 날짜 or 커스텀 → 날짜 변경
  ├─ 카드 아코디언 열기 → SpotChecklist 표시
  │   ├─ 각 Spot 체크 토글 (localStorage 저장)
  │   └─ 전체 완료 시 "완주하시겠습니까?" 제안
  └─ 완주 버튼 → 상태 변경 + completionsCount 증가
```

### 5.4 Component List

| Component | Location | Responsibility |
|-----------|----------|----------------|
| `ScheduleCalendar` | `src/components/spotline/ScheduleCalendar.tsx` | 월간 캘린더 그리드, 도트 마커, 날짜 선택 |
| `EditDateSheet` | `src/components/spotline/EditDateSheet.tsx` | 날짜 수정 바텀시트 (빠른 날짜 + 커스텀) |
| `SpotChecklist` | `src/components/spotline/SpotChecklist.tsx` | Spot별 방문 체크 토글 + 진행률 표시 |
| `ScheduleStatsCard` | `src/components/spotline/ScheduleStatsCard.tsx` | 완주 통계 카드 (총/이번달/평균) |

---

## 6. Error Handling

| Scenario | Handling |
|----------|----------|
| 날짜 수정 API 실패 | 낙관적 업데이트 유지, localStorage에 저장, dev 환경에서 console.warn |
| 체크리스트 localStorage 읽기 실패 | 빈 배열 반환 (unchecked 상태) |
| Spot 목록 없는 카드 | 체크리스트 비활성, "Spot 정보를 불러올 수 없습니다" 표시 |
| 캘린더 날짜 범위 밖 | 월 이동 버튼으로 네비게이션 |

---

## 7. Security Considerations

- [x] 인증 토큰은 기존 `getAuthToken()` 패턴 유지
- [x] localStorage 데이터는 민감 정보 없음 (spotId + checked boolean만)
- [x] 날짜 입력 검증: 과거 날짜도 허용 (유연한 일정 관리)
- [x] XSS: 사용자 입력 없음 (날짜 선택 only)

---

## 8. Test Plan

### 8.1 Test Scope

| Type | Target | Method |
|------|--------|--------|
| Manual | 캘린더 렌더링, 날짜 네비게이션 | 브라우저 검증 |
| Manual | 날짜 수정 flow | 바텀시트 동작 확인 |
| Manual | 체크리스트 토글 + 전체 완주 | localStorage 확인 |
| Manual | 통계 카드 계산 | 다양한 데이터 세트 |

### 8.2 Test Cases

- [x] 캘린더에 일정 있는 날짜에 도트 표시
- [x] 날짜 클릭 시 해당 날짜 일정만 필터링
- [x] 월 이동 (이전/다음) 정상 동작
- [x] EditDateSheet에서 빠른 날짜 선택 → 즉시 반영
- [x] EditDateSheet에서 커스텀 날짜 → 반영
- [x] "날짜 삭제" → scheduledDate null로 변경
- [x] 체크리스트 토글 → localStorage 저장 확인
- [x] 전체 Spot 체크 시 완주 제안 모달 표시
- [x] 통계 카드: 완료 탭 데이터 기반 정확한 계산
- [x] 오프라인 상태에서 체크리스트 정상 동작

---

## 9. Implementation Guide

### 9.1 File Structure

```
src/
├── components/spotline/
│   ├── ScheduleCalendar.tsx      (NEW) — 월간 캘린더 그리드
│   ├── EditDateSheet.tsx          (NEW) — 날짜 수정 바텀시트
│   ├── SpotChecklist.tsx          (NEW) — Spot별 체크 토글
│   ├── ScheduleStatsCard.tsx      (NEW) — 완주 통계 카드
│   ├── MySpotLinesList.tsx        (MODIFY) — 캘린더 뷰 토글, 통계 카드
│   └── MySpotLineCard.tsx         (MODIFY) — 날짜 탭 수정, 체크리스트 아코디언
├── store/
│   └── useMySpotLinesStore.ts     (MODIFY) — updateScheduledDate 액션
├── lib/
│   └── api.ts                     (MODIFY) — updateMySpotLineDate 함수
└── types/
    └── index.ts                   (MODIFY) — SpotCheckItem, ScheduleStats 타입
```

### 9.2 Implementation Order

1. [x] **타입 정의**: `SpotCheckItem`, `ScheduleStats` 타입을 `types/index.ts`에 추가
2. [x] **API 함수**: `updateMySpotLineDate`를 `api.ts`에 추가
3. [x] **Store 확장**: `updateScheduledDate` 액션을 `useMySpotLinesStore.ts`에 추가
4. [x] **ScheduleStatsCard**: 통계 계산 + 렌더링 (가장 독립적)
5. [x] **ScheduleCalendar**: 월간 그리드 + 도트 마커 + 날짜 필터링
6. [x] **SpotChecklist**: 체크 토글 + localStorage + 진행률 바
7. [x] **EditDateSheet**: ReplicateSpotLineSheet 패턴 재활용, 날짜 수정 특화
8. [x] **MySpotLineCard 수정**: 날짜 탭 → EditDateSheet, 아코디언 → SpotChecklist
9. [x] **MySpotLinesList 수정**: 통계 카드 + 뷰 토글 + 캘린더 뷰 연동

### 9.3 Component Specifications

#### ScheduleCalendar

```typescript
interface ScheduleCalendarProps {
  spotLines: MySpotLine[];
  selectedDate: string | null;
  onDateSelect: (date: string | null) => void;
}
```

- date-fns의 `startOfMonth`, `endOfMonth`, `eachDayOfInterval`, `getDay` 사용
- 7열 그리드 (일~토), 빈 셀은 이전/다음 달 날짜로 채움 (비활성 표시)
- 일정 있는 날: purple 도트 마커 (하단에 작은 원)
- 선택된 날: purple 배경 원
- 오늘: ring 표시
- 월 이동: `<` `>` 버튼으로 `currentMonth` state 변경

#### EditDateSheet

```typescript
interface EditDateSheetProps {
  isOpen: boolean;
  onClose: () => void;
  mySpotLine: MySpotLine;
  onDateChange: (mySpotLineId: string, newDate: string | null) => void;
}
```

- ReplicateSpotLineSheet와 동일한 바텀시트 패턴 (createPortal, 배경 클릭 닫기, ESC)
- 빠른 날짜 3개 (오늘/내일/이번 주말) + 커스텀 input
- "날짜 삭제" 버튼 → null로 변경
- 현재 날짜 표시

#### SpotChecklist

```typescript
interface SpotChecklistProps {
  mySpotLineId: string;
  spots: { spotId: string; name: string }[];
  onAllChecked: () => void;
}
```

- localStorage key: `spotline_checklist_{mySpotLineId}`
- 체크 토글 시 즉시 localStorage 저장
- 진행률 바: `checked / total * 100%`
- 전체 체크 시 `onAllChecked()` 콜백 → 완주 확인 모달 제안

#### ScheduleStatsCard

```typescript
interface ScheduleStatsCardProps {
  spotLines: MySpotLine[];
}
```

- 3개 통계: 총 완주 / 이번 달 완주 / 평균 Spot 수
- 완주 = `status === "completed"` 기준
- 이번 달 = `completedAt`이 현재 월에 해당
- 평균 Spot = 완주된 SpotLine의 `spotsCount` 평균

### 9.4 Conventions Applied

| Item | Convention |
|------|-----------|
| Component naming | PascalCase (`ScheduleCalendar.tsx`) |
| Props interface | `[ComponentName]Props` (named export) |
| File location | `src/components/spotline/` (SpotLine 핵심 기능) |
| State management | Zustand store 확장 (기존 패턴) |
| Styling | Tailwind CSS 4, `cn()` 유틸리티, 모바일 퍼스트 |
| Client directive | 모든 새 컴포넌트 최상단 `"use client"` |
| 언어 | UI 텍스트 한국어, 코드 영어 |
| 아이콘 | lucide-react (기존 의존성) |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-17 | Initial draft | Claude |
