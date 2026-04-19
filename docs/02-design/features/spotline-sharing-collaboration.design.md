# spotline-sharing-collaboration Design Document

> **Summary**: SpotLine/Spot 공유 기능 확장 — QR 코드 공유, 공유 추적(sharesCount), 레퍼럴 링크 시스템
>
> **Project**: Spotline
> **Author**: Claude
> **Date**: 2026-04-19
> **Status**: Draft
> **Planning Doc**: [spotline-sharing-collaboration.plan.md](../01-plan/features/spotline-sharing-collaboration.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- 기존 ShareSheet/SpotShareSheet에 QR 코드 공유 채널 추가
- Backend에 `sharesCount` 필드 + 공유 이벤트 추적 API 구현
- 레퍼럴 링크(`?ref=`) 시스템으로 유입 경로 추적
- 공유 통계를 SpotLine/Spot 상세에 표시

### 1.2 Design Principles

- 기존 ShareSheet/SpotShareSheet 패턴 유지 — 공유 채널만 추가
- Fire-and-forget 방식 — 공유 추적이 UX를 차단하지 않음
- Backend 패턴 준수 — SocialService/SocialController 패턴과 동일한 구조

### 1.3 Current State (코드 탐색 결과)

| Component | Status | Notes |
|-----------|--------|-------|
| `ShareSheet.tsx` (SpotLine) | ✅ EXISTS | 링크 복사, 카카오톡, Web Share API |
| `SpotShareSheet.tsx` (Spot) | ✅ EXISTS | 링크 복사, 카카오톡, Web Share API |
| `SpotBottomBar.tsx` | ✅ EXISTS | 공유 버튼 → SpotShareSheet 연결 |
| `SpotLineBottomBar.tsx` | ✅ EXISTS | 공유 버튼 → ShareSheet 연결 |
| `share.ts` 유틸리티 | ✅ EXISTS | copyToClipboard, nativeShare, shareToKakao |
| QR 코드 생성 | ❌ MISSING | 공유 시트에 QR 옵션 없음 |
| `sharesCount` 필드 | ❌ MISSING | Backend Entity/DTO 모두 부재 |
| 공유 추적 API | ❌ MISSING | Share 이벤트 기록 없음 |
| 레퍼럴 링크 | ❌ MISSING | `?ref=` 파라미터 미구현 |

---

## 2. Architecture

### 2.1 Component Diagram

```
┌──────────────────────────────────────────────────────┐
│  Frontend (Next.js)                                  │
│  ┌──────────────┐  ┌───────────────┐                 │
│  │  ShareSheet  │  │SpotShareSheet │  ← MODIFY: QR   │
│  │  (SpotLine)  │  │   (Spot)      │    옵션 추가    │
│  └──────┬───────┘  └───────┬───────┘                 │
│         │                  │                          │
│  ┌──────▼──────────────────▼───────┐                 │
│  │  QRCodeGenerator (common)       │  ← NEW          │
│  │  - Canvas QR 생성               │                 │
│  │  - PNG 다운로드                 │                 │
│  └─────────────────────────────────┘                 │
│         │                                            │
│  ┌──────▼──────────────────────────┐                 │
│  │  share.ts (lib)                 │  ← MODIFY       │
│  │  - trackShare() fire-and-forget │                 │
│  │  - buildShareUrl() with ?ref=   │                 │
│  └──────┬──────────────────────────┘                 │
└─────────┼────────────────────────────────────────────┘
          │ POST /api/v2/shares
          ▼
┌──────────────────────────────────────────────────────┐
│  Backend (Spring Boot)                               │
│  ┌────────────────┐  ┌──────────────┐                │
│  │ShareController │─▶│ ShareService │  ← ALL NEW     │
│  │POST /shares    │  │ trackShare() │                │
│  └────────────────┘  └──────┬───────┘                │
│                             │                        │
│  ┌──────────────────────────▼───────┐                │
│  │  Share Entity + ShareRepository  │  ← NEW         │
│  │  sharesCount on SpotLine/Spot    │  ← MODIFY      │
│  └──────────────────────────────────┘                │
└──────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
1. 사용자가 공유 버튼 클릭 → ShareSheet/SpotShareSheet 열림
2. 공유 채널 선택 (링크 복사 / 카카오톡 / QR / 네이티브)
   2a. QR 선택 시: QRCodeGenerator가 Canvas에 QR 생성 → PNG 다운로드
   2b. 기타: 기존 share.ts 유틸리티 호출
3. 공유 URL에 ?ref= 파라미터 자동 추가 (로그인 사용자)
4. trackShare() fire-and-forget → POST /api/v2/shares
5. Backend: Share 이벤트 저장 + sharesCount 증가
```

---

## 3. Data Model

### 3.1 Share Entity (NEW)

```java
@Entity
@Table(name = "shares", indexes = {
    @Index(name = "idx_shares_target", columnList = "targetType,targetId"),
    @Index(name = "idx_shares_referrer", columnList = "referrerId")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Share {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String targetType;      // "SPOTLINE" or "SPOT"

    @Column(nullable = false)
    private UUID targetId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShareChannel channel;   // LINK, KAKAO, QR, NATIVE

    private String sharerId;        // 공유한 사용자 (nullable, 비로그인 가능)
    private String referrerId;      // 레퍼럴 출처 사용자 (nullable)

    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

### 3.2 ShareChannel Enum (NEW)

```java
public enum ShareChannel {
    LINK,       // 링크 복사
    KAKAO,      // 카카오톡 공유
    QR,         // QR 코드 다운로드
    NATIVE      // Web Share API
}
```

### 3.3 Entity Modifications

**SpotLine Entity** — `sharesCount` 필드 추가:
```java
// 기존 counter 필드들과 동일 패턴
@Builder.Default
private Integer sharesCount = 0;
```

**Spot Entity** — `sharesCount` 필드 추가:
```java
@Builder.Default
private Integer sharesCount = 0;
```

### 3.4 Frontend Type Modifications

```typescript
// src/types/index.ts
interface SpotLineDetailResponse {
  // ... 기존 필드
  sharesCount: number;        // NEW
}

interface SpotDetailResponse {
  // ... 기존 필드
  sharesCount: number;        // NEW
}
```

---

## 4. API Specification

### 4.1 Endpoint List

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/v2/shares` | 공유 이벤트 기록 | Optional |

### 4.2 Detailed Specification

#### `POST /api/v2/shares`

**Request:**
```json
{
  "targetType": "SPOTLINE",
  "targetId": "uuid-string",
  "channel": "LINK",
  "referrerId": "user-id-or-null"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "sharesCount": 42
}
```

**Error Responses:**
- `400 Bad Request`: targetType/targetId/channel 누락
- `404 Not Found`: 대상 SpotLine/Spot 없음
- `429 Too Many Requests`: Rate limit 초과 (1분 10회)

---

## 5. UI/UX Design

### 5.1 ShareSheet QR 옵션 추가 (SpotLine + Spot 공통)

```
┌────────────────────────────────┐
│  ━━━  (drag handle)            │
│                                │
│  공유하기                       │
│                                │
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ 🔗   │ │ 💬   │ │ 📱   │   │
│  │링크   │ │카카오 │ │네이티│   │
│  │복사   │ │톡    │ │브    │   │
│  └──────┘ └──────┘ └──────┘   │
│                                │
│  ┌──────────────────────────┐  │  ← NEW
│  │  ▓▓▓▓▓▓▓▓▓▓             │  │
│  │  ▓ QR CODE ▓             │  │
│  │  ▓▓▓▓▓▓▓▓▓▓             │  │
│  │                          │  │
│  │  [QR 이미지 저장]         │  │
│  └──────────────────────────┘  │
│                                │
└────────────────────────────────┘
```

### 5.2 sharesCount 표시 위치

**SpotLineHeader** — 기존 stats 옆에 추가:
```
❤️ 234  📋 45  👥 12 완주  📤 89     ← sharesCount 추가
```

**SpotDetailHeader** — 기존 stats 옆에 추가:
```
❤️ 56  💾 23  📤 34                   ← sharesCount 추가
```

### 5.3 Component List

| Component | Location | Responsibility | Action |
|-----------|----------|----------------|--------|
| `QRCodeGenerator` | `src/components/common/` | QR 코드 Canvas 생성 + PNG 다운로드 | NEW |
| `ShareSheet` | `src/components/spotline/` | SpotLine 공유 시트 — QR 옵션 추가 | MODIFY |
| `SpotShareSheet` | `src/components/spot/` | Spot 공유 시트 — QR 옵션 추가 | MODIFY |
| `SpotLineHeader` | `src/components/spotline/` | sharesCount 표시 추가 | MODIFY |

---

## 6. Implementation Details

### 6.1 QRCodeGenerator Component (NEW)

```typescript
// src/components/common/QRCodeGenerator.tsx
"use client";

interface QRCodeGeneratorProps {
  url: string;
  size?: number;       // default: 200
  title?: string;      // 하단 표시 텍스트
}

// Implementation:
// 1. dynamic import('qrcode') — 번들 최적화
// 2. QRCode.toCanvas(canvasRef, url, { width: size })
// 3. 다운로드: canvas.toBlob() → URL.createObjectURL() → <a download>
```

### 6.2 share.ts Modifications

```typescript
// src/lib/share.ts — 추가 함수들

/** 공유 URL에 레퍼럴 파라미터 추가 */
export function buildShareUrl(
  path: string,
  referrerId?: string | null
): string {
  const baseUrl = `https://spotline.kr${path}`;
  if (!referrerId) return baseUrl;
  const url = new URL(baseUrl);
  url.searchParams.set('ref', referrerId);
  return url.toString();
}

