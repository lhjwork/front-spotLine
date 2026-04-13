# User Spot Photo Upload Design Document

> **Summary**: SpotLine 빌더에서 Spot에 사진 업로드 — getPresignedUrl 버그 수정 + SpotPhotoUpload 컴포넌트 + SelectedSpotCard 통합
>
> **Project**: front-spotLine
> **Author**: AI Assistant
> **Date**: 2026-04-12
> **Status**: Draft
> **Planning Doc**: [user-spot-photo-upload.plan.md](../../01-plan/features/user-spot-photo-upload.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- 기존 S3 presigned URL 업로드 패턴(Blog BlockMediaUpload)을 재사용하여 Spot 사진 업로드 구현
- getPresignedUrl 버그 수정으로 Blog 업로드와 Spot 업로드 모두 정상 동작
- SpotLine 빌더 내에서 각 Spot별로 최대 5장 사진 업로드 가능

### 1.2 Design Principles

- 기존 패턴 재사용 (BlockMediaUpload.tsx 참조)
- 최소 변경 원칙 — 프론트엔드만 수정, 백엔드 변경 없음
- 즉시 업로드 — 사진 선택 즉시 S3 업로드 + Spot 업데이트 (빌더 저장과 독립)

---

## 2. Architecture

### 2.1 Upload Flow

```
User selects photo
  → getPresignedUrl(filename, contentType, contentLength)
  → PUT file to S3 uploadUrl
  → updateSpotMedia(spotId, mediaItems)
  → Spot.mediaItems updated in DB
  → UI shows uploaded thumbnail
```

### 2.2 Component Diagram

```
SpotLineBuilder
  └── SelectedSpotList
        └── SelectedSpotCard
              └── SpotPhotoUpload   ← NEW
                    ├── Thumbnail grid (uploaded photos)
                    ├── Add button (Camera icon)
                    └── Hidden file input
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| SpotPhotoUpload | getPresignedUrl | S3 presigned URL 발급 |
| SpotPhotoUpload | updateSpotMedia | Spot mediaItems 업데이트 |
| SelectedSpotCard | SpotPhotoUpload | 사진 업로드 UI 표시 |

---

## 3. Data Model

### 3.1 기존 타입 (변경 없음)

```typescript
// types/index.ts — 이미 존재
export interface SpotMediaItem {
  id: string;
  url: string;
  mediaType: "IMAGE" | "VIDEO";
  thumbnailUrl: string | null;
  durationSec: number | null;
  displayOrder: number;
}
```

### 3.2 신규 타입

```typescript
// types/index.ts — 추가
export interface MediaItemRequest {
  s3Key: string;
  mediaType: "IMAGE";
  displayOrder: number;
  fileSizeBytes: number;
  mimeType: string;
}
```

### 3.3 Backend PresignedUrlRequest (참조용, 변경 없음)

```java
// filename (@NotBlank), contentType (@NotBlank), contentLength (@NotNull @Positive)
```

---

## 4. API Specification

### 4.1 수정: getPresignedUrl

**현재 (버그 있음):**
```typescript
export async function getPresignedUrl(
  fileName: string,       // BUG: should be "filename"
  contentType: string     // BUG: missing contentLength
): Promise<{ uploadUrl: string; fileUrl: string }>
```

**수정 후:**
```typescript
export async function getPresignedUrl(
  filename: string,
  contentType: string,
  contentLength: number
): Promise<{ uploadUrl: string; fileUrl: string; s3Key: string }> {
  const { data } = await apiV2.post<{
    uploadUrl: string;
    s3Key: string;
    publicUrl: string;
    mediaType: string;
  }>("/media/presigned-url", { filename, contentType, contentLength }, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    timeout: 5000,
  });
  return { uploadUrl: data.uploadUrl, fileUrl: data.publicUrl, s3Key: data.s3Key };
}
```

**변경점:**
- `fileName` → `filename` (백엔드 PresignedUrlRequest 필드명 일치)
- `contentLength` 파라미터 추가 (백엔드 @NotNull)
- 반환값에 `s3Key` 추가 (MediaItemRequest에 필요)

### 4.2 신규: updateSpotMedia

```typescript
export async function updateSpotMedia(
  spotId: string,
  mediaItems: MediaItemRequest[]
): Promise<void> {
  await apiV2.put(`/spots/${spotId}`, { mediaItems }, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    timeout: 10000,
  });
}
```

**참조 엔드포인트:** `PUT /api/v2/spots/{id}` (UpdateSpotRequest — mediaItems 필드)

### 4.3 호출부 업데이트

getPresignedUrl 시그니처 변경에 따라 기존 호출부 수정:

| 파일 | 수정 내용 |
|------|----------|
| `BlockMediaUpload.tsx` | `getPresignedUrl(file.name, file.type, file.size)` |
| `BlogCoverEditor.tsx` | `getPresignedUrl(file.name, file.type, file.size)` + s3Key 무시 |

---

## 5. UI/UX Design

### 5.1 SpotPhotoUpload 레이아웃

```
┌─ SelectedSpotCard ──────────────────────────┐
│  [≡] ① 카페 스포트              [X]          │
│      연남동 · 카페                            │
│      체류 [60] 분  방문 [14:00]              │
│                                              │
│  ┌─ SpotPhotoUpload ──────────────────────┐  │
│  │  [img1] [img2] [img3] [+ 📷]          │  │
│  │   80x80  80x80  80x80  80x80          │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

