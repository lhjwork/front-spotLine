# SpotLine Replication UX Planning Document

> **Summary**: SpotLine 복제(일정 추가) 흐름의 에러 처리 개선 및 UX 안정화. localStorage 폴백 제거, 에러 토스트 표시, 인증 가드 강화.
>
> **Project**: Spotline (front-spotLine)
> **Version**: 1.0.0
> **Author**: Claude Code
> **Date**: 2026-04-07
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | ReplicateSpotLineSheet에서 API 실패 시 localStorage에 자동 저장되어 사용자가 성공으로 오인. 서버와 동기화되지 않는 유령 데이터 생성. |
| **Solution** | localStorage 폴백 제거, API 실패 시 에러 토스트 표시, 재시도 가능한 UX 제공. |
| **Function/UX Effect** | API 실패 시 명확한 에러 메시지 표시. 사용자가 재시도하거나 나중에 다시 시도 가능. |
| **Core Value** | 데이터 정합성 확보 — 서버에 저장되지 않은 일정은 표시하지 않음. 사용자 신뢰 향상. |

---

## 1. Overview

### 1.1 Purpose

SpotLine 복제(일정 추가) 기능의 에러 처리를 개선하여 데이터 정합성을 확보하고 사용자에게 정확한 피드백을 제공한다.

### 1.2 Background

현재 ReplicateSpotLineSheet는 `replicateSpotLine()` API 호출이 실패하면 localStorage에 유령 데이터를 저장하고 "내 일정에 추가되었습니다" 토스트를 표시한다. 이로 인해:
- 사용자는 성공으로 인식하지만 서버에는 데이터 없음
- 다른 기기에서 내 일정 조회 시 해당 항목 누락
- 동기화 메커니즘이 없어 영구적 불일치

SpotLineBottomBar에는 이미 "내 버전" (fork) 버튼과 "일정 추가" (replicate) 버튼이 모두 있으며, 기본 흐름 자체는 정상 작동한다.

### 1.3 Related Documents

- Phase 7 (Experience Replication): `CLAUDE.md` 참조
- SpotLineBottomBar: `src/components/spotline/SpotLineBottomBar.tsx`
- ReplicateSpotLineSheet: `src/components/spotline/ReplicateSpotLineSheet.tsx`
- MySpotLinesList: `src/components/spotline/MySpotLinesList.tsx`

---

## 2. Scope

### 2.1 In Scope

- [x] ReplicateSpotLineSheet: localStorage 폴백 제거 + 에러 토스트 표시
- [x] ReplicateSpotLineSheet: 에러 시 시트 닫지 않고 재시도 가능하게
- [x] LOCAL_STORAGE_KEY 상수 및 관련 미사용 코드 제거

### 2.2 Out of Scope

- SpotLineBottomBar 변경 (이미 완성됨)
- Fork 흐름 변경 (이미 작동)
- MySpotLinesList 변경 (이미 작동)
- Backend API 변경
- 오프라인 지원 (향후 PWA 전환 시 고려)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | API 실패 시 localStorage 폴백 제거 — 서버 저장만 유효 | High | Pending |
| FR-02 | API 실패 시 에러 토스트 표시 ("일정 추가에 실패했습니다. 다시 시도해주세요") | High | Pending |
| FR-03 | 에러 시 시트 열린 상태 유지 + 버튼 재활성화 (재시도 가능) | High | Pending |
| FR-04 | LOCAL_STORAGE_KEY 상수 및 미사용 import 제거 | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| UX | 에러 메시지 3초 표시 후 자동 소멸 | 기존 toast 메커니즘 재사용 |
| Data Integrity | localStorage 유령 데이터 0건 | 코드 검증 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [x] localStorage 폴백 코드 완전 제거
- [x] API 실패 시 에러 토스트 표시
- [x] 에러 시 시트 열린 상태 + 재시도 가능
- [x] `pnpm type-check && pnpm build` 통과

### 4.2 Quality Criteria

- [x] Zero lint errors
- [x] Build succeeds
- [x] 미사용 코드 0건 (LOCAL_STORAGE_KEY 등)

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| API 지속 실패 시 사용자 이탈 | Medium | Low | 에러 메시지에 "다시 시도" 문구 포함, 시트 열린 상태 유지 |
| 기존 localStorage 데이터 고아화 | Low | Low | 향후 cleanup 가능, 현재는 무시 (자연 소멸) |

---

## 6. Architecture Considerations

### 6.1 Project Level

**Dynamic** — Next.js 16, React 19, Zustand, Spring Boot Backend

### 6.2 Key Decisions

| Decision | Selected | Rationale |
|----------|----------|-----------|
| Error display | Toast (기존 패턴 재사용) | ReplicateSpotLineSheet에 이미 toast 메커니즘 존재 |
| Error recovery | 시트 열린 상태 유지 | 사용자가 날짜 다시 선택 없이 재시도 가능 |
| localStorage 전략 | 완전 제거 | 서버가 Single Source of Truth |

---

## 7. File Changes (예상)

| # | File | Changes | Lines |
|---|------|---------|-------|
| 1 | `components/spotline/ReplicateSpotLineSheet.tsx` | localStorage 폴백 제거, 에러 토스트 추가, LOCAL_STORAGE_KEY 삭제 | ~15줄 변경 |

**총 수정 파일: 1개 (Frontend only)**

---

## 8. Next Steps

1. [x] Design document 작성 (`/pdca design spotline-replication-ux`)
2. [x] 구현
3. [x] Gap analysis

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-07 | Initial draft — SpotLine Replication UX | Claude Code |
