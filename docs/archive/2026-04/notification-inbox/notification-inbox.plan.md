# Notification Inbox Planning Document

> **Summary**: 팔로우, 좋아요, 댓글, SpotLine 포크 등 소셜 활동에 대한 알림 시스템과 인박스 페이지를 구축하여 사용자 재방문 루프 완성
>
> **Project**: front-spotLine + springboot-spotLine-backend
> **Author**: AI Assistant
> **Date**: 2026-04-12
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 팔로우, 좋아요, 댓글 등 소셜 기능이 구축되었지만 알림 시스템이 없어 사용자가 자신의 콘텐츠에 대한 반응을 인지할 수 없음. 앱을 직접 열어 확인해야 하므로 재방문 동기가 부재. |
| **Solution** | Backend에 Notification 엔티티 + REST API를 추가하고, Frontend에 알림 벨 아이콘(헤더) + `/inbox` 페이지를 구현. 팔로우/좋아요/댓글/포크 이벤트 발생 시 자동으로 알림 레코드 생성. |
| **Function/UX Effect** | 헤더의 알림 벨에 읽지 않은 알림 수가 뱃지로 표시. 클릭 시 인박스에서 시간순 알림 목록 확인. 알림 클릭 시 해당 Spot/SpotLine/댓글로 직접 이동. "모두 읽음" 일괄 처리. |
| **Core Value** | 소셜 피드백 루프 완성 → 콘텐츠 크리에이터의 재방문율 증가 + 커뮤니티 활성화. 향후 Push Notification(앱 전환 시) 기반 인프라 마련. |

---

## 1. Overview

### 1.1 Purpose

소셜 플랫폼의 핵심 재방문 메커니즘인 알림 시스템을 구축한다. 현재 팔로우, 좋아요, 저장, 댓글, SpotLine 포크 기능이 모두 구현되었지만 이벤트 발생 시 대상 사용자에게 알려주는 수단이 없다. 이 피처는 In-App 알림(웹 인박스)을 구현하여 사용자가 자신의 콘텐츠에 대한 피드백을 즉시 인지할 수 있게 한다.

### 1.2 Background

**현재 소셜 기능 현황**:
- `FollowController`: 팔로우/언팔로우 (`POST /api/v2/users/{id}/follow`)
- `SocialController`: 좋아요/저장 (`POST /api/v2/spots/{id}/like`, `POST /api/v2/spotlines/{id}/like`, etc.)
- `CommentController`: 댓글 작성 (`POST /api/v2/comments`)
- `UserSpotLineController`: SpotLine 포크 (`POST /api/v2/user-spotlines/fork/{id}`)
- `BlogController`: 블로그 좋아요/저장

**부재 사항**:
- Notification 엔티티/테이블 없음
- 알림 생성 로직 없음
- Frontend 알림 UI 없음
- `/inbox` 라우트 없음

### 1.3 현재 문제점

1. **피드백 루프 단절**: 팔로우/좋아요를 받아도 사용자가 인지할 수 없음
2. **재방문 동기 부재**: "새로운 반응"을 확인하러 올 이유가 없음
3. **크리에이터 동기 저하**: 콘텐츠 게시 후 반응을 볼 수 없어 지속 생산 동기 감소
4. **향후 Push 기반 부재**: 앱 전환(Phase 9) 시 Push Notification 인프라가 전무

---

## 2. Scope

### 2.1 In Scope

- [ ] **FR-01**: Backend — Notification 엔티티 + DB 테이블 (notifications)
- [ ] **FR-02**: Backend — NotificationService (알림 생성 로직)
- [ ] **FR-03**: Backend — NotificationController REST API (목록 조회, 읽음 처리, 삭제)
- [ ] **FR-04**: Backend — 기존 서비스에 알림 트리거 추가 (Follow, Social, Comment, Fork)
- [ ] **FR-05**: Frontend — 알림 벨 아이콘 + 읽지 않은 수 뱃지 (헤더)
- [ ] **FR-06**: Frontend — `/inbox` 페이지 (알림 목록, 읽음 처리, 링크 이동)
- [ ] **FR-07**: Frontend — 알림 타입별 메시지 렌더링 + 아바타/아이콘

### 2.2 Out of Scope

