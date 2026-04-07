# Blog Social Actions Planning Document

> **Summary**: Blog에 좋아요/저장 토글 + 댓글 수 연동 추가. Spot/SpotLine과 동일한 소셜 패턴을 Blog에 확장하여 콘텐츠 engagement loop 완성.
>
> **Project**: Spotline (front-spotLine + springboot-spotLine-backend)
> **Version**: 1.0.0
> **Date**: 2026-04-07
> **Status**: Planning

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | Blog에 좋아요/저장 기능이 없고, commentsCount가 하드코딩(0)되어 콘텐츠 engagement를 측정하거나 유도할 수 없다. Spot/SpotLine은 완전한 소셜 루프를 갖추고 있지만 Blog만 빠져있다. |
| **Solution** | Backend에 BlogLike/BlogSave 엔티티 + toggle 엔드포인트 3개 추가, Blog에 commentsCount 필드 추가. Frontend의 useSocialStore와 api.ts를 "blog" 타입으로 확장, blog 상세 페이지에 SocialHydrator + 좋아요/저장 버튼 추가. |
| **Function/UX Effect** | Blog 상세 페이지에서 좋아요/저장 토글이 가능하고, 실제 댓글 수가 표시된다. 저장한 블로그는 SavesList에서 확인할 수 있다. |
| **Core Value** | 콘텐츠 engagement loop 완성. 블로그 콘텐츠가 단순 읽기에서 좋아요/저장/댓글의 소셜 인터랙션으로 확장되어 유저 리텐션을 높인다. |

| Item | Detail |
|------|--------|
| Feature | Blog Social Actions |
| Created | 2026-04-07 |
| Duration | 예상 1일 (Backend 0.5일 + Frontend 0.5일) |
| Status | Planning |
| Level | Dynamic |
| Target Repo | front-spotLine + springboot-spotLine-backend |

---

## 1. Overview

### 1.1 Purpose

Spot/SpotLine에 구현된 좋아요/저장/댓글 수 패턴을 Blog에도 동일하게 적용. Blog 콘텐츠에 소셜 인터랙션을 추가하여 engagement loop을 완성한다.

### 1.2 Background

- Blog 시스템은 spotline-blog-builder PDCA에서 구현 (92%, archived)
- blog-seo-tracking에서 view tracking + sitemap 완성 (100%, archived)
- 그러나 소셜 기능(좋아요/저장)이 누락됨:
  - SocialController에 blog 엔드포인트 없음
  - BlogLike/BlogSave 엔티티 없음
  - Blog 엔티티에 commentsCount 필드 없음
  - CommentService의 BLOG case가 no-op (카운트 미업데이트)
  - Frontend blog 상세 페이지에 좋아요/저장 UI 없음
  - CommentSection에 commentsCount={0} 하드코딩

### 1.3 Current State

**이미 존재하는 것:**
- Blog 엔티티에 `likesCount`, `savesCount` 필드 (DB 컬럼, 기본값 0)
- BlogDetailResponse에 `likesCount`, `savesCount` 매핑
- CommentTargetType.BLOG 이미 존재 (댓글 생성은 가능)
- useSocialStore 패턴 (spot/spotline용)
- SocialHydrator 컴포넌트 (spot/spotline용)
- SpotLineBottomBar (like/save 버튼 패턴)

**누락된 것:**
- Backend: BlogLike/BlogSave 엔티티 + Repository
- Backend: SocialController blog 엔드포인트 3개
- Backend: Blog.commentsCount 필드 + CommentService 연동
- Frontend: useSocialStore, api.ts, types에 "blog" 타입 확장
- Frontend: Blog 상세 페이지에 SocialHydrator + like/save UI
- Frontend: commentsCount 실제값 연동

---

## 2. Scope

### 2.1 In Scope

