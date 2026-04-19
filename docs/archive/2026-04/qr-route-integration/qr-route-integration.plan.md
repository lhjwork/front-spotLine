# qr-route-integration Planning Document

> **Summary**: QR 스캔과 SpotLine 시스템의 심층 통합 — 스캔 히스토리, 기존 SpotLine에 추가, QR 세션 기반 자동 SpotLine 초안 생성
>
> **Project**: Spotline
> **Author**: AI
> **Date**: 2026-04-19
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | QR 스캔과 SpotLine 생성이 분리되어 있어, 유저가 여러 매장을 방문하며 자연스럽게 SpotLine을 만들 수 없음 |
| **Solution** | QR 스캔 히스토리 추적 + 기존 SpotLine에 Spot 추가 + 세션 기반 자동 SpotLine 초안 생성 |
| **Function/UX Effect** | QR 스캔 → "내 SpotLine에 추가" 원탭, 스캔 히스토리에서 SpotLine 자동 생성 제안 |
| **Core Value** | Pillar 1(QR Discovery)과 Pillar 2(Experience Recording)를 연결하여 핵심 플랫폼 루프 완성 |

---

## 1. Overview

### 1.1 Purpose

현재 QR 스캔과 SpotLine 시스템은 독립적으로 동작함. QR로 매장을 방문해도 "새 SpotLine 만들기"만 가능하고, 기존 SpotLine에 추가하거나 여러 스캔을 묶어 자동으로 SpotLine을 만드는 플로우가 없음. 이 피처는 **QR 스캔 → SpotLine 생성**의 자연스러운 연결을 구현함.

### 1.2 Background

- Spotline의 3대 핵심 축 중 Pillar 1(QR Discovery)과 Pillar 2(Experience Recording)이 분리되어 있음
- 유저가 하루 동안 여러 QR을 스캔하면서 자연스럽게 경험 코스(SpotLine)를 만들 수 있어야 함
- Cold Start 단계에서 유저의 자연스러운 콘텐츠 생성을 유도하는 핵심 전환 메커니즘

### 1.3 Related Documents

- Plan: `docs/01-plan/features/experience-social-platform.plan.md`
- Archive: `docs/archive/2026-03/qr-system-integration/`
- CLAUDE.md: Phase 5 (QR 시스템 통합)

---

## 2. Scope

### 2.1 In Scope

- [x] QR 스캔 히스토리 저장 (localStorage 기반, 당일 세션)
- [x] Spot 상세 페이지에 "기존 SpotLine에 추가" 기능
- [x] QR 스캔 히스토리 페이지 (`/qr-history`)
- [x] 히스토리에서 SpotLine 자동 생성 제안
- [x] QR 방문 시 강화된 SpotLine 추천 UI

### 2.2 Out of Scope

- 서버사이드 스캔 히스토리 영구 저장 (로그인 유저용 — 후속 피처)
- QR 코드 자동 인식 (카메라 스캔 — 앱 전환 시)
- 파트너 매장 간 자동 경로 최적화

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | QR 스캔 시 localStorage에 스캔 히스토리 저장 (spotId, slug, name, timestamp, qrId) | High | Pending |
| FR-02 | Spot 상세 페이지 하단 바에 "기존 SpotLine에 추가" 버튼 추가 (내 SpotLine 목록 표시) | High | Pending |
| FR-03 | `/qr-history` 페이지 — 당일 스캔 히스토리 타임라인 표시 | High | Pending |
| FR-04 | 히스토리에서 "이 Spot들로 SpotLine 만들기" 버튼 (SpotLineBuilder로 이동) | High | Pending |
| FR-05 | QR 스캔 2개 이상 시 하단 플로팅 배너 "N개 Spot 방문 — SpotLine 만들기" | Medium | Pending |
| FR-06 | QR 방문 Spot 상세 페이지에서 SpotLine 추천 섹션 강화 (상단 배치) | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | localStorage 읽기/쓰기 < 5ms | 브라우저 DevTools |
| UX | 원탭으로 기존 SpotLine에 추가 가능 | 사용성 테스트 |
| Data | 스캔 히스토리 24시간 자동 만료 | localStorage TTL 확인 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [x] QR 스캔 히스토리가 localStorage에 정상 저장/조회
- [x] "기존 SpotLine에 추가" 플로우 동작
- [x] `/qr-history` 페이지 렌더링 및 SpotLine 생성 연동
- [x] 플로팅 배너 조건부 표시
- [x] 기존 QR 플로우 영향 없음 (regression 없음)

### 4.2 Quality Criteria

- [x] Zero lint errors
- [x] Build succeeds
- [x] 모바일 퍼스트 반응형 UI

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| localStorage 용량 초과 | Low | Low | 24h TTL + 최대 50개 항목 제한 |
| 내 SpotLine 목록 API 부재 | Medium | Medium | 기존 `/api/v2/spotlines/me` 엔드포인트 활용 또는 추가 |
| SpotLine에 Spot 추가 API 부재 | High | Medium | `PATCH /api/v2/spotlines/{id}/spots` 엔드포인트 필요 여부 확인 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Selected |
|-------|-----------------|:--------:|
| **Dynamic** | Feature-based modules, BaaS integration | ✅ |

### 6.2 Key Architectural Decisions

| Decision | Selected | Rationale |
|----------|----------|-----------|
| 스캔 히스토리 저장 | localStorage | 서버 부하 없이 클라이언트 측 즉시 처리, 24h TTL |
| SpotLine에 Spot 추가 | SpotLineBuilder 리다이렉트 | 기존 Builder UI 재활용, 별도 API 불필요 |
| 플로팅 배너 상태 | React Context (QrSessionProvider) | 앱 전역 스캔 세션 상태 관리 |

### 6.3 구현 구조

```
front-spotLine/src/
├── lib/qr-history.ts              — localStorage CRUD 유틸리티
├── contexts/QrSessionContext.tsx   — QR 세션 상태 (스캔 카운트, 배너 표시)
├── app/qr-history/page.tsx         — 스캔 히스토리 페이지
├── components/qr/
│   ├── QrSessionBanner.tsx         — 플로팅 배너 ("N개 Spot 방문")
│   └── AddToSpotLineSheet.tsx      — 기존 SpotLine에 추가 바텀시트
└── components/spot/
    └── SpotBottomBar.tsx           — 수정: "기존 SpotLine에 추가" 버튼 추가
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions section
- [x] ESLint configuration
- [x] TypeScript configuration (`tsconfig.json`)
- [x] Tailwind CSS 4, 모바일 퍼스트

### 7.2 환경 변수

- 추가 환경 변수 불필요 (localStorage 기반)

---

## 8. Next Steps

1. [x] Write design document (`qr-route-integration.design.md`)
2. [ ] Implementation
3. [ ] Gap analysis

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-19 | Initial draft | AI |
