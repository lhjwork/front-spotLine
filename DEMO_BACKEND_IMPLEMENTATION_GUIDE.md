# SpotLine 데모 백엔드 구현 가이드 (개선된 플로우)

## 개요
SpotLine 데모 시스템의 백엔드 구현을 위한 상세 가이드입니다. 
새로운 플로우에서는 별도의 데모 전용 라우트를 사용하여 실제 운영과 완전히 분리합니다.

## 개선된 아키텍처

### 1. 라우트 분리 구조
```
실제 운영: /spotline/[qrId] → 동적 라우트, DB 조회
데모 전용: /spotline/demo-store → 정적 라우트, 하드코딩 데이터
```

### 2. QR 처리 로직
```typescript
// QR 페이지에서 데모/실제 구분
if (qrId === "demo_cafe_001") {
  // 데모 전용 페이지로 리다이렉트
  router.replace(`/spotline/demo-store?qr=${qrId}`);
} else {
  // 실제 QR 코드 처리
  const { storeId } = await getStoreIdByQR(qrId);
  router.replace(`/spotline/${storeId}?qr=${qrId}`);
}
```

### 3. 데모 데이터 구조
```typescript
// 데모 매장 데이터 (하드코딩)
const DEMO_STORE: SpotlineStore = {
  id: "demo-store",
  name: "아늑한 카페 스토리",
  shortDescription: "따뜻한 분위기의 동네 카페",
  representativeImage: "/demo/cafe-001.jpg",
  category: "cafe",
  location: {
    address: "서울시 강남구 테헤란로 123",
    coordinates: [127.0276, 37.4979]
  },
  qrCode: {
    id: "demo_cafe_001",
    isActive: true
  },
  spotlineStory: {
    title: "커피 한 잔의 여유",
    content: "바쁜 일상 속에서 잠시 멈춰 서서 향긋한 커피 한 잔과 함께하는 소중한 시간을 선사합니다.",
    tags: ["커피", "휴식", "분위기", "수제디저트"]
  },
  externalLinks: [
    {
      type: "instagram",
      url: "https://instagram.com/demo_cafe",
      title: "인스타그램"
    }
  ],
  demoNotice: "이것은 SpotLine 서비스 소개용 데모입니다."
};

// 데모 근처 Spot들 (4개)
const DEMO_NEXT_SPOTS: NextSpot[] = [
  {
    id: "demo_bakery_001",
    name: "달콤한 베이커리",
    shortDescription: "갓 구운 빵의 향기",
    representativeImage: "/demo/bakery-001.jpg",
    category: "bakery",
    distance: 150,
    walkingTime: 2,
    spotlineStory: {
      title: "갓 구운 빵의 행복",
      content: "매일 새벽부터 정성스럽게 구워내는 빵들이 여러분을 기다립니다."
    }
  },
  {
    id: "demo_bookstore_001", 
    name: "조용한 서점",
    shortDescription: "책과 함께하는 시간",
    representativeImage: "/demo/bookstore-001.jpg",
    category: "bookstore",
    distance: 200,
    walkingTime: 3,
    spotlineStory: {
      title: "책 속 여행",
      content: "좋은 책과 함께 떠나는 마음의 여행을 시작해보세요."
    }
  },
  {
    id: "demo_flower_001",
    name: "꽃향기 플라워샵",
    shortDescription: "싱싱한 꽃과 식물",
    representativeImage: "/demo/flower-001.jpg",
    category: "flower",
    distance: 300,
    walkingTime: 4,
    spotlineStory: {
      title: "자연의 선물",
      content: "아름다운 꽃과 식물로 일상에 생기를 더해보세요."
    }
  },
  {
    id: "demo_art_001",
    name: "작은 갤러리",
    shortDescription: "예술과의 만남",
    representativeImage: "/demo/art-001.jpg",
    category: "art",
    distance: 250,
    walkingTime: 3,
    spotlineStory: {
      title: "예술이 있는 공간",
      content: "지역 작가들의 작품을 감상하며 영감을 얻어보세요."
    }
  }
];
```
## 프론트엔드 연동

### 1. 홈페이지 데모 버튼
```typescript
// src/app/page.tsx
<button 
  onClick={() => window.location.href = '/qr/demo_cafe_001'}
  className="text-purple-600 hover:text-purple-700 underline font-medium"
>
  🎭 데모보기로 먼저 체험해보기
</button>
```

### 2. QR 페이지 데모 처리
```typescript
// src/app/qr/[qrId]/page.tsx
useEffect(() => {
  const handleQRScan = async () => {
    if (qrId === "demo_cafe_001") {
      // 데모 전용 페이지로 리다이렉트
      router.replace(`/spotline/demo-store?qr=${qrId}`);
      return;
    }
    
    // 실제 QR 코드 처리
    const { storeId } = await getStoreIdByQR(qrId);
    router.replace(`/spotline/${storeId}?qr=${qrId}`);
  };
  
  handleQRScan();
}, [qrId, router]);
```

