# user-visit-checkin Design Document

> **Summary**: 유저 Spot 방문 체크인 "가봤어요" 토글 — Backend 엔티티/API + Frontend 토글 버튼 + 프로필 통계
>
> **Feature**: user-visit-checkin
> **Version**: 0.1.0
> **Author**: Crew
> **Date**: 2026-04-14
> **Status**: Draft
> **Plan Reference**: `docs/01-plan/features/user-visit-checkin.plan.md`

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 유저가 Spot을 실제 방문했는지 표시할 방법이 없어, 프로필의 "방문" 통계가 항상 0이고 경험 기반 콘텐츠 신뢰도가 부재 |
| **Solution** | Like/Save 소셜 토글 패턴과 동일한 "가봤어요" 체크인 기능 — SpotVisit 엔티티, visit 토글 API, SocialStore 확장 |
| **Function/UX Effect** | Spot 상세에서 "가봤어요" 한 번 탭으로 방문 기록, 프로필에서 방문 Spot 목록 확인, 방문 카운트로 콘텐츠 신뢰도 표시 |
| **Core Value** | Experience Recording 핵심 축의 첫 단추 — 유저 참여도와 콘텐츠 신뢰성 동시 확보 |

---

## 1. Architecture Overview

### 1.1 System Architecture

```
[SpotBottomBar] → toggleVisit() → [useSocialStore] → optimistic update
                                         ↓
                              POST /api/v2/spots/{id}/visit
                                         ↓
                              [SocialController] → [SocialService]
                                         ↓
                              [SpotVisitRepository] → spot_visits 테이블
                                         ↓
                              Spot.visitedCount 증감 → SocialToggleResponse 반환
```

### 1.2 Design Decisions

| Decision | Selected | Rationale |
|----------|----------|-----------|
| 엔티티 패턴 | SpotLike와 동일 | 일관성, 검증된 패턴 |
| API 엔드포인트 | `POST /spots/{id}/visit` | Like/Save와 동일 패턴 |
| 상태 관리 | useSocialStore 확장 | 기존 social 상태와 통합 |
| 카운트 관리 | Spot.visitedCount 필드 | Like/Save 동일 패턴, 조회 성능 |

---

## 2. Data Model

### 2.1 New Entity: SpotVisit

```java
@Entity
@Table(name = "spot_visits", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "spot_id"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SpotVisit {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spot_id", nullable = false)
    private Spot spot;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

### 2.2 Spot Entity 변경

```java
// Spot.java에 추가
@Column(nullable = false)
@Builder.Default
private Integer visitedCount = 0;
```

### 2.3 DB Migration (V3)

```sql
-- V3__add_spot_visit.sql

-- spot_visits 테이블
CREATE TABLE spot_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    spot_id UUID NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, spot_id)
);

CREATE INDEX idx_spot_visits_user_id ON spot_visits(user_id);
CREATE INDEX idx_spot_visits_spot_id ON spot_visits(spot_id);

-- spots 테이블에 visited_count 컬럼 추가
ALTER TABLE spots ADD COLUMN visited_count INTEGER NOT NULL DEFAULT 0;
```

---

## 3. API Specification

### 3.1 Visit Toggle

```
POST /api/v2/spots/{id}/visit
Authorization: Bearer {token} (required)

Response 200:
{
  "liked": null,
  "saved": null,
  "visited": true,
  "likesCount": null,
  "savesCount": null,
  "visitedCount": 42
}
```

### 3.2 Social Status 확장

```
GET /api/v2/spots/{id}/social
Authorization: Bearer {token} (optional)

Response 200:
{
  "isLiked": false,
  "isSaved": true,
  "isVisited": false
}
```

### 3.3 User Visited Spots

```
GET /api/v2/users/{userId}/visited-spots?page=0&size=20
Authorization: Bearer {token} (optional)