- 기존 SelectedSpotCard의 메타 입력(체류/방문) 아래에 배치
- 80x80 썸네일 그리드 (BlockMediaUpload와 동일)
- 마지막에 Camera 아이콘 추가 버튼
- hover 시 X 버튼으로 삭제
- 업로드 중 Loader2 스피너

### 5.2 User Flow

```
Spot 추가 → SelectedSpotCard 표시
  → 카메라 아이콘 클릭
  → 파일 선택 (JPEG/PNG/WebP, 10MB 이하)
  → 업로드 중 스피너 표시
  → 완료 시 썸네일 추가
  → (반복, 최대 5장)
  → 5장 도달 시 추가 버튼 숨김
```

### 5.3 Component List

| Component | Location | Responsibility |
|-----------|----------|----------------|
| SpotPhotoUpload | `src/components/spotline-builder/SpotPhotoUpload.tsx` | Spot별 사진 업로드 UI + S3 업로드 + Spot 업데이트 |
| SelectedSpotCard | `src/components/spotline-builder/SelectedSpotCard.tsx` | SpotPhotoUpload 통합 (MODIFY) |

---

## 6. Error Handling

| Scenario | UX | Handling |
|----------|-----|---------|
| 10MB 초과 | "10MB 이하 이미지만 업로드 가능합니다" alert | 파일 선택 시 즉시 검증, 업로드 차단 |
| 비허용 형식 | "JPEG, PNG, WebP 이미지만 지원합니다" alert | accept 속성 + 추가 검증 |
| S3 업로드 실패 | console.warn + 스피너 해제 | 재시도 가능 (파일 다시 선택) |
| Spot 업데이트 실패 | console.warn (사진은 S3에 저장됨) | 다음 저장 시 재시도 가능 |
| 5장 초과 | 추가 버튼 숨김 | maxPhotos 체크 |

---

## 7. Security Considerations

- [x] Presigned URL 10분 만료 (백엔드 설정)
- [x] 인증된 사용자만 업로드 가능 (Authorization 헤더)
- [x] 파일 유효성 검사 — 클라이언트 (형식 + 크기) + 서버 (MediaService)
- [x] Content-Type 헤더 일치 검증 (presigned URL 생성 시 지정)

---

## 8. Implementation Items

### Item 1: getPresignedUrl 버그 수정

| Property | Value |
|----------|-------|
| **File** | `src/lib/api.ts` |
| **Type** | MODIFY |
| **LOC** | ~10 |

