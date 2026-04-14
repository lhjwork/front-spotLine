# user-visit-checkin Planning Document

> **Summary**: 유저 Spot 방문 체크인 기능 — "가봤어요" 토글 + 방문 기록 + 프로필 통계
>
> **Project**: front-spotLine + springboot-spotLine-backend
> **Version**: 0.1.0
> **Author**: Crew
> **Date**: 2026-04-14
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 유저가 Spot을 실제 방문했는지 표시할 방법이 없어, 프로필의 "방문" 통계가 항상 0이고 경험 기반 콘텐츠 신뢰도가 부재 |
| **Solution** | 기존 Like/Save 소셜 토글 패턴을 따르는 "가봤어요" 체크인 기능 — Backend 엔티티/API + Frontend 토글 버튼 + 프로필 통계 연동 |
| **Function/UX Effect** | Spot 상세에서 "가봤어요" 한 번 탭으로 방문 기록, 프로필에서 방문 Spot 목록 확인, 방문 카운트로 콘텐츠 신뢰도 표시 |
| **Core Value** | "경험 기반 소셜 플랫폼" 핵심 축인 Experience Recording의 첫 단추 — 유저 참여도와 콘텐츠 신뢰성 동시 확보 |

---

## 1. Overview

### 1.1 Purpose

유저가 Spot을 실제 방문했음을 "가봤어요" 버튼으로 표시하고, 방문 기록을 프로필에서 확인할 수 있게 한다. 이를 통해 유저의 실제 경험을 기반으로 한 콘텐츠 신뢰도를 높인다.

### 1.2 Background

- Spotline은 "경험 기반 소셜 플랫폼"으로, Spot 방문 기록은 핵심 기능
- 현재 Like/Save 소셜 기능은 완성되어 있으나, Visit(방문) 기능은 미구현
- UserProfile의 `stats.visited`가 항상 0으로 반환됨 (하드코딩)
- TypeScript에 `UserActivityType = "visit" | "like" | "recommend"` 타입이 이미 정의되어 있음
- 목업(mockup)에서 방문 카운트 UI가 이미 설계되어 있음

### 1.3 Related Documents

- CLAUDE.md: Pillar 2 — Experience Recording
- 기존 소셜 패턴: `src/store/useSocialStore.ts`, `SocialController.java`
- 목업: `src/app/mockup/g/page.tsx` (방문 카운트 표시)
- 프로필: `src/components/profile/ProfileHeader.tsx` (stats.visited)

---

## 2. Scope

### 2.1 In Scope

- [ ] Backend: SpotVisit 엔티티 + 마이그레이션 (spot_visits 테이블)
- [ ] Backend: Spot 엔티티에 visitedCount 필드 추가
- [ ] Backend: Visit 토글 API (`POST /api/v2/spots/{id}/visit`)
- [ ] Backend: Visit 상태 조회 API (`GET /api/v2/spots/{id}/social` 확장)
- [ ] Backend: 유저 프로필 stats.visited 실제 카운트 반환
- [ ] Backend: 유저 방문 Spot 목록 API (`GET /api/v2/users/{id}/visited-spots`)
- [ ] Frontend: SpotBottomBar에 "가봤어요" 토글 버튼 추가
- [ ] Frontend: useSocialStore에 visit 상태 관리 추가
- [ ] Frontend: Spot 상세 페이지에 visitedCount 표시
- [ ] Frontend: 프로필 "방문" 탭에 방문 Spot 목록 표시
- [ ] Frontend: SocialHydrator에 visit 상태 초기화 추가

### 2.2 Out of Scope

- 위치 기반 자동 체크인 (GPS 검증) — v2 고려
- SpotLine 진행률 ("X곳 방문 완료") — 별도 feature
- 방문 인증 사진 업로드 — 별도 feature
- 방문 날짜 커스텀 지정 — 단순 토글만 구현
- 방문자 아바타 표시 — v2 고려

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | SpotVisit 엔티티: user_id + spot_id 유니크 제약, created_at 타임스탬프 | High | Pending |
| FR-02 | Visit 토글 API: Like/Save 패턴 동일 — 존재하면 삭제, 없으면 생성 + 카운트 증감 | High | Pending |
| FR-03 | Social Status 확장: 기존 isLiked/isSaved에 isVisited 추가 | High | Pending |
| FR-04 | "가봤어요" 버튼: SpotBottomBar에 MapPinCheck 아이콘 + 방문 카운트 뱃지 | High | Pending |
| FR-05 | 방문 상태 낙관적 업데이트: Like/Save와 동일한 optimistic UI 패턴 | High | Pending |
| FR-06 | 프로필 stats.visited: 실제 방문 카운트 반환 (현재 0 하드코딩 제거) | High | Pending |
| FR-07 | 프로필 "방문" 탭: 유저가 방문한 Spot 목록 (페이지네이션) | Medium | Pending |
| FR-08 | Spot 상세 visitedCount 표시: 조회수 옆에 "N명 방문" 표시 | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | Visit 토글 응답 < 300ms | API 응답시간 확인 |
| Consistency | 카운트 정합성 (음수 방지) | Math.max(0, count - 1) 패턴 |
| UX | 인증 미완료 시 로그인 유도 | 기존 패턴 활용 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] FR-01 ~ FR-08 구현 완료
- [ ] 기존 Like/Save 기능 regression 없음
- [ ] TypeScript 빌드 에러 0 (both repos)
- [ ] Vercel 배포 성공 (front-spotLine)
- [ ] Backend 빌드 + 마이그레이션 성공

