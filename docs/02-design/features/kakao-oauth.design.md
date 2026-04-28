# kakao-oauth Design Document

> **Summary**: 카카오 OAuth 로그인 활성화 + 이메일 미제공 사용자를 위한 이메일 수집 플로우 구현
>
> **Feature**: kakao-oauth
> **Author**: AI
> **Date**: 2026-04-28
> **Status**: Draft
> **Plan Reference**: `docs/01-plan/features/kakao-oauth.plan.md`

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 카카오 OAuth는 비즈니스 인증 없이 이메일을 제공하지 않아, 로그인 후 사용자 식별 및 소통 수단이 부족함 |
| **Solution** | Supabase Kakao Provider 설정 + OAuth 콜백에서 이메일 미보유 사용자 감지 시 이메일 수집 모달 표시 |
| **Function/UX Effect** | 카카오 로그인 → 최초 가입 시 이메일 입력 화면 → 서비스 이용. 기존 사용자는 바로 진입 |
| **Core Value** | 보안적 서버사이드 OAuth + 사용자 마찰 최소화하면서 이메일 확보율 극대화 |

---

## 1. Design Goals

| Goal | Description |
|------|-------------|
| 최소 변경 | 기존 OAuth 플로우를 최대한 유지하며 이메일 수집 로직만 추가 |
| UX 자연스러움 | 콜백 페이지 내에서 모달로 이메일 수집, 페이지 이동 없음 |
| 보안 | 이메일 업데이트는 인증된 사용자 본인만 가능 (JWT + userId 매칭) |
| 스킵 허용 | 사용자가 이메일 입력을 거부할 수 있되, 추후 프로필에서 추가 가능 |

---

## 2. Architecture

### 2.1 Component Diagram

```
┌─────────────────────────────────────────────────────┐
│  /auth/callback/page.tsx (MODIFY)                   │
│  ┌───────────────────────────────────────────────┐  │
│  │ getSession() → email 확인                     │  │
│  │   ├─ email 있음 → returnUrl로 이동 (기존)     │  │
│  │   └─ email 없음 → needsEmail = true           │  │
│  │       └─ <EmailCollectionModal /> 표시         │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  EmailCollectionModal.tsx (NEW)                      │
│  ┌───────────────────────────────────────────────┐  │
│  │ - 이메일 입력 필드 + 유효성 검사              │  │
│  │ - 제출 → updateMyEmail() API 호출             │  │
│  │ - 스킵 → returnUrl로 이동                     │  │
│  │ - 성공 → useAuthStore 업데이트 + returnUrl     │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Backend: PUT /api/v2/users/me/email (NEW)           │
│  ┌───────────────────────────────────────────────┐  │
│  │ - JWT 인증 필수                                │  │
│  │ - 이메일 형식 + 중복 검사                      │  │
│  │ - User.email 업데이트                          │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
카카오 로그인 버튼 클릭
  → supabase.auth.signInWithOAuth({ provider: "kakao" })
  → 카카오 인증/동의 화면
  → Supabase 서버에서 토큰 교환 (REST API Key 사용)
  → /auth/callback 리다이렉트 (code in URL)
  → supabase.auth.getSession()
  → session.user.email 확인
     ├─ email 존재 & @unknown 아님
     │    → getAndClearReturnUrl() → window.location.href = returnUrl
     └─ email 없음 OR @unknown 포함
          → EmailCollectionModal 표시
          → [사용자 이메일 입력]
               → PUT /api/v2/users/me/email { email: "user@example.com" }
               → 성공: useAuthStore.setUser() 업데이트
               → window.location.href = returnUrl
          → [스킵 클릭]
               → window.location.href = returnUrl
```

---

## 3. Implementation Details

### DI-01: OAuth 콜백 이메일 감지 (MODIFY)

**File**: `src/app/auth/callback/page.tsx`

현재 콜백 페이지가 세션 확인 후 즉시 리다이렉트하는 로직에 이메일 미보유 감지를 추가한다.

```typescript
// 변경 전
supabase.auth.getSession().then(({ data: { session }, error: err }) => {
  if (err || !session) { setError(...); return; }
  const returnUrl = getAndClearReturnUrl();
  window.location.href = returnUrl;
});

// 변경 후
const [needsEmail, setNeedsEmail] = useState(false);
const [returnUrl, setReturnUrl] = useState("/");

supabase.auth.getSession().then(({ data: { session }, error: err }) => {
  if (err || !session) { setError(...); return; }
  const url = getAndClearReturnUrl();
  setReturnUrl(url);

  const email = session.user.email;
  if (!email || email.endsWith("@unknown")) {
    setNeedsEmail(true);
  } else {
    window.location.href = url;
  }
});
```

