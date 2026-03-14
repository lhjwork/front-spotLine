# Claude Code Mode 사용 방법 (상세 가이드)

Claude Code Mode는 VS Code에서 Claude AI를 활용하여 코딩 작업을 자동화하는 에이전트 모드입니다. 아래에 실제 예시와 함께 상세하게 설명합니다.

---

## 1. 기본 설정

### CLAUDE.md 파일 작성

프로젝트 루트에 `CLAUDE.md` 파일을 만들어 프로젝트 컨텍스트를 제공합니다.
이 파일은 Claude에게 프로젝트 맥락을 알려주는 **가장 중요한 파일**입니다.

---

## 2. CLAUDE.md 작성 가이드 (핵심)

포함해야 할 내용:

| 섹션 | 설명 | 예시 |
|------|------|------|
| **빌드 명령어** | 개발/빌드/테스트 방법 | `pnpm dev`, `pnpm build` |
| **아키텍처** | 기술 스택과 구조 | Next.js 16, React 19, Zustand |
| **핵심 플로우** | 앱의 주요 동작 흐름 | QR 스캔 → 매장 정보 표시 |
| **주요 파일** | 핵심 파일 경로와 역할 | `src/lib/api.ts` — API 레이어 |
| **코드 패턴** | 프로젝트의 규칙/컨벤션 | `cn()` 유틸리티 사용, 한국어 UI |
| **환경 변수** | 필요한 환경 설정 | API URL, 포트 등 |

### CLAUDE.md 예시

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 빌드 & 개발 명령어

\`\`\`bash
pnpm dev          # 개발 서버 (포트 3003)
pnpm build        # 프로덕션 빌드
pnpm lint         # ESLint 검사
pnpm type-check   # TypeScript 타입 검사
\`\`\`

## 아키텍처

**Next.js App Router** 기반, React 19, TypeScript strict 모드, Tailwind CSS, Zustand 상태관리.

### 주요 파일

- `src/app/spotline/[qrId]/page.tsx` — 메인 동적 페이지
- `src/lib/api.ts` — API 레이어
- `src/store/useSpotlineStore.ts` — Zustand 스토어
- `src/types/index.ts` — TypeScript 인터페이스

### 코드 패턴

- 인터랙티브 컴포넌트에 `"use client"` 디렉티브 사용
- `cn()` 유틸리티로 조건부 클래스 처리
- UI 및 에러 메시지는 한국어
```

---

## 3. 실제 사용 예시 (프롬프트별)

### 📌 예시 1: 새로운 컴포넌트 추가

```
"매장 리뷰를 별점과 함께 보여주는 ReviewCard 컴포넌트를 만들어줘. 
기존 RecommendationCard 스타일을 따르고 Tailwind CSS 사용해줘"
```

→ Claude가 기존 코드 패턴을 분석하고 일관된 스타일로 컴포넌트를 생성합니다.

### 📌 예시 2: 버그 수정

```
"spotline/[qrId] 페이지에서 데모 모드일 때 로딩이 안 끝나는 버그가 있어. 확인하고 수정해줘"
```

→ Claude가 관련 파일들을 읽고, 문제를 분석하고, 코드를 직접 수정합니다.

### 📌 예시 3: API 연동

```
"백엔드에 POST /api/reviews 엔드포인트가 추가됐어. 
api.ts에 리뷰 제출 함수를 추가하고, 타입도 types/index.ts에 정의해줘"
```

→ 기존 API 패턴(`src/lib/api.ts`)을 따라서 일관되게 구현합니다.

### 📌 예시 4: 리팩토링

```
"RecommendationList 컴포넌트가 너무 커졌어. 
로직을 커스텀 훅으로 분리하고, 컴포넌트는 UI만 담당하게 리팩토링해줘"
```

### 📌 예시 5: 테스트 작성

```
"useSpotlineStore의 주요 액션들에 대한 단위 테스트를 작성해줘. 
vitest 사용하고 각 상태 변경이 올바른지 검증해줘"
```

### 📌 예시 6: 전체 기능 구현 (멀티스텝)

```
"매장 즐겨찾기 기능을 만들어줘:
1. localStorage에 저장하는 Zustand 스토어
2. 하트 버튼 컴포넌트
3. 즐겨찾기 목록 페이지 (/favorites)
4. SpotlineStoreInfo에 즐겨찾기 버튼 통합"
```

→ Claude가 TODO 리스트를 만들고, 단계별로 파일을 생성/수정합니다.

---

## 4. 효과적인 프롬프트 작성 팁

### ✅ 좋은 프롬프트

```
"CategoryFilter 컴포넌트에 '전체' 카테고리 버튼을 추가해줘. 
선택 시 필터를 초기화하고, 기존 cn() 유틸리티와 
Tailwind 스타일 패턴을 따라줘"
```

