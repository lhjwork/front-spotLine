# supabase-auth-migration Plan

> **Summary**: front-spotLine 인증을 Instagram OAuth → Supabase Auth로 전환하여 백엔드 JWT 인증과 연결
>
> **Project**: Spotline
> **Date**: 2026-04-03
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | front-spotLine이 Instagram OAuth로 로그인하지만 accessToken을 저장하지 않아 `getAuthToken()`이 항상 빈 문자열 반환. 백엔드는 Supabase JWT를 기대하므로 모든 인증 API (좋아요, 저장, 팔로우 등 11개)가 401 실패 |
| **Solution** | front-spotLine에 Supabase 클라이언트를 도입하고, Instagram을 Supabase OAuth Provider로 연결. Supabase가 JWT를 발급하면 백엔드의 기존 `JwtAuthenticationFilter`가 그대로 검증 |
| **Function/UX Effect** | 로그인 후 좋아요·저장·팔로우·Route 복제 등 소셜 기능이 실제 동작. 세션 자동 갱신으로 재로그인 빈도 감소. admin-spotLine과 동일한 인증 체계로 통합 |
| **Core Value** | 소셜 기능 완전 활성화로 사용자 참여도 확보. Cold Start 크루 큐레이션 콘텐츠에 유저 인터랙션 레이어 추가 |

---

## 1. Overview

### 1.1 Purpose

front-spotLine의 인증 시스템을 Instagram 직접 OAuth에서 Supabase Auth로 전환하여:
- 백엔드(Spring Boot)의 Supabase JWT 검증과 end-to-end 연결
- 좋아요, 저장, 팔로우, Route 복제 등 소셜 API 11개 정상 동작
- admin-spotLine과 동일한 인증 인프라로 운영 단순화

### 1.2 Background

**현재 상태 (Broken)**:
- front-spotLine: Instagram OAuth → `InstagramUser` (accessToken 필드 없음) → localStorage 저장
- `getAuthToken()`: `data.instagramUser?.accessToken` 읽기 → 항상 `""` 반환
- 백엔드: `JwtAuthenticationFilter` → `Authorization: Bearer <token>` → Supabase JWT secret으로 검증
- **결과**: 모든 인증 API가 401 UNAUTHORIZED 또는 500 Internal Server Error

**admin-spotLine은 정상 동작**:
- `@supabase/supabase-js` → `supabase.auth.signInWithPassword()` → Supabase JWT 발급
- 해당 JWT로 Spring Boot API 호출 → 인증 성공

### 1.3 Related Documents

- `CLAUDE.md` — 전체 프로젝트 구조 및 Phase 정의
- `front-spotLine/src/lib/api.ts` — getAuthToken() 및 11개 인증 API 호출
- `front-spotLine/src/store/useAuthStore.ts` — 현재 auth store (Instagram 기반)
- `springboot-spotLine-backend/.../security/JwtTokenProvider.java` — Supabase JWT 검증
- `admin-spotLine/src/lib/supabaseClient.ts` — Supabase 클라이언트 참고 구현

---

## 2. Scope

### 2.1 In Scope

- [ ] front-spotLine에 Supabase 클라이언트 초기화 (`@supabase/ssr`)
- [ ] useAuthStore 리팩토링 — Supabase session 기반으로 전환
- [ ] 로그인 UI — Supabase OAuth (Google, Kakao) + Email/Password
- [ ] `getAuthToken()` 수정 — Supabase session access_token 반환
- [ ] AuthInitializer 수정 — `supabase.auth.onAuthStateChange()` 연동
- [ ] Instagram OAuth 코드 제거 (API route, callback page, auth.ts 헬퍼)
- [ ] 기존 11개 인증 API 호출이 정상 동작하는지 검증
- [ ] UserProfile 타입 정리 — InstagramUser 의존성 제거

### 2.2 Out of Scope

- 백엔드 변경 (Spring Boot JWT 검증 로직 그대로 유지)
- admin-spotLine 변경 (이미 Supabase Auth 사용 중)
- 소셜 로그인 Provider 추가 (Apple, GitHub 등 — 추후)
- 이메일 인증 커스텀 템플릿
- 2FA / MFA

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | Supabase OAuth 로그인 (Google) | Must | Pending |
| FR-02 | Supabase OAuth 로그인 (Kakao) | Must | Pending |
| FR-03 | Email/Password 로그인/회원가입 | Should | Pending |
| FR-04 | 세션 자동 갱신 (access_token refresh) | Must | Pending |
| FR-05 | 로그아웃 (Supabase signOut + localStorage 정리) | Must | Pending |
| FR-06 | getAuthToken()이 Supabase access_token 반환 | Must | Pending |
| FR-07 | 기존 11개 인증 API 정상 동작 | Must | Pending |
| FR-08 | 미로그인 사용자 → LoginBottomSheet 표시 (기존 UX 유지) | Must | Pending |
| FR-09 | Instagram OAuth 레거시 코드 제거 | Should | Pending |

### 3.2 Non-Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-01 | 로그인 → API 호출 가능까지 2초 이내 | Must |
| NFR-02 | 토큰 만료 시 자동 갱신 (사용자 인지 없이) | Must |
| NFR-03 | SSR 환경에서 Supabase 세션 호환 (`@supabase/ssr`) | Should |
| NFR-04 | localStorage 저장 데이터 최소화 (토큰 + 프로필만) | Should |

---

## 4. Technical Approach

### 4.1 Architecture

