# User Spot Creation Design Document

> **Summary**: 유저가 직접 Spot을 생성하는 `/create-spot` 페이지 — SpotCreateForm, AddressSearch, CategorySelector, TagInput 컴포넌트 + createSpot API 함수
>
> **Project**: front-spotLine
> **Author**: AI Assistant
> **Date**: 2026-04-13
> **Status**: Draft
> **Planning Doc**: [user-spot-creation.plan.md](../../01-plan/features/user-spot-creation.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- 유저가 프론트엔드에서 직접 Spot(장소)을 등록할 수 있는 폼 페이지 구현
- 기존 create-spotline 페이지와 동일한 아키텍처 패턴 (AuthGuard + Suspense)
- Daum Postcode API로 정확한 주소 → 좌표 변환 보장
- SpotPhotoUpload 컴포넌트 재활용으로 사진 업로드 지원

### 1.2 Design Principles

- 기존 패턴 재사용 (create-spotline 페이지, SpotPhotoUpload, AuthGuard)
- 모바일 퍼스트 반응형 — 유저 대부분 모바일에서 Spot 등록
- 최소 필수 필드만 요구 (title, category, address) — 나머지는 선택
- source="USER" 고정, creatorType="user" 자동 설정

---

## 2. Architecture

### 2.1 Spot Creation Flow

```
User clicks FloatingCreateButton → selects "Spot 등록"
  → /create-spot 페이지 진입
  → AuthGuard 인증 확인
  → SpotCreateForm 렌더링
  → 필수 정보 입력 (장소명, 카테고리, 주소)
  → 선택 정보 입력 (설명, 사진, 태그, 링크)
  → 제출 → POST /api/v2/spots
  → 성공 → /spot/[slug] 리다이렉트
```

### 2.2 Component Diagram

```
/create-spot (page.tsx)
  └── AuthGuard
        └── SpotCreateForm               ← NEW (메인 폼)
              ├── CategorySelector        ← NEW (카테고리 칩 선택)
              ├── AddressSearch           ← NEW (Daum Postcode 통합)
              ├── SpotPhotoUpload         ← REUSE (기존 컴포넌트)
              └── TagInput               ← NEW (태그 입력 칩)

FloatingCreateButton                     ← MODIFY (Spot/SpotLine 선택 메뉴)
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| SpotCreateForm | createSpot() | API 호출 |
| SpotCreateForm | CategorySelector | 카테고리 선택 |
| SpotCreateForm | AddressSearch | 주소 검색 + 좌표 변환 |
| SpotCreateForm | SpotPhotoUpload | 사진 업로드 (재활용) |
| SpotCreateForm | TagInput | 태그 입력 |
| AddressSearch | Daum Postcode API | 주소 검색 스크립트 |
| FloatingCreateButton | — | Spot/SpotLine 선택 메뉴 |

---

## 3. Data Model

### 3.1 신규 타입: CreateSpotRequest

```typescript
// types/index.ts — 추가
export interface CreateSpotRequest {
  title: string;           // 필수, 최대 100자
  category: SpotCategory;  // 필수, 10개 중 택1
  source: string;          // "USER" 고정
  address: string;         // 필수, Daum Postcode에서 채움
  latitude: number;        // 필수, geocoding 결과
  longitude: number;       // 필수, geocoding 결과
  area: string;            // 필수, sido + sigungu 조합
  sido?: string;           // 선택, Daum Postcode에서 채움
  sigungu?: string;        // 선택
  dong?: string;           // 선택
  description?: string;    // 선택, 최대 500자
  tags?: string[];         // 선택, 최대 10개
  blogUrl?: string;        // 선택
  instagramUrl?: string;   // 선택
  websiteUrl?: string;     // 선택
}
```

### 3.2 신규 타입: CreateSpotResponse

```typescript
// types/index.ts — 추가
export interface CreateSpotResponse {
  id: string;
  slug: string;
  title: string;
  category: SpotCategory;
  address: string;
  createdAt: string;
}
```

### 3.3 기존 타입 (변경 없음)

```typescript
// SpotCategory — 이미 정의됨
export type SpotCategory =
  | "cafe" | "restaurant" | "bar"
  | "nature" | "culture" | "exhibition"
  | "walk" | "activity" | "shopping" | "other";

// SpotMediaItem, MediaItemRequest — 이미 정의됨 (SpotPhotoUpload에서 사용)
```

---

## 4. API Specification

### 4.1 신규: createSpot

```typescript
// api.ts — 추가
export async function createSpot(
  request: CreateSpotRequest
): Promise<CreateSpotResponse> {
  const { data } = await apiV2.post<CreateSpotResponse>(
    "/spots",
    request,
    {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
      timeout: 10000,
    }
  );
  return data;
}
```

**Backend 엔드포인트**: `POST /api/v2/spots`
- 인증 필수 (Bearer token)
- creatorType="user" 백엔드에서 자동 설정
- slug 자동 생성 (SpotService.create)
- 성공 시 201 Created + Spot 응답

### 4.2 기존 API (재활용)

| API | Purpose | 변경 |
|-----|---------|------|
| `getPresignedUrl()` | 사진 업로드 URL | 없음 |
| `updateSpotMedia()` | Spot 미디어 업데이트 | 없음 |

---

## 5. UI/UX Design

### 5.1 /create-spot 페이지 레이아웃

```
┌─ Header ──────────────────────────────────┐
│  [←]  Spot 등록                           │
├───────────────────────────────────────────┤
│                                           │
│  장소 이름 *                              │
│  ┌─────────────────────────────────────┐  │
│  │ 예: 성수동 카페 123                  │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  카테고리 *                               │
│  [☕카페] [🍽️맛집] [🍷바] [🌿자연]       │
│  [🎭문화] [🎨전시] [🚶산책] [🎯활동]     │
│  [🛍️쇼핑] [📌기타]                       │
│                                           │
│  주소 *                                   │
│  ┌──────────────────────── [🔍 검색] ──┐  │
│  │ 주소를 검색해주세요                  │  │
│  └─────────────────────────────────────┘  │
│  서울특별시 성동구 성수동2가              │
│                                           │
│  설명                                     │
│  ┌─────────────────────────────────────┐  │
│  │ 이 장소를 소개해주세요 (선택)        │  │
│  │                                     │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  사진 (최대 5장)                          │
│  ┌─ SpotPhotoUpload ──────────────────┐  │
│  │  [+ 📷]                            │  │
│  └────────────────────────────────────┘  │
│                                           │
│  태그 (최대 10개)                         │
│  [분위기좋은] [조용한] [+추가]            │
│                                           │
│  외부 링크 (선택)                         │
│  블로그   ┌────────────────────────────┐  │
│           │ https://...                │  │
│           └────────────────────────────┘  │
│  인스타   ┌────────────────────────────┐  │
│           │ https://...                │  │
│           └────────────────────────────┘  │
│  웹사이트 ┌────────────────────────────┐  │
│           │ https://...                │  │
│           └────────────────────────────┘  │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │          Spot 등록하기               │  │
│  └─────────────────────────────────────┘  │
│                                           │
└───────────────────────────────────────────┘
```

### 5.2 FloatingCreateButton 변경

```
기존: [+] → /create-spotline 직접 이동

변경: [+] 클릭 → 팝업 메뉴 표시
  ┌─────────────────────┐
  │  📍 Spot 등록       │ → /create-spot
  │  🗺️ SpotLine 만들기 │ → /create-spotline
  └─────────────────────┘
```

### 5.3 CategorySelector UI

```
┌─ CategorySelector ──────────────────────┐
│  [☕카페] [🍽️맛집] [🍷바] [🌿자연]      │
│  [🎭문화] [🎨전시] [🚶산책] [🎯활동]    │
│  [🛍️쇼핑] [📌기타]                      │
└──────────────────────────────────────────┘
```

- 칩(chip) 스타일, 선택 시 blue-600 배경 + 흰 텍스트
- 미선택 시 gray-100 배경 + gray-700 텍스트
- flex-wrap으로 모바일에서 자연스럽게 줄바꿈

### 5.4 AddressSearch UI

```
┌─ AddressSearch ─────────────────────────┐
│  ┌────────────────────── [🔍 검색] ──┐  │
│  │ 주소를 검색해주세요                │  │
│  └───────────────────────────────────┘  │
│  ✅ 서울특별시 성동구 성수동2가 123-45  │  (선택된 주소 표시)
└──────────────────────────────────────────┘
```

- "검색" 버튼 클릭 → Daum Postcode 팝업/레이어 오픈
- 주소 선택 시: address, sido, sigungu, dong 자동 채움
- 좌표 변환: Daum Postcode의 좌표 정보 또는 Kakao Geocoder API 활용

### 5.5 TagInput UI

```
┌─ TagInput ──────────────────────────────┐
│  [분위기좋은 ×] [조용한 ×] [넓은 ×]    │
│  ┌───────────────────── [추가] ──────┐  │
│  │ 태그 입력 (Enter로 추가)          │  │
│  └───────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

- 입력 후 Enter 또는 "추가" 버튼으로 태그 추가
- 각 태그 칩에 × 버튼으로 삭제
- 최대 10개 도달 시 입력 비활성화

### 5.6 Component List

| Component | Location | Type | Responsibility |
|-----------|----------|------|----------------|
| CreateSpotPage | `src/app/create-spot/page.tsx` | NEW | AuthGuard + Suspense 래핑 |
| SpotCreateForm | `src/components/spot/SpotCreateForm.tsx` | NEW | 메인 폼 상태 관리 + API 제출 |
| CategorySelector | `src/components/spot/CategorySelector.tsx` | NEW | 카테고리 칩 선택 UI |
| AddressSearch | `src/components/spot/AddressSearch.tsx` | NEW | Daum Postcode 통합 |
| TagInput | `src/components/spot/TagInput.tsx` | NEW | 태그 입력 칩 UI |
| FloatingCreateButton | `src/components/common/FloatingCreateButton.tsx` | MODIFY | Spot/SpotLine 선택 메뉴 |

---

## 6. Error Handling

| Scenario | UX | Handling |
|----------|-----|---------|
| 필수 필드 누락 | 해당 필드 아래 빨간 텍스트 "필수 항목입니다" | 클라이언트 유효성 검사, 제출 차단 |
| title 100자 초과 | 입력 제한 (maxLength) + 글자수 카운터 | 실시간 검증 |
| description 500자 초과 | 입력 제한 (maxLength) + 글자수 카운터 | 실시간 검증 |
| 주소 미선택 | "주소를 검색해주세요" 안내 텍스트 | 제출 시 검증 |
| 태그 10개 초과 | 입력 비활성화 | maxTags 체크 |
| API 에러 (400) | 토스트 "입력 정보를 확인해주세요" | handleApiError 패턴 |
| API 에러 (401) | AuthGuard가 로그인 유도 | 인증 만료 시 |
| API 에러 (500) | 토스트 "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요" | 일반 서버 에러 |
| 네트워크 에러 | 토스트 "네트워크 연결을 확인해주세요" | timeout/network 에러 |

---

## 7. Security Considerations

- [x] AuthGuard로 인증된 사용자만 접근 가능
- [x] Bearer token으로 API 호출 인증
- [x] source="USER" 클라이언트에서 고정 — 서버에서 creatorType 검증
- [x] 클라이언트 유효성 검사 + 서버 DTO validation (@NotBlank, @Size 등)
- [x] Daum Postcode API는 클라이언트 사이드 전용 (보안 이슈 없음)
- [x] 사진 업로드는 Presigned URL 패턴 (기존 검증 완료)

---

## 8. Implementation Items

### Item 1: CreateSpotRequest/Response 타입 추가

| Property | Value |
|----------|-------|
| **File** | `src/types/index.ts` |
| **Type** | MODIFY |
| **LOC** | ~25 |

```typescript
// types/index.ts — SpotLine Builder 타입 섹션 아래에 추가

/** Spot 생성 요청 (유저용) */
export interface CreateSpotRequest {
  title: string;
  category: SpotCategory;
  source: string;
  address: string;
  latitude: number;
  longitude: number;
  area: string;
  sido?: string;
  sigungu?: string;
  dong?: string;
  description?: string;
  tags?: string[];
  blogUrl?: string;
  instagramUrl?: string;
  websiteUrl?: string;
}

/** Spot 생성 응답 */
export interface CreateSpotResponse {
  id: string;
  slug: string;
  title: string;
  category: SpotCategory;
  address: string;
  createdAt: string;
}
```

### Item 2: createSpot() API 함수 추가

| Property | Value |
|----------|-------|
| **File** | `src/lib/api.ts` |
| **Type** | MODIFY |
| **LOC** | ~15 |

```typescript
// api.ts — SpotLine CRUD 섹션 근처에 추가

import type { CreateSpotRequest, CreateSpotResponse } from "@/types";

/** Spot 생성 (유저용) */
export async function createSpot(
  request: CreateSpotRequest
): Promise<CreateSpotResponse> {
  const { data } = await apiV2.post<CreateSpotResponse>(
    "/spots",
    request,
    {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
      timeout: 10000,
    }
  );
  return data;
}
```

### Item 3: CategorySelector 컴포넌트

| Property | Value |
|----------|-------|
| **File** | `src/components/spot/CategorySelector.tsx` |
| **Type** | NEW |
| **LOC** | ~50 |

```typescript
"use client";

import { cn } from "@/lib/utils";
import type { SpotCategory } from "@/types";

const CATEGORIES: { value: SpotCategory; label: string }[] = [
  { value: "cafe", label: "카페" },
  { value: "restaurant", label: "맛집" },
  { value: "bar", label: "바" },
  { value: "nature", label: "자연" },
  { value: "culture", label: "문화" },
  { value: "exhibition", label: "전시" },
  { value: "walk", label: "산책" },
  { value: "activity", label: "활동" },
  { value: "shopping", label: "쇼핑" },
  { value: "other", label: "기타" },
];

interface CategorySelectorProps {
  value: SpotCategory | null;
  onChange: (category: SpotCategory) => void;
}

export default function CategorySelector({ value, onChange }: CategorySelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map(({ value: cat, label }) => (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(cat)}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            value === cat
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
```

### Item 4: AddressSearch 컴포넌트

| Property | Value |
|----------|-------|
| **File** | `src/components/spot/AddressSearch.tsx` |
| **Type** | NEW |
| **LOC** | ~80 |

```typescript
"use client";

import { useState, useCallback } from "react";
import { Search, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddressData {
  address: string;
  latitude: number;
  longitude: number;
  area: string;
  sido: string;
  sigungu: string;
  dong: string;
}

interface AddressSearchProps {
  value: AddressData | null;
  onChange: (data: AddressData) => void;
}

export default function AddressSearch({ value, onChange }: AddressSearchProps) {
  const [isLoading, setIsLoading] = useState(false);

  const openDaumPostcode = useCallback(() => {
    // Daum Postcode 스크립트 동적 로드
    const script = document.createElement("script");
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.onload = () => {
      new (window as any).daum.Postcode({
        oncomplete: async (data: any) => {
          const address = data.roadAddress || data.jibunAddress;
          const sido = data.sido;
          const sigungu = data.sigungu;
          const dong = data.bname;
          const area = `${sido} ${sigungu}`;

          setIsLoading(true);
          try {
            // Kakao Geocoder로 좌표 변환
            const coords = await geocodeAddress(address);
            onChange({
              address,
              latitude: coords.lat,
              longitude: coords.lng,
              area,
              sido,
              sigungu,
              dong,
            });
          } catch {
            // geocoding 실패 시 좌표 0,0으로 설정 (서버에서 검증)
            onChange({ address, latitude: 0, longitude: 0, area, sido, sigungu, dong });
          } finally {
            setIsLoading(false);
          }
        },
      }).open();
    };
    document.head.appendChild(script);
  }, [onChange]);

  return (
    <div>
      <button
        type="button"
        onClick={openDaumPostcode}
        disabled={isLoading}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-left transition-colors hover:border-blue-400",
          value ? "border-blue-500 bg-blue-50" : "text-gray-400"
        )}
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate">
          {isLoading ? "주소 확인 중..." : value ? value.address : "주소를 검색해주세요"}
        </span>
      </button>
      {value && (
        <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="h-3.5 w-3.5" />
          <span>{value.area} · {value.dong}</span>
        </div>
      )}
    </div>
  );
}

/** Kakao Geocoder API로 주소 → 좌표 변환 */
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!(window as any).kakao?.maps?.services) {
      // Kakao Maps SDK 미로드 시 fallback
      reject(new Error("Kakao Maps SDK not loaded"));
      return;
    }
    const geocoder = new (window as any).kakao.maps.services.Geocoder();
    geocoder.addressSearch(address, (result: any[], status: string) => {
      if (status === "OK" && result.length > 0) {
        resolve({ lat: parseFloat(result[0].y), lng: parseFloat(result[0].x) });
      } else {
        reject(new Error("Geocoding failed"));
      }
    });
  });
}
```

### Item 5: TagInput 컴포넌트

| Property | Value |
|----------|-------|
| **File** | `src/components/spot/TagInput.tsx` |
| **Type** | NEW |
| **LOC** | ~55 |

```typescript
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_TAGS = 10;

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const tag = input.trim();
    if (!tag || tags.length >= MAX_TAGS || tags.includes(tag)) return;
    onChange([...tags, tag]);
    setInput("");
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div>
      {tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
            >
              {tag}
              <button type="button" onClick={() => removeTag(i)} className="text-blue-400 hover:text-blue-600">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length >= MAX_TAGS ? "태그는 최대 10개까지" : "태그 입력 (Enter로 추가)"}
          disabled={tags.length >= MAX_TAGS}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
        />
        <button
          type="button"
          onClick={addTag}
          disabled={!input.trim() || tags.length >= MAX_TAGS}
          className="shrink-0 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
        >
          추가
        </button>
      </div>
    </div>
  );
}
```

### Item 6: SpotCreateForm 컴포넌트

| Property | Value |
|----------|-------|
| **File** | `src/components/spot/SpotCreateForm.tsx` |
| **Type** | NEW |
| **LOC** | ~180 |

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createSpot } from "@/lib/api";
import { cn } from "@/lib/utils";
import CategorySelector from "./CategorySelector";
import AddressSearch from "./AddressSearch";
import TagInput from "./TagInput";
import SpotPhotoUpload from "@/components/spotline-builder/SpotPhotoUpload";
import type { SpotCategory, SpotMediaItem, CreateSpotRequest } from "@/types";

