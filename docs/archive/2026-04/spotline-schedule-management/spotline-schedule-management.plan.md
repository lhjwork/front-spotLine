# spotline-schedule-management Planning Document

> **Summary**: 내 일정 페이지 UX 고도화 — 캘린더 뷰, 날짜 수정, Spot 체크리스트, 완주 통계
>
> **Project**: front-spotLine (Spotline)
> **Version**: 0.1.0
> **Author**: Claude
> **Date**: 2026-04-17
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 내 일정 페이지가 단순 리스트 뷰만 제공하여 일정 관리 도구로서의 기능이 부족하고, 날짜 수정/Spot별 진행 추적이 불가능하다 |
| **Solution** | 캘린더 월간 뷰 + 날짜 수정 바텀시트 + Spot별 체크리스트 + 완주 통계 카드를 추가하여 일정 관리 경험을 완성한다 |
| **Function/UX Effect** | 한눈에 일정을 파악하는 캘린더, 터치 한 번으로 날짜 변경, Spot을 하나씩 체크하며 코스를 완주하는 성취감 |
| **Core Value** | 복제한 SpotLine을 실제로 경험하는 비율(완주율)을 높여 플랫폼 리텐션과 재방문을 강화한다 |

---

## 1. Overview

### 1.1 Purpose

현재 "내 일정" 페이지는 복제된 SpotLine을 예정/완료 탭으로 나누어 보여주는 기본 리스트 UI만 제공한다. 사용자가 날짜를 수정하거나, 코스 진행 상황을 추적하거나, 언제 어떤 일정이 있는지 시각적으로 파악하는 것이 불가능하다. 이 기능은 일정 관리 UX를 완성하여 복제→실제 경험→완주 전환율을 높이는 것을 목표로 한다.

### 1.2 Background

- Phase 7 (Experience Replication)의 핵심 사용자 플로우: 복제 → 일정 확인 → 경험 → 완주
- 현재 복제 기능(ReplicateSpotLineSheet)과 CRUD API는 완성되어 있음
- Backend에 `completionsCount` 필드가 있으나 증가 로직이 미구현
- `scheduledDate` 수정 API가 없음 (PATCH에서 status만 변경 가능)
- 프론트엔드에서 localStorage 폴백으로 오프라인 복원력 확보됨

### 1.3 Related Documents

- Phase 7 명세: `docs/01-plan/features/experience-social-platform.plan.md`
- SpotLine 상세 v2: `docs/archive/2026-04/spotline-detail-page-v2/`

---

## 2. Scope

### 2.1 In Scope

- [ ] 캘린더 월간 뷰 (일정이 있는 날짜에 도트 표시)
- [ ] 날짜 수정 기능 (기존 일정의 scheduledDate 변경)
- [ ] Spot별 체크리스트 (코스 내 개별 장소 방문 체크)
- [ ] 완주 통계 카드 (총 완주 수, 이번 달 완주, 연속 완주)
- [ ] completionsCount 증가 연동 (Backend PATCH 확장)

### 2.2 Out of Scope

- 푸시 알림 / 리마인더 (앱 전환 후 구현)
- 일정 공유 (Social Sharing 별도 feature)
- Google Calendar / ICS 연동 (Phase 9에서 검토)
- 일정 충돌 감지 (MVP 후 검토)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 월간 캘린더 뷰: 현재 월 달력에 일정이 있는 날짜에 도트 마커 표시, 날짜 클릭 시 해당 날짜 일정 필터링 | High | Pending |
| FR-02 | 날짜 수정: MySpotLineCard에서 날짜 탭 시 수정 바텀시트 표시, 빠른 날짜(오늘/내일/이번 주말) + 커스텀 날짜 선택 | High | Pending |
| FR-03 | Spot 체크리스트: 일정 카드 펼치면 포함된 Spot 목록 표시, 각 Spot에 체크 토글, 전체 완료 시 자동 완주 제안 | High | Pending |
| FR-04 | 완주 통계 카드: 페이지 상단에 총 완주/이번 달 완주/평균 Spot 수 표시 | Medium | Pending |
| FR-05 | Backend 확장: PATCH /users/me/spotlines/{id}에 scheduledDate 수정 지원, 완주 시 SpotLine.completionsCount 증가 | High | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 캘린더 렌더링 < 100ms, 날짜 변경 낙관적 업데이트 | Lighthouse, 체감 |
| Accessibility | 캘린더 키보드 탐색, 체크리스트 aria-checked | 수동 검증 |
| Offline | localStorage 폴백 유지, 체크리스트 상태 로컬 저장 | 네트워크 차단 테스트 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 모든 Functional Requirements 구현
- [ ] TypeScript 타입 체크 통과
- [ ] 모바일/데스크톱 반응형 확인
- [ ] Gap Analysis Match Rate >= 90%

