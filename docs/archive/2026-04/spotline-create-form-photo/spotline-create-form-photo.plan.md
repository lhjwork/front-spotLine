# SpotLine Create Form Photo Upload Planning Document

> **Summary**: Spot 생성 폼(`/create-spot`)에 사진 업로드 기능 통합 — 기존 presigned URL 패턴 재사용, CreateSpotRequest에 mediaItems 추가
>
> **Project**: front-spotLine
> **Author**: AI Assistant
> **Date**: 2026-04-13
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 사용자가 Spot 생성 시(`/create-spot`) 사진을 첨부할 수 없어, 텍스트만으로 Spot을 등록하게 되어 콘텐츠 품질이 낮아짐 |
| **Solution** | SpotCreateForm에 사진 업로드 섹션 추가. 기존 presigned URL 패턴과 SpotPhotoUpload 로직 재사용. CreateSpotRequest 타입에 mediaItems 필드 추가 |
| **Function/UX Effect** | Spot 생성 시 최대 5장 사진 첨부 가능. 파일 선택→S3 업로드→미리보기 표시→제출 시 mediaItems 포함 전송 |
| **Core Value** | UGC 품질 향상 → Spot에 고유 이미지 포함 → SEO 차별화 + 피드 시각적 풍부함 + 사용자 참여도 증가 |

---

## 1. Overview

### 1.1 Purpose

사용자가 Spot 등록 시 자신의 사진을 함께 업로드하여 더 풍부한 콘텐츠를 생성할 수 있게 한다.

### 1.2 Background

- SpotPhotoUpload 컴포넌트가 SpotLine 빌더에 이미 존재 (`spotline-builder/SpotPhotoUpload.tsx`)
- 그러나 이 컴포넌트는 **기존 spotId**가 필요 (`updateSpotMedia` 호출)
- Spot 생성 폼에서는 spotId가 없으므로, 사진을 먼저 S3에 업로드하고 s3Key를 수집한 뒤 CreateSpotRequest에 포함해야 함
- Backend `CreateSpotRequest`에는 이미 `mediaItems: List<MediaItemRequest>` 필드 존재
- Frontend `CreateSpotRequest` 타입에만 `mediaItems` 필드 추가하면 됨

### 1.3 Related Documents

- `docs/archive/2026-04/user-spot-photo-upload/` — SpotLine 빌더 사진 업로드 (참조용)

---

## 2. Scope

### 2.1 In Scope

- [ ] CreateSpotRequest 타입에 `mediaItems` 필드 추가
- [ ] SpotCreateForm에 사진 업로드 UI 섹션 추가
- [ ] 사진 선택 → presigned URL → S3 업로드 → 미리보기 표시
- [ ] 제출 시 수집된 mediaItems를 CreateSpotRequest에 포함
- [ ] 최대 5장, JPEG/PNG/WebP, 10MB 제한

### 2.2 Out of Scope

- 비디오 업로드
- 이미지 크롭/리사이즈
- 드래그 앤 드롭 순서 변경 (향후 확장)
- SpotPhotoUpload.tsx 기존 컴포넌트 수정 (별도 컴포넌트로 분리)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | CreateSpotRequest 타입에 `mediaItems?: MediaItemRequest[]` 추가 | High | Pending |
| FR-02 | SpotCreateForm에 사진 업로드 섹션 추가 (설명 필드 아래) | High | Pending |
| FR-03 | 사진 선택 시 S3 presigned URL로 즉시 업로드 + 미리보기 | High | Pending |
| FR-04 | 업로드된 사진 삭제 (X 버튼) | High | Pending |
| FR-05 | 제출 시 mediaItems 배열 포함하여 API 전송 | High | Pending |
| FR-06 | 유효성 검사: JPEG/PNG/WebP만, 10MB 이하, 최대 5장 | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria |
|----------|----------|
| Performance | 이미지 업로드 < 5초 (10MB, Wi-Fi) |
| UX | 업로드 중 로딩 스피너 표시, 다른 필드 입력 가능 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] Spot 생성 시 사진 첨부 → 생성된 Spot 상세에서 사진 표시
- [ ] `pnpm build` 성공, lint 에러 0

---

## 5. Architecture Considerations

### 5.1 Key Decision: spotId 없이 업로드

SpotCreateForm에서는 spotId가 없으므로 **2단계 접근**:
1. 사진을 S3에 업로드하고 s3Key를 로컬 state에 수집
2. 폼 제출 시 CreateSpotRequest.mediaItems에 s3Key 배열 포함

`updateSpotMedia()`는 호출하지 않음 (그건 기존 Spot 수정용).

### 5.2 구현 항목 요약

| # | Item | Type | Estimated LOC |
|:-:|------|------|:------------:|
| 1 | CreateSpotRequest 타입 확장 | MODIFY | ~3 |
| 2 | CreateFormPhotoUpload 컴포넌트 | NEW | ~100 |
| 3 | SpotCreateForm에 통합 | MODIFY | ~20 |

---

## 6. Next Steps

1. [ ] Write design document
2. [ ] Implement (3 items, ~123 LOC)
3. [ ] Gap analysis + report

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-13 | Initial draft | AI Assistant |