### 3. 데모 전용 SpotLine 페이지
```typescript
// src/app/spotline/demo-store/page.tsx
export default function DemoStorePage() {
  const searchParams = useSearchParams();
  const qrId = searchParams.get("qr") || "demo_cafe_001";
  
  const [store, setStore] = useState<SpotlineStore | null>(null);
  const [nextSpots, setNextSpots] = useState<NextSpot[]>([]);
  
  useEffect(() => {
    const loadDemoData = async () => {
      setIsLoading(true);
      
      // 로딩 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setStore(DEMO_STORE);
      setNextSpots(DEMO_NEXT_SPOTS);
      setIsLoading(false);
      
      console.log("데모 모드: 통계 수집하지 않음");
    };

    loadDemoData();
  }, []);
  
  // ... 렌더링 로직
}
```

## 라우트 구조 설계

### 1. 실제 운영 라우트
```
/spotline/[qrId] → 동적 라우트
- 매장별 고유 ID 사용
- 데이터베이스에서 실시간 조회
- 통계 수집 및 분석
- 예: /spotline/695f96c2825a4a7c28bb6ce9
```

### 2. 데모 전용 라우트
```
/spotline/demo-store → 정적 라우트
- 고정된 데모 데이터 사용
- API 호출 없이 하드코딩 데이터
- 통계 수집 없음
- 예: /spotline/demo-store?qr=demo_cafe_001
```

### 3. 라우트 분리의 장점
- **완전한 분리**: 실제 운영에 영향 없음
- **성능 최적화**: 데모는 빠른 응답, 실제는 정확한 데이터
- **유지보수성**: 각각 독립적으로 관리 가능
- **확장성**: 데모 기능 추가 시 실제 서비스에 영향 없음

## 데이터베이스 설계 (실제 운영용)

### 1. 데모 플래그 추가
```sql
-- stores 테이블에 is_demo 컬럼 추가
ALTER TABLE stores ADD COLUMN is_demo BOOLEAN DEFAULT FALSE;

-- 데모 매장 데이터 삽입
INSERT INTO stores (id, name, is_demo, ...) 
VALUES ('demo_cafe_001', '아늑한 카페 스토리', TRUE, ...);
```

### 2. 통계 수집 제외
```sql
-- 통계 테이블에서 데모 데이터 제외
SELECT * FROM analytics 
WHERE store_id NOT LIKE 'demo_%';
```

## 배포 및 운영

### 1. 환경별 설정
```env
# 개발 환경
DEMO_MODE=true
DEMO_API_TIMEOUT=3000

# 운영 환경  
DEMO_MODE=true
DEMO_API_TIMEOUT=5000
```

### 2. 모니터링
- 데모 페이지 접근 빈도 모니터링
- 데모 API 응답 시간 측정
- 에러율 추적 (실제 서비스와 분리)

### 3. 성능 최적화
- 데모 데이터 캐싱
- CDN을 통한 데모 이미지 제공
- 데모 API 응답 시간 최소화

## 보안 고려사항

### 1. 데모 데이터 보호
- 실제 매장 정보와 완전 분리
- 가상의 주소, 연락처 사용
- 실제 SNS 계정과 연결 금지

### 2. 접근 제한
- 데모 API 호출 빈도 제한
- 봇 접근 차단
- 악용 방지를 위한 모니터링

## 업주 소개용 커스터마이징

### 1. 업종별 데모 데이터
```typescript
const DEMO_STORES_BY_CATEGORY = {
  cafe: [/* 카페 데모 데이터 */],
  restaurant: [/* 음식점 데모 데이터 */],
  retail: [/* 소매점 데모 데이터 */]
};
```

### 2. 지역별 데모 데이터
```typescript
const DEMO_STORES_BY_REGION = {
  gangnam: [/* 강남 지역 데모 */],
  hongdae: [/* 홍대 지역 데모 */],
  itaewon: [/* 이태원 지역 데모 */]
};
```

### 3. 동적 데모 생성
```typescript
const generateDemoStore = (category: string, region: string) => {
  return {
    id: `demo_${category}_${region}_001`,
    name: `${region} ${category} 데모`,
    // ... 동적 생성 로직
  };
};
```

## 테스트 시나리오

### 1. 기본 플로우 테스트
1. 데모 버튼 클릭
2. QR 페이지 로딩 확인
3. SpotLine 페이지 이동 확인
4. 데모 데이터 표시 확인

### 2. 에러 처리 테스트
1. 잘못된 데모 ID 접근
2. API 타임아웃 시뮬레이션
3. 네트워크 오류 상황

### 3. 성능 테스트
1. 동시 접속자 처리
2. 응답 시간 측정
3. 메모리 사용량 확인

## 마이그레이션 가이드

### 기존 시스템에서 데모 모드 추가
1. 데모 데이터 준비
2. API 엔드포인트 추가
3. 프론트엔드 데모 모드 로직 구현
4. 통계 수집 로직 수정
5. 테스트 및 배포