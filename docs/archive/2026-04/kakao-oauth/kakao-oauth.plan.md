# kakao-oauth Planning Document

> **Summary**: 카카오 OAuth 로그인 활성화 + 이메일 미제공 사용자를 위한 이메일 수집 플로우 구현
>
> **Project**: Spotline
> **Author**: AI
> **Date**: 2026-04-28
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 카카오 OAuth는 비즈니스 인증 없이 이메일을 제공하지 않아, 로그인 후 사용자 식별 및 소통 수단이 부족함 |
| **Solution** | Supabase Kakao Provider 설정 + OAuth 콜백에서 이메일 미보유 사용자 감지 시 이메일 수집 모달 표시 |
| **Function/UX Effect** | 카카오 로그인 → 최초 가입 시 이메일 입력 화면 → 서비스 이용. 기존 사용자는 바로 진입 |
| **Core Value** | 보안적 서버사이드 OAuth + 사용자 마찰 최소화하면서 이메일 확보율 극대화 |

---

## 1. Overview

### 1.1 Purpose

카카오 OAuth 로그인을 활성화하고, 이메일 권한 없이도 사용자 이메일을 수집할 수 있는 후속 플로우를 구현한다.

### 1.2 Background

- 카카오 개발자 콘솔에서 이메일(`account_email`) 동의항목이 "권한 없음" 상태 (비즈니스 인증 필요)
- 현재 Frontend에 카카오 로그인 버튼과 Supabase OAuth 연동 코드가 이미 존재
- Backend `UserSyncService`는 이메일 없을 시 `{userId}@unknown` 폴백 처리
- 이메일은 알림, 계정 복구, 마케팅 등에 필수적이므로 별도 수집 필요

### 1.3 Related Documents

- `front-spotLine/src/lib/auth.ts` — OAuth 로그인 진입점
- `front-spotLine/src/components/auth/LoginBottomSheet.tsx` — 로그인 UI
- `front-spotLine/src/app/auth/callback/page.tsx` — OAuth 콜백 처리
- `springboot-spotLine-backend/.../UserSyncService.java` — 사용자 자동 생성

---

## 2. Scope

### 2.1 In Scope

- [ ] Supabase Dashboard에서 Kakao Provider 활성화 (수동 설정)
- [ ] 카카오 개발자 콘솔 동의항목 설정 (닉네임 필수, 프로필 사진 선택)
- [ ] OAuth 콜백에서 이메일 미보유 사용자 감지 로직
- [ ] 이메일 수집 모달/페이지 UI (최초 가입 시 1회)
- [ ] 수집한 이메일을 Backend User 엔티티에 업데이트하는 API
- [ ] 이메일 수집 건너뛰기(스킵) 옵션

### 2.2 Out of Scope

- 이메일 인증(verification) 메일 발송
- 비즈니스 인증을 통한 카카오 이메일 직접 수신
- 구글/애플 등 추가 OAuth Provider
- Admin 패널 카카오 로그인 (Admin은 이메일/비밀번호 유지)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 카카오 OAuth 로그인이 정상 동작해야 한다 (Supabase Provider 설정) | High | Pending |
| FR-02 | OAuth 콜백에서 이메일 없는 사용자를 감지해야 한다 | High | Pending |
| FR-03 | 이메일 수집 모달을 표시해야 한다 (최초 가입 시 1회) | High | Pending |
| FR-04 | 이메일 형식 유효성 검사를 수행해야 한다 | Medium | Pending |
| FR-05 | Backend에 이메일 업데이트 API가 있어야 한다 (`PUT /api/v2/users/me/email`) | High | Pending |
| FR-06 | "나중에 할게요" 스킵 버튼으로 이메일 입력을 건너뛸 수 있어야 한다 | Medium | Pending |
| FR-07 | 스킵한 사용자에게 프로필 페이지에서 이메일 추가 기능을 제공해야 한다 | Low | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Security | 이메일 업데이트 API는 인증된 사용자 본인만 호출 가능 | JWT 인증 + userId 매칭 검증 |
| UX | 이메일 수집 모달은 3초 이내 표시 | OAuth 콜백 페이지에서 즉시 감지 |
| Privacy | 이메일은 서비스 내부에서만 사용, 제3자 공유 없음 | 개인정보 처리방침 명시 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 카카오 로그인 → 동의 → 콜백 → 이메일 수집 → 서비스 진입 전체 플로우 정상 동작
- [ ] 이메일이 없는 사용자(`@unknown`)가 이메일 수집 모달을 볼 수 있음
- [ ] 이메일 입력 후 Backend User.email이 업데이트됨
- [ ] 스킵 시 정상적으로 서비스 진입 가능
- [ ] 재로그인 시 이메일 수집 모달 미표시 (이미 이메일 있는 경우)

