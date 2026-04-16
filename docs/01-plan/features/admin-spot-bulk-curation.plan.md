# admin-spot-bulk-curation Planning Document

> **Summary**: 크루 어드민의 Bulk Curation 기능을 고도화하여 대량 Spot 등록 워크플로우를 효율화
>
> **Project**: admin-spotLine (크루 어드민)
> **Author**: Claude Code
> **Date**: 2026-04-14
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 현재 BulkCurationPanel은 기본 메모(defaultNote)만 일괄 적용 가능하고, 태그·카테고리·지역 일괄 설정, 진행률 표시, 개별 에러 처리가 없어 200~300 Spot Cold Start 목표 달성에 비효율적 |
| **Solution** | BulkActionBar 컴포넌트로 일괄 태그/카테고리/지역 설정 UI 추가, BulkProgressModal로 건별 진행률·에러·재시도 지원, 순차 배치 전송(10개 단위) |
| **Function/UX Effect** | 크루가 Place API 검색 → 체크박스 선택 → 일괄 메타데이터 설정 → 한 번에 등록까지 끊김 없이 완료. 에러 발생 시 실패 건만 재시도 가능 |
| **Core Value** | Cold Start 200~300 Spot 등록 시간을 대폭 단축하여 런칭 일정 준수. 크루 작업 효율 3배 이상 향상 |

---

## 1. Overview

### 1.1 Purpose

크루 어드민의 Bulk Curation 워크플로우를 고도화하여, Place API 검색 결과에서 다수의 Spot을 선택한 뒤 태그·카테고리·지역·크루노트를 일괄 설정하고, 진행 상황을 모니터링하며, 실패 건을 개별 재시도할 수 있게 한다.

### 1.2 Background

- **Cold Start 전략**: 런칭 전 서울 주요 5개 지역에 200~300 Spot + 15~20 SpotLine 확보 필요
- **현재 한계**: BulkCurationPanel은 `defaultNote`만 일괄 적용. 태그·카테고리는 개별 수정 필요
- **백엔드 준비 완료**: `POST /api/v2/spots/bulk` (최대 50개, all-or-nothing 트랜잭션) 이미 구현
- **Phase 2**: admin-spotLine 크루 큐레이션 도구 개선은 프로젝트 로드맵의 핵심

### 1.3 Related Documents

- Plan: `front-spotLine/docs/01-plan/features/experience-social-platform.plan.md`
- Backend API: Swagger UI (`localhost:4000/swagger-ui.html`) — `POST /api/v2/spots/bulk`
- Content Strategy: `front-spotLine/docs/content-based_transition_strategic_proposal.md`

---

## 2. Scope

### 2.1 In Scope

- [ ] BulkActionBar: 선택된 Spot들에 태그·카테고리·지역 일괄 설정 UI
- [ ] BulkProgressModal: 배치 전송 진행률, 성공/실패 건별 표시, 재시도 버튼
- [ ] 순차 배치 전송: 50개 제한에 맞춰 10개 단위 청크로 분할 전송
- [ ] 선택 관리 개선: 전체 선택/해제, 선택 카운트 배지, 선택 상태 유지
- [ ] 개별 Spot 메타데이터 오버라이드: 일괄 설정 후 개별 수정 가능
- [ ] 에러 핸들링: 배치별 실패 시 해당 배치만 재시도 (all-or-nothing → 배치 단위)

### 2.2 Out of Scope

