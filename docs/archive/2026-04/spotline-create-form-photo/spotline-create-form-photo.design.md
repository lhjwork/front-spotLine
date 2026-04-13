# SpotLine Create Form Photo Upload Design Document

> **Summary**: SpotCreateForm에 사진 업로드 통합 — spotId 없이 S3 업로드 후 s3Key 수집, CreateSpotRequest.mediaItems에 포함
>
> **Project**: front-spotLine
> **Version**: 0.1
> **Author**: AI Assistant
> **Date**: 2026-04-13
> **Status**: Draft
> **Planning Doc**: [spotline-create-form-photo.plan.md](../01-plan/features/spotline-create-form-photo.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- SpotCreateForm에서 spotId 없이 사진을 S3에 업로드하고 s3Key를 수집
- 기존 `getPresignedUrl()` API 패턴 재사용
- 최소한의 코드로 기존 폼에 자연스럽게 통합

### 1.2 Design Principles

- **기존 패턴 재사용**: SpotPhotoUpload.tsx의 업로드 로직 참고, updateSpotMedia 호출 제거
- **단순성**: 새 컴포넌트 1개 + 타입 확장 + 폼 통합
- **독립성**: 사진 업로드와 폼 입력은 독립적으로 동작

---

## 2. Architecture

### 2.1 Data Flow

```
사진 선택 → 유효성 검사 (타입/크기/개수)
         → getPresignedUrl() → S3 PUT 업로드
         → s3Key + fileUrl 로컬 state에 저장
         → 미리보기 표시
         ─────────────────────────────────
폼 제출 시 → CreateSpotRequest.mediaItems에 s3Key 배열 포함
         → POST /api/v2/spots → 백엔드가 mediaItems 처리
```

### 2.2 핵심 차이: SpotPhotoUpload vs CreateFormPhotoUpload

| 항목 | SpotPhotoUpload (기존) | CreateFormPhotoUpload (신규) |
|------|----------------------|---------------------------|
| spotId 필요 | Yes | **No** |
| updateSpotMedia 호출 | Yes (업로드 즉시) | **No** |
| 결과 전달 방식 | onMediaUpdate(SpotMediaItem[]) | **onMediaItemsChange(MediaItemRequest[])** |
| 사용처 | SpotLine 빌더 (기존 Spot 수정) | SpotCreateForm (새 Spot 생성) |

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| CreateFormPhotoUpload | `getPresignedUrl()` | S3 presigned URL 발급 |
| CreateFormPhotoUpload | `MediaItemRequest` type | 업로드 결과 타입 |
| SpotCreateForm | CreateFormPhotoUpload | 사진 업로드 UI 섹션 |

---

## 3. Data Model

### 3.1 타입 확장

```typescript
// src/types/index.ts — CreateSpotRequest에 mediaItems 추가
export interface CreateSpotRequest {
  // ... 기존 필드 유지
  mediaItems?: MediaItemRequest[];  // NEW: 사진 업로드 결과
}
```

### 3.2 로컬 State 타입

```typescript
// CreateFormPhotoUpload 내부에서 사용할 미리보기 아이템
interface PhotoPreviewItem {
  id: string;          // crypto.randomUUID()
  fileUrl: string;     // S3 파일 URL (미리보기용)
  s3Key: string;       // S3 키 (API 전송용)
  fileSizeBytes: number;
  mimeType: string;
}
```

---

## 4. UI/UX Design

### 4.1 SpotCreateForm 내 배치

```
┌────────────────────────────────────┐
│  장소 이름 *                        │
├────────────────────────────────────┤
│  카테고리 *                         │
├────────────────────────────────────┤
│  주소 *                            │
├────────────────────────────────────┤
│  설명                              │
├────────────────────────────────────┤
│  📸 사진 (최대 5장)                 │  ← NEW
│  ┌────┐ ┌────┐ ┌────┐ ┌──────┐   │
│  │ 사진│ │ 사진│ │ 사진│ │ + 추가│   │
│  │  ✕ │ │  ✕ │ │  ✕ │ │      │   │
│  └────┘ └────┘ └────┘ └──────┘   │
├────────────────────────────────────┤
│  태그                              │
├────────────────────────────────────┤
│  외부 링크                          │
├────────────────────────────────────┤
│  [ Spot 등록하기 ]                  │
└────────────────────────────────────┘
```

### 4.2 User Flow

```
1. 사진 추가 버튼(+) 클릭 → 파일 선택 다이얼로그
2. 파일 선택 → 유효성 검사 → S3 업로드 (스피너 표시)
3. 업로드 완료 → 미리보기 썸네일 표시
4. X 버튼 → 로컬 state에서 제거 (S3 파일은 남겨둠)
5. 폼 제출 → mediaItems 포함 → 백엔드 처리
```

---

## 5. Component Specification

### 5.1 CreateFormPhotoUpload

**파일**: `src/components/spot/CreateFormPhotoUpload.tsx` (NEW)

```typescript
interface CreateFormPhotoUploadProps {
  mediaItems: MediaItemRequest[];
  onMediaItemsChange: (items: MediaItemRequest[]) => void;
}
```

**내부 State**:
```typescript
const [previews, setPreviews] = useState<PhotoPreviewItem[]>([]);
const [isUploading, setIsUploading] = useState(false);
const inputRef = useRef<HTMLInputElement>(null);
```

**상수**:
```typescript
const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
```

**핵심 로직**:

1. `handleUpload(file)`:
   - 유효성 검사 (타입, 크기, 최대 개수)
   - `getPresignedUrl(file.name, file.type, file.size)` 호출
   - `fetch(uploadUrl, { method: "PUT", body: file })` 로 S3 업로드
   - previews state에 `{ id, fileUrl, s3Key, fileSizeBytes, mimeType }` 추가
   - `onMediaItemsChange()`로 부모에 MediaItemRequest[] 전달

2. `handleRemove(id)`:
   - previews에서 해당 항목 제거
   - displayOrder 재정렬
   - `onMediaItemsChange()`로 부모에 업데이트 전달

**렌더링**:
- 업로드된 사진 미리보기 (64x64 썸네일, rounded-lg)
- 각 썸네일에 X 삭제 버튼 (hover 시 표시)
- 추가 버튼 (Camera 아이콘, border-dashed)
- 업로드 중 Loader2 스피너
- 숨겨진 file input (accept="image/jpeg,image/png,image/webp")

### 5.2 SpotCreateForm 수정

**파일**: `src/components/spot/SpotCreateForm.tsx` (MODIFY)

변경사항:

```typescript
// 1. 임포트 추가
import CreateFormPhotoUpload from "./CreateFormPhotoUpload";
import type { MediaItemRequest } from "@/types";

// 2. State 추가
const [mediaItems, setMediaItems] = useState<MediaItemRequest[]>([]);

// 3. handleSubmit에서 mediaItems 포함
const request: CreateSpotRequest = {
  // ... 기존 필드
  ...(mediaItems.length > 0 && { mediaItems }),
};

// 4. 설명 섹션과 태그 섹션 사이에 사진 업로드 UI 추가
<div>
  <label className="mb-2 block text-sm font-medium text-gray-900">사진</label>
  <CreateFormPhotoUpload
    mediaItems={mediaItems}
    onMediaItemsChange={setMediaItems}
  />
  <p className="mt-1 text-xs text-gray-400">
    JPEG, PNG, WebP · 최대 10MB · 최대 5장
  </p>
</div>
```

---

## 6. Error Handling

| 상황 | 처리 |
|------|------|
| 지원하지 않는 파일 형식 | `alert("JPEG, PNG, WebP 이미지만 지원합니다")` |
| 10MB 초과 | `alert("10MB 이하 이미지만 업로드 가능합니다")` |
| 5장 초과 | 추가 버튼 숨김 (canAdd = false) |
| S3 업로드 실패 | `console.warn` + 해당 사진 스킵 |
| presignedUrl 발급 실패 | `console.warn` + 해당 사진 스킵 |

---

## 7. Implementation Guide

### 7.1 Implementation Order

| # | Item | Type | File | Est. LOC |
|:-:|------|------|------|:--------:|
| 1 | CreateSpotRequest 타입에 mediaItems 추가 | MODIFY | `src/types/index.ts` | ~1 |
| 2 | CreateFormPhotoUpload 컴포넌트 | NEW | `src/components/spot/CreateFormPhotoUpload.tsx` | ~100 |
| 3 | SpotCreateForm에 사진 섹션 통합 | MODIFY | `src/components/spot/SpotCreateForm.tsx` | ~15 |

### 7.2 구현 순서

1. **타입 확장** — `CreateSpotRequest`에 `mediaItems?: MediaItemRequest[]` 추가
2. **컴포넌트 생성** — `CreateFormPhotoUpload.tsx` 작성
3. **폼 통합** — SpotCreateForm에 import + state + UI + submit 로직 추가

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-13 | Initial draft | AI Assistant |