interface AddressData {
  address: string;
  latitude: number;
  longitude: number;
  area: string;
  sido: string;
  sigungu: string;
  dong: string;
}

export default function SpotCreateForm() {
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<SpotCategory | null>(null);
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [blogUrl, setBlogUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // Photo state (Spot 생성 후 업로드이므로 별도 관리)
  const [spotId, setSpotId] = useState<string | null>(null);
  const [mediaItems, setMediaItems] = useState<SpotMediaItem[]>([]);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "장소 이름을 입력해주세요";
    if (!category) newErrors.category = "카테고리를 선택해주세요";
    if (!addressData) newErrors.address = "주소를 검색해주세요";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !addressData) return;

    setIsSubmitting(true);
    try {
      const request: CreateSpotRequest = {
        title: title.trim(),
        category: category!,
        source: "USER",
        address: addressData.address,
        latitude: addressData.latitude,
        longitude: addressData.longitude,
        area: addressData.area,
        sido: addressData.sido,
        sigungu: addressData.sigungu,
        dong: addressData.dong,
        ...(description.trim() && { description: description.trim() }),
        ...(tags.length > 0 && { tags }),
        ...(blogUrl.trim() && { blogUrl: blogUrl.trim() }),
        ...(instagramUrl.trim() && { instagramUrl: instagramUrl.trim() }),
        ...(websiteUrl.trim() && { websiteUrl: websiteUrl.trim() }),
      };

      const result = await createSpot(request);
      router.push(`/spot/${result.slug}`);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Spot 등록에 실패했습니다. 다시 시도해주세요.";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 space-y-6 overflow-y-auto p-4">
      {/* 장소 이름 */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-900">
          장소 이름 <span className="text-red-500">*</span>
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="예: 성수동 카페 123"
          className={cn(
            "w-full rounded-lg border px-4 py-3 text-sm focus:outline-none",
            errors.title ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"
          )}
        />
        <div className="mt-1 flex justify-between text-xs">
          {errors.title && <span className="text-red-500">{errors.title}</span>}
          <span className="ml-auto text-gray-400">{title.length}/100</span>
        </div>
      </div>

      {/* 카테고리 */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-900">
          카테고리 <span className="text-red-500">*</span>
        </label>
        <CategorySelector value={category} onChange={setCategory} />
        {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
      </div>

      {/* 주소 검색 */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-900">
          주소 <span className="text-red-500">*</span>
        </label>
        <AddressSearch value={addressData} onChange={setAddressData} />
        {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
      </div>

      {/* 설명 */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-900">설명</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="이 장소를 소개해주세요 (선택)"
          className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
        />
        <p className="mt-1 text-right text-xs text-gray-400">{description.length}/500</p>
      </div>

      {/* 태그 */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-900">태그</label>
        <TagInput tags={tags} onChange={setTags} />
      </div>

      {/* 외부 링크 */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-900">외부 링크</label>
        <div className="space-y-2">
          {[
            { label: "블로그", value: blogUrl, setter: setBlogUrl, placeholder: "https://blog.naver.com/..." },
            { label: "인스타그램", value: instagramUrl, setter: setInstagramUrl, placeholder: "https://instagram.com/..." },
            { label: "웹사이트", value: websiteUrl, setter: setWebsiteUrl, placeholder: "https://..." },
          ].map(({ label, value: val, setter, placeholder }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-16 shrink-0 text-xs text-gray-500">{label}</span>
              <input
                value={val}
                onChange={(e) => setter(e.target.value)}
                placeholder={placeholder}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 제출 버튼 */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "w-full rounded-lg py-3 text-sm font-semibold text-white transition-colors",
          isSubmitting ? "cursor-not-allowed bg-blue-400" : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
        )}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            등록 중...
          </span>
        ) : (
          "Spot 등록하기"
        )}
      </button>
    </form>
  );
}
```

**Note on Photo Upload**: 사진 업로드는 Spot 생성 후에만 가능 (spotId 필요). 초기 버전에서는 Spot 생성 → 리다이렉트 후 Spot 상세에서 사진 추가를 유도하거나, 생성 완료 후 spotId를 받아 사진 업로드 단계를 추가하는 방식으로 확장 가능. Plan의 FR-06은 Should 우선순위이므로 향후 개선 가능.

### Item 7: /create-spot 페이지

| Property | Value |
|----------|-------|
| **File** | `src/app/create-spot/page.tsx` |
| **Type** | NEW |
| **LOC** | ~40 |

```typescript
"use client";

import { Suspense } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import AuthGuard from "@/components/common/AuthGuard";
import SpotCreateForm from "@/components/spot/SpotCreateForm";

function CreateSpotContent() {
  return (
    <AuthGuard>
      <div className="flex h-dvh flex-col bg-white">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center border-b border-gray-200 px-4">
          <Link href="/" className="mr-3 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-semibold text-gray-900">Spot 등록</h1>
        </header>

        {/* Form */}
        <SpotCreateForm />
      </div>
    </AuthGuard>
  );
}

export default function CreateSpotPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <CreateSpotContent />
    </Suspense>
  );
}
```

### Item 8: FloatingCreateButton 수정

| Property | Value |
|----------|-------|
| **File** | `src/components/common/FloatingCreateButton.tsx` |
| **Type** | MODIFY |
| **LOC** | ~50 |

```typescript
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Plus, MapPin, Route } from "lucide-react";
import { cn } from "@/lib/utils";

const MENU_ITEMS = [
  { href: "/create-spot", icon: MapPin, label: "Spot 등록" },
  { href: "/create-spotline", icon: Route, label: "SpotLine 만들기" },
];

export default function FloatingCreateButton() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={menuRef} className="fixed bottom-20 right-4 z-30 md:right-[calc(50%-256px+16px)]">
      {/* Menu */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 mb-2 w-48 rounded-xl bg-white py-2 shadow-lg ring-1 ring-gray-200">
          {MENU_ITEMS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Icon className="h-4 w-4 text-gray-500" />
              {label}
            </Link>
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg transition-all hover:scale-105 hover:bg-purple-700 active:scale-95",
          isOpen && "rotate-45"
        )}
        aria-label="새로 만들기"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
```

---

## 9. Implementation Order

| # | Item | File(s) | Type | Depends On | LOC |
|:-:|------|---------|------|:----------:|:---:|
| 1 | CreateSpotRequest/Response 타입 | `src/types/index.ts` | MODIFY | — | ~25 |
| 2 | createSpot() API 함수 | `src/lib/api.ts` | MODIFY | 1 | ~15 |
| 3 | CategorySelector 컴포넌트 | `src/components/spot/CategorySelector.tsx` | NEW | — | ~50 |
| 4 | AddressSearch 컴포넌트 | `src/components/spot/AddressSearch.tsx` | NEW | — | ~80 |
| 5 | TagInput 컴포넌트 | `src/components/spot/TagInput.tsx` | NEW | — | ~55 |
| 6 | SpotCreateForm 컴포넌트 | `src/components/spot/SpotCreateForm.tsx` | NEW | 2,3,4,5 | ~180 |
| 7 | /create-spot 페이지 | `src/app/create-spot/page.tsx` | NEW | 6 | ~40 |
| 8 | FloatingCreateButton 수정 | `src/components/common/FloatingCreateButton.tsx` | MODIFY | — | ~50 |

**총 예상 LOC**: ~495 (5 NEW, 3 MODIFY)

---

## 10. Coding Convention Reference

| Item | Convention Applied |
|------|-------------------|
| Component naming | PascalCase (`SpotCreateForm.tsx`, `CategorySelector.tsx`) |
| File organization | `src/components/spot/` (Spot 전용 하위 디렉토리) |
| State management | 로컬 useState (단순 폼이므로 Zustand 불필요) |
| Error handling | 클라이언트 유효성 검사 + alert (API 에러) |
| Import order | React → Next.js → lucide → @/lib → @/components → @/types |
| 색상 체계 | Blue-600 프라이머리 (Spot 생성 폼), Purple (FloatingCreateButton 유지) |
| 언어 | UI 텍스트: 한국어, 코드: 영어 |
| 스타일링 | Tailwind CSS 4, cn() 조건부 클래스, 모바일 퍼스트 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-13 | Initial draft | AI Assistant |
