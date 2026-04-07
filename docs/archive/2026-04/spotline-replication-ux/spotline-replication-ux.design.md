# SpotLine Replication UX Design Document

> **Summary**: ReplicateSpotLineSheet의 localStorage 폴백 제거, API 에러 시 에러 토스트 표시 + 시트 열린 상태 유지. 단일 파일 수정.
>
> **Project**: Spotline (front-spotLine)
> **Version**: 1.0.0
> **Author**: Claude Code
> **Date**: 2026-04-07
> **Status**: Draft
> **Planning Doc**: [spotline-replication-ux.plan.md](../../01-plan/features/spotline-replication-ux.plan.md)

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | API 실패 시 localStorage 폴백으로 유령 데이터 생성. 사용자가 성공으로 오인. |
| **Solution** | localStorage 폴백 제거, 에러 토스트 표시, 시트 열린 상태 유지로 재시도 가능. |
| **Function/UX Effect** | 실패 시 "일정 추가에 실패했습니다. 다시 시도해주세요" 에러 토스트 표시. 시트 닫히지 않아 즉시 재시도 가능. |
| **Core Value** | 서버가 Single Source of Truth. 데이터 정합성 100% 확보. |

---

## 1. Overview

### 1.1 Design Goals

- localStorage 폴백 완전 제거 → 서버 저장만 유효
- API 에러 시 사용자에게 명확한 피드백 (에러 토스트)
- 에러 시 시트 열린 상태 유지 (날짜 재선택 없이 재시도)
- 미사용 코드 정리 (LOCAL_STORAGE_KEY, MySpotLine import)

### 1.2 Design Principles

- **최소 변경**: 1 파일, catch 블록만 수정
- **기존 패턴 재사용**: toast 메커니즘 이미 존재, error용으로 확장

---

## 2. File Changes

### 2.1 Frontend — Modified Files (1)

| # | File | Changes |
|---|------|---------|
| 1 | `components/spotline/ReplicateSpotLineSheet.tsx` | catch 블록 교체, 미사용 코드 제거 |

---

## 3. Detailed Specifications

### 3.1 ReplicateSpotLineSheet.tsx (MODIFY)

**변경 1: 미사용 import/상수 제거**

Remove:
```typescript
import type { MySpotLine } from "@/types";  // REMOVE — no longer needed
```

Remove:
```typescript
const LOCAL_STORAGE_KEY = "spotline_my_spotlines";  // REMOVE — unused
```

**변경 2: catch 블록 교체**

현재 (Before):
```typescript
} catch {
  // localStorage fallback
  const localSpotLine: MySpotLine = {
    id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    spotLineId: spotLine.id,
    spotLineSlug: spotLine.slug,
    title: spotLine.title,
    area: spotLine.area,
    spotsCount: spotLine.spotsCount,
    scheduledDate: date,
    status: "scheduled",
    completedAt: null,
    parentSpotLineId: spotLine.id,
    createdAt: new Date().toISOString(),
  };
  addSpotLine(localSpotLine);
  console.warn("복제 API 실패 — localStorage에 저장");
  setToast("내 일정에 추가되었습니다");
  onClose();
}
```

변경 후 (After):
```typescript
} catch {
  setToast("일정 추가에 실패했습니다. 다시 시도해주세요");
}
```

**핵심 차이점:**
1. localStorage 폴백 코드 완전 제거 (12줄 → 1줄)
2. `addSpotLine()` 호출 제거 — 서버 저장 실패 시 로컬 상태도 추가하지 않음
3. `onClose()` 호출 제거 — 시트 열린 상태 유지 (재시도 가능)
4. 에러 메시지 토스트 표시 (기존 toast 메커니즘 재사용)

**변경 3: toast 스타일 — 에러 토스트 구분**

현재 toast는 성공/에러 구분 없이 동일 스타일. 에러 시 빨간색 배경으로 구분.

toast 상태 타입 변경:
```typescript
const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
```

성공 시:
```typescript
setToast({ message: "내 일정에 추가되었습니다", type: "success" });
```

에러 시:
```typescript
setToast({ message: "일정 추가에 실패했습니다. 다시 시도해주세요", type: "error" });
```

Toast 렌더링 변경:
```tsx
{toast && (
  <div className={cn(
    "fixed left-1/2 top-8 z-[60] -translate-x-1/2 rounded-xl px-5 py-3 text-sm font-medium text-white shadow-lg",
    toast.type === "error" ? "bg-red-600" : "bg-gray-900"
  )}>
    {toast.message}
  </div>
)}
```

Toast auto-dismiss 업데이트:
```typescript
useEffect(() => {
  if (toast) {
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }
}, [toast]);
```

---

## 4. Complete handleSubmit (After)

```typescript
const handleSubmit = async (date: string | null) => {
  if (isSubmitting) return;
  setIsSubmitting(true);

  try {
    const response = await replicateSpotLine(spotLine.id, date);
    addSpotLine(response.mySpotLine);
    setToast({ message: "내 일정에 추가되었습니다", type: "success" });
    onClose();
  } catch {
    setToast({ message: "일정 추가에 실패했습니다. 다시 시도해주세요", type: "error" });
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## 5. Implementation Order

| Step | Task | Details |
|------|------|---------|
| 1 | 미사용 import/상수 제거 | `MySpotLine` import, `LOCAL_STORAGE_KEY` 상수 |
| 2 | toast 상태 타입 변경 | `string \| null` → `{ message, type } \| null` |
| 3 | catch 블록 교체 | localStorage 폴백 → 에러 토스트 |
| 4 | 성공 토스트 업데이트 | `setToast("...")` → `setToast({ message, type: "success" })` |
| 5 | Toast 렌더링 업데이트 | 에러 시 `bg-red-600`, 성공 시 `bg-gray-900` |
| 6 | Toast auto-dismiss 업데이트 | `toast` 객체 참조로 변경 |
| 7 | 빌드 검증 | `pnpm type-check && pnpm build` |

**총 파일: Frontend MODIFY 1개, Backend 변경 없음**

---

## 6. Verification Checklist

- [ ] `LOCAL_STORAGE_KEY` 상수 제거됨
- [ ] `import type { MySpotLine }` 제거됨
- [ ] catch 블록에서 localStorage 코드 없음
- [ ] catch 블록에서 `addSpotLine()` 호출 없음
- [ ] catch 블록에서 `onClose()` 호출 없음 (시트 열린 상태 유지)
- [ ] 에러 시 토스트 메시지: "일정 추가에 실패했습니다. 다시 시도해주세요"
- [ ] 에러 토스트 배경색: `bg-red-600`
- [ ] 성공 토스트 배경색: `bg-gray-900` (기존 유지)
- [ ] toast 상태 타입: `{ message: string; type: "success" | "error" } | null`
- [ ] `pnpm type-check` + `pnpm build` 통과

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-07 | Initial design — SpotLine Replication UX | Claude Code |
