# User Spot Photo Upload Planning Document

> **Summary**: 사용자가 Spot에 사진을 업로드할 수 있는 기능 — 기존 백엔드 인프라(MediaController, SpotMedia) 활용, 프론트엔드 업로드 UI 구현
>
> **Project**: front-spotLine + springboot-spotLine-backend
> **Author**: AI Assistant
> **Date**: 2026-04-12
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 사용자가 SpotLine 빌더에서 Spot을 추가할 때 사진을 첨부할 수 없어, Place API 사진에만 의존하거나 사진 없는 Spot이 생성됨 |
| **Solution** | 기존 MediaController + SpotMedia 엔티티를 활용하여 SpotLine 빌더 내 Spot 사진 업로드 UI 추가 + api.ts getPresignedUrl 버그 수정 |
| **Function/UX Effect** | SpotLine 빌더에서 Spot 추가 시 최대 5장 사진 첨부, 드래그&드롭/탭 업로드, 업로드 진행률 표시, 순서 변경 가능 |
| **Core Value** | 유저 생성 콘텐츠(UGC) 품질 향상 → SEO 차별화(고유 이미지) + 크리에이터 표현력 확대 + 플랫폼 콘텐츠 자산 축적 |

---

## 1. Overview

### 1.1 Purpose

사용자가 SpotLine 빌더에서 Spot을 추가할 때 자신만의 사진을 업로드하여 더 풍부하고 개성 있는 경험 콘텐츠를 만들 수 있게 한다.

### 1.2 Background

- 백엔드 인프라 완비: `MediaController` (presigned URL), `SpotMedia` 엔티티, `S3Service` 모두 구현됨
- `CreateSpotRequest`/`UpdateSpotRequest`에 `mediaItems` 필드 이미 존재
- 하지만 프론트엔드에서 이 기능을 활용하는 UI가 전혀 없음
- `getPresignedUrl()` 함수에 버그 존재: `fileName` → `filename`, `contentLength` 누락
- Blog 에디터(`BlockMediaUpload.tsx`, `BlogCoverEditor.tsx`)에 동일한 업로드 패턴이 이미 구현되어 있어 참조 가능

### 1.3 Related Documents

- Backend Swagger: `localhost:4000/swagger-ui.html` — MediaController, SpotController 참조
- Blog 업로드 참조: `src/components/blog/BlockMediaUpload.tsx`, `BlogCoverEditor.tsx`

---

## 2. Scope

### 2.1 In Scope

- [ ] `getPresignedUrl()` API 함수 버그 수정 (filename casing + contentLength 추가)
- [ ] SpotLine 빌더 내 Spot 사진 업로드 컴포넌트 (SpotPhotoUpload)
- [ ] Spot 생성 시 mediaItems 포함하여 API 전송
- [ ] 업로드 진행률 표시 UI
- [ ] 사진 미리보기 + 삭제 + 순서 변경
- [ ] 최대 5장 제한, 이미지 유효성 검사 (JPEG/PNG/WebP, 10MB 이하)

### 2.2 Out of Scope

