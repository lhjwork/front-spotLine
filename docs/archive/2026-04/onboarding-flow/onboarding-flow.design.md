# Onboarding Flow Design Document

> **Summary**: 첫 방문 사용자에게 Spotline 핵심 가치를 전달하는 4단계 스와이프 온보딩 오버레이
>
> **Project**: Spotline (front-spotLine)
> **Version**: 0.1.0
> **Author**: AI
> **Date**: 2026-04-16
> **Status**: Draft
> **Planning Doc**: [onboarding-flow.plan.md](../01-plan/features/onboarding-flow.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- 첫 방문 사용자에게 30초 내 Spotline 핵심 가치 전달
- 기존 랜딩 페이지 위에 오버레이로 동작 (URL/라우팅 변경 없음)
- 외부 라이브러리 없이 자체 스와이프 구현 (의존성 최소화)
- 모바일 퍼스트, 데스크톱에서도 자연스럽게 동작

### 1.2 Design Principles

- 최소 침습: 스킵 버튼 상시 노출, 3~4초 내 건너뛰기 가능
- 자체 완결: 온보딩 상태 관리를 localStorage만으로 처리 (서버 의존 없음)
- 일관성: 기존 프로젝트 패턴 (Tailwind, cn(), lucide-react) 준수

---

## 2. Architecture

### 2.1 Component Diagram

```
┌─────────────────────────────────────────────┐
│  page.tsx (/)                               │
│  ┌───────────────────────────────────────┐  │
│  │  Layout                               │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │  DiscoverPage                   │  │  │
│  │  └─────────────────────────────────┘  │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  OnboardingOverlay (conditional)      │  │
│  │  ┌─────────┐ ┌─────────┐ ┌────────┐  │  │
│  │  │ Card 1  │ │ Card 2  │ │ Card N │  │  │
│  │  └─────────┘ └─────────┘ └────────┘  │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │  OnboardingDots                 │  │  │
│  │  └─────────────────────────────────┘  │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
[page.tsx mount]
    │
    ▼
[lib/onboarding.ts] isFirstVisit() ──── localStorage check
    │
    ├── false → render nothing
    │
    └── true → render OnboardingOverlay
                  │
                  ├── user swipe/tap → next card (state: currentStep)
                  ├── user clicks "건너뛰기" → completeOnboarding()
                  └── user clicks CTA → completeOnboarding() + navigate
                        │
                        ▼
                  [lib/onboarding.ts] completeOnboarding()
                        │
                        ▼
                  localStorage.setItem("spotline_onboarding_completed", "true")
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| OnboardingOverlay | lib/onboarding.ts | 첫 방문 감지, 완료 기록 |
| OnboardingOverlay | OnboardingCard | 단계별 콘텐츠 렌더링 |
| OnboardingOverlay | OnboardingDots | 진행 인디케이터 |
| page.tsx | OnboardingOverlay | 조건부 렌더링 |

---

## 3. Data Model

### 3.1 Onboarding Step Definition

```typescript
// src/components/onboarding/OnboardingOverlay.tsx 내부 상수

interface OnboardingStep {
  id: number;
  title: string;         // 한국어 제목
  description: string;   // 한국어 설명
  icon: ReactNode;       // lucide-react 아이콘 조합
  bgColor: string;       // Tailwind 배경색 클래스
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 0,
    title: "다음 장소, Spotline이 추천해요",
    description: "지금 있는 장소에서 다음에 가기 좋은 곳을 추천받으세요",
    icon: <QrCode />,      // + MapPin 조합
    bgColor: "bg-blue-50",
  },
  {
    id: 1,
    title: "QR 스캔 한 번이면 끝",
    description: "매장의 QR 코드를 스캔하면 근처 추천 장소를 바로 확인할 수 있어요",
    icon: <Smartphone />,  // → QrCode 플로우
    bgColor: "bg-green-50",
  },
  {
    id: 2,
    title: "나만의 동선을 만들어보세요",
    description: "좋았던 장소들을 연결해 SpotLine을 만들고, 다른 사람의 경험도 따라가보세요",
    icon: <MapPin />,      // + Route 조합
    bgColor: "bg-purple-50",
  },
  {
    id: 3,
    title: "지금 시작하세요",
    description: "피드에서 인기 SpotLine을 둘러보거나, 데모를 체험해보세요",
    icon: <Sparkles />,
    bgColor: "bg-amber-50",
  },
];
```

### 3.2 localStorage Schema

| Key | Type | Purpose |
|-----|------|---------|
| `spotline_onboarding_completed` | `"true"` | 온보딩 완료/스킵 여부 |

---

## 4. API Specification

API 호출 없음. 순수 클라이언트 사이드 기능.

---

## 5. UI/UX Design

### 5.1 Screen Layout — Mobile (375px)

```
┌─────────────────────────┐
│  ╳ (close)    건너뛰기  │  ← 상단 바
│                         │
│                         │
│      ┌──────────┐       │
│      │  🔍📍   │       │  ← 아이콘 영역 (120x120)
│      └──────────┘       │
│                         │
│   다음 장소, Spotline이  │  ← 제목 (text-2xl, bold)
│     추천해요             │
│                         │
│  지금 있는 장소에서 다음  │  ← 설명 (text-base, gray-600)
│  에 가기 좋은 곳을       │
│  추천받으세요            │
│                         │
│                         │
│      ● ○ ○ ○            │  ← 도트 인디케이터
│                         │
│   [    다음    ]         │  ← 다음 버튼 (Step 0~2)
│                         │  ← 또는 CTA 버튼들 (Step 3)
└─────────────────────────┘
```

### 5.2 Screen Layout — Step 4 CTA (Mobile)

```
┌─────────────────────────┐
│  ╳ (close)              │
│                         │
│      ┌──────────┐       │
│      │    ✨    │       │
│      └──────────┘       │
│                         │
│    지금 시작하세요       │
│                         │
│  피드에서 인기 SpotLine  │
│  을 둘러보거나, 데모를   │
│  체험해보세요            │
│                         │
│      ○ ○ ○ ●            │
│                         │
│  [ 피드 둘러보기  ]      │  ← Primary CTA (blue-600)
│  [ 데모 체험하기  ]      │  ← Secondary CTA (outline)
│                         │
└─────────────────────────┘
```

### 5.3 User Flow

```
첫 방문 → 온보딩 오버레이 표시
    │
    ├── 건너뛰기 클릭 → 오버레이 닫힘 → 랜딩 페이지 노출
    │
    └── 다음 → 다음 → 다음 → CTA 선택
                                │
                                ├── "피드 둘러보기" → 오버레이 닫힘 → 랜딩 페이지 (이미 피드)
                                └── "데모 체험하기" → /qr/demo_cafe_001 이동