/** 공유 이벤트 추적 (fire-and-forget) */
export function trackShare(data: {
  targetType: 'SPOTLINE' | 'SPOT';
  targetId: string;
  channel: 'LINK' | 'KAKAO' | 'QR' | 'NATIVE';
  referrerId?: string | null;
}): void {
  fetch('/api/v2/shares', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).catch(() => {
    // fire-and-forget: 실패 무시
  });
}
```

### 6.3 ShareSheet/SpotShareSheet QR 추가 패턴

기존 공유 채널 버튼 아래에 QR 코드 섹션 추가:
1. `buildShareUrl()` 으로 레퍼럴 포함 URL 생성
2. 각 채널 클릭 시 `trackShare()` fire-and-forget 호출
3. QR 섹션: `QRCodeGenerator` 렌더링 + "QR 이미지 저장" 버튼

### 6.4 Backend ShareController (NEW)

```java
@RestController
@RequestMapping("/api/v2/shares")
@RequiredArgsConstructor
@Tag(name = "Share", description = "공유 추적 API")
public class ShareController {
    private final ShareService shareService;
    private final AuthUtil authUtil;

    @PostMapping
    @Operation(summary = "공유 이벤트 기록")
    public ResponseEntity<Map<String, Object>> trackShare(
            @RequestBody ShareRequest request) {
        String userId = authUtil.getCurrentUserId().orElse(null);
        int sharesCount = shareService.trackShare(
            request.getTargetType(),
            request.getTargetId(),
            request.getChannel(),
            userId,
            request.getReferrerId()
        );
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(Map.of("success", true, "sharesCount", sharesCount));
    }
}
```

### 6.5 Backend ShareService (NEW)

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class ShareService {
    private final ShareRepository shareRepository;
    private final SpotLineRepository spotLineRepository;
    private final SpotRepository spotRepository;

    @Transactional
    public int trackShare(String targetType, UUID targetId,
                          ShareChannel channel, String sharerId,
                          String referrerId) {
        // 1. Save share event
        shareRepository.save(Share.builder()
            .targetType(targetType)
            .targetId(targetId)
            .channel(channel)
            .sharerId(sharerId)
            .referrerId(referrerId)
            .build());

        // 2. Increment counter (same pattern as likes/saves)
        if ("SPOTLINE".equals(targetType)) {
            SpotLine sl = spotLineRepository.findById(targetId)
                .orElseThrow(() -> new ResourceNotFoundException("SpotLine", targetId.toString()));
            sl.setSharesCount(sl.getSharesCount() + 1);
            spotLineRepository.save(sl);
            return sl.getSharesCount();
        } else {
            Spot spot = spotRepository.findById(targetId)
                .orElseThrow(() -> new ResourceNotFoundException("Spot", targetId.toString()));
            spot.setSharesCount(spot.getSharesCount() + 1);
            spotRepository.save(spot);
            return spot.getSharesCount();
        }
    }
}
```

