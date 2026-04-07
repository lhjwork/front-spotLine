# Plan: admin-user-management

## Executive Summary

| Perspective | Description |
|-------------|-------------|
| **Problem** | 어드민에서 유저 목록 조회, 검색, 정지/해제 기능이 없음. 백엔드에 유저 관리 API(`GET /api/v2/admin/users`)도 부재하여, UGC 스케일링 전 모더레이션 기반이 없는 상태. |
| **Solution** | 백엔드에 유저 목록/검색/정지 API 추가 + 어드민에 유저 관리 페이지(`/users`) 구현. 기존 DataTable + 탭 필터 패턴 재활용. |
| **Function UX Effect** | 어드민 → 유저 관리 탭 → 유저 목록/검색 → 상세 보기 → 정지/해제 액션. 활동 통계(Spot/SpotLine/Blog 수, 팔로워) 한눈에 확인. |
| **Core Value** | 플랫폼 안전성 확보 + UGC 모더레이션 기반 마련 → 유저 확장 시 관리 리스크 제거. |

---

## 1. Feature Overview

- **Feature Name**: admin-user-management
- **Priority**: Medium
- **Scope**: `admin-spotLine` (어드민 프론트) + `springboot-spotLine-backend` (백엔드 API)
- **Target Repos**: `admin-spotLine`, `springboot-spotLine-backend`

### 1.1 Background

현재 어드민 대시보드는 Spot/SpotLine/Blog/Partner 관리 + 모더레이션(신고 처리)만 지원한다. 유저 관리 기능이 전무하여:
- 유저 목록을 볼 수 없음
- 문제 유저를 정지/해제할 수 없음
- 유저별 활동 통계를 확인할 수 없음

백엔드의 `User` 엔티티에는 `id, email, nickname, avatar, bio, role, followersCount, followingCount, createdAt` 필드가 있지만, 어드민용 유저 조회/관리 API가 없다.

### 1.2 Goals

- 백엔드: 어드민용 유저 목록/검색/상세/정지 API 추가
- User 엔티티에 `suspended` (boolean) + `suspendedAt` 필드 추가
- 어드민: 유저 관리 페이지 (`/users`) + 유저 상세 모달
- 유저 검색 (닉네임/이메일), 상태 필터 (전체/활성/정지)
- 유저 정지/해제 액션 (사유 입력)
- 유저별 활동 통계 표시 (Spot/SpotLine/Blog 수, 팔로워/팔로잉)

### 1.3 Non-Goals (v1)

- 유저 삭제 (개인정보 보호 이슈, 별도 정책 필요)
- IP 차단/ban (인프라 레벨, 별도 피처)
- 유저 역할 변경 (user ↔ admin, 기존 Admins 페이지에서 관리)
- 유저 활동 로그/감사 추적 (별도 피처)
- 유저 메시지/알림 발송

---

## 2. Functional Requirements

### FR-01: Backend — Admin User List API
- `GET /api/v2/admin/users` — 페이지네이션 + 검색 + 상태 필터
- Parameters: `page`, `size`, `keyword` (닉네임/이메일 부분 일치), `status` (ALL/ACTIVE/SUSPENDED)
- Response: `SpringPage<UserAdminResponse>` (id, email, nickname, avatar, role, suspended, followersCount, spotsCount, spotLinesCount, blogsCount, createdAt, suspendedAt)
- 정렬: createdAt DESC (기본)
- 권한: admin 이상

### FR-02: Backend — User Suspend/Unsuspend API
- `PATCH /api/v2/admin/users/{userId}/suspend` — 유저 정지 (body: `{ reason: string }`)
- `PATCH /api/v2/admin/users/{userId}/unsuspend` — 정지 해제
- User 엔티티에 `suspended` (Boolean, default false), `suspendedAt` (LocalDateTime, nullable) 추가
- 권한: admin 이상

