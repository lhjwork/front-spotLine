# SpotLine Frontend

QR 코드 기반으로 현재 장소에서 다음 경험을 자연스럽게 제안하는 SpotLine의 프론트엔드 애플리케이션입니다.

## 🚀 프로젝트 개요

SpotLine은 **광고 플랫폼이 아닌**, **현재 장소를 기준으로 다음 경험을 자연스럽게 제안**하는 웹 애플리케이션입니다. QR 코드를 스캔하면 현재 위치와 자연스럽게 이어지는 다음 Spot들을 추천받을 수 있습니다.

### 🎯 SpotLine 핵심 원칙

- ❌ 광고 플랫폼이 아니다
- ❌ 리뷰 서비스가 아니다
- ❌ 사용자 참여형 커뮤니티가 아니다
- ✅ 현재 장소를 기준으로 다음 경험을 자연스럽게 제안
- ✅ 사용자 이동 흐름을 관찰
- ✅ 큐레이션의 신뢰를 축적

## 🛠 기술 스택

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm
- **State Management**: Zustand
- **HTTP Client**: Axios
- **UI Components**: Headless UI
- **Icons**: Lucide React

## 📦 설치 및 실행

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

또는 `.env.example` 파일을 복사하여 사용하세요:

```bash
cp .env.example .env.local
```

### 3. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 4. 빌드

```bash
pnpm build
```

### 5. 프로덕션 실행

```bash
pnpm start
```

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── spotline/[qrId]/   # SpotLine QR 페이지 (메인)
│   ├── qr/[qrId]/         # 기존 QR 페이지 (리다이렉트)
│   ├── globals.css        # 글로벌 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 홈페이지
├── components/            # 재사용 가능한 컴포넌트
│   ├── spotline/         # SpotLine 전용 컴포넌트
│   │   ├── SpotlineStoreInfo.tsx    # 매장 정보 (간소화)
│   │   ├── NextSpotCard.tsx         # 다음 Spot 카드
│   │   └── NextSpotsList.tsx        # 다음 Spot 리스트
│   ├── common/           # 공통 컴포넌트
│   └── layout/           # 레이아웃 컴포넌트
├── lib/                  # 유틸리티 함수
│   ├── api.ts           # API 호출 함수 (SpotLine 전용 추가)
│   └── utils.ts         # 공통 유틸리티
├── store/               # Zustand 상태 관리
└── types/               # TypeScript 타입 정의 (SpotLine 타입 추가)
    └── index.ts
```

## 🎯 주요 기능

### 1. QR 스캔 페이지 (`/qr/[qrId]`)

- QR 코드 ID를 URL 파라미터로 받아 처리
- 현재 매장 정보 표시 (이름, 카테고리, 주소, 영업시간)
- 매장 이미지 및 태그 표시
- 로딩 상태 및 에러 처리

### 2. 추천 리스트 섹션

- 현재 매장 기준 다음 장소 추천 표시
- 카테고리별 필터링 (식사, 디저트, 활동, 문화 등)
- 각 추천 매장의 정보 카드
- 지도 보기 버튼

### 3. 지도 연동

- 카카오맵, 구글맵, 네이버맵 연결
- 추천 매장 위치를 지도에 표시
- 현재 위치에서 목적지까지의 경로 안내

### 4. 분석 이벤트 추적

- QR 스캔 이벤트 로깅
- 페이지 뷰 추적
- 추천 클릭 이벤트 추적
- 지도 클릭 이벤트 추적

## 🎨 UI/UX 특징 (SpotLine 정체성 준수)

- **광고성 요소 완전 제거**: 별점, 평점, 리뷰, 좋아요, 북마크 등 없음
- **정보 최소화**: 매장명 + 한 문장 설명만 표시
- **자연스러운 경험 흐름**: "다음으로 이어지는 Spot" 중심 설계
- **모바일 퍼스트**: QR 스캔 후 사용하는 시나리오에 최적화
- **미니멀 디자인**: 빠른 의사결정을 돕는 깔끔한 인터페이스

## 🔧 개발 스크립트

```bash
# 개발 서버 실행
pnpm dev

# 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 린트 검사
pnpm lint

# 린트 자동 수정
pnpm lint:fix

# 타입 체크
pnpm type-check

# 빌드 후 프리뷰
pnpm preview

# 캐시 정리
pnpm clean
```

## 🌐 API 연동

SpotLine API Version001과 연동하여 다음 엔드포인트들을 사용합니다:

- `GET /api/stores/spotline/{qrId}` - SpotLine QR 스캔 전용 매장 조회
- `GET /api/recommendations/next-spots/{storeId}` - 다음으로 이어지는 Spot 조회
- `POST /api/analytics/spotline-event` - SpotLine 전용 이벤트 로깅 (개인 식별 데이터 없이)

## 📱 반응형 디자인

- **Mobile**: 320px ~ 768px (주요 타겟)
- **Tablet**: 768px ~ 1024px
- **Desktop**: 1024px 이상

## ♿ 접근성

- 키보드 네비게이션 지원
- 스크린 리더 호환성
- 색상 대비 WCAG 2.1 AA 준수
- 포커스 인디케이터 명확히 표시

## 🚀 배포

### Vercel 배포

1. Vercel에 프로젝트 연결
2. 환경 변수 설정
3. 자동 배포 설정

### 환경 변수

프로덕션 환경에서 다음 환경 변수들을 설정해야 합니다:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com/api
```

#### Vercel 환경 변수 설정 방법

1. Vercel 대시보드에서 프로젝트 선택
2. Settings → Environment Variables 메뉴로 이동
3. 다음 환경 변수 추가:
   - Name: `NEXT_PUBLIC_API_BASE_URL`
   - Value: `https://your-backend-domain.com/api`
   - Environment: Production (또는 필요에 따라 Preview, Development)

#### 환경별 설정 파일

- `.env.local` - 로컬 개발 환경
- `.env.production` - 프로덕션 환경 (참고용)
- `.env.example` - 환경 변수 예시 파일

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

- 이메일: contact@spotline.app
- 웹사이트: https://spotline.app

---

Made with ❤️ by Spotline Team
