# spot-approval-notification Planning Document

> **Summary**: Spot 승인/반려 시 유저에게 알림을 자동 발송하는 기능
>
> **Project**: Spotline
> **Version**: 1.0
> **Author**: AI
> **Date**: 2026-04-19
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 유저가 Spot을 생성하면 PENDING 상태로 크루 승인을 기다리지만, 승인/반려 결과를 알 수 없어 앱을 반복 확인해야 함 |
| **Solution** | SpotService.approve()/reject() 호출 시 NotificationService를 통해 SPOT_APPROVED/SPOT_REJECTED 알림을 자동 생성 |
| **Function/UX Effect** | 유저가 알림 인박스에서 즉시 결과를 확인하고, 반려 시 사유와 함께 해당 Spot으로 바로 이동 가능 |
| **Core Value** | UGC 참여 루프 완성 — 생성 → 대기 → 결과 확인 → 재수정의 피드백 사이클 구축 |

---

## 1. Overview

### 1.1 Purpose

유저가 생성한 Spot이 크루에 의해 승인 또는 반려될 때, 해당 유저에게 알림을 발송하여 UGC 피드백 루프를 완성한다.

### 1.2 Background

- 유저 생성 Spot은 `SpotStatus.PENDING`으로 시작하여 크루 승인이 필요
- 현재 SpotService.approve()/reject()는 DB 상태만 변경하고 알림을 보내지 않음
- 프론트엔드는 이미 `SPOT_APPROVED`/`SPOT_REJECTED` 타입의 알림 렌더링을 완전히 구현함
- 백엔드 `NotificationType` enum에만 두 타입이 누락되어 있음

### 1.3 Related Documents

- Backend SpotService: `springboot-spotLine-backend/.../service/SpotService.java`
- NotificationService: `springboot-spotLine-backend/.../service/NotificationService.java`
- Frontend NotificationListItem: `front-spotLine/src/components/notification/NotificationListItem.tsx`

---

## 2. Scope

### 2.1 In Scope

- [x] Backend `NotificationType` enum에 `SPOT_APPROVED`, `SPOT_REJECTED` 추가
- [x] `SpotService.approve()` 메서드에 알림 트리거 추가
- [x] `SpotService.reject()` 메서드에 알림 트리거 추가 (반려 사유 포함)
- [x] 프론트엔드 알림 타입 동기화 확인 (이미 구현됨)

### 2.2 Out of Scope

- 이메일/푸시 알림 (현재 인앱 알림만)
- SpotLine 승인 워크플로우 (별도 피처)
- 실시간 WebSocket 알림 (현재 폴링 방식 유지)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | Spot 승인 시 생성자에게 SPOT_APPROVED 알림 생성 | High | Pending |
| FR-02 | Spot 반려 시 생성자에게 SPOT_REJECTED 알림 생성 | High | Pending |
| FR-03 | 알림 클릭 시 해당 Spot 상세 페이지로 이동 | High | Done (프론트 구현 완료) |
| FR-04 | 반려 알림에서 반려 사유 확인 가능 | Medium | Pending |
| FR-05 | 크루가 자기 Spot을 승인/반려 시 자기 알림 안 감 | Low | Done (NotificationService 기본 로직) |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 알림 생성이 승인/반려 트랜잭션에 영향 없음 | 응답 시간 < 200ms 유지 |
| Reliability | 5분 중복 방지 윈도우 기존 로직 활용 | NotificationService 기본 dedup |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [x] NotificationType에 SPOT_APPROVED, SPOT_REJECTED 추가
- [x] SpotService.approve()에서 알림 생성
- [x] SpotService.reject()에서 알림 생성
- [x] 프론트엔드 인박스에서 승인/반려 알림 정상 표시
- [x] 알림 클릭 시 Spot 상세 페이지 이동

### 4.2 Quality Criteria

- [x] 기존 테스트 깨지지 않음
- [x] 빌드 성공
- [x] 알림 중복 방지 동작 확인

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 크루가 아닌 시스템 계정으로 알림 발송 시 actorId 매핑 | Low | Low | 크루 adminId를 actorId로 사용 (현재 approve/reject에 이미 adminId 전달) |
| Spot 생성자(creatorId) 필드 누락 | Medium | Low | Spot 엔티티에 creatorId 확인 필요 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites | ☐ |
| **Dynamic** | Feature-based modules, BaaS | Web apps with backend | ☑ |
| **Enterprise** | Strict layer separation, DI | High-traffic systems | ☐ |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| 알림 생성 방식 | 동기 호출 / 이벤트 기반 | 동기 호출 | 기존 패턴 유지, 단순성 |
| 반려 사유 전달 | Notification 엔티티 message 필드 / Spot 조회 | Spot 조회 시 rejectionReason | 기존 Spot 엔티티에 이미 저장됨 |

### 6.3 변경 영향 범위

```
springboot-spotLine-backend/
├── domain/enums/NotificationType.java    ← SPOT_APPROVED, SPOT_REJECTED 추가
└── service/SpotService.java              ← NotificationService 주입 + 알림 트리거

front-spotLine/ (변경 없음 — 이미 구현 완료)
├── src/types/index.ts                    ← SPOT_APPROVED, SPOT_REJECTED 이미 정의
└── src/components/notification/          ← 렌더링 로직 이미 구현
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions section
- [x] TypeScript configuration (`tsconfig.json`)
- [x] Spring Boot conventions (service layer pattern)

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **Enum 동기화** | exists (enums 피처 완료) | Backend ↔ Frontend enum 일치 확인 | High |
| **Notification 패턴** | exists | 기존 패턴 따름 (동기 호출) | Medium |

---

## 8. Next Steps

1. [x] Write design document (`spot-approval-notification.design.md`)
2. [x] Implementation (Backend 변경 2개 파일)
3. [x] Gap analysis

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-19 | Initial draft | AI |