```typescript
// BEFORE (line ~1480)
export async function getPresignedUrl(
  fileName: string,
  contentType: string
): Promise<{ uploadUrl: string; fileUrl: string }> {
  const { data } = await apiV2.post<{...}>("/media/presigned-url", { fileName, contentType }, {...});
  return { uploadUrl: data.uploadUrl, fileUrl: data.publicUrl };
}

// AFTER
export async function getPresignedUrl(
  filename: string,
  contentType: string,
  contentLength: number
): Promise<{ uploadUrl: string; fileUrl: string; s3Key: string }> {
  const { data } = await apiV2.post<{
    uploadUrl: string;
    s3Key: string;
    publicUrl: string;
    mediaType: string;
  }>("/media/presigned-url", { filename, contentType, contentLength }, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    timeout: 5000,
  });
  return { uploadUrl: data.uploadUrl, fileUrl: data.publicUrl, s3Key: data.s3Key };
}
```

### Item 2: updateSpotMedia API 함수 추가 + MediaItemRequest 타입

| Property | Value |
|----------|-------|
| **Files** | `src/lib/api.ts`, `src/types/index.ts` |
| **Type** | MODIFY |
| **LOC** | ~15 |

```typescript
// types/index.ts — MediaItemRequest 추가
export interface MediaItemRequest {
  s3Key: string;
  mediaType: "IMAGE";
  displayOrder: number;
  fileSizeBytes: number;
  mimeType: string;
}

// api.ts — updateSpotMedia 추가
export async function updateSpotMedia(
  spotId: string,
  mediaItems: MediaItemRequest[]
): Promise<void> {
  await apiV2.put(`/spots/${spotId}`, { mediaItems }, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    timeout: 10000,
  });
}
```

### Item 3: SpotPhotoUpload 컴포넌트 생성

| Property | Value |
|----------|-------|
| **File** | `src/components/spotline-builder/SpotPhotoUpload.tsx` |
| **Type** | NEW |
| **LOC** | ~100 |

```typescript
"use client";

import { useState, useRef } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { getPresignedUrl, updateSpotMedia } from "@/lib/api";
import { cn } from "@/lib/utils";
import OptimizedImage from "@/components/common/OptimizedImage";
import type { SpotMediaItem, MediaItemRequest } from "@/types";

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface SpotPhotoUploadProps {
  spotId: string;
  mediaItems: SpotMediaItem[];
  onMediaUpdate: (mediaItems: SpotMediaItem[]) => void;
}

export default function SpotPhotoUpload({
  spotId,
  mediaItems,
  onMediaUpdate,
}: SpotPhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert("JPEG, PNG, WebP 이미지만 지원합니다");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert("10MB 이하 이미지만 업로드 가능합니다");
      return;
    }

    setIsUploading(true);
    try {
      // 1. Get presigned URL
      const { uploadUrl, fileUrl, s3Key } = await getPresignedUrl(
        file.name, file.type, file.size
      );

      // 2. Upload to S3
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      // 3. Build updated mediaItems for API
      const newMediaItem: MediaItemRequest = {
        s3Key,
        mediaType: "IMAGE",
        displayOrder: mediaItems.length,
        fileSizeBytes: file.size,
        mimeType: file.type,
      };
      const allRequests = [
        ...mediaItems.map((m, i) => ({
          s3Key: extractS3Key(m.url),
          mediaType: "IMAGE" as const,
          displayOrder: i,
          fileSizeBytes: 0,
          mimeType: "",
        })),
        newMediaItem,
      ];

      // 4. Update Spot
      await updateSpotMedia(spotId, allRequests);

      // 5. Update local state
      const newItem: SpotMediaItem = {
        id: crypto.randomUUID(),
        url: fileUrl,
        mediaType: "IMAGE",
        thumbnailUrl: null,
        durationSec: null,
        displayOrder: mediaItems.length,
      };
      onMediaUpdate([...mediaItems, newItem]);
    } catch (err) {
      console.warn("사진 업로드 실패:", err);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async (mediaId: string) => {
    const updated = mediaItems.filter((m) => m.id !== mediaId);
    onMediaUpdate(updated);
    // Spot update with remaining items (fire-and-forget)
    try {
      await updateSpotMedia(spotId, updated.map((m, i) => ({
        s3Key: extractS3Key(m.url),
        mediaType: "IMAGE" as const,
        displayOrder: i,
        fileSizeBytes: 0,
        mimeType: "",
      })));
    } catch {}
  };

  const canAdd = mediaItems.length < MAX_PHOTOS;

  return (
    <div className="ml-7 mt-2">
      <div className="flex flex-wrap gap-2">
        {mediaItems.map((media) => (
          <div key={media.id} className="group relative h-16 w-16 shrink-0">
            <OptimizedImage
              src={media.url}
              alt="Spot 사진"
              width={64}
              height={64}
              className="h-full w-full rounded-lg object-cover"
            />
            <button
              onClick={() => handleRemove(media.id)}
              className="absolute -right-1 -top-1 hidden rounded-full bg-red-500 p-0.5 text-white shadow-sm group-hover:block"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {canAdd && (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className={cn(
              "flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-gray-400 transition-colors hover:border-purple-300 hover:text-purple-500",
              isUploading && "cursor-not-allowed opacity-50"
            )}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}

/** Extract S3 key from full URL (e.g., "https://...s3.../media/spots/2026-04/xxx.jpg" → "media/spots/2026-04/xxx.jpg") */
function extractS3Key(url: string): string {
  const match = url.match(/media\/spots\/.+/);
  return match ? match[0] : url;
}
```