- Push Notification (Web Push / FCM) — Phase 9 앱 전환 시
- 이메일 알림
- 알림 설정 (켜기/끄기/타입별 필터) — 향후 확장
- 실시간 WebSocket (초기에는 폴링 방식)
- 관리자 공지 알림 (시스템 메시지)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | Notification 엔티티: id, recipientId, actorId, type, targetType, targetId, message, isRead, createdAt | High | Pending |
| FR-02 | NotificationService: 알림 생성 (자기 자신 제외), 중복 방지 (같은 actor+type+target 5분 내) | High | Pending |
| FR-03 | NotificationController: GET /notifications (목록, 페이지네이션), GET /notifications/unread-count, PUT /notifications/{id}/read, PUT /notifications/read-all, DELETE /notifications/{id} | High | Pending |
| FR-04 | 트리거 통합: FollowService.follow → "FOLLOW" 알림, SocialService.toggleLike → "LIKE" 알림, CommentService.create → "COMMENT" 알림, UserSpotLineService.fork → "FORK" 알림 | High | Pending |
| FR-05 | NotificationBell 컴포넌트: 헤더에 벨 아이콘, unread count > 0이면 빨간 뱃지, 클릭 시 /inbox 이동 | High | Pending |
| FR-06 | InboxPage: 시간순 알림 목록, 읽지 않은 알림 강조, 클릭 시 읽음 처리 + 대상 페이지 이동, "모두 읽음" 버튼, 무한 스크롤 | High | Pending |
| FR-07 | 알림 렌더링: 타입별 아이콘 + 메시지 ("OOO님이 회원님을 팔로우합니다"), actor 아바타, 상대 시간 (방금, 5분 전, 1시간 전) | Medium | Pending |

### 3.2 Notification Types

| Type | Trigger | Message Template | Target Link |
|------|---------|------------------|-------------|
| `FOLLOW` | 누군가 나를 팔로우 | "{actor}님이 회원님을 팔로우합니다" | `/profile/{actorId}` |
| `SPOT_LIKE` | 내 Spot에 좋아요 | "{actor}님이 회원님의 Spot을 좋아합니다" | `/spot/{targetSlug}` |
| `SPOTLINE_LIKE` | 내 SpotLine에 좋아요 | "{actor}님이 회원님의 SpotLine을 좋아합니다" | `/spotline/{targetSlug}` |
| `BLOG_LIKE` | 내 Blog에 좋아요 | "{actor}님이 회원님의 블로그를 좋아합니다" | `/blog/{targetSlug}` |
| `COMMENT` | 내 콘텐츠에 댓글 | "{actor}님이 댓글을 남겼습니다" | `/spot/{targetSlug}` or `/spotline/{targetSlug}` |
| `FORK` | 내 SpotLine이 포크됨 | "{actor}님이 회원님의 SpotLine을 복제했습니다" | `/spotline/{targetSlug}` |

### 3.3 Non-Functional Requirements

| Category | Criteria | Measurement |
|----------|----------|-------------|
| Performance | 알림 목록 API 응답 < 100ms | 페이지네이션 기본 20개 |
| Scalability | 사용자당 최대 500개 알림 보관 | 오래된 알림 자동 정리 (90일) |
| Consistency | 알림 생성은 비동기 불필요 (동기 OK) | 트리거 서비스와 같은 트랜잭션 |
| UX | unread count 폴링 간격 30초 | `setInterval` or `useSWR` revalidate |
| Mobile | 인박스 페이지 모바일 퍼스트 | 348px 이상 정상 표시 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] Backend: Notification 엔티티 + 테이블 생성
- [ ] Backend: CRUD API 5개 엔드포인트 동작
- [ ] Backend: 4개 트리거 통합 (follow, like, comment, fork)
- [ ] Backend: `./gradlew build` 성공
- [ ] Frontend: 알림 벨 + unread count 표시
- [ ] Frontend: `/inbox` 페이지 알림 목록 렌더링
- [ ] Frontend: 알림 클릭 → 대상 페이지 이동 + 읽음 처리
- [ ] Frontend: `pnpm build` 성공
- [ ] Gap Analysis 90% 이상

### 4.2 Quality Criteria

- [ ] 자기 자신의 액션에 대한 알림은 생성되지 않음
- [ ] 같은 actor+type+target 5분 내 중복 알림 방지
- [ ] 읽지 않은 알림 수가 정확히 일치
- [ ] 로그인하지 않은 상태에서 인박스 접근 시 로그인 유도

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 알림 폭증 (인기 콘텐츠) | Medium | Medium | 사용자당 500개 제한 + 동일 actor+type 중복 방지 |
| 폴링 기반 서버 부하 | Medium | Low | 30초 간격 + 로그인 사용자만 폴링 + 인박스 진입 시만 목록 조회 |
| 알림 지연 (트랜잭션 내 동기 생성) | Low | Low | 초기에는 동기 OK, 부하 증가 시 @Async 전환 가능 |
| 인증 없는 사용자 | Low | Medium | API에 JWT 필수, Frontend에서 auth 체크 후 벨 표시 |
| 삭제된 콘텐츠 알림 | Medium | Medium | 알림 클릭 시 404 → "삭제된 콘텐츠입니다" 메시지 |

