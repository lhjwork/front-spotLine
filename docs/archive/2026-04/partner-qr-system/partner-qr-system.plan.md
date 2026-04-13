# Partner QR System Planning Document

> **Summary**: 파트너 매장 QR 시스템 프론트엔드 완성 — 파트너 전용 QR 랜딩, 혜택 강조 UX, 전환 추적
>
> **Project**: Spotline (front-spotLine)
> **Version**: 1.0
> **Author**: Claude
> **Date**: 2026-04-13
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 파트너 QR 스캔 시 일반 Spot 페이지와 동일한 UX — 파트너 혜택이 눈에 띄지 않고, 전환(혜택 사용) 유도 흐름이 부재하여 파트너 가치가 충분히 전달되지 않음 |
| **Solution** | QR 스캔 진입 시 파트너 전용 혜택 강조 배너 + CTA, 파트너 Spot 필터/발견 UI, 전환 추적 이벤트 확장 |
| **Function/UX Effect** | QR 스캔 → 파트너 혜택 즉시 인지 → CTA 클릭 → 혜택 사용 완료 플로우. 피드/탐색에서 파트너 Spot 발견 가능 |
| **Core Value** | 파트너 매장의 QR 투자 대비 가시적 효과 제공 → 파트너 유지율 향상 → 수익 모델 기반 확보 |

---

## 1. Overview

### 1.1 Purpose

파트너 매장이 QR 코드를 통해 고객에게 혜택을 전달하고, 그 효과를 측정할 수 있는 프론트엔드 UX를 완성한다. 현재 기본적인 파트너 배지/혜택 표시는 구현되어 있으나, QR 스캔 → 혜택 전환까지의 흐름이 최적화되지 않았다.

### 1.2 Background

- **Backend**: Partner CRUD, QR 생성, 스캔 로깅, 분석 API 모두 완료 (9개 어드민 엔드포인트 + QR 스캔 API)
- **Admin**: 파트너 등록/관리, QR 코드 생성/관리, 분석 대시보드 완료
- **Frontend 현재 상태**:
  - `PartnerBadge` — SpotHero, SpotPreviewCard에 통합 완료
  - `PartnerBenefit` — Spot 상세 페이지에 통합 완료
  - `QrAnalytics` — QR 스캔 기록 (recordQrScan + logPageEnter) 완료
  - `QrBanner` — QR 모드 배너 표시 완료
- **남은 과제**: 파트너 QR 전용 혜택 강조 UX, 전환 추적, 파트너 Spot 발견 UI

### 1.3 Related Documents

- 전체 Plan: `docs/01-plan/features/experience-social-platform.plan.md` (Phase 8)
- CLAUDE.md: 프로젝트 아키텍처 및 컨벤션
- Backend API: Swagger UI (`localhost:4000/swagger-ui.html`)

---

## 2. Scope

### 2.1 In Scope

- [ ] **FR-01**: 파트너 QR 전용 혜택 강조 배너 (QR 스캔 진입 시 상단 고정)
- [ ] **FR-02**: 혜택 사용 CTA 버튼 + 전환 이벤트 추적
- [ ] **FR-03**: 파트너 Spot 필터/배지 (탐색·피드 연동)
- [ ] **FR-04**: 파트너 QR 랜딩 전환 퍼널 추적 확장

### 2.2 Out of Scope

- Backend API 변경 (이미 완료)
- Admin 대시보드 변경 (이미 완료)
- 파트너 요금제/결제 시스템
- 파트너 자체 대시보드 (public-facing)
- QR 코드 물리적 디자인/인쇄

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 파트너 QR 스캔 진입 시 혜택 강조 배너: QR 모드(`?qr=`)이고 `spot.partner.isPartner`일 때, 기존 `QrBanner` 대신 파트너 브랜드 컬러 + 혜택 텍스트를 강조하는 전용 배너 표시 | High | Pending |
| FR-02 | 혜택 사용 CTA: "혜택 받기" 버튼 → 혜택 상세 모달/시트 표시 → 전환 이벤트(`partner_benefit_click`) 기록 | High | Pending |
| FR-03 | 피드/탐색 카드에 파트너 필터: 도시·카테고리 페이지에서 "파트너 매장" 필터 토글 추가. 백엔드 `/api/v2/spots?partner=true` 파라미터 지원 확인 | Medium | Pending |
| FR-04 | QR 전환 퍼널 이벤트 확장: `qr_scan` → `page_view` → `benefit_view` → `benefit_click` 4단계 이벤트 체인 기록. 기존 `QrAnalytics`에 추가 이벤트 전송 | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 파트너 배너 렌더링 추가 지연 0ms (SSR 데이터에 이미 포함) | Lighthouse |
| UX | 혜택 배너 3초 내 인지 (스크롤 없이 보이는 영역) | 수동 검증 |
| Analytics | 이벤트 fire-and-forget, 실패 시 UX 차단 없음 | 코드 리뷰 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 파트너 QR 스캔 시 전용 혜택 배너가 상단에 표시됨
- [ ] 혜택 CTA 클릭 시 전환 이벤트가 기록됨
- [ ] SpotPreviewCard에서 파트너 배지가 정상 표시됨 (이미 완료 확인)
- [ ] 탐색 페이지에서 파트너 필터 작동
- [ ] Gap analysis 90% 이상

