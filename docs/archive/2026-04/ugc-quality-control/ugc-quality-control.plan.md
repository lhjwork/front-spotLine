# ugc-quality-control Planning Document

> **Summary**: UGC 품질 관리 — Spot/SpotLine 신고 UI + 심사 결과 알림 + 콘텐츠 작성 가이드라인
>
> **Project**: front-spotLine
> **Version**: 0.1.0
> **Author**: Claude
> **Date**: 2026-04-16
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 유저가 부적절한 Spot/SpotLine을 신고할 수 없고, 자신이 등록한 콘텐츠의 심사 결과(승인/반려)를 알림으로 받을 수 없다 |
| **Solution** | Spot/SpotLine 상세 페이지에 신고 기능 추가, 알림 시스템에 심사 결과 타입 확장, 콘텐츠 작성 시 품질 가이드라인 표시 |
| **Function/UX Effect** | 신고 버튼 1탭으로 부적절 콘텐츠 접수, 알림 인박스에서 승인/반려 즉시 확인, 작성 시 가이드로 반려율 감소 |
| **Core Value** | 플랫폼 콘텐츠 신뢰도 향상 + 유저 참여 피드백 루프 완성 |

---

## 1. Overview

### 1.1 Purpose

현재 UGC 품질 관리 시스템은 Backend에 완전 구현되어 있으나 Frontend에서 일부 기능이 누락되어 있다:
- **댓글 신고만 가능** — Spot/SpotLine 콘텐츠 자체는 신고할 수 없음
- **심사 결과 알림 없음** — 관리자가 승인/반려해도 유저가 직접 "내 Spot" 페이지를 확인해야 함
- **콘텐츠 가이드라인 없음** — 유저가 Spot 등록 시 어떤 품질 기준이 있는지 모름

### 1.2 Background

- Backend: SpotStatus (PENDING/APPROVED/REJECTED) + ContentReport (COMMENT만 활성) 완비
- Admin: UserContentReview + ModerationQueue 페이지 완비
- Frontend: SpotStatusBadge, MySpotsList (상태별 필터) 구현 완료
- 누락: Spot/SpotLine 신고 UI, 심사 결과 알림, 작성 가이드라인

### 1.3 Related Documents

- Backend API: `springboot-spotLine-backend` SpotController, ContentReportController
- Admin UI: `admin-spotLine` UserContentReview.tsx, ModerationQueue.tsx
- Frontend 기존: `front-spotLine` SpotStatusBadge.tsx, ReportModal.tsx (댓글용)

---

## 2. Scope

### 2.1 In Scope

- [ ] Spot 상세 페이지에서 Spot 신고 기능 (targetType: "SPOT")
- [ ] SpotLine 상세 페이지에서 SpotLine 신고 기능 (targetType: "SPOTLINE")
- [ ] 기존 ReportModal을 범용화하여 Spot/SpotLine/Comment 모두 지원
- [ ] NotificationType에 SPOT_APPROVED, SPOT_REJECTED 추가
- [ ] 알림 인박스에 심사 결과 렌더링 (승인/반려 + 반려 사유)
- [ ] Spot 등록 폼에 콘텐츠 가이드라인 안내 UI

### 2.2 Out of Scope

- SpotLine 심사 워크플로우 (현재 SpotLine에는 status 필드 없음 — 별도 피처로)
- 자동 콘텐츠 필터링/AI 모더레이션
- 신고 접수 알림 (관리자 대시보드에 이미 badge 있음)
- 신고 이력 조회 페이지

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | Spot 상세 페이지에 신고 버튼 추가 (로그인 유저만, 본인 콘텐츠 제외) | High | Pending |
| FR-02 | SpotLine 상세 페이지에 신고 버튼 추가 (동일 조건) | High | Pending |
| FR-03 | ReportModal을 범용 ContentReportModal로 리팩터 — targetType 파라미터 지원 | High | Pending |
| FR-04 | API 레이어에 createReport의 targetType을 "SPOT" \| "SPOTLINE" \| "COMMENT"로 확장 | High | Pending |
| FR-05 | NotificationType에 "SPOT_APPROVED" \| "SPOT_REJECTED" 타입 추가 | High | Pending |
| FR-06 | NotificationItem에 심사 결과 렌더링 (아이콘, 메시지, 반려 사유 표시) | High | Pending |
| FR-07 | Spot 등록 폼(/my-spots/create)에 품질 가이드라인 배너/팁 표시 | Medium | Pending |
| FR-08 | 중복 신고 시 toast 에러 메시지 ("이미 신고한 콘텐츠입니다") | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 신고 API 응답 < 500ms | Network tab |
| UX | 신고 모달 2탭 이내 완료 | 수동 테스트 |
| Accessibility | 모달 포커스 트랩, ESC 닫기 | 수동 테스트 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 모든 FR 구현 완료
- [ ] Spot/SpotLine 상세에서 신고 가능
- [ ] 알림 인박스에서 승인/반려 결과 확인 가능
- [ ] Spot 등록 시 가이드라인 표시
- [ ] `pnpm build` 성공
- [ ] `pnpm lint` 에러 없음

