# SpotLine 데모 API 명세서 V2.0 (백엔드 연동)

## 개요
SpotLine 데모 시스템의 백엔드 API 명세서입니다. 데모 데이터를 별도로 관리하여 프론트엔드와 백엔드가 분리된 구조로 설계되었습니다.

## 아키텍처 개요

### 데이터 관리 구조
```
프론트엔드: /spotline/demo-store (UI 렌더링)
     ↓ API 호출
백엔드: /api/demo/store (데모 데이터 제공)
     ↓ 데이터 참조
데이터 레이어: /src/data/demo.ts (데모 데이터 관리)
```

### 플로우
```
홈페이지 → [🎭 데모 버튼] → /qr/demo_cafe_001 → /spotline/demo-store?qr=demo_cafe_001
                                                           ↓ API 호출
                                                    /api/demo/store
```

## API 엔드포인트

### 1. 데모 매장 및 근처 Spot 조회

#### 요청
```http
GET /api/demo/store
Content-Type: application/json
```

#### 응답 (성공)
```json
{
  "success": true,
  "data": {
    "store": {
      "id": "demo-store",
      "name": "아늑한 카페 스토리",
      "shortDescription": "따뜻한 분위기의 동네 카페",
      "representativeImage": "/demo/cafe-001.jpg",
      "category": "cafe",
      "location": {
        "address": "서울시 강남구 테헤란로 123",
        "coordinates": [127.0276, 37.4979]
      },
      "qrCode": {
        "id": "demo_cafe_001",
        "isActive": true
      },
      "spotlineStory": {
        "title": "커피 한 잔의 여유",
        "content": "바쁜 일상 속에서 잠시 멈춰 서서 향긋한 커피 한 잔과 함께하는 소중한 시간을 선사합니다. 정성스럽게 내린 원두커피와 수제 디저트로 특별한 순간을 만들어보세요.",
        "tags": ["커피", "휴식", "분위기", "수제디저트"]
      },
      "externalLinks": [
        {
          "type": "instagram",
          "url": "https://instagram.com/demo_cafe",
          "title": "인스타그램"
        },
        {
          "type": "website",
          "url": "https://demo-cafe.com",
          "title": "홈페이지"
        }
      ],
      "demoNotice": "이것은 SpotLine 서비스 소개용 데모입니다. 실제 매장이 아닙니다."
    },
    "nextSpots": [
      {
        "id": "demo_bakery_001",
        "name": "달콤한 베이커리",
        "shortDescription": "갓 구운 빵의 향기",
        "representativeImage": "/demo/bakery-001.jpg",
        "category": "bakery",
        "distance": 150,
        "walkingTime": 2,
        "spotlineStory": {
          "title": "갓 구운 빵의 행복",
          "content": "매일 새벽부터 정성스럽게 구워내는 빵들이 여러분을 기다립니다."
        }
      },
      {
        "id": "demo_bookstore_001",
        "name": "조용한 서점",
        "shortDescription": "책과 함께하는 시간",
        "representativeImage": "/demo/bookstore-001.jpg",
        "category": "bookstore",
        "distance": 200,
        "walkingTime": 3,
        "spotlineStory": {
          "title": "책 속 여행",
          "content": "좋은 책과 함께 떠나는 마음의 여행을 시작해보세요."
        }
      },
      {
        "id": "demo_flower_001",
        "name": "꽃향기 플라워샵",
        "shortDescription": "싱싱한 꽃과 식물",
        "representativeImage": "/demo/flower-001.jpg",
        "category": "flower",
        "distance": 300,
        "walkingTime": 4,
        "spotlineStory": {
          "title": "자연의 선물",
          "content": "아름다운 꽃과 식물로 일상에 생기를 더해보세요."
        }
      },
      {
        "id": "demo_art_001",
        "name": "작은 갤러리",
        "shortDescription": "예술과의 만남",
        "representativeImage": "/demo/art-001.jpg",
        "category": "art",
        "distance": 250,
        "walkingTime": 3,
        "spotlineStory": {
          "title": "예술이 있는 공간",
          "content": "지역 작가들의 작품을 감상하며 영감을 얻어보세요."
        }
      }
    ]
  },
  "message": "데모 데이터를 성공적으로 가져왔습니다.",
  "meta": {
    "isDemo": true,
    "scenario": "cafe",
    "timestamp": "2024-01-08T10:30:00.000Z"
  }
}
```

#### 응답 (실패)
```json
{
  "success": false,
  "message": "데모 데이터를 가져올 수 없습니다.",
  "error": "상세 에러 메시지"
}
```

## 데이터 구조