Response 200:
{
  "content": [SpotSummaryResponse],
  "totalElements": 15,
  "totalPages": 1,
  "number": 0,
  "size": 20
}
```

---

## 4. Backend Implementation

### 4.1 SpotVisitRepository

```java
public interface SpotVisitRepository extends JpaRepository<SpotVisit, UUID> {
    Optional<SpotVisit> findByUserIdAndSpot(String userId, Spot spot);
    boolean existsByUserIdAndSpot(String userId, Spot spot);
    Page<SpotVisit> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    long countByUserId(String userId);
}
```

### 4.2 SocialService 확장

```java
// toggleSpotVisit — Like/Save 토글과 동일 패턴
public SocialToggleResponse toggleSpotVisit(UUID spotId, String userId) {
    Spot spot = spotRepository.findById(spotId)
        .orElseThrow(() -> new ResourceNotFoundException("Spot not found"));

    Optional<SpotVisit> existing = spotVisitRepository.findByUserIdAndSpot(userId, spot);

    boolean visited;
    if (existing.isPresent()) {
        spotVisitRepository.delete(existing.get());
        spot.setVisitedCount(Math.max(0, spot.getVisitedCount() - 1));
        visited = false;
    } else {
        SpotVisit visit = SpotVisit.builder()
            .userId(userId)
            .spot(spot)
            .build();
        spotVisitRepository.save(visit);
        spot.setVisitedCount(spot.getVisitedCount() + 1);
        visited = true;
    }
    spotRepository.save(spot);

    return new SocialToggleResponse(null, null, visited, null, null, spot.getVisitedCount());
}
```

### 4.3 SocialController 확장

```java
@PostMapping("/spots/{id}/visit")
@Operation(summary = "Spot 방문 토글")
public ResponseEntity<SocialToggleResponse> toggleSpotVisit(
        @PathVariable UUID id,
        HttpServletRequest request) {
    String userId = authUtil.requireUserId(request);
    return ResponseEntity.ok(socialService.toggleSpotVisit(id, userId));
}
```

### 4.4 DTO 변경

**SocialStatusResponse.java:**
```java
@Data @AllArgsConstructor
public class SocialStatusResponse {
    @JsonProperty("isLiked") private boolean liked;
    @JsonProperty("isSaved") private boolean saved;
    @JsonProperty("isVisited") private boolean visited;  // NEW
}
```

**SocialToggleResponse.java:**
```java
@Data @AllArgsConstructor
public class SocialToggleResponse {
    private Boolean liked;
    private Boolean saved;
    private Boolean visited;      // NEW
    private Integer likesCount;
    private Integer savesCount;
    private Integer visitedCount;  // NEW
}
```

### 4.5 UserService stats.visited

```java
// UserProfileResponse.from() 변경
long visitedCount = spotVisitRepository.countByUserId(userId);
.stats(UserStatsResponse.builder()
    .visited((int) visitedCount)  // 하드코딩 0 제거
    .liked(likedCount)
    // ...
```

---

## 5. Frontend Implementation

### 5.1 Type Changes (`types/index.ts`)

```typescript
// SocialStatus에 추가
export interface SocialStatus {
  isLiked: boolean;
  isSaved: boolean;
  isVisited: boolean;  // NEW
}

// SocialToggleResponse에 추가
export interface SocialToggleResponse {
  liked?: boolean;
  saved?: boolean;
  visited?: boolean;       // NEW
  likesCount?: number;
  savesCount?: number;
  visitedCount?: number;   // NEW
}

// SpotDetailResponse에 추가
visitedCount: number;  // NEW
```

### 5.2 API Layer (`lib/api.ts`)

```typescript
// toggleVisit 함수 추가
export async function toggleVisit(spotId: string): Promise<SocialToggleResponse> {
  const { data } = await api.post(`/api/v2/spots/${spotId}/visit`);
  return data;
}

// fetchVisitedSpots 함수 추가
export async function fetchVisitedSpots(
  userId: string, page = 0, size = 20
): Promise<PaginatedResponse<SpotSummaryResponse>> {
  const { data } = await api.get(`/api/v2/users/${userId}/visited-spots`, {
    params: { page, size }
  });
  return data;
}
```

### 5.3 Social Store (`useSocialStore.ts`)

```typescript
// SocialItem 확장
interface SocialItem {
  liked: boolean;
  saved: boolean;
  visited: boolean;       // NEW
  likesCount: number;
  savesCount: number;
  visitedCount: number;   // NEW
}

// initSocialStatus 확장
initSocialStatus: (type, id, status, counts) => {
  // counts에 visitedCount 추가
  // status에 isVisited 추가
}

// toggleVisit 액션 추가 — toggleLike와 동일 패턴
toggleVisit: async (type, id) => {
  const key = makeKey(type, id);
  const current = get().items[key];
  // optimistic update
  set(state => ({
    items: {
      ...state.items,
      [key]: {
        ...current,
        visited: !current.visited,
        visitedCount: current.visited
          ? Math.max(0, current.visitedCount - 1)
          : current.visitedCount + 1,
      }
    }
  }));
  try {
    const res = await toggleVisit(id);
    // server response로 보정
    set(state => ({
      items: {
        ...state.items,
        [key]: {
          ...state.items[key],
          visited: res.visited ?? state.items[key].visited,
          visitedCount: res.visitedCount ?? state.items[key].visitedCount,
        }
      }
    }));
  } catch {
    // rollback
    set(state => ({
      items: { ...state.items, [key]: current }
    }));
  }
}
```

### 5.4 SocialHydrator 확장

```typescript
// props에 visitedCount 추가
interface SocialHydratorProps {
  type: string;
  id: string;
  likesCount: number;
  savesCount: number;
  visitedCount: number;  // NEW
}

// initSocialStatus 호출 시 visitedCount, isVisited 포함
initSocialStatus(type, id, {
  isLiked: false,
  isSaved: false,
  isVisited: false,
}, {
  likesCount, savesCount, visitedCount
});
```

### 5.5 SpotBottomBar — "가봤어요" 버튼

```
기존 버튼 배치:
[❤️ 좋아요] [🔖 저장] [📤 공유] [📍 SpotLine] [🧭 길찾기]

변경 후:
[❤️ 좋아요] [🔖 저장] [✅ 가봤어요] [📤 공유] [📍 SpotLine] [🧭 길찾기]
```

- 아이콘: `MapPinCheck` (lucide-react)
- 활성 상태: green-500 배경 + white 아이콘 + "가봤어요" 텍스트
- 비활성 상태: gray 아이콘 + "방문" 텍스트
- 인증 미완료 시: LoginBottomSheet 표시 (기존 패턴)

### 5.6 Spot 상세 페이지 — visitedCount 표시

- 위치: 기존 likesCount 표시 영역 인근
- 형식: `"N명 방문"` 텍스트 (MapPinCheck 아이콘 + 카운트)

### 5.7 ProfileTabs — "방문" 탭 추가

```typescript
// TabKey에 "visited" 추가
type TabKey = "likes" | "saves" | "visited" | "spotlines" | "my-spots" | "blogs";

// TABS 배열에 추가 (saves 다음)
{ key: "visited", label: "방문", icon: MapPinCheck }

// loadTabData에 visited 케이스 추가
case "visited":
  const data = await fetchVisitedSpots(userId, 0, 20);
  // SpotPreviewCard 그리드로 렌더링
```

---

## 6. Error Handling

| Scenario | Backend Response | Frontend Handling |
|----------|-----------------|-------------------|
| 인증 안 됨 | 401 Unauthorized | LoginBottomSheet 표시 |
| Spot 미존재 | 404 Not Found | 토스트 에러 메시지 |
| 네트워크 에러 | - | optimistic update 롤백 |
| 중복 요청 | unique constraint → toggle | 정상 동작 (toggle) |

---

## 7. Security

- Visit 토글: `authUtil.requireUserId()` — 인증 필수
- Social Status 조회: `authUtil.getCurrentUserId()` — 비인증 허용 (isVisited=false)
- 방문 Spot 목록: 공개 (다른 유저 프로필에서도 조회 가능)
- CSRF: 기존 Spring Security 설정 활용

---

## 8. Implementation Guide

### 8.1 Implementation Order

```
Step 1: Backend Entity + Migration
  ├─ SpotVisit.java (NEW)
  ├─ SpotVisitRepository.java (NEW)
  ├─ V3__add_spot_visit.sql (NEW)
  └─ Spot.java (+visitedCount 필드)

Step 2: Backend Service + Controller + DTO
  ├─ SocialToggleResponse.java (+visited, +visitedCount)
  ├─ SocialStatusResponse.java (+isVisited)
  ├─ SocialService.java (+toggleSpotVisit, +getSpotSocialStatus 확장)
  ├─ SocialController.java (+visit 엔드포인트)
  └─ UserService.java (stats.visited 실카운트)

Step 3: Frontend Types + API
  ├─ types/index.ts (+isVisited, +visitedCount)
  └─ lib/api.ts (+toggleVisit, +fetchVisitedSpots)

Step 4: Frontend Store + Hydrator
  ├─ store/useSocialStore.ts (+visited 상태, +toggleVisit)
  └─ components/social/SocialHydrator.tsx (+visitedCount)

Step 5: Frontend UI
  ├─ components/spot/SpotBottomBar.tsx (+가봤어요 버튼)
  ├─ app/spot/[slug]/page.tsx (+visitedCount 표시, +SocialHydrator props)
  └─ components/profile/ProfileTabs.tsx (+방문 탭)
```

### 8.2 File Change Summary

| File | Repo | Action | Description |
|------|------|--------|-------------|
| `entity/SpotVisit.java` | backend | NEW | 방문 엔티티 (SpotLike 패턴) |
| `repository/SpotVisitRepository.java` | backend | NEW | 방문 리포지토리 |
| `db/migration/V3__add_spot_visit.sql` | backend | NEW | 마이그레이션 |
| `entity/Spot.java` | backend | MODIFY | +visitedCount 필드 |
| `dto/response/SocialToggleResponse.java` | backend | MODIFY | +visited, +visitedCount |
| `dto/response/SocialStatusResponse.java` | backend | MODIFY | +isVisited |
| `service/SocialService.java` | backend | MODIFY | +toggleSpotVisit, status 확장 |
| `controller/SocialController.java` | backend | MODIFY | +visit 엔드포인트 |
| `service/UserService.java` | backend | MODIFY | stats.visited 실카운트 |
| `types/index.ts` | frontend | MODIFY | +isVisited, +visitedCount |
| `lib/api.ts` | frontend | MODIFY | +toggleVisit, +fetchVisitedSpots |
| `store/useSocialStore.ts` | frontend | MODIFY | +visited 상태, +toggleVisit |
| `components/social/SocialHydrator.tsx` | frontend | MODIFY | +visitedCount prop |
| `components/spot/SpotBottomBar.tsx` | frontend | MODIFY | +가봤어요 버튼 |
| `app/spot/[slug]/page.tsx` | frontend | MODIFY | +visitedCount 표시 |
| `components/profile/ProfileTabs.tsx` | frontend | MODIFY | +방문 탭 |

**Total: 16 files (3 NEW, 13 MODIFY)**

### 8.3 Coding Convention

- Entity: `@Builder` + `@Getter/@Setter` (Lombok)
- DTO 필드 추가 시 기존 필드 변경 없음 (하위 호환)
- Frontend: `cn()` 유틸리티로 조건부 클래스
- UI 텍스트 한국어, 코드 영어
- Tailwind CSS 모바일 퍼스트

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-14 | Initial design | Crew |