```
[사용자] → LoginBottomSheet → Supabase OAuth (Google/Kakao)
                                    ↓
                              Supabase Auth Server
                                    ↓
                              JWT (access_token) 발급
                                    ↓
[front-spotLine]  ← onAuthStateChange() → useAuthStore 업데이트
       ↓
  API 호출: Authorization: Bearer <supabase_access_token>
       ↓
[Spring Boot] → JwtAuthenticationFilter → JwtTokenProvider.validateToken()
                                            (SUPABASE_JWT_SECRET으로 HMAC 검증)
       ↓
  SecurityContext에 userId, email, role 설정 → Controller 처리
```

### 4.2 Implementation Strategy

**Phase A: Supabase 클라이언트 설치 + Auth Store 전환**
1. `@supabase/supabase-js` + `@supabase/ssr` 설치
2. `src/lib/supabase.ts` — 브라우저/서버 클라이언트 생성
3. `useAuthStore` — Supabase session 기반으로 리팩토링
4. `AuthInitializer` — `onAuthStateChange()` 구독
5. `getAuthToken()` — `supabase.auth.getSession()` → `session.access_token`

**Phase B: 로그인 UI 전환**
1. `LoginBottomSheet` — Google/Kakao OAuth 버튼으로 교체
2. `LoginButton` — Supabase 세션 기반 로그인 상태 표시
3. Instagram OAuth API route (`/api/auth/instagram/*`) 제거
4. `/auth/callback` 페이지 — Supabase OAuth callback 처리로 전환

**Phase C: 정리 및 검증**
1. `InstagramUser` 타입 및 관련 코드 제거
2. 11개 인증 API 호출 E2E 테스트
3. UserProfile 타입 Supabase user metadata 기반으로 정리

### 4.3 Key Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `src/lib/supabase.ts` | **New** | Supabase 클라이언트 초기화 |
| `src/store/useAuthStore.ts` | **Rewrite** | Supabase session 기반 전환 |
| `src/lib/api.ts` | **Edit** | `getAuthToken()` 수정 |
| `src/lib/auth.ts` | **Rewrite** | Instagram → Supabase 헬퍼 |
| `src/components/auth/AuthInitializer.tsx` | **Edit** | onAuthStateChange 구독 |
| `src/components/auth/LoginBottomSheet.tsx` | **Edit** | OAuth 버튼 교체 |
| `src/components/auth/LoginButton.tsx` | **Edit** | 세션 기반 상태 표시 |
| `src/app/auth/callback/page.tsx` | **Rewrite** | Supabase callback 처리 |
| `src/app/api/auth/instagram/route.ts` | **Delete** | 레거시 제거 |
| `src/app/api/auth/instagram/callback/route.ts` | **Delete** | 레거시 제거 |
| `src/types/index.ts` | **Edit** | InstagramUser 제거, AuthUser 추가 |
| `.env.local` | **Edit** | SUPABASE_URL, SUPABASE_ANON_KEY 추가 |

### 4.4 Supabase OAuth Provider 설정 (사전 작업)

Supabase Dashboard에서:
1. Authentication > Providers > Google 활성화 (Client ID/Secret 설정)
2. Authentication > Providers > Kakao 활성화 (REST API Key 설정)
3. Redirect URL: `http://localhost:3003/auth/callback` (개발), 프로덕션 URL (배포)

---

## 5. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Supabase JWT secret 불일치 | 모든 인증 실패 | `.env`의 `SUPABASE_JWT_SECRET`이 Supabase Dashboard 값과 일치하는지 확인 |
| Instagram 로그인 사용자 데이터 유실 | 기존 유저 프로필 소멸 | Instagram userId → Supabase user metadata 매핑 마이그레이션 스크립트 (필요시) |
| Kakao OAuth Supabase 미지원 | 카카오 로그인 불가 | Supabase는 Kakao를 기본 Provider로 지원. Dashboard에서 활성화 필요 |
| SSR에서 토큰 접근 | 서버 컴포넌트에서 인증 불가 | `@supabase/ssr`의 cookie 기반 세션 관리로 해결 |

---

## 6. Success Criteria

| Criteria | Target |
|----------|--------|
| 로그인 후 좋아요 API 성공 | 200 OK (현재 401) |
| 로그인 후 저장 API 성공 | 200 OK (현재 401) |
| 로그인 후 팔로우 API 성공 | 200 OK (현재 401) |
| 토큰 자동 갱신 | 1시간 후 재요청 성공 |
| Instagram 레거시 코드 제거 | 0 references to InstagramUser |
| 11개 인증 API 전수 테스트 | All pass |

---

## 7. Timeline

| Phase | Task | Estimate |
|-------|------|----------|
| A | Supabase 클라이언트 + Auth Store 전환 | 0.5일 |
| B | 로그인 UI 전환 (Google/Kakao OAuth) | 0.5일 |
| C | 레거시 제거 + 검증 | 0.5일 |
| **Total** | | **1.5일** |

---

## 8. Dependencies

| Dependency | Status | Note |
|------------|--------|------|
| Supabase 프로젝트 | ✅ 존재 | admin-spotLine에서 이미 사용 중 |
| SUPABASE_JWT_SECRET | ✅ 백엔드 설정 완료 | `application.properties`에 설정됨 |
| Google OAuth Client | ⚠️ 확인 필요 | Supabase Dashboard에서 Provider 활성화 |
| Kakao OAuth Client | ⚠️ 확인 필요 | Supabase Dashboard에서 Provider 활성화 |
| Spring Boot JwtTokenProvider | ✅ 변경 불필요 | Supabase JWT 검증 이미 구현됨 |