### 4.2 Quality Criteria

- [ ] `pnpm build` 성공
- [ ] `pnpm lint` 에러 없음
- [ ] `pnpm type-check` 에러 없음

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 파트너 0개 상태에서 UI 미검증 | Low | High | 빈 상태 처리 + 데모 데이터로 테스트 |
| 백엔드 `partner=true` 필터 미지원 | Medium | Low | Swagger 확인 후 필요 시 백엔드 요청 |
| 혜택 모달 UX 과설계 | Low | Medium | 최소 버전: 인라인 확장 → 모달은 후속 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites | ☐ |
| **Dynamic** | Feature-based modules, BaaS integration | Web apps with backend | ☑ |
| **Enterprise** | Strict layer separation, microservices | High-traffic systems | ☐ |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Framework | Next.js 16 | Next.js 16 | 기존 프로젝트 |
| State Management | Zustand | Zustand | 기존 패턴 유지 |
| Styling | Tailwind CSS 4 | Tailwind CSS 4 | 기존 패턴 유지 |
| Analytics | fire-and-forget API 호출 | fire-and-forget | 기존 패턴 유지, UX 차단 없음 |

### 6.3 컴포넌트 구조

```
src/components/
├── qr/
│   ├── QrBanner.tsx              (기존 — 일반 QR 배너)
│   ├── QrAnalytics.tsx           (기존 — 스캔 기록, 수정: 추가 이벤트)
│   └── PartnerQrBanner.tsx       (신규 — 파트너 QR 전용 혜택 배너 + CTA)
├── spot/
│   ├── PartnerBadge.tsx          (기존 — 유지)
│   └── PartnerBenefit.tsx        (기존 — 유지)
```

**변경 대상 파일:**
- `src/app/spot/[slug]/page.tsx` — 파트너 QR 모드 분기 로직
- `src/components/qr/QrAnalytics.tsx` — 전환 이벤트 확장
- `src/lib/api.ts` — 전환 이벤트 API 함수 추가 (있다면 확인)

**신규 파일:**
- `src/components/qr/PartnerQrBanner.tsx` — 파트너 QR 전용 혜택 강조 배너

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions section
- [x] ESLint configuration
- [x] TypeScript configuration (`tsconfig.json`)
- [x] Tailwind CSS 4

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **Naming** | exists | — | — |
| **Folder structure** | exists | `qr/` 하위 파트너 컴포넌트 추가 | Low |
| **Analytics events** | exists (fire-and-forget) | 전환 이벤트 네이밍 규칙 확인 | Medium |

### 7.3 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| `NEXT_PUBLIC_API_BASE_URL` | API endpoint | Client | 이미 존재 |

*추가 환경 변수 불필요*

---

## 8. Implementation Items Summary

| # | Item | Type | Estimated LOC |
|---|------|------|:------------:|
| 1 | `PartnerQrBanner.tsx` — 파트너 QR 혜택 강조 배너 + CTA | NEW | ~60 |
| 2 | `spot/[slug]/page.tsx` — 파트너 QR 모드 분기 | MODIFY | ~10 |
| 3 | `QrAnalytics.tsx` — 전환 퍼널 이벤트 확장 | MODIFY | ~15 |
| 4 | `api.ts` — 전환 이벤트 함수 추가 | MODIFY | ~10 |
| | **Total** | 1 NEW, 3 MODIFY | **~95** |

---

## 9. Next Steps

1. [ ] Write design document (`partner-qr-system.design.md`)
2. [ ] Start implementation
3. [ ] Gap analysis

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-13 | Initial draft | Claude |