---

## 7. Security Considerations

- [x] Rate Limiting: 1분 10회 (Spring Boot @RateLimiter 또는 필터)
- [x] Input validation: targetType은 SPOTLINE/SPOT만 허용, channel은 enum
- [x] Auth optional: 비로그인 사용자도 공유 가능, 추적만 제한적
- [x] XSS 방지: QR URL은 서버 도메인만 사용 (사용자 입력 URL 없음)

---

## 8. Implementation Guide

### 8.1 File Structure

```
Frontend (front-spotLine):
├── src/components/common/QRCodeGenerator.tsx    — NEW: QR 코드 생성 컴포넌트
├── src/components/spotline/ShareSheet.tsx        — MODIFY: QR 옵션 + trackShare
├── src/components/spot/SpotShareSheet.tsx        — MODIFY: QR 옵션 + trackShare
├── src/components/spotline/SpotLineHeader.tsx    — MODIFY: sharesCount 표시
├── src/lib/share.ts                              — MODIFY: buildShareUrl + trackShare
└── src/types/index.ts                            — MODIFY: sharesCount 추가

Backend (springboot-spotLine-backend):
├── controller/ShareController.java               — NEW
├── service/ShareService.java                      — NEW
├── domain/entity/Share.java                       — NEW
├── domain/repository/ShareRepository.java         — NEW
├── domain/enums/ShareChannel.java                 — NEW
├── dto/request/ShareRequest.java                  — NEW
├── domain/entity/SpotLine.java                    — MODIFY: sharesCount 추가
├── domain/entity/Spot.java                        — MODIFY: sharesCount 추가
├── dto/response/SpotLineDetailResponse.java       — MODIFY: sharesCount 추가
└── dto/response/SpotDetailResponse.java           — MODIFY: sharesCount 추가
```