### SpotlineStore (데모 매장)
```typescript
interface SpotlineStore {
  id: string;                    // "demo-store"
  name: string;                  // 매장명
  shortDescription: string;      // 짧은 설명
  representativeImage: string;   // 대표 이미지 URL
  category: string;              // 카테고리 (cafe, restaurant, etc.)
  location: {
    address: string;             // 주소
    coordinates: [number, number]; // [경도, 위도]
  };
  qrCode: {
    id: string;                  // QR 코드 ID
    isActive: boolean;           // 활성화 상태
  };
  spotlineStory: {
    title: string;               // 스토리 제목
    content: string;             // 스토리 내용
    tags: string[];              // 태그 배열
  };
  externalLinks: Array<{
    type: string;                // 링크 타입 (instagram, website, etc.)
    url: string;                 // URL
    title: string;               // 표시명
  }>;
  demoNotice: string;            // 데모 안내 메시지
}
```

### NextSpot (근처 추천 매장)
```typescript
interface NextSpot {
  id: string;                    // Spot ID
  name: string;                  // 매장명
  shortDescription: string;      // 짧은 설명
  representativeImage: string;   // 대표 이미지 URL
  category: string;              // 카테고리
  distance: number;              // 거리 (미터)
  walkingTime: number;           // 도보 시간 (분)
  spotlineStory: {
    title: string;               // 스토리 제목
    content: string;             // 스토리 내용
  };
}
```

## 기술적 특징

### 1. 데이터 분리
- **데이터 레이어**: `/src/data/demo.ts`에서 데모 데이터 관리
- **API 레이어**: `/api/demo/store`에서 데이터 제공
- **UI 레이어**: `/spotline/demo-store`에서 렌더링

### 2. 로딩 시뮬레이션
```typescript
// 실제 DB 조회하는 것처럼 로딩 시간 시뮬레이션
await new Promise(resolve => setTimeout(resolve, 500));
```

### 3. 에러 처리
- 네트워크 오류 시 적절한 에러 메시지 반환
- 프론트엔드에서 에러 상태 UI 표시

### 4. 메타데이터
```typescript
meta: {
  isDemo: true,           // 데모 모드 식별
  scenario: "cafe",       // 데모 시나리오 타입
  timestamp: string       // 응답 시간
}
```

## 실제 운영 API와의 차이점

### 데모 API 특징
- **고정 데이터**: 항상 동일한 데모 데이터 반환
- **빠른 응답**: 로딩 시뮬레이션만 있고 실제 DB 조회 없음
- **통계 수집 없음**: 사용자 행동 추적 안함
- **별도 라우트**: `/spotline/demo-store` 전용 라우트

### 실제 운영 API 특징
- **동적 데이터**: 실시간 DB 조회로 최신 데이터 제공
- **변동 응답 시간**: DB 상태에 따라 응답 시간 변동
- **통계 수집**: 사용자 행동, 방문 패턴 분석
- **동적 라우트**: `/spotline/[qrId]` 매장별 라우트

## 확장 가능성

### 1. 다양한 데모 시나리오
```typescript
// /src/data/demo.ts에서 확장 가능
export const DEMO_SCENARIOS = {
  cafe: { store: CAFE_DEMO_STORE, nextSpots: CAFE_NEXT_SPOTS },
  restaurant: { store: RESTAURANT_DEMO_STORE, nextSpots: RESTAURANT_NEXT_SPOTS },
  retail: { store: RETAIL_DEMO_STORE, nextSpots: RETAIL_NEXT_SPOTS }
};
```

### 2. 시나리오별 API 엔드포인트
```http
GET /api/demo/store?scenario=cafe
GET /api/demo/store?scenario=restaurant
GET /api/demo/store?scenario=retail
```

### 3. 지역별 데모 데이터
```typescript
export const DEMO_REGIONS = {
  gangnam: { ... },
  hongdae: { ... },
  itaewon: { ... }
};
```

## 성능 고려사항

### 1. 캐싱 전략
- 데모 데이터는 변경되지 않으므로 적극적인 캐싱 가능
- CDN을 통한 이미지 캐싱
- 브라우저 캐시 활용

### 2. 응답 최적화
- 불필요한 데이터 제거
- 이미지 최적화 (WebP, 적절한 크기)
- Gzip 압축 적용

### 3. 모니터링
- 데모 API 응답 시간 모니터링
- 에러율 추적
- 사용 빈도 분석 (별도 통계)

## 보안 고려사항

### 1. 데이터 보호
- 실제 매장 정보와 완전 분리
- 가상의 연락처, 주소 사용
- 실제 SNS 계정과 연결 금지

### 2. API 보안
- Rate limiting 적용
- CORS 설정
- 악용 방지를 위한 모니터링

## 배포 및 운영

### 1. 환경 설정
```env
# 데모 모드 설정
DEMO_MODE=enabled
DEMO_LOADING_DELAY=500

# 이미지 CDN
DEMO_IMAGE_CDN=https://cdn.spotline.com/demo
```

### 2. 모니터링 지표
- 데모 페이지 접근 수
- API 응답 시간
- 에러 발생률
- 사용자 체험 완료율

### 3. 업데이트 프로세스
1. `/src/data/demo.ts` 데이터 수정
2. 테스트 환경에서 검증
3. 프로덕션 배포
4. 모니터링 및 피드백 수집