# spot-approval-notification Design Document

> **Summary**: Spot 승인/반려 시 유저에게 인앱 알림을 자동 발송하는 백엔드 변경
>
> **Project**: Spotline
> **Version**: 1.0
> **Author**: AI
> **Date**: 2026-04-19
> **Status**: Draft
> **Planning Doc**: [spot-approval-notification.plan.md](../01-plan/features/spot-approval-notification.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- Backend NotificationType enum에 SPOT_APPROVED, SPOT_REJECTED 추가
- SpotService.approve()/reject()에서 NotificationService를 통해 알림 자동 생성
- 기존 프론트엔드 구현(이미 완료)과 백엔드를 연결하여 UGC 피드백 루프 완성

### 1.2 Design Principles

- 기존 패턴 준수: NotificationService.create() 동기 호출 방식 유지
- 최소 변경: Backend 2개 파일만 수정 (NotificationType.java, SpotService.java)
- 안전성: 자기 알림 방지, 5분 중복 방지 기존 로직 그대로 활용

---

## 2. Architecture

### 2.1 Component Diagram

```
┌──────────────┐     ┌──────────────┐     ┌────────────────────┐
│  Admin UI    │────▶│  SpotService │────▶│ NotificationService│
│ (approve/    │     │  .approve()  │     │   .create()        │
│  reject)     │     │  .reject()   │     │                    │
└──────────────┘     └──────────────┘     └────────────────────┘
                                                    │
                                                    ▼
                                          ┌────────────────────┐
                                          │  notifications     │
                                          │  (DB table)        │
                                          └────────────────────┘
                                                    │
                                                    ▼
                                          ┌────────────────────┐
                                          │  Front-end Inbox   │
                                          │  (이미 구현 완료)   │
                                          └────────────────────┘
```

### 2.2 Data Flow

```
Admin clicks approve/reject
  → SpotController calls SpotService.approve(slug, adminId) or reject(slug, reason, adminId)
  → SpotService updates Spot status in DB
  → SpotService calls NotificationService.create(adminId, spot.creatorId, type, "SPOT", spot.id, spot.slug)
  → NotificationService checks: self-notification? 5-min dedup?
  → Notification saved to DB
  → Frontend polls /api/v2/notifications → renders in inbox
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| SpotService | NotificationService | 알림 생성 트리거 |
| NotificationService | NotificationRepository | DB 저장 |
| Frontend NotificationListItem | Backend Notification API | 알림 렌더링 (이미 구현) |

---

## 3. Data Model

### 3.1 Enum 변경

```java
// NotificationType.java — 2개 값 추가
public enum NotificationType {
    FOLLOW,
    SPOT_LIKE,
    SPOTLINE_LIKE,
    BLOG_LIKE,
    COMMENT,
    FORK,
    SPOT_APPROVED,    // NEW
    SPOT_REJECTED     // NEW
}
```

### 3.2 기존 Notification 엔티티 (변경 없음)

```java
// Notification.java — 기존 구조 그대로 사용
@Entity
public class Notification {
    UUID id;
    String recipientId;    // spot.creatorId
    String actorId;        // adminId (승인/반려한 크루)
    NotificationType type; // SPOT_APPROVED or SPOT_REJECTED
    String targetType;     // "SPOT"
    String targetId;       // spot.id
    String targetSlug;     // spot.slug
    Boolean isRead;
    LocalDateTime createdAt;
}
```

### 3.3 Spot 엔티티 관련 필드 (변경 없음)

| Field | Type | 용도 |
|-------|------|------|
| `creatorId` | String | 알림 수신자 (recipientId) |
| `creatorType` | String | "crew" or "user" — user일 때만 알림 |
| `slug` | String | 알림 targetSlug |
| `id` | UUID | 알림 targetId |

---

## 4. API Specification

### 4.1 기존 API (변경 없음)

| Method | Path | Description |
|--------|------|-------------|
| PUT | `/api/v2/spots/{slug}/approve` | Spot 승인 (어드민) |
| PUT | `/api/v2/spots/{slug}/reject` | Spot 반려 (어드민) |
| GET | `/api/v2/notifications` | 알림 목록 조회 |

API 엔드포인트 변경 없음. SpotService 내부에서 알림 생성 로직만 추가.

---

## 5. UI/UX Design

### 5.1 프론트엔드 (변경 없음 — 이미 구현 완료)

**NotificationListItem.tsx 기존 구현:**

| Type | Icon | Color | Message |
|------|------|-------|---------|
| `SPOT_APPROVED` | CheckCircle | green-500 | "회원님의 Spot이 승인되었습니다" |
| `SPOT_REJECTED` | XCircle | red-500 | "회원님의 Spot이 반려되었습니다" |

**클릭 시 이동:** `targetType === "SPOT"` → `/spot/${targetSlug}`

---

## 6. Error Handling

| Scenario | Handling |
|----------|----------|
| Spot에 creatorId 없음 | 알림 생성 skip (null check) |
| creatorType이 "crew"인 경우 | NotificationService 자체 self-notification 방지로 처리 |
| NotificationService 예외 | approve/reject 트랜잭션에 포함 — 실패 시 함께 롤백 |

---

## 7. Security Considerations

- [x] 알림은 recipientId 기반으로만 조회 (기존 보안 유지)
- [x] 자기 알림 방지: `actorId.equals(recipientId)` 체크 (NotificationService 기본 로직)
- [x] 5분 중복 방지 윈도우 (NotificationService 기본 로직)

---

## 8. Test Plan

### 8.1 수동 테스트 시나리오

- [x] Spot 승인 → 생성자 알림 인박스에 SPOT_APPROVED 표시
- [x] Spot 반려 → 생성자 알림 인박스에 SPOT_REJECTED 표시
- [x] 알림 클릭 → `/spot/{slug}` 페이지 이동
- [x] 크루가 자기 Spot 승인 → 자기 알림 안 감
- [x] 같은 Spot 5분 내 재승인 → 중복 알림 안 감

---

## 9. Implementation Guide

### 9.1 변경 파일

```
springboot-spotLine-backend/
├── src/main/java/com/spotline/api/
│   ├── domain/enums/NotificationType.java    ← MODIFY
│   └── service/SpotService.java              ← MODIFY
```

### 9.2 Design Items (구현 순서)

| ID | Type | File | Description |
|----|------|------|-------------|
| DI-01 | MODIFY | `domain/enums/NotificationType.java` | `SPOT_APPROVED`, `SPOT_REJECTED` enum 값 추가 |
| DI-02 | MODIFY | `service/SpotService.java` | `NotificationService` 필드 주입 (생성자 주입, `@RequiredArgsConstructor`) |
| DI-03 | MODIFY | `service/SpotService.java` | `approve()` 메서드에 알림 트리거 추가 |
| DI-04 | MODIFY | `service/SpotService.java` | `reject()` 메서드에 알림 트리거 추가 |

### 9.3 상세 구현

#### DI-01: NotificationType enum 추가

```java
public enum NotificationType {
    FOLLOW,
    SPOT_LIKE,
    SPOTLINE_LIKE,
    BLOG_LIKE,
    COMMENT,
    FORK,
    SPOT_APPROVED,
    SPOT_REJECTED
}
```

#### DI-02: SpotService에 NotificationService 주입

```java
// SpotService.java — 필드 추가 (기존 @RequiredArgsConstructor 활용)
private final NotificationService notificationService;
```

#### DI-03: approve() 알림 트리거

```java
@Transactional
public SpotDetailResponse approve(String slug, String adminId) {
    Spot spot = spotRepository.findBySlugAndIsActiveTrue(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Spot", slug));
    spot.setStatus(SpotStatus.APPROVED);
    spot.setRejectionReason(null);
    spot.setReviewedAt(LocalDateTime.now());
    spot.setReviewedBy(adminId);
    spotRepository.save(spot);

    // 알림 생성 (self-notification 방지 + 5분 dedup은 NotificationService 내부 처리)
    if (spot.getCreatorId() != null) {
        notificationService.create(adminId, spot.getCreatorId(),
            NotificationType.SPOT_APPROVED, "SPOT",
            spot.getId().toString(), spot.getSlug());
    }

    return SpotDetailResponse.from(spot, null, getS3BaseUrl());
}
```

#### DI-04: reject() 알림 트리거

```java
@Transactional
public SpotDetailResponse reject(String slug, String reason, String adminId) {
    Spot spot = spotRepository.findBySlugAndIsActiveTrue(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Spot", slug));
    spot.setStatus(SpotStatus.REJECTED);
    spot.setRejectionReason(reason);
    spot.setReviewedAt(LocalDateTime.now());
    spot.setReviewedBy(adminId);
    spotRepository.save(spot);

    // 알림 생성 (반려 사유는 Spot 조회 시 rejectionReason 필드에서 확인)
    if (spot.getCreatorId() != null) {
        notificationService.create(adminId, spot.getCreatorId(),
            NotificationType.SPOT_REJECTED, "SPOT",
            spot.getId().toString(), spot.getSlug());
    }

    return SpotDetailResponse.from(spot, null, getS3BaseUrl());
}
```

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-19 | Initial draft | AI |