이메일 수집이 필요한 경우 `EmailCollectionModal`을 렌더링한다.

**렌더링 분기**:
```tsx
if (needsEmail) {
  return (
    <EmailCollectionModal
      onComplete={() => { window.location.href = returnUrl; }}
      onSkip={() => { window.location.href = returnUrl; }}
    />
  );
}
```

---

### DI-02: EmailCollectionModal 컴포넌트 (NEW)

**File**: `src/components/auth/EmailCollectionModal.tsx`

**Props**:
```typescript
export interface EmailCollectionModalProps {
  onComplete: () => void;
  onSkip: () => void;
}
```

**UI 구조**:
```
┌──────────────────────────────────────┐
│                                      │
│         환영합니다! 🎉               │
│                                      │
│   서비스 이용을 위해 이메일을         │
│   입력해 주세요.                     │
│                                      │
│   알림, 계정 복구 등에 사용됩니다.   │
│                                      │
│   ┌──────────────────────────────┐   │
│   │  이메일 입력                 │   │
│   └──────────────────────────────┘   │
│   ⚠️ 올바른 이메일 형식이 아닙니다   │
│                                      │
│   [       이메일로 시작하기      ]   │ ← Blue-600 primary button
│                                      │
│       나중에 할게요                   │ ← text button, gray
│                                      │
└──────────────────────────────────────┘
```

**유효성 검사**:
- 이메일 형식: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- 빈 값 불허
- 중복 시 서버 응답으로 에러 표시 ("이미 사용 중인 이메일입니다")

**상태 관리**:
```typescript
const [email, setEmail] = useState("");
const [error, setError] = useState<string | null>(null);
const [isSubmitting, setIsSubmitting] = useState(false);
```

**제출 핸들러**:
```typescript
async function handleSubmit() {
  if (!isValidEmail(email)) {
    setError("올바른 이메일 형식이 아닙니다");
    return;
  }
  setIsSubmitting(true);
  try {
    const updated = await updateMyEmail(email);
    useAuthStore.getState().setUser(updated);
    onComplete();
  } catch (err) {
    setError(err instanceof ApiError && err.status === 409
      ? "이미 사용 중인 이메일입니다"
      : "이메일 저장에 실패했습니다. 다시 시도해 주세요");
  } finally {
    setIsSubmitting(false);
  }
}
```

**스타일링**:
- 전체 화면 배경 (`bg-gray-50`, `min-h-screen`)
- 중앙 카드 (`bg-white`, `rounded-xl`, `shadow-lg`, `max-w-sm`)
- 모바일 퍼스트 (`mx-4 w-full`)
- 기존 콜백 페이지 에러 UI와 동일한 카드 스타일 유지

---

### DI-03: 이메일 업데이트 API 함수 (MODIFY)

**File**: `src/lib/api.ts`

기존 `updateMyProfile` 패턴을 따라 `updateMyEmail` 함수를 추가한다.

```typescript
/** 내 이메일 업데이트 (카카오 OAuth 이메일 미보유 시) */
export async function updateMyEmail(email: string): Promise<UserProfile> {
  const { data } = await apiV2.put<UserProfile>(
    "/users/me/email",
    { email },
    {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
      timeout: 5000,
    },
  );
  return data;
}
```

**위치**: `updateMyProfile` 함수 바로 아래 (Profile Edit API 섹션 내)

---

### DI-04: useAuthStore 이메일 업데이트 (MODIFY)

**File**: `src/store/useAuthStore.ts`

변경 불필요. 기존 `setUser(user: UserProfile)` 메서드가 이미 UserProfile 전체를 업데이트하고 캐시에 저장하므로, `EmailCollectionModal`에서 API 응답의 UserProfile을 `setUser()`로 전달하면 된다.

```typescript
// EmailCollectionModal에서 호출
const updated = await updateMyEmail(email);
useAuthStore.getState().setUser(updated); // 기존 메서드 활용
```

---

### DI-05: Backend 이메일 업데이트 엔드포인트 (NEW)

**File**: `UserController.java`