### 4.2 Quality Criteria

- [ ] Zero lint errors
- [ ] Build succeeds (`pnpm build` / `./gradlew build`)
- [ ] Swagger UI에서 새 API 확인 가능

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| DB 마이그레이션 충돌 (기존 V2 이후 번호) | Medium | Low | V3 번호로 마이그레이션 파일 생성 |
| SocialToggleResponse 변경 시 기존 Like/Save 영향 | High | Medium | isVisited를 별도 필드로 추가, 기존 필드 변경 없음 |
| 프로필 API 변경 시 하위 호환성 | Medium | Low | stats에 visited 필드는 이미 존재 (값만 변경) |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites | ☐ |
| **Dynamic** | Feature-based modules | Web apps with backend | ☑ |
| **Enterprise** | Strict layer separation | High-traffic systems | ☐ |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| API 패턴 | 별도 visit 엔드포인트 vs social 통합 | 별도 엔드포인트 + social 상태 확장 | Like/Save 패턴 일관성 |
| 상태 관리 | useSocialStore 확장 vs 별도 store | useSocialStore 확장 | 기존 social 상태와 통합 |
| 카운트 관리 | 실시간 카운트 vs 캐싱 | Spot 엔티티에 visitedCount 필드 | Like/Save 동일 패턴 |

### 6.3 Clean Architecture Approach

```
변경 파일 예상:
┌─────────────────────────────────────────────────────┐
│ springboot-spotLine-backend (Backend)                │
│                                                     │
│ NEW:  entity/SpotVisit.java                         │
│ NEW:  repository/SpotVisitRepository.java           │
│ NEW:  db/migration/V3__add_spot_visit.sql           │
│ MOD:  entity/Spot.java (+visitedCount)              │
│ MOD:  service/SocialService.java (+toggleVisit)     │
│ MOD:  controller/SocialController.java (+visit API) │
│ MOD:  dto/response/SocialStatusResponse.java        │
│ MOD:  dto/response/SocialToggleResponse.java        │
│ MOD:  service/UserService.java (stats.visited 실카운트)│
├─────────────────────────────────────────────────────┤
│ front-spotLine (Frontend)                           │
│                                                     │
│ MOD:  types/index.ts (+isVisited, +visitedCount)    │
│ MOD:  lib/api.ts (+toggleVisit)                     │
│ MOD:  store/useSocialStore.ts (+visited 상태)        │
│ MOD:  components/social/SocialHydrator.tsx           │
│ MOD:  components/spot/SpotBottomBar.tsx (+가봤어요)   │
│ MOD:  app/spot/[slug]/page.tsx (+visitedCount)      │
│ MOD:  components/profile/ProfileTabs.tsx (+방문 탭)  │
│ NEW:  components/profile/VisitedSpotsList.tsx        │
└─────────────────────────────────────────────────────┘
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions
- [x] ESLint / TypeScript 설정
- [x] Tailwind CSS 모바일 퍼스트
- [x] Spring Boot 레이어 구조 (entity/repository/service/controller/dto)

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **Naming** | exists | SpotVisit (Like/Save 네이밍 일관) | - |
| **API path** | exists | `/api/v2/spots/{id}/visit` | - |
| **DB migration** | V2 exists | V3 번호 사용 | High |

### 7.3 Environment Variables Needed

추가 환경변수 불필요 (기존 DB, Supabase, API URL 활용)

---

## 8. Next Steps

1. [ ] Write design document (`user-visit-checkin.design.md`)
2. [ ] Backend SpotVisit 엔티티 + 마이그레이션 구현
3. [ ] Frontend 토글 버튼 + 프로필 연동

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-14 | Initial draft | Crew |
