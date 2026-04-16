# Onboarding Flow Planning Document

> **Summary**: 신규 사용자가 Spotline 서비스를 처음 접했을 때, 핵심 가치를 빠르게 이해하고 첫 액션(SpotLine 탐색/QR 스캔)으로 유도하는 온보딩 플로우
>
> **Project**: Spotline (front-spotLine)
> **Version**: 0.1.0
> **Author**: AI
> **Date**: 2026-04-16
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 신규 사용자가 랜딩 페이지 진입 후 서비스 이해 없이 이탈하며, 첫 액션까지의 전환율이 낮음 |
| **Solution** | 3단계 인터랙티브 온보딩 (서비스 소개 → 핵심 기능 체험 → 첫 액션 유도)으로 이해도와 전환율 향상 |
| **Function/UX Effect** | 스와이프 기반 온보딩 카드 UI, 스킵 가능, 로그인 전/후 모두 대응, 재방문 시 미표시 |
| **Core Value** | 서비스 첫 인상을 통한 리텐션 확보 — "다음 장소 추천" 핵심 가치를 30초 내 전달 |

---

## 1. Overview

### 1.1 Purpose

첫 방문 사용자에게 Spotline의 핵심 가치("지금 있는 장소에서 다음 장소 추천")를 직관적으로 전달하고, 피드 탐색 또는 데모 QR 체험으로 유도하여 첫 세션 이탈율을 낮춘다.

### 1.2 Background

- 현재 랜딩 페이지(`/`)와 소개 페이지(`/about`)가 있지만, 신규 사용자를 위한 인터랙티브 가이드가 없음
- MVP 기능(피드, SpotLine 상세, QR 스캔, 지도 탐색)은 완성되었으나 첫 진입 시 어디서부터 시작해야 할지 불명확
- Cold Start 전략상 콘텐츠+SEO 유입이 핵심이므로, SEO로 유입된 사용자의 서비스 이해도를 높여야 함
- 앱 설치 없는 웹 서비스이므로, 첫 방문에서 가치를 전달하지 못하면 재방문 확률이 매우 낮음

### 1.3 Related Documents

- Plan: `docs/01-plan/features/experience-social-platform.plan.md`
- About Page: `src/app/about/page.tsx`
- 콘텐츠 전환 전략: `docs/content-based_transition_strategic_proposal.md`

---

## 2. Scope

### 2.1 In Scope

- [ ] 온보딩 오버레이/모달 컴포넌트 (3~4단계 스와이프 카드)
- [ ] 첫 방문 감지 로직 (localStorage 기반)
- [ ] 단계별 콘텐츠: 서비스 소개 → QR 플로우 설명 → SpotLine 개념 → CTA
- [ ] 스킵 버튼 및 진행 인디케이터
- [ ] 완료 후 피드 페이지 또는 데모 QR 체험으로 유도
- [ ] 모바일 퍼스트 반응형 디자인

### 2.2 Out of Scope

- 로그인/회원가입 플로우 (Supabase OAuth 별도)
- 푸시 알림 권한 요청
- A/B 테스트 인프라
- 어드민 패널에서 온보딩 콘텐츠 관리

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 첫 방문 사용자 진입 시 온보딩 오버레이 자동 표시 | High | Pending |
| FR-02 | 3~4단계 스와이프/탭 기반 카드 UI | High | Pending |
| FR-03 | 각 단계: 일러스트/아이콘 + 제목 + 설명 텍스트 | High | Pending |
| FR-04 | "건너뛰기" 버튼으로 언제든 스킵 가능 | High | Pending |
| FR-05 | 마지막 단계에서 CTA 버튼 (피드 탐색 / 데모 QR 체험) | High | Pending |
| FR-06 | 온보딩 완료/스킵 시 localStorage에 기록하여 재표시 방지 | High | Pending |
| FR-07 | 단계 진행 인디케이터 (도트 네비게이션) | Medium | Pending |
| FR-08 | 터치 스와이프 제스처 지원 (모바일) | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 온보딩 컴포넌트 로드 < 100ms (lazy load) | Lighthouse |
| Accessibility | 키보드 네비게이션, 스크린 리더 지원 | 수동 테스트 |
| UX | 전체 온보딩 완료 30초 이내 | 사용자 테스트 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 온보딩 컴포넌트 구현 및 랜딩 페이지 통합
- [ ] 첫 방문 감지 + 재방문 미표시 동작 확인
- [ ] 모바일/데스크톱 반응형 확인
- [ ] 스와이프 제스처 동작 확인