### FR-03: Admin — User Management Page (`/users`)
- 상단: 검색 입력 (디바운스 300ms) + 상태 탭 (전체/활성/정지)
- DataTable: 닉네임(아바타), 이메일, 역할, 상태, 팔로워, 가입일, 액션
- 페이지네이션: 기존 SpringPage → DataTable 변환 패턴
- 액션 드롭다운: 상세 보기, 정지/해제

### FR-04: Admin — User Detail Modal
- 유저 프로필 (아바타, 닉네임, 이메일, 바이오)
- 활동 통계 카드 (Spot 수, SpotLine 수, Blog 수, 팔로워)
- 상태 배지 (활성/정지)
- 정지/해제 버튼 (사유 입력 textarea)

---

## 3. Technical Approach

### 3.1 Backend Changes (springboot-spotLine-backend)

| File | Change |
|------|--------|
| `User.java` | `suspended` (Boolean), `suspendedAt` (LocalDateTime) 필드 추가 |
| `UserRepository.java` | 검색/필터 쿼리 메서드 추가 |
| `AdminUserController.java` | 새 컨트롤러: list, suspend, unsuspend |
| `AdminUserService.java` | 새 서비스: 유저 목록/정지 비즈니스 로직 |
| `UserAdminResponse.java` | 새 DTO: 어드민용 유저 응답 |

### 3.2 Admin Changes (admin-spotLine)

| File | Change |
|------|--------|
| `types/v2.ts` | UserAdminItem, UserStatus 타입 추가 |
| `services/v2/userAPI.ts` | 새 파일: getList, suspend, unsuspend |
| `pages/UserManagement.tsx` | 새 파일: 유저 목록 + 검색/필터 + DataTable |
| `pages/UserDetailModal.tsx` | 새 파일: 유저 상세 + 정지/해제 액션 |
| `components/Layout.tsx` | 유저 관리 네비게이션 추가 |
| `App.tsx` | `/users` 라우트 추가 |

### 3.3 Reusable Patterns

| Pattern | Source | Reuse |
|---------|--------|-------|
| DataTable + 페이지네이션 | SpotManagement.tsx | 유저 목록 테이블 |
| 상태 탭 필터 | BlogManagement.tsx | 전체/활성/정지 탭 |
| 디바운스 검색 | SpotManagement.tsx | 닉네임/이메일 검색 |
| API 서비스 패턴 | reportAPI.ts | userAPI.ts 구조 |
| 모달 액션 패턴 | ModerationQueue.tsx | 정지 사유 입력 |
| SpringPage 변환 | toDataTablePagination | 페이지네이션 변환 |

---

## 4. Constraints & Risks

| Risk | Mitigation |
|------|------------|
| User 엔티티 변경 시 DB 마이그레이션 필요 | Spring JPA auto-ddl로 nullable 컬럼 추가 (안전) |
| 정지된 유저의 기존 콘텐츠 처리 | v1에서는 콘텐츠 유지, 향후 콘텐츠 숨김 정책 별도 결정 |
| 유저 수가 적은 초기 단계에서 필요성 | UGC 스케일링 전 안전망 사전 구축, 모더레이션과 연계 |
| 어드민 권한 검증 | 기존 ProtectedRoute + requiredRole="admin" 패턴 사용 |

---

## 5. Success Criteria

- [ ] `GET /api/v2/admin/users` API 동작 (페이지네이션, 검색, 상태 필터)
- [ ] `PATCH /api/v2/admin/users/{id}/suspend` / `unsuspend` 동작
- [ ] User 엔티티에 suspended, suspendedAt 필드 추가
- [ ] 어드민 `/users` 페이지에서 유저 목록 표시
- [ ] 닉네임/이메일 검색 동작
- [ ] 전체/활성/정지 탭 필터 동작
- [ ] 유저 상세 모달에서 활동 통계 표시
- [ ] 정지/해제 액션 동작 (사유 입력)
- [ ] Layout 네비게이션에 유저 관리 메뉴 표시
- [ ] TypeScript 타입 체크 + 빌드 통과 (admin-spotLine)
- [ ] 백엔드 컴파일 + 실행 통과 (springboot-spotLine-backend)