- 비디오 업로드 (향후 확장)
- Spot 상세 페이지에서 직접 사진 편집/추가 (별도 피처)
- 이미지 리사이즈/크롭 (클라이언트 사이드)
- SpotLine 커버 이미지 (별도 피처)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | `getPresignedUrl()` 버그 수정 — filename casing + contentLength 파라미터 추가 | High | Pending |
| FR-02 | SpotPhotoUpload 컴포넌트 — 파일 선택(탭) 또는 드래그&드롭으로 사진 추가 | High | Pending |
| FR-03 | 업로드 진행률 표시 (0~100%) + 완료 후 미리보기 썸네일 | High | Pending |
| FR-04 | 사진 삭제 버튼 (X 아이콘, 업로드 전/후 모두 지원) | High | Pending |
| FR-05 | 최대 5장 제한, 제한 초과 시 안내 메시지 | Medium | Pending |
| FR-06 | 이미지 유효성 검사 — JPEG/PNG/WebP만 허용, 10MB 이하 | Medium | Pending |
| FR-07 | SpotLine 빌더에서 Spot 생성 시 mediaItems 배열로 API 전송 | High | Pending |
| FR-08 | SpotLine 빌더에서 기존 Spot 수정 시 mediaItems 업데이트 | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 이미지 업로드 < 5초 (10MB 기준 Wi-Fi) | 실사용 테스트 |
| UX | 업로드 중 다른 UI 조작 가능 (비동기) | 수동 확인 |
| Security | presigned URL 10분 만료, 인증된 사용자만 업로드 가능 | Backend 검증 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] getPresignedUrl 버그 수정 완료
- [ ] SpotPhotoUpload 컴포넌트 구현 + SpotLine 빌더 통합
- [ ] 사진 첨부된 Spot 생성 → DB에 SpotMedia 레코드 저장 확인
- [ ] Spot 상세 페이지에서 업로드된 사진 표시 확인
- [ ] `pnpm build` 성공

### 4.2 Quality Criteria

- [ ] Zero lint errors
- [ ] Build 성공 (pnpm build)
- [ ] 이미지 업로드 → S3 저장 → publicUrl 접근 가능 확인

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| S3 presigned URL 만료 (10분) | Medium | Low | 업로드 시작 직전 URL 요청, 실패 시 재요청 |
| 대용량 이미지 업로드 시 UX 저하 | Medium | Medium | 진행률 표시 + 10MB 제한 + WebP 권장 |
| getPresignedUrl 버그 수정 시 Blog 업로드 영향 | High | Low | Blog 업로드 호출부 함께 확인 |

---

## 6. Architecture Considerations

### 6.1 Project Level

Dynamic — 기존 프로젝트 아키텍처 유지

### 6.2 Key Architectural Decisions

| Decision | Selected | Rationale |
|----------|----------|-----------|
| 업로드 방식 | S3 presigned URL (기존 패턴) | Backend MediaController 이미 구현됨 |
| 컴포넌트 위치 | `src/components/spotline-builder/SpotPhotoUpload.tsx` | 빌더 내 전용 컴포넌트 |
| 업로드 패턴 | Blog BlockMediaUpload.tsx 참조 | 검증된 동일 패턴 재사용 |
| 상태 관리 | 로컬 useState | 빌더 내부 상태, 글로벌 스토어 불필요 |

### 6.3 구현 항목 요약

| # | Item | Repo | Type | Estimated LOC |
|:-:|------|------|------|:------------:|
| 1 | getPresignedUrl 버그 수정 | front | MODIFY | ~5 |
| 2 | SpotPhotoUpload 컴포넌트 | front | NEW | ~120 |
| 3 | SpotLineBuilder 통합 | front | MODIFY | ~30 |
| 4 | CreateSpotLineRequest 타입 확장 | front | MODIFY | ~10 |
| 5 | Spot 생성 API 호출 시 mediaItems 전송 | front | MODIFY | ~15 |

---

## 7. Convention Prerequisites

### 7.1 Existing Conventions

- [x] `CLAUDE.md` has coding conventions
- [x] `src/components/CLAUDE.md` — 컴포넌트 규칙
- [x] `src/lib/CLAUDE.md` — API 레이어 규칙
- [x] ESLint + TypeScript strict mode

### 7.2 기존 업로드 패턴 (BlogCoverEditor 참조)

```typescript
// 1. Presigned URL 요청
const { uploadUrl, fileUrl } = await getPresignedUrl(file.name, file.type);
// 2. S3에 직접 PUT
await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
// 3. publicUrl 저장
```

### 7.3 환경 변수

기존 환경 변수 모두 충족 (S3, Supabase Auth). 추가 필요 없음.

---

## 8. Next Steps

1. [ ] Write design document (`user-spot-photo-upload.design.md`)
2. [ ] Implement (5 items, ~180 LOC)
3. [ ] Gap analysis + report

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-12 | Initial draft | AI Assistant |