---

## 6. Implementation Items

| # | Item | Repo | Files | Description |
|:-:|------|------|-------|-------------|
| 1 | NotificationType enum | backend | `NotificationType.java` (NEW) | FOLLOW, SPOT_LIKE, SPOTLINE_LIKE, BLOG_LIKE, COMMENT, FORK |
| 2 | Notification 엔티티 | backend | `Notification.java` (NEW) | id, recipientId, actorId, type, targetType, targetId, targetSlug, message, isRead, createdAt |
| 3 | NotificationRepository | backend | `NotificationRepository.java` (NEW) | JPA Repository + 커스텀 쿼리 (unread count, 중복 체크) |
| 4 | NotificationService | backend | `NotificationService.java` (NEW) | create(), markAsRead(), markAllAsRead(), delete(), getNotifications(), getUnreadCount() |
| 5 | NotificationController | backend | `NotificationController.java` (NEW) | 5개 엔드포인트 (GET list, GET unread-count, PUT read, PUT read-all, DELETE) |
| 6 | NotificationResponse DTO | backend | `NotificationResponse.java` (NEW) | 알림 응답 DTO (actor nickname/avatar 포함) |
| 7 | 트리거 통합 | backend | `FollowService.java`, `SocialService.java`, `CommentService.java`, `UserSpotLineService.java` (MODIFY) | 각 서비스에 notificationService.create() 호출 추가 |
| 8 | Frontend 타입 | front | `types/index.ts` (MODIFY) | Notification, NotificationType 인터페이스 |
| 9 | API 함수 | front | `lib/api.ts` (MODIFY) | fetchNotifications, fetchUnreadCount, markAsRead, markAllAsRead, deleteNotification |
| 10 | NotificationBell | front | `components/notification/NotificationBell.tsx` (NEW) | 벨 아이콘 + unread count 뱃지, 30초 폴링 |
| 11 | 헤더 통합 | front | 기존 헤더 컴포넌트 (MODIFY) | NotificationBell 배치 (로그인 시에만 표시) |
| 12 | InboxPage | front | `app/inbox/page.tsx` (NEW) | 알림 목록, 무한 스크롤, 읽음 처리, "모두 읽음" |
| 13 | NotificationItem | front | `components/notification/NotificationItem.tsx` (NEW) | 타입별 아이콘/메시지 + 아바타 + 상대 시간 |

---

## 7. Architecture Considerations

### 7.1 Project Level

Dynamic — Backend API 신규 + Frontend 페이지/컴포넌트 추가

### 7.2 Key Decisions

| Decision | Selected | Rationale |
|----------|----------|-----------|
| 알림 전달 방식 | 폴링 (30초) | WebSocket은 과도한 복잡도, 초기 사용자 수 적으므로 폴링 충분. Phase 9 앱 전환 시 Push로 전환 |
| 알림 생성 방식 | 동기 (같은 트랜잭션) | 비동기(MQ)는 오버엔지니어링. 알림 생성은 단순 INSERT 1건이므로 성능 영향 미미 |
| 알림 저장 | DB (notifications 테이블) | Redis 등 별도 저장소 불필요. PostgreSQL로 충분 |
| 중복 방지 | 5분 시간 윈도우 | 같은 사람이 좋아요 취소→재좋아요 반복 시 알림 폭발 방지 |
| unread count | 서버 카운트 API | 클라이언트 계산은 페이지네이션과 불일치. 서버 COUNT 쿼리가 정확 |

### 7.3 DB Schema

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id VARCHAR(255) NOT NULL REFERENCES users(id),
    actor_id VARCHAR(255) NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,           -- NotificationType enum
    target_type VARCHAR(50),             -- "SPOT", "SPOTLINE", "BLOG", "USER"
    target_id VARCHAR(255),              -- 대상 엔티티 ID
    target_slug VARCHAR(255),            -- 프론트 라우팅용
    message VARCHAR(500),                -- 렌더링된 메시지
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),

    -- Indexes
    INDEX idx_notifications_recipient (recipient_id, created_at DESC),
    INDEX idx_notifications_unread (recipient_id, is_read) WHERE is_read = FALSE
);
```

---

## 8. Next Steps

1. [ ] Design 문서 작성 (`/pdca design notification-inbox`)
2. [ ] 구현 (`/pdca do notification-inbox`)
3. [ ] Gap Analysis (`/pdca analyze notification-inbox`)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-12 | Initial draft | AI Assistant |