### Item 4: SelectedSpotCard에 SpotPhotoUpload 통합

| Property | Value |
|----------|-------|
| **File** | `src/components/spotline-builder/SelectedSpotCard.tsx` |
| **Type** | MODIFY |
| **LOC** | ~20 |

변경 내용:
1. SpotPhotoUpload import 추가
2. mediaItems 로컬 상태 관리 (useState, spot.mediaItems 초기값)
3. 메타 입력 영역 아래에 SpotPhotoUpload 렌더링

```typescript
// 추가 import
import { useState } from "react";
import SpotPhotoUpload from "./SpotPhotoUpload";
import type { SpotMediaItem } from "@/types";

// 컴포넌트 내부 — state 추가
const [mediaItems, setMediaItems] = useState<SpotMediaItem[]>(
  spot.mediaItems || []
);

// JSX — 메타 입력 div 아래에 추가
<SpotPhotoUpload
  spotId={spot.id}
  mediaItems={mediaItems}
  onMediaUpdate={setMediaItems}
/>
```

### Item 5: getPresignedUrl 호출부 수정 (Blog 컴포넌트)

| Property | Value |
|----------|-------|
| **Files** | `src/components/blog/BlockMediaUpload.tsx`, Blog cover editor (if exists) |
| **Type** | MODIFY |
| **LOC** | ~5 |

```typescript
// BlockMediaUpload.tsx — line 32-34
// BEFORE:
const { uploadUrl, fileUrl } = await getPresignedUrl(file.name, file.type);

// AFTER:
const { uploadUrl, fileUrl } = await getPresignedUrl(file.name, file.type, file.size);
```

동일하게 BlogCoverEditor.tsx에서도 `file.size` 파라미터 추가.

---

## 9. Implementation Order

| # | Item | File(s) | Type | Depends On |
|:-:|------|---------|------|:----------:|
| 1 | getPresignedUrl 버그 수정 | `src/lib/api.ts` | MODIFY | — |
| 2 | MediaItemRequest 타입 + updateSpotMedia API | `src/types/index.ts`, `src/lib/api.ts` | MODIFY | 1 |
| 3 | SpotPhotoUpload 컴포넌트 | `src/components/spotline-builder/SpotPhotoUpload.tsx` | NEW | 1, 2 |
| 4 | SelectedSpotCard 통합 | `src/components/spotline-builder/SelectedSpotCard.tsx` | MODIFY | 3 |
| 5 | Blog 호출부 수정 | `src/components/blog/BlockMediaUpload.tsx` + cover editor | MODIFY | 1 |

---

## 10. Coding Convention Reference

| Item | Convention Applied |
|------|-------------------|
| Component naming | PascalCase (`SpotPhotoUpload.tsx`) |
| File organization | `src/components/spotline-builder/` (빌더 전용) |
| State management | 로컬 useState (SelectedSpotCard 내부) |
| Error handling | alert (유효성 검사) + console.warn (업로드 실패) |
| Import order | React → lucide → @/lib → @/components → @/types |
| 색상 체계 | purple (빌더 테마 일관성) |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-12 | Initial draft | AI Assistant |
