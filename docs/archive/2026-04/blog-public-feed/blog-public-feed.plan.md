# Blog Public Feed Planning Document

> **Summary**: 블로그 공개 발견 경로 추가. 메인 피드에 블로그 섹션, 프로필에 블로그 탭, /blogs 전용 페이지 생성. 기존 fetchBlogs API + BlogCard 컴포넌트를 활용하여 콘텐츠 발견 루프 완성.
>
> **Project**: Spotline (front-spotLine)
> **Version**: 1.0.0
> **Date**: 2026-04-07
> **Status**: Planning

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 블로그 생성/편집/발행은 완성되었으나 공개 발견 경로가 전혀 없음. `fetchBlogs()` API가 dead code이고, 피드/프로필/탐색 어디에서도 블로그를 찾을 수 없어 콘텐츠 생산 대비 소비가 0. |
| **Solution** | 메인 피드에 "인기 블로그" 섹션 추가, /blogs 전용 리스트 페이지 생성, 프로필 탭에 "블로그" 추가. 기존 `fetchBlogs` API와 `BlogCard` 컴포넌트를 연결. |
| **Function/UX Effect** | 피드에서 블로그 카드가 보이고, /blogs에서 지역별 필터로 블로그 탐색 가능, 프로필에서 유저의 블로그 목록 확인 가능. |
| **Core Value** | 콘텐츠 발견 루프 완성 — 블로그 콘텐츠가 생산부터 소비까지 연결되어 Cold Start 전략(SEO + 콘텐츠)의 실효성 확보. |

| Item | Detail |
|------|--------|
| Feature | Blog Public Feed |
| Created | 2026-04-07 |
| Duration | 예상 0.5일 (Frontend only) |
| Status | Planning |
| Level | Dynamic |
| Target Repo | front-spotLine |

---

## 1. Overview

### 1.1 Purpose

블로그 콘텐츠에 공개 발견 경로를 추가하여, 생산된 콘텐츠가 유저에게 자연스럽게 노출되도록 한다.

### 1.2 Background

- 블로그 시스템은 spotline-blog-builder + blog-seo-tracking + blog-social-actions를 통해 완성됨
- 그러나 블로그를 발견할 방법이 없음:
  - FeedPage에 블로그 섹션 없음 (SpotLine + Spot만 표시)
  - /blogs 리스트 페이지 없음
  - 프로필 탭에 "블로그" 없음 (likes, saves, spotlines, my-spots만)
  - `fetchBlogs()` API 함수가 정의만 되어 있고 어디서도 호출 안 됨

### 1.3 Current State

**이미 존재하는 것:**
- Backend: `GET /api/v2/blogs` — 공개, area 필터, 페이지네이션
- Frontend: `fetchBlogs(page, size, area?)` — api.ts에 정의됨 (미사용)
- Frontend: `BlogCard` — 완성된 카드 컴포넌트 (커버 이미지, 제목, 요약, 카운트)
- Frontend: `BlogListItem` 타입 — 모든 필드 정의됨
- Frontend: `/blog/[slug]` — SSR 상세 페이지 (SEO 완성)
- Frontend: `/my-blogs` — 내 블로그 관리 페이지 (인증 필요)

**누락된 것:**
- 메인 피드에 블로그 섹션
- /blogs 공개 리스트 페이지
- 프로필 탭에 "블로그" 탭
- 공개 유저별 블로그 조회 (backend에 userId 필터 없으면 추가 필요)

---

## 2. Scope

### 2.1 In Scope

- [ ] **FR-01**: FeedPage에 "인기 블로그" 섹션 추가 (FeedSpotLineSection 아래)
- [ ] **FR-02**: /blogs 전용 리스트 페이지 (area 필터 + 무한 스크롤)
- [ ] **FR-03**: ProfileTabs에 "블로그" 탭 추가 (isMe일 때 표시)
- [ ] **FR-04**: fetchBlogs를 FeedPage에서 호출하여 블로그 카드 렌더링
- [ ] **FR-05**: FeedBlogSection 컴포넌트 (FeedSpotLineSection 패턴)
- [ ] **FR-06**: /blogs 페이지 메타데이터 (SEO)

### 2.2 Out of Scope

- FollowingFeed에 블로그 표시 (별도 feature: following-feed-content)
- 블로그 정렬 옵션 (인기순/최신순 — backend 확장 필요, 별도 feature)
- 공개 프로필에서 타인의 블로그 표시 (userId 필터 backend 확장 필요)
- 블로그 검색 기능

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | FeedPage "all" 탭에 FeedBlogSection 추가 | High | Pending |
| FR-02 | /blogs 전용 리스트 페이지 (SSR + area 필터 + 무한 스크롤) | High | Pending |
| FR-03 | ProfileTabs에 "블로그" 탭 (isMe=true에서 /my-blogs 링크) | High | Pending |
| FR-04 | FeedPage에서 fetchBlogs 호출 + 결과 렌더링 | High | Pending |
| FR-05 | FeedBlogSection 컴포넌트 (BlogCard 가로 스크롤 또는 그리드) | High | Pending |
| FR-06 | /blogs 페이지 SEO 메타데이터 | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria |
|----------|----------|
| Consistency | FeedSpotLineSection과 동일한 디자인 패턴 |
| Performance | /blogs 페이지에 ISR (revalidate: 3600) |
| UX | BlogCard 기존 디자인 재사용, 추가 UI 최소화 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 피드 "전체" 탭에서 블로그 카드가 보임
- [ ] /blogs 페이지에서 지역 필터로 블로그 탐색 가능
- [ ] 내 프로필에서 "블로그" 탭이 /my-blogs로 연결됨
- [ ] `pnpm type-check` 통과
- [ ] `pnpm build` 성공

---

## 5. Implementation Order

| Step | Task | Files |
|------|------|-------|
| 1 | FeedBlogSection 컴포넌트 생성 | components/feed/FeedBlogSection.tsx (NEW) |
| 2 | FeedPage에 FeedBlogSection 통합 | components/feed/FeedPage.tsx (MODIFY) |
| 3 | /blogs 리스트 페이지 생성 | app/blogs/page.tsx (NEW) |
| 4 | ProfileTabs에 "블로그" 탭 추가 | components/profile/ProfileTabs.tsx (MODIFY) |
| 5 | SEO 메타데이터 | app/blogs/page.tsx (within) |

Backend 변경 없음 — 기존 `GET /api/v2/blogs` 그대로 사용.

---

## 6. Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| 블로그 콘텐츠가 0개일 때 빈 섹션 | Low | 0개면 섹션 숨김 처리 |
| /blogs 빌드 시 API 타임아웃 | Low | ISR + catch 패턴 (sitemap과 동일) |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-04-07 | Initial plan — Blog Public Feed | Claude Code |
