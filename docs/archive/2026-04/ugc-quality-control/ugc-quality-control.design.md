# ugc-quality-control Design Document

> **Summary**: UGC 품질 관리 — Spot/SpotLine 신고 UI + 심사 결과 알림 + 콘텐츠 작성 가이드라인
>
> **Project**: front-spotLine
> **Version**: 0.1.0
> **Author**: Claude
> **Date**: 2026-04-16
> **Status**: Draft
> **Planning Doc**: [ugc-quality-control.plan.md](../01-plan/features/ugc-quality-control.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- Spot/SpotLine 상세 페이지에 신고 버튼 추가 (기존 ReportModal 재사용)
- NotificationType 확장으로 심사 결과(승인/반려) 알림 지원
- Spot 등록 시 품질 가이드라인 안내 UI 제공
- 기존 댓글 신고 기능 regression 없이 확장

### 1.2 Design Principles

- Reuse First: 기존 ReportModal이 이미 targetType 파라미터를 지원하므로 그대로 재사용
- Backward Compatible: NotificationType 확장 시 기존 타입에 영향 없음
- Convention Adherence: 프로젝트 기존 패턴(BottomBar 내 버튼, toast 에러) 유지

---

## 2. Architecture

### 2.1 Component Diagram

```
┌─────────────────────────┐
│ Spot/SpotLine Detail    │
│ (Server Component)      │
│   └─ BottomBar          │
│      └─ ReportButton    │ ← NEW: 신고 버튼 (client)
│         └─ ReportModal  │ ← EXISTING: targetType="SPOT"|"SPOTLINE"
└─────────────────────────┘

┌─────────────────────────┐
│ NotificationListItem    │ ← MODIFY: SPOT_APPROVED/REJECTED 렌더링
│   └─ NOTIFICATION_CONFIG│ ← 2 entries 추가
└─────────────────────────┘

┌─────────────────────────┐
│ SpotCreateForm          │ ← MODIFY: 가이드라인 배너 삽입
│   └─ SpotContentGuide   │ ← NEW: 품질 가이드라인 컴포넌트
└─────────────────────────┘
```

### 2.2 Data Flow

```
[Spot 신고] User → SpotBottomBar → ReportModal → createReport(targetType:"SPOT") → POST /api/v2/reports
[SpotLine 신고] User → SpotLineBottomBar → ReportModal → createReport(targetType:"SPOTLINE") → POST /api/v2/reports
[심사 알림] Backend → GET /api/v2/notifications → NotificationListItem → 승인/반려 렌더링
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| SpotBottomBar | ReportModal | 신고 모달 표시 |
| SpotLineBottomBar | ReportModal | 신고 모달 표시 |
| NotificationListItem | NotificationType | 심사 결과 타입 렌더링 |
| SpotContentGuide | None (standalone) | 가이드라인 표시 |

---

## 3. Data Model

### 3.1 Type Changes

```typescript
// src/types/index.ts — NotificationType 확장
export type NotificationType =
  | "FOLLOW"
  | "SPOT_LIKE"
  | "SPOTLINE_LIKE"
  | "BLOG_LIKE"
  | "COMMENT"
  | "FORK"
  | "SPOT_APPROVED"    // NEW
  | "SPOT_REJECTED";   // NEW

// NotificationItem — 기존 인터페이스에 rejectionReason 추가
export interface NotificationItem {
  id: string;
  type: NotificationType;
  targetType: string | null;
  targetId: string | null;
  targetSlug: string | null;
  isRead: boolean;
  createdAt: string;
  actorId: string;
  actorNickname: string;
  actorAvatar: string | null;
  message: string | null;  // NEW: 반려 사유 등 추가 메시지
}
```

### 3.2 Entity Relationships

```
[User] 1 ──── N [ContentReport] (reporter)
[Spot/SpotLine] 1 ──── N [ContentReport] (target)
[User] 1 ──── N [Notification] (recipient)
```

---

## 4. API Specification

### 4.1 Endpoint List (기존 API 활용)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /api/v2/reports | 콘텐츠 신고 | Required |
| GET | /api/v2/notifications | 알림 목록 | Required |
| PUT | /api/v2/notifications/{id}/read | 알림 읽음 처리 | Required |

### 4.2 POST /api/v2/reports (기존)

**Request:**
```json
{
  "targetType": "SPOT",
  "targetId": "uuid-string",
  "reason": "SPAM",
  "description": "추가 설명 (선택)"
}
```

- `targetType`: `"SPOT"` | `"SPOTLINE"` | `"COMMENT"` (확장)
- `reason`: `"SPAM"` | `"INAPPROPRIATE"` | `"HARASSMENT"` | `"OTHER"`

**Response (201 Created):** Empty body

**Error Responses:**
- `409 Conflict`: 이미 신고한 콘텐츠 → "이미 신고한 콘텐츠입니다" toast
- `401 Unauthorized`: 로그인 필요

### 4.3 GET /api/v2/notifications (기존, 응답 확장)

**Response item (신규 타입):**
```json
{
  "id": "uuid",
  "type": "SPOT_APPROVED",
  "targetType": "SPOT",
  "targetId": "spot-uuid",
  "targetSlug": "my-spot-slug",
  "isRead": false,
  "createdAt": "2026-04-16T12:00:00Z",
  "actorId": "admin-uuid",
  "actorNickname": "Spotline",
  "actorAvatar": null,
  "message": null
}
```

- `SPOT_REJECTED`의 경우 `message` 필드에 반려 사유 포함

---

## 5. UI/UX Design

### 5.1 Spot 상세 페이지 — 신고 버튼 (SpotBottomBar)

```
┌──────────────────────────────────────────────────────┐
│ ♥ 123  🔖 저장  📍 체크인  📤 공유  🚩  🛣️ 코스  [길찾기] │
│                                    ↑                 │
│                              신고 버튼 (Flag 아이콘)    │
└──────────────────────────────────────────────────────┘
```

- 위치: 공유 버튼과 코스 버튼 사이
- 조건: 로그인 유저 && 본인 콘텐츠가 아닌 경우에만 표시
- 아이콘: `Flag` (lucide-react), 텍스트 없이 아이콘만

### 5.2 SpotLine 상세 페이지 — 신고 버튼 (SpotLineBottomBar)

```
┌──────────────────────────────────────────────────────┐
│ ♥ 45  🔖  📤  🚩  🔀 내 버전  [일정 추가]              │
│                   ↑                                   │
│             신고 버튼 (Flag 아이콘)                      │
└──────────────────────────────────────────────────────┘
```

- 위치: 공유 버튼과 "내 버전" 버튼 사이
- 동일 조건: 로그인 && 본인 아닌 경우

### 5.3 NotificationListItem — 심사 결과 렌더링

```
┌────────────────────────────────────────────┐
│ [🟢] Spotline                    3분 전     │  SPOT_APPROVED
│      회원님의 Spot이 승인되었습니다           │
├────────────────────────────────────────────┤
│ [🔴] Spotline                    1시간 전   │  SPOT_REJECTED
│      회원님의 Spot이 반려되었습니다           │
│      사유: 부적절한 이미지가 포함되어 있습니다  │  ← message 필드
└────────────────────────────────────────────┘
```

- SPOT_APPROVED: `CheckCircle` 아이콘, `text-green-500`
- SPOT_REJECTED: `XCircle` 아이콘, `text-red-500`, 반려 사유 표시

### 5.4 SpotContentGuide — 콘텐츠 가이드라인

```
┌────────────────────────────────────────────┐
│ 📋 Spot 등록 가이드라인                      │
│                                            │
│ • 실제 방문한 장소만 등록해 주세요             │
│ • 적절한 카테고리를 선택해 주세요              │
│ • 명확한 장소 사진을 첨부하면 승인이 빨라요     │
│ • 부적절한 콘텐츠는 반려될 수 있습니다         │
│                                     [닫기] │
└────────────────────────────────────────────┘
```

- 위치: SpotCreateForm 상단 (제목 입력 필드 위)
- 닫기 가능 (sessionStorage에 닫힘 상태 저장)
- 스타일: `bg-blue-50 border border-blue-200 rounded-xl`

### 5.5 Component List

| Component | Location | Responsibility |
|-----------|----------|----------------|
| SpotBottomBar | `src/components/spot/SpotBottomBar.tsx` | MODIFY: 신고 버튼 추가 |
| SpotLineBottomBar | `src/components/spotline/SpotLineBottomBar.tsx` | MODIFY: 신고 버튼 추가 |
| ReportModal | `src/components/comment/ReportModal.tsx` | EXISTING: 그대로 재사용 |
| NotificationListItem | `src/components/notification/NotificationListItem.tsx` | MODIFY: 심사 결과 렌더링 |
| SpotContentGuide | `src/components/spot/SpotContentGuide.tsx` | NEW: 가이드라인 배너 |
| SpotCreateForm | `src/components/spot/SpotCreateForm.tsx` | MODIFY: 가이드라인 삽입 |

---

## 6. Error Handling

### 6.1 Error Scenarios

| Scenario | Handling |
|----------|----------|
| 중복 신고 (409) | ReportModal에서 "이미 신고한 콘텐츠입니다" 에러 표시 (이미 구현됨) |
| 미로그인 신고 시도 | LoginBottomSheet 표시 (기존 패턴) |
| 신고 API 실패 | ReportModal에서 "신고에 실패했습니다" 에러 표시 (이미 구현됨) |
| 알림 로드 실패 | 기존 알림 에러 처리 로직 유지 |

---

## 7. Security Considerations

- [x] 신고 API는 인증 필수 (Authorization: Bearer token)
- [x] 본인 콘텐츠 신고 방지 (UI에서 버튼 숨김)
- [x] 중복 신고 방지 (Backend 409 응답 처리)
- [x] XSS 방지: description은 사용자 입력이지만 React가 기본 이스케이핑

---

## 8. Test Plan

### 8.1 Test Scope

| Type | Target | Tool |
|------|--------|------|
| Build Test | pnpm build 성공 | CLI |
| Lint Test | pnpm lint 에러 없음 | CLI |
| Manual Test | 신고 플로우, 알림 확인 | 브라우저 |

### 8.2 Test Cases

- [ ] Spot 상세에서 로그인 유저가 신고 버튼 클릭 → ReportModal 표시 → 사유 선택 → 신고 완료
- [ ] SpotLine 상세에서 동일 신고 플로우
- [ ] 본인 Spot에서 신고 버튼 미표시 확인
- [ ] 미로그인 시 신고 버튼 미표시 확인
- [ ] 알림 인박스에서 SPOT_APPROVED 타입 → 녹색 아이콘 + 승인 메시지
- [ ] 알림 인박스에서 SPOT_REJECTED 타입 → 빨간 아이콘 + 반려 메시지 + 사유
- [ ] Spot 등록 폼에 가이드라인 배너 표시 → 닫기 → 새로고침 시 다시 안 보임
- [ ] 기존 댓글 신고 기능 regression 없음

---

## 9. Implementation Guide

### 9.1 File Structure

```
src/
├── types/index.ts                              ← MODIFY: NotificationType, NotificationItem
├── components/
│   ├── spot/
│   │   ├── SpotBottomBar.tsx                   ← MODIFY: 신고 버튼 + ReportModal
│   │   ├── SpotContentGuide.tsx                ← NEW: 가이드라인 배너
│   │   └── SpotCreateForm.tsx                  ← MODIFY: SpotContentGuide 삽입
│   ├── spotline/
│   │   └── SpotLineBottomBar.tsx               ← MODIFY: 신고 버튼 + ReportModal
│   └── notification/
│       └── NotificationListItem.tsx            ← MODIFY: 심사 결과 렌더링
```

### 9.2 Implementation Order

1. [ ] **types/index.ts** — NotificationType에 `SPOT_APPROVED` | `SPOT_REJECTED` 추가, NotificationItem에 `message` 필드 추가
2. [ ] **SpotBottomBar.tsx** — 신고 버튼 + ReportModal import + 상태 관리
3. [ ] **SpotLineBottomBar.tsx** — 동일 신고 버튼 추가
4. [ ] **NotificationListItem.tsx** — NOTIFICATION_CONFIG에 2개 엔트리 추가, message 표시
5. [ ] **SpotContentGuide.tsx** — 새 컴포넌트 생성
6. [ ] **SpotCreateForm.tsx** — SpotContentGuide 삽입

### 9.3 Detailed Implementation Specs

#### 9.3.1 SpotBottomBar.tsx 변경

```typescript
// 추가 import
import { Flag } from "lucide-react";
import ReportModal from "@/components/comment/ReportModal";

// 추가 상태
const [showReport, setShowReport] = useState(false);
const session = useAuthStore((s) => s.session);
const isOwner = session?.user?.id === spot.userId;

// 신고 버튼 (공유 버튼과 코스 버튼 사이에 삽입)
// 조건: isAuthenticated && !isOwner
{isAuthenticated && !isOwner && (
  <button
    onClick={() => setShowReport(true)}
    className="flex items-center rounded-xl px-2 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-100"
    title="신고"
  >
    <Flag className="h-4 w-4" />
  </button>
)}

// ReportModal 렌더
{showReport && (
  <ReportModal
    targetType="SPOT"
    targetId={spot.id}
    onClose={() => setShowReport(false)}
    onSuccess={() => setShowReport(false)}
  />
)}
```

#### 9.3.2 SpotLineBottomBar.tsx 변경

동일 패턴. `targetType="SPOTLINE"`, `targetId={spotLine.id}`.
조건: `isAuthenticated && session?.user?.id !== spotLine.userId`.

#### 9.3.3 NotificationListItem.tsx 변경

```typescript
// 추가 import
import { CheckCircle, XCircle } from "lucide-react";

// NOTIFICATION_CONFIG에 추가
SPOT_APPROVED: {
  icon: CheckCircle,
  color: "text-green-500",
  getMessage: () => "회원님의 Spot이 승인되었습니다",
},
SPOT_REJECTED: {
  icon: XCircle,
  color: "text-red-500",
  getMessage: () => "회원님의 Spot이 반려되었습니다",
},

// getNotificationLink: SPOT_APPROVED/REJECTED → /spot/{targetSlug}
// (기존 switch case에서 targetType "SPOT"으로 이미 처리됨)

// message 표시 (반려 사유)
// notification.message가 있으면 메시지 아래에 추가 텍스트 표시
{notification.message && (
  <p className="text-xs text-gray-500 mt-0.5">
    사유: {notification.message}
  </p>
)}
```

#### 9.3.4 SpotContentGuide.tsx (신규)

```typescript
"use client";

import { useState, useEffect } from "react";
import { X, ClipboardList } from "lucide-react";

const GUIDE_DISMISSED_KEY = "spot-content-guide-dismissed";

export default function SpotContentGuide() {
  const [isDismissed, setIsDismissed] = useState(true); // default hidden to prevent flash

  useEffect(() => {
    setIsDismissed(sessionStorage.getItem(GUIDE_DISMISSED_KEY) === "true");
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem(GUIDE_DISMISSED_KEY, "true");
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  return (
    <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">Spot 등록 가이드라인</p>
            <ul className="mt-2 space-y-1 text-sm text-blue-800">
              <li>• 실제 방문한 장소만 등록해 주세요</li>
              <li>• 적절한 카테고리를 선택해 주세요</li>
              <li>• 명확한 장소 사진을 첨부하면 승인이 빨라요</li>
              <li>• 부적절한 콘텐츠는 반려될 수 있습니다</li>
            </ul>
          </div>
        </div>
        <button onClick={handleDismiss} className="shrink-0 rounded p-1 text-blue-400 hover:bg-blue-100">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
```

#### 9.3.5 SpotCreateForm.tsx 변경

```typescript
// 추가 import
import SpotContentGuide from "./SpotContentGuide";

// form 상단에 SpotContentGuide 삽입 (제목 입력 위)
// isEditMode가 아닌 경우에만 표시
{!isEditMode && <SpotContentGuide />}
```

---

## 10. Coding Convention Reference

### 10.1 This Feature's Conventions

| Item | Convention Applied |
|------|-------------------|
| Component naming | PascalCase (`SpotContentGuide`) |
| File organization | 기존 디렉토리 구조 유지 (spot/, spotline/, notification/) |
| State management | useState (컴포넌트 로컬 상태), sessionStorage (가이드라인 닫힘) |
| Error handling | ReportModal 기존 에러 핸들링 재사용 |
| Import order | React → lucide → @/lib → @/components → @/types |
| UI text | 한국어 |
| Styling | Tailwind CSS 4, `cn()` 유틸리티 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-16 | Initial draft | Claude |
