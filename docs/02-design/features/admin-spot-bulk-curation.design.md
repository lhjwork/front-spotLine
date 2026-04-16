# admin-spot-bulk-curation Design Document

> **Summary**: 크루 어드민 BulkCurationPanel에 일괄 메타데이터 설정 + 배치 진행률 + 재시도 기능 추가
>
> **Project**: admin-spotLine
> **Author**: Claude Code
> **Date**: 2026-04-14
> **Status**: Draft
> **Planning Doc**: [admin-spot-bulk-curation.plan.md](../01-plan/features/admin-spot-bulk-curation.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- 기존 BulkCurationPanel의 UX 흐름을 유지하면서 일괄 메타데이터 설정 기능 추가
- 백엔드 API 변경 없이 프론트엔드만으로 배치 분할·진행률·재시도 구현
- 기존 Quick/Manual 모드에 영향 없음

### 1.2 Design Principles

- **최소 변경**: 기존 컴포넌트 구조 유지, 새 컴포넌트 2개만 추가
- **기존 패턴 준수**: Tailwind CSS 직접 사용, Lucide React 아이콘, useMutation 패턴
- **점진적 적용**: 일괄 설정 → 개별 오버라이드 가능

---

## 2. Architecture

### 2.1 Component Diagram

```
SpotCuration.tsx (페이지)
├── PlaceSearchPanel.tsx (좌측 - 검색)
│   ├── 검색 입력 + 프로바이더 토글
│   ├── 검색 결과 카드 (체크박스)
│   └── [NEW] 전체 선택/해제 + 선택 카운트 배지
│
└── BulkCurationPanel.tsx (우측 - 등록)
    ├── [NEW] BulkActionBar.tsx (일괄 설정 툴바)
    │   ├── 태그 일괄 입력
    │   ├── 카테고리 일괄 선택
    │   ├── 지역 일괄 선택
    │   └── 크루노트 일괄 입력
    ├── 선택된 Place 목록 (기존)
    ├── 개별 크루노트 오버라이드 (기존)
    ├── 등록 버튼
    └── [NEW] BulkProgressModal.tsx (진행률 모달)
        ├── 전체 진행 바
        ├── 배치별 상태 (대기/진행/성공/실패)
        ├── 실패 배치 재시도 버튼
        └── 완료 요약
```

### 2.2 Data Flow

```
PlaceSearchPanel (체크박스 선택)
  ↓ checkedPlaces: PlaceInfo[]
BulkCurationPanel
  ↓ BulkActionBar에서 일괄 메타데이터 설정
  ↓ bulkMeta: { tags, category, area, crewNote }
  ↓ 개별 오버라이드: overrides[placeId]: Partial<BulkMeta>
  ↓ 등록 버튼 클릭
  ↓ placeToSpotRequest() + bulkMeta + overrides 병합
  ↓ CreateSpotRequest[] 생성
  ↓ 10개 단위 청크 분할
  ↓ BulkProgressModal 표시
  ↓ 순차 배치 전송: spotAPI.bulkCreate(chunk)
  ↓ 배치별 성공/실패 추적
  ↓ 완료 요약 표시
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| BulkActionBar | BulkCurationPanel (props) | 일괄 메타데이터 입력 UI |
| BulkProgressModal | BulkCurationPanel (props) | 진행률 표시 + 재시도 |
| BulkCurationPanel | spotAPI.bulkCreate | 배치 전송 |
| BulkCurationPanel | placeToSpotRequest | PlaceInfo → CreateSpotRequest 변환 |

---

## 3. Data Model

### 3.1 New Types

```typescript
// 일괄 메타데이터 설정값
interface BulkMeta {
  tags: string[];
  category: SpotCategory | null;  // null = auto-detect 유지
  area: string | null;            // null = auto-extract 유지
  crewNote: string;
}

// 배치 처리 상태
interface BatchStatus {
  batchIndex: number;
  items: CreateSpotRequest[];
  status: "pending" | "processing" | "success" | "failed";
  error?: string;
  successCount?: number;
}

// BulkActionBar Props
interface BulkActionBarProps {
  bulkMeta: BulkMeta;
  onChange: (meta: BulkMeta) => void;
  selectedCount: number;
}

// BulkProgressModal Props
interface BulkProgressModalProps {
  isOpen: boolean;
  batches: BatchStatus[];
  onRetry: (batchIndex: number) => void;
  onClose: () => void;
}
```

### 3.2 Existing Types (참조)

```typescript
// 기존 - 변경 없음
interface CreateSpotRequest {
  title: string;
  category: SpotCategory;
  source: SpotSource;
  crewNote?: string;
  address: string;
  latitude: number;
  longitude: number;
  area: string;
  tags?: string[];
  naverPlaceId?: string;
  kakaoPlaceId?: string;
  // ... 기타 필드
}

// 기존 placeToSpotRequest(place, crewNote?, tags?) → CreateSpotRequest
```

---

## 4. API Specification

### 4.1 Existing Backend API (변경 없음)

| Method | Path | Description | Limit |
|--------|------|-------------|-------|
| POST | /api/v2/spots/bulk | 다수 Spot 일괄 생성 | max 50, all-or-nothing |

### 4.2 Frontend Batch Strategy

백엔드 API는 변경하지 않음. 프론트엔드에서 배치 분할:

```typescript
// spotAPI.ts에 추가할 헬퍼
async function bulkCreateBatched(
  requests: CreateSpotRequest[],
  batchSize: number = 10,
  onBatchProgress: (batchIndex: number, status: BatchStatus) => void,
): Promise<{ success: number; failed: number; failedBatches: number[] }> {
  const chunks = chunkArray(requests, batchSize);
  let success = 0;
  let failed = 0;
  const failedBatches: number[] = [];

  for (let i = 0; i < chunks.length; i++) {
    onBatchProgress(i, { batchIndex: i, items: chunks[i], status: "processing" });
    try {
      const result = await spotAPI.bulkCreate(chunks[i]);
      success += result.length;
      onBatchProgress(i, { batchIndex: i, items: chunks[i], status: "success", successCount: result.length });
    } catch (error) {
      failed += chunks[i].length;
      failedBatches.push(i);
      onBatchProgress(i, { batchIndex: i, items: chunks[i], status: "failed", error: String(error) });
    }
  }

  return { success, failed, failedBatches };
}
```

---

## 5. UI/UX Design

### 5.1 BulkActionBar Layout

```
┌─────────────────────────────────────────────────────┐
│ 일괄 설정 (3개 선택됨)                               │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 태그    [   태그 입력 (쉼표 구분)              ] │
│                                                     │
│ 카테고리 [ 자동 감지 ▼ ]   지역 [ 자동 추출 ▼ ]    │
│                                                     │
│ 크루노트 [   일괄 적용할 크루노트               ] │
│                                                     │
│ [ 일괄 적용 ]                                       │
└─────────────────────────────────────────────────────┘
```

- 카테고리 드롭다운: "자동 감지" (기본값) + SpotCategory 10개 옵션
- 지역 드롭다운: "자동 추출" (기본값) + AREAS 20개 옵션
- 태그: 쉼표 구분 텍스트 입력
- "일괄 적용" 버튼 → bulkMeta를 현재 선택에 적용

### 5.2 BulkProgressModal Layout

```
┌─────────────────────────────────────────────────────┐
│ 일괄 등록 진행 중                             [X] │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 전체 진행률: ████████░░░░░░░░ 5/15 (33%)            │
│                                                     │
│ 배치 1 (10개)  ✅ 성공                              │
│ 배치 2 (10개)  🔄 처리 중...                        │
│ 배치 3 (5개)   ⏳ 대기                              │
│                                                     │
│ ─── 실패 시 ───                                     │
│ 배치 2 (10개)  ❌ 실패: 서버 오류  [ 재시도 ]       │
│                                                     │
├─────────────────────────────────────────────────────┤
│ 완료: 성공 20개, 실패 10개             [ 닫기 ]     │
└─────────────────────────────────────────────────────┘
```

### 5.3 PlaceSearchPanel - 전체 선택 영역

```
┌─────────────────────────────────────────────────────┐
│ 검색 결과 (12건)   [☑ 전체 선택]  선택: 5개         │
├─────────────────────────────────────────────────────┤
│ ☑ 카페 OOO  성수동  ★4.5                           │
│ ☐ 레스토랑 XXX  을지로  ★4.2                       │
│ ...                                                 │
└─────────────────────────────────────────────────────┘
```

### 5.4 User Flow

```
1. 검색 + 체크박스 선택 (PlaceSearchPanel)
2. 우측 패널에 선택 목록 표시 (BulkCurationPanel)
3. BulkActionBar에서 태그/카테고리/지역/크루노트 일괄 설정
4. "일괄 적용" 클릭 → 선택된 모든 Place에 메타데이터 반영
5. (선택) 개별 Place에서 메타데이터 오버라이드
6. "일괄 등록" 클릭 → BulkProgressModal 표시
7. 배치별 진행률 실시간 갱신
8. 실패 시 재시도 / 완료 시 닫기
```

### 5.5 Component List

| Component | Location | Responsibility |
|-----------|----------|----------------|
| BulkActionBar | `src/components/curation/BulkActionBar.tsx` | 일괄 태그/카테고리/지역/크루노트 설정 UI |
| BulkProgressModal | `src/components/curation/BulkProgressModal.tsx` | 배치 진행률, 에러 표시, 재시도 |
| BulkCurationPanel | `src/components/curation/BulkCurationPanel.tsx` | 기존 + BulkActionBar/ProgressModal 통합 |
| PlaceSearchPanel | `src/components/curation/PlaceSearchPanel.tsx` | 전체 선택/해제 추가 |
| SpotCuration | `src/pages/SpotCuration.tsx` | bulkMeta 상태 관리 |

---

## 6. Error Handling

### 6.1 에러 시나리오

| Scenario | Handling |
|----------|----------|
| 배치 전송 실패 (네트워크 에러) | 해당 배치만 "failed" 표시, 재시도 버튼 노출 |
| 배치 전송 실패 (400 validation) | 에러 메시지 표시, 재시도 전 데이터 확인 유도 |
| 전체 선택 0건에서 등록 시도 | 버튼 disabled, 안내 메시지 |
| 배치 진행 중 모달 닫기 | 진행 중에는 닫기 불가 (backdrop 클릭 무시) |

---

## 7. Security Considerations

- [x] 기존 Supabase JWT 인증 유지 (Axios interceptor)
- [x] crewNote XSS: 백엔드에서 sanitize (기존 로직)
- [x] 배치 크기 제한: 프론트에서 10개, 백엔드에서 50개 이중 제한

---

## 8. Test Plan

### 8.1 Test Cases (수동 검증)

- [ ] Happy path: 30개 Place 선택 → 일괄 태그/카테고리 설정 → 등록 → 3배치 성공
- [ ] 에러: 네트워크 끊김 시 실패 배치 재시도 → 성공
- [ ] 오버라이드: 일괄 설정 후 개별 Place 카테고리 변경 → 변경된 값 전송 확인
- [ ] 전체 선택: 12건 검색 → 전체 선택 → 전체 해제 → 정상 토글
- [ ] 경계: 정확히 10개 → 1배치, 11개 → 2배치 확인

---

## 9. Implementation Guide

### 9.1 File Structure

```
admin-spotLine/src/
├── components/curation/
│   ├── BulkActionBar.tsx       ← NEW
│   ├── BulkProgressModal.tsx   ← NEW
│   ├── BulkCurationPanel.tsx   ← MODIFY
│   └── PlaceSearchPanel.tsx    ← MODIFY
├── pages/
│   └── SpotCuration.tsx        ← MODIFY
├── services/v2/
│   └── spotAPI.ts              ← MODIFY
└── types/
    └── v2.ts                   ← MODIFY (타입 추가)
```

### 9.2 Implementation Order

1. [ ] **v2.ts**: BulkMeta, BatchStatus, BulkActionBarProps, BulkProgressModalProps 타입 추가
2. [ ] **spotAPI.ts**: `bulkCreateBatched()` 배치 분할 헬퍼 함수 추가
3. [ ] **BulkActionBar.tsx**: 일괄 메타데이터 설정 UI 컴포넌트 (NEW)
4. [ ] **BulkProgressModal.tsx**: 배치 진행률 + 재시도 모달 (NEW)
5. [ ] **BulkCurationPanel.tsx**: BulkActionBar 통합, bulkMeta 적용 로직, 배치 전송 연결
6. [ ] **PlaceSearchPanel.tsx**: 전체 선택/해제 체크박스 추가
7. [ ] **SpotCuration.tsx**: bulkMeta 상태 추가 (필요 시)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-14 | Initial draft | Claude Code |