```

### 5.4 Component List

| Component | Location | Responsibility |
|-----------|----------|----------------|
| `OnboardingOverlay` | `src/components/onboarding/OnboardingOverlay.tsx` | 전체 오버레이 컨테이너, 스와이프/상태 관리 |
| `OnboardingCard` | `src/components/onboarding/OnboardingCard.tsx` | 개별 단계 카드 렌더링 (아이콘 + 제목 + 설명) |
| `OnboardingDots` | `src/components/onboarding/OnboardingDots.tsx` | 하단 도트 네비게이션 인디케이터 |

---

## 6. Component Detailed Design

### 6.1 OnboardingOverlay

```typescript
// src/components/onboarding/OnboardingOverlay.tsx
"use client";

interface OnboardingOverlayProps {
  onComplete: () => void;  // 완료/스킵 시 호출
}

// State:
// - currentStep: number (0~3)
// - touchStart: number | null (스와이프 감지용)

// 스와이프 로직:
// - onTouchStart: touchStart 기록
// - onTouchEnd: delta > 50px → prev/next step
// - 마지막 단계에서 오른쪽 스와이프 무시

// 렌더링:
// - fixed inset-0 z-50 bg-white (전체 화면 오버레이)
// - 상단: 닫기(X) 버튼 + "건너뛰기" 텍스트
// - 중앙: OnboardingCard (currentStep에 해당하는 step)
// - 하단: OnboardingDots + "다음" 버튼 (또는 CTA 버튼들)
// - 카드 전환 시 CSS transition (transform + opacity)
```

### 6.2 OnboardingCard

```typescript
// src/components/onboarding/OnboardingCard.tsx

interface OnboardingCardProps {
  step: OnboardingStep;
  isLastStep: boolean;
  onPrimaryAction: () => void;   // 피드 둘러보기 or 다음
  onSecondaryAction?: () => void; // 데모 체험하기 (마지막 단계만)
}

// 렌더링:
// - 아이콘 영역: w-24 h-24, rounded-2xl, step.bgColor 배경
// - 제목: text-2xl font-bold text-gray-900, mt-8
// - 설명: text-base text-gray-600, mt-4, max-w-xs mx-auto
// - 마지막 단계만: 두 개의 CTA 버튼 (Primary + Secondary)
```

### 6.3 OnboardingDots

```typescript
// src/components/onboarding/OnboardingDots.tsx