### 4.2 Quality Criteria

- [ ] Zero lint errors (신규 파일 기준)
- [ ] Build succeeds
- [ ] 기존 ReportModal 기능 regression 없음

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Backend가 SPOT/SPOTLINE targetType을 아직 검증하지 않을 수 있음 | High | Medium | ContentReportService 코드 확인 — 현재 COMMENT만 검증 중이면 Backend 수정 필요 |
| 알림 API가 SPOT_APPROVED/REJECTED 타입을 반환하지 않을 수 있음 | High | High | Backend에 알림 생성 로직 추가 필요 — Frontend은 타입만 확장하고 렌더링 준비 |
| ReportModal 리팩터 시 댓글 신고 기능 regression | Medium | Low | targetType 파라미터 기본값 "COMMENT"으로 하위 호환 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites | |
| **Dynamic** | Feature-based, BaaS | Web apps with backend | **V** |
| **Enterprise** | Strict layer separation | High-traffic systems | |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Framework | Next.js 16 | Next.js 16 | 기존 프로젝트 |
| State Management | Zustand | Zustand | 기존 패턴 유지 |
| API Client | Axios | Axios | 기존 api.ts 레이어 |
| Styling | Tailwind CSS 4 | Tailwind CSS 4 | 기존 패턴 |

### 6.3 Component Strategy

```
변경 파일 예상:
┌─────────────────────────────────────────────────────┐
│ NEW:                                                │
│   src/components/report/ContentReportModal.tsx      │  ← 범용 신고 모달
│   src/components/spot/SpotContentGuide.tsx          │  ← 작성 가이드라인
│                                                     │
│ MODIFY:                                             │
│   src/types/index.ts                                │  ← NotificationType 확장
│   src/lib/api.ts                                    │  ← createReport 타입 확장
│   src/app/spot/[slug]/page.tsx                      │  ← 신고 버튼
│   src/app/spotline/[slug]/page.tsx                  │  ← 신고 버튼
│   src/components/comment/CommentItem.tsx            │  ← 새 모달 import
│   src/components/notification/NotificationItem.tsx  │  ← 심사 결과 렌더링
│   src/app/my-spots/create/page.tsx (or form)        │  ← 가이드라인 삽입
└─────────────────────────────────────────────────────┘
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions section
- [x] `src/CLAUDE.md` — 임포트/네이밍/스타일링 규칙
- [x] ESLint configuration
- [x] TypeScript strict mode

### 7.2 Conventions to Follow

| Category | Rule |
|----------|------|
| **UI 텍스트** | 한국어 |
| **코드** | 영어 (변수명, 타입, 주석) |
| **컴포넌트** | PascalCase, Props 접미사 |
| **import** | `@/*` 별칭, React → 외부 → 내부 순서 |
| **스타일** | Tailwind CSS 4, `cn()` 유틸, 모바일 퍼스트 |

### 7.3 Environment Variables Needed

추가 환경 변수 없음 — 기존 `NEXT_PUBLIC_API_BASE_URL` 사용.

---

## 8. Next Steps

1. [ ] Design document 작성 (`/pdca design ugc-quality-control`)
2. [ ] Backend SPOT/SPOTLINE targetType 지원 확인/추가
3. [ ] Backend 심사 결과 알림 생성 로직 확인/추가
4. [ ] 구현 시작

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-16 | Initial draft | Claude |