- 백엔드 API 변경 (기존 bulk API 그대로 사용)
- CSV/Excel 파일 import 기능
- 자동 카테고리 매핑 AI (향후 기능)
- SpotLine 자동 구성 (별도 피처)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | BulkActionBar에서 선택된 Spot들에 태그를 일괄 추가/제거할 수 있다 | High | Pending |
| FR-02 | BulkActionBar에서 선택된 Spot들의 카테고리를 일괄 변경할 수 있다 | High | Pending |
| FR-03 | BulkActionBar에서 선택된 Spot들의 지역(area)을 일괄 설정할 수 있다 | High | Pending |
| FR-04 | BulkActionBar에서 선택된 Spot들에 defaultNote(크루노트)를 일괄 적용할 수 있다 | High | Pending |
| FR-05 | 50개 초과 선택 시 10개 단위 배치로 자동 분할하여 순차 전송한다 | High | Pending |
| FR-06 | BulkProgressModal에서 배치별 진행률(진행/성공/실패)을 실시간 표시한다 | High | Pending |
| FR-07 | 실패한 배치에 대해 재시도 버튼을 제공한다 | Medium | Pending |
| FR-08 | 전체 선택/해제 토글과 선택 카운트 배지를 제공한다 | Medium | Pending |
| FR-09 | 일괄 설정 후 개별 Spot의 메타데이터를 오버라이드할 수 있다 | Medium | Pending |
| FR-10 | 등록 완료 후 결과 요약(성공 N개, 실패 N개)을 표시한다 | Low | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 50개 배치 전송 시 30초 이내 완료 | 네트워크 탭 확인 |
| UX | 진행률 모달에서 현재 상태가 1초 이내 갱신 | UI 관찰 |
| Reliability | 네트워크 에러 시 데이터 손실 없음 (선택 상태 보존) | 에러 시나리오 테스트 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] FR-01 ~ FR-10 구현 완료
- [ ] 50개 Spot 일괄 등록 워크플로우 정상 동작 확인
- [ ] 에러 발생 시 재시도 동작 확인
- [ ] 기존 Quick/Manual 모드에 영향 없음 확인

### 4.2 Quality Criteria

- [ ] TypeScript strict 모드 에러 0건
- [ ] ESLint 에러 0건
- [ ] 빌드 성공

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 백엔드 bulk API가 all-or-nothing이라 1건 실패 시 전체 롤백 | High | Medium | 10개 단위 소규모 배치로 분할하여 실패 범위 최소화 |
| Place API → Spot 변환 시 필수 필드 누락 | Medium | Low | placeToSpotRequest 유틸 함수로 자동 변환 + 검증 |
| 대량 등록 시 UI 프리징 | Medium | Low | 비동기 배치 처리 + 진행률 모달로 UX 분리 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites, portfolios | ☐ |
| **Dynamic** | Feature-based modules, BaaS integration | Web apps with backend, SaaS MVPs | ☑ |
| **Enterprise** | Strict layer separation, DI, microservices | High-traffic systems | ☐ |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Framework | React + Vite (SPA) | React + Vite | admin-spotLine 기존 스택 유지 |
| State Management | React Query + local state | React Query + useState | 기존 패턴 유지, 서버 상태 캐싱 |
| API Client | Axios | Axios | 기존 spotAPI.ts 확장 |
| Form Handling | react-hook-form | react-hook-form | 기존 패턴 유지 |
| Styling | Tailwind CSS 4 | Tailwind CSS 4 | 기존 스택 유지 |
| Icons | Lucide React | Lucide React | 기존 스택 유지 |

### 6.3 Target Files

| File | Action | Description |
|------|--------|-------------|
| `src/components/curation/BulkActionBar.tsx` | NEW | 일괄 태그/카테고리/지역 설정 툴바 |
| `src/components/curation/BulkProgressModal.tsx` | NEW | 배치 진행률/에러/재시도 모달 |
| `src/components/curation/BulkCurationPanel.tsx` | MODIFY | BulkActionBar 통합, 배치 전송 로직 |
| `src/components/curation/PlaceSearchPanel.tsx` | MODIFY | 전체 선택/해제, 선택 카운트 배지 |
| `src/pages/SpotCuration.tsx` | MODIFY | 배치 전송 상태 관리 |
| `src/services/v2/spotAPI.ts` | MODIFY | 순차 배치 전송 헬퍼 함수 추가 |

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] TypeScript strict 모드
- [x] Tailwind CSS 4
- [x] React Query for 서버 상태
- [x] react-hook-form for 폼
- [x] Lucide React icons
- [x] Axios API 클라이언트

### 7.2 Conventions to Follow

| Category | Convention |
|----------|-----------|
| Naming | 컴포넌트 PascalCase, Props `[Component]Props` |
| UI Text | 한국어 |
| Code | 영어 (변수명, 타입명) |
| Import | `@/*` → `./src/*` 경로 별칭 |

### 7.3 Environment Variables

신규 환경 변수 불필요. 기존 `VITE_API_BASE_URL` 사용.

---

## 8. Next Steps

1. [ ] Design document 작성 (`/pdca design admin-spot-bulk-curation`)
2. [ ] 구현 (`/pdca do admin-spot-bulk-curation`)
3. [ ] Gap analysis (`/pdca analyze admin-spot-bulk-curation`)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-14 | Initial draft | Claude Code |