```java
@PutMapping("/me/email")
@Operation(summary = "이메일 업데이트", description = "카카오 OAuth 사용자의 이메일을 설정합니다")
public ResponseEntity<UserProfileResponse> updateEmail(
    @AuthenticationPrincipal String userId,
    @Valid @RequestBody UpdateEmailRequest request
) {
    User updated = userService.updateEmail(userId, request.getEmail());
    return ResponseEntity.ok(toProfileResponse(updated));
}
```

**Request DTO**:
```java
public record UpdateEmailRequest(
    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "올바른 이메일 형식이 아닙니다")
    String email
) {}
```

**Response**: 기존 `UserProfileResponse` 재사용 (프로필 수정 API와 동일한 응답 형식)

---

### DI-06: 이메일 중복 검사 + 업데이트 로직 (MODIFY)

**File**: `UserService.java`

```java
public User updateEmail(String userId, String email) {
    // 이메일 중복 확인
    if (userRepository.existsByEmailAndIdNot(email, userId)) {
        throw new DuplicateEmailException("이미 사용 중인 이메일입니다");
    }

    User user = userRepository.findById(userId)
        .orElseThrow(() -> new UserNotFoundException(userId));
    user.setEmail(email);
    return userRepository.save(user);
}
```

**UserRepository 추가 메서드**:
```java
boolean existsByEmailAndIdNot(String email, String id);
```

**에러 처리**:
- 이메일 중복: `409 Conflict` 응답
- 사용자 미존재: `404 Not Found` 응답
- 잘못된 이메일 형식: `400 Bad Request` (Bean Validation)

---

## 4. Error Handling

| Scenario | Frontend | Backend | HTTP Status |
|----------|----------|---------|-------------|
| 이메일 형식 오류 | 클라이언트 유효성 검사로 사전 차단 | Bean Validation | 400 |
| 이메일 중복 | "이미 사용 중인 이메일입니다" 표시 | DuplicateEmailException | 409 |
| 인증 실패 | 로그인 페이지로 리다이렉트 | 401 Unauthorized | 401 |
| 서버 오류 | "이메일 저장에 실패했습니다" 표시 | 500 Internal Server Error | 500 |
| 네트워크 오류 | "이메일 저장에 실패했습니다" 표시 | - | - |

---

## 5. Security Considerations

| Item | Implementation |
|------|---------------|
| 인증 | JWT Bearer Token 필수 (`@AuthenticationPrincipal`) |
| 권한 | 본인 이메일만 변경 가능 (userId from JWT) |
| 입력 검증 | Frontend 정규식 + Backend `@Email` + `@NotBlank` |
| 이메일 중복 | DB unique constraint + 서비스 레이어 검증 |
| Rate Limiting | 기존 API rate limit 적용 (별도 추가 불필요) |

---

## 6. Implementation Order

| Order | Item | Dependencies | Estimated Scope |
|-------|------|-------------|-----------------|
| 1 | DI-06: UserRepository + UserService 이메일 업데이트 | 없음 | ~30 LOC |
| 2 | DI-05: UserController 엔드포인트 | DI-06 | ~20 LOC |
| 3 | DI-03: api.ts `updateMyEmail()` 함수 | DI-05 | ~10 LOC |
| 4 | DI-02: EmailCollectionModal 컴포넌트 | DI-03 | ~80 LOC |
| 5 | DI-01: OAuth 콜백 페이지 수정 | DI-02, DI-04 | ~20 LOC |

**총 예상**: ~160 LOC, 5 files (2 NEW, 5 MODIFY)

---

## 7. Files Summary

| File | Action | Description |
|------|--------|-------------|
| `front-spotLine/src/app/auth/callback/page.tsx` | MODIFY | 이메일 미보유 감지 + 모달 표시 분기 |
| `front-spotLine/src/components/auth/EmailCollectionModal.tsx` | NEW | 이메일 수집 전체 화면 모달 |
| `front-spotLine/src/lib/api.ts` | MODIFY | `updateMyEmail()` 함수 추가 |
| `springboot-spotLine-backend/.../controller/UserController.java` | MODIFY | `PUT /me/email` 엔드포인트 |
| `springboot-spotLine-backend/.../service/UserService.java` | MODIFY | `updateEmail()` 메서드 + 중복 검사 |
| `springboot-spotLine-backend/.../repository/UserRepository.java` | MODIFY | `existsByEmailAndIdNot()` 메서드 |
| `springboot-spotLine-backend/.../dto/UpdateEmailRequest.java` | NEW | 이메일 업데이트 요청 DTO |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-28 | Initial design | AI |