### 8.2 Implementation Order

1. [ ] **Backend: ShareChannel enum** — `domain/enums/ShareChannel.java`
2. [ ] **Backend: Share entity + repository** — `domain/entity/Share.java`, `domain/repository/ShareRepository.java`
3. [ ] **Backend: sharesCount 필드** — SpotLine/Spot Entity + DTO에 추가
4. [ ] **Backend: ShareRequest DTO** — `dto/request/ShareRequest.java`
5. [ ] **Backend: ShareService** — `service/ShareService.java`
6. [ ] **Backend: ShareController** — `controller/ShareController.java`
7. [ ] **Frontend: types 업데이트** — `sharesCount` 필드 추가
8. [ ] **Frontend: share.ts 확장** — `buildShareUrl()`, `trackShare()`
9. [ ] **Frontend: QRCodeGenerator** — `components/common/QRCodeGenerator.tsx`
10. [ ] **Frontend: ShareSheet QR 추가** — SpotLine 공유 시트에 QR + 추적
11. [ ] **Frontend: SpotShareSheet QR 추가** — Spot 공유 시트에 QR + 추적
12. [ ] **Frontend: sharesCount 표시** — SpotLineHeader에 공유 통계 표시

### 8.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| ShareService | Share, ShareRepository, SpotLine/SpotRepository | 공유 추적 비즈니스 로직 |
| ShareController | ShareService, AuthUtil | REST API 엔드포인트 |
| QRCodeGenerator | `qrcode` npm package (dynamic import) | QR 코드 Canvas 생성 |
| ShareSheet (modified) | QRCodeGenerator, share.ts | QR 공유 + 추적 |
| SpotShareSheet (modified) | QRCodeGenerator, share.ts | QR 공유 + 추적 |

### 8.4 Package Dependencies

```bash
# Frontend — QR 코드 생성 라이브러리
pnpm add qrcode
pnpm add -D @types/qrcode
```

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-19 | Initial draft | Claude |