interface OnboardingDotsProps {
  totalSteps: number;
  currentStep: number;
  onDotClick: (step: number) => void;
}

// 렌더링:
// - flex gap-2 justify-center
// - 각 도트: w-2 h-2 rounded-full
// - active: bg-blue-600 w-6 (확장)
// - inactive: bg-gray-300
// - transition-all duration-300
```

### 6.4 lib/onboarding.ts

```typescript
// src/lib/onboarding.ts

const ONBOARDING_KEY = "spotline_onboarding_completed";

export function isFirstVisit(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ONBOARDING_KEY) !== "true";
}

export function completeOnboarding(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ONBOARDING_KEY, "true");
}
```

---

## 7. Swipe Gesture Implementation

### 7.1 Touch Event Handling

```typescript
// OnboardingOverlay 내부

const SWIPE_THRESHOLD = 50; // px

const handleTouchStart = (e: React.TouchEvent) => {
  setTouchStart(e.touches[0].clientX);
};

const handleTouchEnd = (e: React.TouchEvent) => {
  if (touchStart === null) return;
  const delta = touchStart - e.changedTouches[0].clientX;

  if (Math.abs(delta) > SWIPE_THRESHOLD) {
    if (delta > 0 && currentStep < STEPS.length - 1) {
      // swipe left → next
      setCurrentStep(prev => prev + 1);
    } else if (delta < 0 && currentStep > 0) {
      // swipe right → prev
      setCurrentStep(prev => prev - 1);
    }
  }
  setTouchStart(null);
};
```

### 7.2 Card Transition Animation

```
CSS transition 전략 (CSS transform 기반):
- 컨테이너에 flex, overflow-hidden
- 카드 래퍼에 transform: translateX(-{currentStep * 100}%)
- transition: transform 300ms ease-in-out
```

---

## 8. Error Handling

| Scenario | Handling |
|----------|----------|
| localStorage 접근 불가 (프라이버시 모드) | try-catch → 항상 온보딩 표시 (false positive 허용) |
| SSR에서 window 접근 | `typeof window === "undefined"` 체크 |

---

## 9. Security Considerations

- [x] XSS 위험 없음 (사용자 입력 없음, 정적 콘텐츠만)
- [x] localStorage 데이터는 단순 flag ("true"), 민감 정보 없음
- [x] 외부 API 호출 없음

---

## 10. Test Plan

### 10.1 Test Cases (Key)

- [ ] 첫 방문 시 온보딩 오버레이가 표시됨
- [ ] "건너뛰기" 클릭 시 오버레이가 닫히고 재방문 시 미표시
- [ ] 4단계를 끝까지 완료 후 재방문 시 미표시
- [ ] 모바일에서 좌/우 스와이프로 단계 이동
- [ ] 마지막 단계의 CTA 버튼("피드 둘러보기", "데모 체험하기")이 올바르게 동작
- [ ] 도트 인디케이터가 현재 단계를 정확히 표시
- [ ] localStorage 비활성 시에도 크래시 없이 온보딩 표시

---

## 11. Implementation Guide

### 11.1 File Structure

```
src/
├── components/
│   └── onboarding/
│       ├── OnboardingOverlay.tsx    — (NEW) 메인 오버레이
│       ├── OnboardingCard.tsx       — (NEW) 개별 카드
│       └── OnboardingDots.tsx       — (NEW) 도트 인디케이터
├── lib/
│   └── onboarding.ts               — (NEW) 첫 방문 감지 유틸
└── app/
    └── page.tsx                     — (MODIFY) 온보딩 통합
```

### 11.2 Implementation Order

1. [ ] `src/lib/onboarding.ts` — 첫 방문 감지/완료 유틸 함수
2. [ ] `src/components/onboarding/OnboardingDots.tsx` — 도트 인디케이터
3. [ ] `src/components/onboarding/OnboardingCard.tsx` — 개별 카드 컴포넌트
4. [ ] `src/components/onboarding/OnboardingOverlay.tsx` — 메인 오버레이 (스와이프 포함)
5. [ ] `src/app/page.tsx` — 온보딩 오버레이 통합 (조건부 렌더링)

### 11.3 Conventions Applied

| Item | Convention |
|------|-----------|
| Component naming | PascalCase, `Onboarding` 접두사 |
| File organization | `components/onboarding/` 디렉토리 |
| State management | React useState (컴포넌트 로컬), localStorage (영속) |
| Styling | Tailwind CSS 4, `cn()` 유틸리티 |
| Icons | lucide-react |
| 언어 | UI 텍스트 한국어, 코드 영어 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-16 | Initial draft | AI |