### 4.2 Quality Criteria

- [ ] Zero lint errors
- [ ] Build succeeds
- [ ] 모바일 Safari/Chrome에서 스와이프 정상 동작

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 온보딩이 강제적으로 느껴져 이탈 유발 | High | Medium | 스킵 버튼 상시 노출, 3단계로 짧게 유지 |
| 스와이프 제스처 브라우저 호환성 | Medium | Low | touch 이벤트 + pointer 이벤트 병행, 버튼 네비게이션 대체 제공 |
| SEO 크롤러에 온보딩 노출 | Low | Low | 클라이언트 사이드 렌더링으로 SEO 영향 없음 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites, portfolios | ☐ |
| **Dynamic** | Feature-based modules, BaaS integration | Web apps with backend | ☑ |
| **Enterprise** | Strict layer separation, DI | High-traffic systems | ☐ |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Framework | Next.js 16 | Next.js 16 | 기존 프로젝트 |
| State Management | Zustand / localStorage | localStorage | 온보딩 완료 여부만 저장, 전역 상태 불필요 |
| Styling | Tailwind CSS 4 | Tailwind CSS 4 | 기존 컨벤션 |
| Swipe Library | 외부 라이브러리 / 자체 구현 | 자체 구현 | 의존성 최소화, 3~4장 카드에 라이브러리 과잉 |
| Component Placement | 모달 오버레이 / 전체 페이지 | 모달 오버레이 | 기존 랜딩 위에 표시, URL 변경 없이 |

### 6.3 Clean Architecture Approach

```
Selected Level: Dynamic

New Files:
src/
├── components/
│   └── onboarding/
│       ├── OnboardingOverlay.tsx    — 메인 오버레이 컨테이너
│       ├── OnboardingCard.tsx       — 개별 단계 카드
│       └── OnboardingDots.tsx       — 진행 인디케이터
├── lib/
│   └── onboarding.ts               — 첫 방문 감지 + 완료 기록 유틸
└── app/
    └── page.tsx                     — (수정) 온보딩 오버레이 통합
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions section
- [x] ESLint configuration
- [x] TypeScript configuration (`tsconfig.json`)
- [x] Tailwind CSS 4 설정

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **Naming** | exists | `Onboarding` 접두사 컴포넌트 | High |
| **Folder structure** | exists | `components/onboarding/` 디렉토리 | High |
| **Import order** | exists | 기존 규칙 유지 | Medium |

### 7.3 Environment Variables Needed

추가 환경 변수 불필요.

---

## 8. Onboarding Content Design

### Step 1: 서비스 소개
- **제목**: "다음 장소, Spotline이 추천해요"
- **설명**: "지금 있는 장소에서 다음에 가기 좋은 곳을 추천받으세요"
- **아이콘**: QrCode + MapPin

### Step 2: QR 플로우
- **제목**: "QR 스캔 한 번이면 끝"
- **설명**: "매장의 QR 코드를 스캔하면 근처 추천 장소를 바로 확인할 수 있어요"
- **아이콘**: Smartphone → QrCode → MapPin 플로우

### Step 3: SpotLine 소개
- **제목**: "나만의 동선을 만들어보세요"
- **설명**: "좋았던 장소들을 연결해 SpotLine을 만들고, 다른 사람의 경험도 따라가보세요"
- **아이콘**: Route/List 아이콘

### Step 4: CTA
- **제목**: "지금 시작하세요"
- **CTA 1**: "피드 둘러보기" → `/` (피드 섹션으로 스크롤)
- **CTA 2**: "데모 체험하기" → `/qr/demo_cafe_001`

---

## 9. Next Steps

1. [ ] Write design document (`onboarding-flow.design.md`)
2. [ ] Review and approval
3. [ ] Start implementation

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-16 | Initial draft | AI |
