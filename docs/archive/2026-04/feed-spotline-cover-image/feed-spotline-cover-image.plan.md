# Feed SpotLine Cover Image Planning Document

> **Summary**: SpotLinePreviewCard에 커버 이미지를 추가하여 피드 시각적 매력 대폭 향상. Backend는 이미 coverImageUrl을 반환하므로 Frontend만 수정.
>
> **Project**: Spotline (front-spotLine)
> **Version**: 1.0.0
> **Date**: 2026-04-07
> **Status**: Planning

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | SpotLinePreviewCard가 아이콘만 표시 — 시각적 매력 0. Blog 카드는 커버 이미지가 있어 대비 심함. |
| **Solution** | SpotLinePreview 타입에 coverImageUrl 추가, SpotLinePreviewCard에 이미지 렌더링. Backend 변경 불필요 (이미 반환 중). |
| **Function/UX Effect** | 피드의 SpotLine 카드에 커버 이미지 표시. 이미지 없으면 기존 아이콘 폴백. |
| **Core Value** | 피드 시각적 매력 대폭 향상. 클릭률(CTR) 상승 기대. Blog 카드와 시각적 일관성 확보. |

---

## 1. Overview

### 1.1 Purpose

SpotLinePreviewCard에 커버 이미지를 추가하여 피드의 시각적 매력을 높이고, Blog 카드와의 시각적 일관성을 확보한다.

### 1.2 Background

- Backend `SpotLinePreviewResponse`는 이미 `coverImageUrl` 필드를 반환
- `resolveCoverImageUrl()`이 첫 번째 Spot의 첫 번째 미디어에서 S3 URL 생성
- 하지만 Frontend `SpotLinePreview` 타입에 `coverImageUrl`이 없음
- SpotLinePreviewCard는 Route 아이콘만 표시 → 시각적 매력 부족
- BlogCard는 이미 커버 이미지를 잘 표시 → 불일치

### 1.3 Current State

**이미 존재하는 것:**
- Backend: `SpotLinePreviewResponse.coverImageUrl` (S3 커버 이미지 URL)
- Backend: `resolveCoverImageUrl()` — 첫 Spot의 첫 미디어에서 추출
- Frontend: `SpotLinePreviewCard` — 기능적으로 완전, 이미지만 없음
- Frontend: `OptimizedImage` — 재사용 가능한 이미지 컴포넌트 (재시도, 폴백)

**누락된 것:**
- Frontend: `SpotLinePreview` 타입에 `coverImageUrl` 필드
- Frontend: SpotLinePreviewCard에 이미지 렌더링 UI

---

## 2. Scope

### 2.1 In Scope

- [ ] **FR-01**: `SpotLinePreview` 타입에 `coverImageUrl?: string` 추가
- [ ] **FR-02**: SpotLinePreviewCard 리디자인 — 커버 이미지 + 아이콘 폴백
- [ ] **FR-03**: FollowingFeed의 SpotLine 매핑에 coverImageUrl 포함

### 2.2 Out of Scope

- Backend 변경 (이미 coverImageUrl 반환 중)
- 이미지 업로드/편집 UI (크루 어드민 영역)
- 이미지 최적화/CDN (기존 S3 인프라 사용)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | `SpotLinePreview` 타입에 `coverImageUrl?: string` 추가 | High | Pending |
| FR-02 | SpotLinePreviewCard — coverImageUrl 있으면 이미지, 없으면 아이콘 폴백 | High | Pending |
| FR-03 | FollowingFeed SpotLine 매핑에 coverImageUrl 포함 | High | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria |
|----------|----------|
| Performance | 이미지 lazy loading (Next.js Image 또는 OptimizedImage) |
| UX | 이미지 없는 카드는 기존 아이콘 폴백 유지 |
| Consistency | BlogCard와 시각적 일관성 (rounded corners, aspect ratio) |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] SpotLinePreviewCard에 커버 이미지 표시
- [ ] 이미지 없을 때 기존 아이콘 폴백
- [ ] FollowingFeed에서도 이미지 표시
- [ ] `pnpm type-check` + `pnpm build` 통과

---

## 5. Implementation Order

| Step | Task | Files |
|------|------|-------|
| 1 | SpotLinePreview 타입에 coverImageUrl 추가 | `types/index.ts` (MODIFY) |
| 2 | SpotLinePreviewCard 리디자인 | `components/shared/SpotLinePreviewCard.tsx` (MODIFY) |
| 3 | FollowingFeed 매핑 업데이트 | `components/feed/FollowingFeed.tsx` (MODIFY) |

**총 파일: Frontend MODIFY 3개, Backend 변경 없음**

---

## 6. Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| 이미지 없는 SpotLine이 많을 수 있음 | Medium | 아이콘 폴백으로 graceful degradation |
| S3 이미지 로딩 느림 | Low | lazy loading + placeholder |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-04-07 | Initial plan — Feed SpotLine Cover Image | Claude Code |