- [ ] **Backend**: BlogLike 엔티티 + BlogLikeRepository
- [ ] **Backend**: BlogSave 엔티티 + BlogSaveRepository
- [ ] **Backend**: SocialService에 toggleBlogLike/toggleBlogSave/getBlogSocialStatus
- [ ] **Backend**: SocialController에 POST /blogs/{id}/like, /save, GET /social
- [ ] **Backend**: Blog 엔티티에 commentsCount 필드 추가
- [ ] **Backend**: CommentService BLOG case에서 commentsCount 업데이트
- [ ] **Backend**: BlogDetailResponse에 commentsCount 추가
- [ ] **Frontend**: api.ts toggleLike/toggleSave/fetchSocialStatus에 "blog" 타입 추가
- [ ] **Frontend**: useSocialStore에 "blog" 타입 추가
- [ ] **Frontend**: types/index.ts BlogResponse에 commentsCount 추가
- [ ] **Frontend**: blog/[slug]/page.tsx에 SocialHydrator + like/save 버튼 추가
- [ ] **Frontend**: commentsCount={0} → blog.commentsCount ?? 0

### 2.2 Out of Scope

- Blog에 공유 기능 (별도 feature)
- SavesList에서 Blog 탭 추가 (기존 spot/spotline만, 별도 feature)
- Blog 인기 랭킹/추천 (별도 feature)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | BlogLike 엔티티 (blog_likes 테이블) | High | Pending |
| FR-02 | BlogSave 엔티티 (blog_saves 테이블) | High | Pending |
| FR-03 | POST /api/v2/blogs/{id}/like — 좋아요 토글 | High | Pending |
| FR-04 | POST /api/v2/blogs/{id}/save — 저장 토글 | High | Pending |
| FR-05 | GET /api/v2/blogs/{id}/social — 소셜 상태 조회 | High | Pending |
| FR-06 | Blog.commentsCount 필드 + CommentService 연동 | High | Pending |
| FR-07 | BlogDetailResponse/BlogResponse에 commentsCount 포함 | High | Pending |
| FR-08 | Frontend api.ts/useSocialStore에 "blog" 타입 확장 | High | Pending |
| FR-09 | blog/[slug]/page.tsx에 SocialHydrator + 좋아요/저장 버튼 | High | Pending |
| FR-10 | commentsCount 실제값 연동 (하드코딩 제거) | High | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria |
|----------|----------|
| Consistency | Spot/SpotLine 소셜 패턴과 100% 동일한 구조 |
| UX | 비로그인 유저가 좋아요/저장 클릭 시 로그인 바텀시트 표시 |
| Performance | 낙관적 업데이트 (optimistic update) 패턴 유지 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] Blog 상세 페이지에서 좋아요/저장 토글 가능
- [ ] 토글 후 카운트가 즉시 반영 (낙관적 업데이트)
- [ ] 실제 댓글 수가 CommentSection에 표시
- [ ] 기존 Spot/SpotLine 소셜 기능 정상 동작 유지

### 4.2 Quality Criteria

- [ ] `pnpm type-check` 통과
- [ ] `pnpm build` 성공
- [ ] `./gradlew build` 성공

---

## 5. Implementation Order

| Step | Task | Repo | Dependencies |
|------|------|------|-------------|
| 1 | BlogLike + BlogSave 엔티티/Repository | backend | None |
| 2 | SocialService blog 메서드 3개 | backend | Step 1 |
| 3 | SocialController blog 엔드포인트 3개 | backend | Step 2 |
| 4 | Blog.commentsCount + CommentService 연동 | backend | None |
| 5 | BlogDetailResponse/BlogResponse에 commentsCount | backend | Step 4 |
| 6 | api.ts + useSocialStore "blog" 타입 확장 | front | Steps 3, 5 |
| 7 | types/index.ts commentsCount 추가 | front | Step 5 |
| 8 | blog/[slug]/page.tsx SocialHydrator + 버튼 + commentsCount | front | Steps 6, 7 |

Backend Steps 1-5 → Frontend Steps 6-8. Step 4 is independent of Steps 1-3.

---

## 6. Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| DB 마이그레이션 필요 (blog_likes, blog_saves, commentsCount) | Medium | JPA auto DDL로 개발환경 처리, 프로덕션은 수동 마이그레이션 |
| SavesList에서 Blog 저장 미표시 | Low | Out of scope, 별도 feature로 처리 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-04-07 | Initial plan — Blog Social Actions | Claude Code |