### 4.2 Quality Criteria

- [ ] Zero lint errors
- [ ] Build succeeds (`pnpm build`)
- [ ] 모바일/데스크톱 반응형 UI 정상

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Supabase Kakao Provider 설정 누락 | High | Medium | 설정 가이드 문서화, 체크리스트 제공 |
| 카카오에서 닉네임/프로필 사진 미반환 | Medium | Low | Supabase user_metadata 폴백 처리 (기존 로직 활용) |
| 이메일 수집률 낮음 (대부분 스킵) | Medium | Medium | 이메일 수집의 가치를 명확히 안내하는 UX 문구 |
| 이메일 중복 (다른 계정과 동일 이메일) | Medium | Low | Backend에서 이메일 고유성 체크 + 안내 메시지 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites | |
| **Dynamic** | Feature-based, BaaS integration | Web apps with backend | **X** |
| **Enterprise** | Strict layer separation | High-traffic systems | |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| OAuth 처리 | Supabase SDK / 직접 구현 | Supabase SDK | 기존 구조 유지, 코드 변경 최소화 |
| 이메일 수집 위치 | 콜백 페이지 / 별도 페이지 / 모달 | 콜백 페이지 내 모달 | 페이지 이동 없이 자연스러운 UX |
| 이메일 저장 | Supabase Auth / Backend API | Backend API | Backend User 엔티티와 직접 동기화 |

### 6.3 구현 흐름

```
카카오 로그인 버튼 클릭
  → Supabase signInWithOAuth({ provider: "kakao" })
  → 카카오 인증/동의
  → /auth/callback 리다이렉트
  → getSession() → 세션 확인
  → user.email 확인
    → 이메일 있음: returnUrl로 이동 (기존 플로우)
    → 이메일 없음 (@unknown): 이메일 수집 모달 표시
      → 이메일 입력 + 제출: PUT /api/v2/users/me/email
      → 스킵: returnUrl로 이동
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions section
- [x] ESLint configuration
- [x] TypeScript configuration (`tsconfig.json`)
- [x] Tailwind CSS 4 + cn() utility

### 7.2 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | Client | 기존 존재 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 | Client | 기존 존재 |
| `SUPABASE_JWT_SECRET` | JWT 검증 시크릿 | Server (Backend) | 기존 존재 |

**Supabase Dashboard 설정 (코드 외)**:
- Kakao Provider 활성화
- Client ID: spotLine REST API 키
- Client Secret: 카카오 클라이언트 시크릿

**카카오 개발자 콘솔 설정 (코드 외)**:
- 카카오 로그인 활성화
- Redirect URI: Supabase 콜백 URL 등록
- 동의항목: 닉네임 (필수), 프로필 사진 (선택)

---

## 8. Implementation Items

| # | Item | Repo | Type | Description |
|---|------|------|------|-------------|
| 1 | OAuth 콜백 이메일 감지 | front-spotLine | MODIFY | `/auth/callback/page.tsx`에 이메일 미보유 감지 + 모달 표시 로직 |
| 2 | EmailCollectionModal 컴포넌트 | front-spotLine | NEW | 이메일 입력 폼 모달 (유효성 검사 포함) |
| 3 | 이메일 업데이트 API 호출 | front-spotLine | MODIFY | `api.ts`에 `updateUserEmail()` 함수 추가 |
| 4 | useAuthStore 이메일 업데이트 | front-spotLine | MODIFY | 이메일 수집 후 스토어 상태 반영 |
| 5 | 이메일 업데이트 API 엔드포인트 | springboot-backend | NEW/MODIFY | `PUT /api/v2/users/me/email` 엔드포인트 |
| 6 | 이메일 중복 검사 | springboot-backend | MODIFY | UserService에 이메일 고유성 검증 |

---

## 9. Next Steps

1. [ ] Supabase Dashboard에서 Kakao Provider 설정 (수동)
2. [ ] 카카오 개발자 콘솔 동의항목 설정 (수동)
3. [ ] Write design document (`kakao-oauth.design.md`)
4. [ ] Implementation
5. [ ] 카카오 로그인 E2E 테스트

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-28 | Initial draft | AI |