- **구체적** 위치 지정
- **기존 패턴** 참조
- **기대 동작** 명시

### ❌ 나쁜 프롬프트

```
"필터 고쳐줘"
```

- 어떤 필터인지 불명확
- 무엇이 문제인지 불명확
- 기대 결과 없음

---

## 5. 주요 기능별 사용법

### 🔍 코드 검색 & 이해

```
"useSpotlineStore에서 fetchStoreData 액션의 전체 흐름을 설명해줘"
"api.ts의 에러 핸들링 패턴을 분석해줘"
```

### ✏️ 코드 수정

```
"StoreInfo 컴포넌트의 영업시간 표시 형식을 'HH:MM ~ HH:MM'으로 변경해줘"
```

### 🏗️ 파일 생성

```
"src/hooks/useDebounce.ts 커스텀 훅을 만들어줘"
```

### 🖥️ 터미널 명령 실행

```
"pnpm build 실행해서 빌드 에러 있는지 확인해줘"
"새 패키지 framer-motion 설치해줘"
```

### 🔧 디버깅

```
"빌드 에러가 나는데 확인하고 수정해줘"
"타입 에러 전부 찾아서 고쳐줘"
```

### 📝 Git 작업

```
"지금까지 변경사항 확인하고 적절한 커밋 메시지로 커밋해줘"
"feature/review 브랜치 만들고 체크아웃해줘"
```

---

## 6. CLAUDE.md 계층 구조

CLAUDE.md는 여러 위치에 둘 수 있습니다:

```
프로젝트루트/
├── CLAUDE.md              ← 프로젝트 전체 규칙
├── src/
│   ├── CLAUDE.md          ← src 하위 전용 규칙
│   └── components/
│       └── CLAUDE.md      ← 컴포넌트 전용 규칙
```

하위 CLAUDE.md는 해당 디렉토리의 파일을 작업할 때만 참조됩니다.

### 계층별 예시

**루트 `CLAUDE.md`** — 전체 프로젝트 규칙

```markdown
## 코드 스타일
- TypeScript strict 모드
- 함수형 컴포넌트만 사용
- 한국어 UI 메시지
```

**`src/components/CLAUDE.md`** — 컴포넌트 전용 규칙

```markdown
## 컴포넌트 규칙
- Props 타입은 컴포넌트명 + Props (예: ButtonProps)
- 'use client' 디렉티브 필수
- cn() 유틸리티로 클래스 결합
- 기본 export 사용
```

---

## 7. 고급 활용 패턴

### 멀티 파일 작업 요청

```
"Store 타입에 rating 필드를 추가하고, 
관련된 모든 컴포넌트와 API 레이어를 업데이트해줘"
```

→ Claude가 `types/index.ts` → `api.ts` → 컴포넌트들 순서로 연쇄 수정

### 코드 리뷰 요청

```
"최근 변경사항을 리뷰해줘. 성능 이슈나 버그 가능성이 있는지 확인해줘"
```

### 마이그레이션 작업

```
"이 프로젝트의 모든 클래스 컴포넌트를 함수 컴포넌트로 변환해줘"
```

### 문서화

```
"src/lib/api.ts의 모든 함수에 JSDoc 주석을 추가해줘"
```

### 성능 최적화

```
"RecommendationList에서 불필요한 리렌더링이 발생하는지 확인하고 
React.memo, useMemo, useCallback으로 최적화해줘"
```

---

## 8. 핵심 요약

| 원칙 | 설명 |
|------|------|
| **CLAUDE.md를 잘 작성** | 프로젝트 맥락이 풍부할수록 결과가 좋음 |
| **구체적으로 요청** | 파일명, 컴포넌트명, 기대 동작 명시 |
| **기존 패턴 참조** | "기존 ~처럼" 이라고 하면 일관성 유지 |
| **단계별 요청** | 복잡한 작업은 번호 매겨서 요청 |
| **검증 요청** | "빌드해서 에러 없는지 확인해줘" 추가 |

---

## 9. 자주 쓰는 프롬프트 템플릿

### 새 기능 추가

```
"[기능 설명]을 구현해줘.
- 위치: [파일/폴더 경로]
- 참고: [기존 유사 코드]
- 스타일: [기존 패턴] 따라서
- 완료 후 빌드 확인해줘"
```

### 버그 수정

```
"[페이지/컴포넌트]에서 [증상] 버그가 있어.
- 재현 조건: [조건]
- 기대 동작: [올바른 동작]
- 관련 파일: [파일 경로]"
```

### 리팩토링

```
"[대상 파일]을 리팩토링해줘.
- 목표: [분리/통합/최적화]
- 제약: [기존 API 유지/타입 변경 없이]
- 테스트도 업데이트해줘"
```