### 4.2 Quality Criteria

- [ ] Zero lint errors
- [ ] Build 성공
- [ ] localStorage 폴백 정상 작동

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Backend scheduledDate PATCH 미지원 | High | High | Frontend에서 낙관적 업데이트 + localStorage 저장, Backend 확장 별도 요청 |
| Spot 체크리스트 데이터 미저장 | Medium | Medium | localStorage에 체크 상태 저장 (key: `spotline_checklist_{mySpotLineId}`) |
| 캘린더 라이브러리 번들 사이즈 | Medium | Low | 라이브러리 없이 직접 구현 (단순 월간 그리드) |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites | ☐ |
| **Dynamic** | Feature-based modules, BaaS integration | Web apps with backend | ☑ |
| **Enterprise** | Strict layer separation, microservices | High-traffic systems | ☐ |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Calendar | date-fns + 커스텀 그리드 / react-calendar | 커스텀 그리드 | 번들 최소화, 디자인 자유도 |
| Checklist Storage | Backend API / localStorage | localStorage | Backend 변경 최소화, 오프라인 지원 |
| State Management | Zustand (기존 store 확장) | Zustand | 기존 useMySpotLinesStore 활용 |
| Date Mutation | 새 API / 기존 PATCH 확장 | 기존 PATCH 확장 | scheduledDate 필드 추가만으로 충분 |

### 6.3 Implementation Strategy

```
Frontend Only (Backend 변경 최소):
├── 캘린더 뷰: 순수 프론트엔드 (date-fns로 월 계산)
├── 날짜 수정: 기존 PATCH API에 scheduledDate 추가 요청
├── Spot 체크리스트: localStorage 기반 (Backend 변경 불필요)
└── 완주 통계: 기존 fetchMySpotLines 데이터로 프론트 계산
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions section
- [x] ESLint configuration
- [x] TypeScript configuration (`tsconfig.json`)
- [x] Tailwind CSS 4, 모바일 퍼스트 반응형

### 7.2 New Components Needed

| Component | Location | Type |
|-----------|----------|------|
| `ScheduleCalendar` | `src/components/spotline/` | Client (인터랙티브) |
| `EditDateSheet` | `src/components/spotline/` | Client (바텀시트) |
| `SpotChecklist` | `src/components/spotline/` | Client (토글) |
| `ScheduleStatsCard` | `src/components/spotline/` | Server (통계 표시) |

### 7.3 Files to Modify

| File | Changes |
|------|---------|
| `MySpotLinesList.tsx` | 캘린더 뷰 토글, 통계 카드 추가 |
| `MySpotLineCard.tsx` | 날짜 탭 수정, 체크리스트 아코디언 |
| `useMySpotLinesStore.ts` | updateScheduledDate 액션 추가 |
| `api.ts` | updateMySpotLineDate 함수 추가 |
| `types/index.ts` | SpotChecklist 타입 추가 |

---

## 8. Next Steps

1. [ ] Write design document (`spotline-schedule-management.design.md`)
2. [ ] Backend에 PATCH scheduledDate 지원 요청 확인
3. [ ] Start implementation

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-17 | Initial draft | Claude |
