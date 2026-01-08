# SpotLine 데모 시스템 백엔드 구현 프롬프트

## 🎯 구현 목표
SpotLine 서비스의 영업용 데모 시스템을 위한 백엔드 API를 구현해주세요. 실제 운영 시스템과 완전히 분리된 데모 전용 API가 필요합니다.

## 📋 요구사항 요약

### 1. 핵심 기능
- **데모 매장 정보 제공**: 1개의 대표 카페 매장 데이터
- **근처 Spot 추천**: 4개의 다양한 카테고리 추천 매장
- **로딩 시뮬레이션**: 실제 DB 조회하는 것처럼 자연스러운 로딩
- **에러 처리**: 안정적인 에러 응답

### 2. 기술적 요구사항
- **완전한 분리**: 실제 운영 DB와 완전히 독립
- **빠른 응답**: 500ms 내외의 일관된 응답 시간
- **확장 가능**: 향후 다양한 데모 시나리오 추가 가능한 구조

## 🛠 구현 상세

### API 엔드포인트
```
GET /api/demo/store
```

### 응답 데이터 구조
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
        "content": "바쁜 일상 속에서 잠시 멈춰 서서 향긋한 커피 한 잔과 함께하는 소중한 시간을 선사합니다.",
        "tags": ["커피", "휴식", "분위기", "수제디저트"]
      },
      "externalLinks": [
        {
          "type": "instagram",
          "url": "https://instagram.com/demo_cafe",
          "title": "인스타그램"
        }
      ],
      "demoNotice": "이것은 SpotLine 서비스 소개용 데모입니다."
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
      }
      // ... 총 4개의 nextSpots
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

## 🔧 구현 가이드

### 1. 데이터 관리 방식
```typescript
// 권장: 별도 파일에서 데모 데이터 관리
// /data/demo.ts 또는 /constants/demoData.ts

export const DEMO_STORE = {
  id: "demo-store",
  name: "아늑한 카페 스토리",
  // ... 전체 매장 데이터
};

export const DEMO_NEXT_SPOTS = [
  // 베이커리, 서점, 플라워샵, 갤러리 총 4개
];
```

### 2. API 구현 예시 (Node.js/Express)
```javascript
// /routes/demo.js
const express = require('express');
const { DEMO_STORE, DEMO_NEXT_SPOTS } = require('../data/demo');

router.get('/store', async (req, res) => {
  try {
    // 로딩 시뮬레이션 (500ms)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    res.json({
      success: true,
      data: {
        store: DEMO_STORE,
        nextSpots: DEMO_NEXT_SPOTS
      },
      message: "데모 데이터를 성공적으로 가져왔습니다.",
      meta: {
        isDemo: true,
        scenario: "cafe",
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "데모 데이터를 가져올 수 없습니다.",
      error: error.message
    });
  }
});
```

### 3. API 구현 예시 (Python/FastAPI)
```python
# /routers/demo.py
from fastapi import APIRouter
import asyncio
from datetime import datetime
from .data.demo import DEMO_STORE, DEMO_NEXT_SPOTS

router = APIRouter()

@router.get("/store")
async def get_demo_store():
    try:
        # 로딩 시뮬레이션
        await asyncio.sleep(0.5)
        
        return {
            "success": True,
            "data": {
                "store": DEMO_STORE,
                "nextSpots": DEMO_NEXT_SPOTS
            },
            "message": "데모 데이터를 성공적으로 가져왔습니다.",
            "meta": {
                "isDemo": True,
                "scenario": "cafe",
                "timestamp": datetime.now().isoformat()
            }
        }
    except Exception as e:
        return {
            "success": False,
            "message": "데모 데이터를 가져올 수 없습니다.",
            "error": str(e)
        }
```

## 📊 데모 데이터 상세

### 메인 매장 (카페)
- **이름**: "아늑한 카페 스토리"
- **카테고리**: cafe
- **위치**: 서울시 강남구 (가상 주소)
- **특징**: 커피, 휴식, 분위기, 수제디저트
- **외부 링크**: 인스타그램, 홈페이지

### 근처 Spot 4개
1. **달콤한 베이커리** (150m, 도보 2분)
   - 카테고리: bakery
   - 특징: 갓 구운 빵

2. **조용한 서점** (200m, 도보 3분)
   - 카테고리: bookstore
   - 특징: 책과 함께하는 시간

3. **꽃향기 플라워샵** (300m, 도보 4분)
   - 카테고리: flower
   - 특징: 싱싱한 꽃과 식물

4. **작은 갤러리** (250m, 도보 3분)
   - 카테고리: art
   - 특징: 예술과의 만남

## ⚠️ 중요 고려사항

### 1. 실제 운영과의 분리
- **절대 실제 DB 접근 금지**: 데모 API는 실제 운영 DB와 완전히 분리
- **별도 라우트 사용**: `/api/demo/*` 경로로 명확히 구분
- **통계 수집 금지**: 데모 사용에 대한 통계는 별도 관리 (실제 운영 통계와 분리)

### 2. 성능 요구사항
- **일관된 응답 시간**: 500ms ± 100ms 내외
- **높은 가용성**: 99.9% 이상 가용성 보장
- **캐싱 적용**: 데모 데이터는 변경되지 않으므로 적극적인 캐싱

### 3. 보안 고려사항
- **가상 데이터만 사용**: 실제 매장 정보 절대 사용 금지
- **Rate Limiting**: 과도한 요청 방지
- **CORS 설정**: 프론트엔드 도메인에서만 접근 허용

## 🚀 확장 계획

### 1. 다양한 데모 시나리오 (향후)
```
GET /api/demo/store?scenario=cafe      // 현재 구현
GET /api/demo/store?scenario=restaurant // 향후 추가
GET /api/demo/store?scenario=retail     // 향후 추가
```

### 2. 지역별 데모 (향후)
```
GET /api/demo/store?region=gangnam
GET /api/demo/store?region=hongdae
```

### 3. 개인화된 데모 (향후)
```
POST /api/demo/store/custom
{
  "businessType": "cafe",
  "region": "gangnam",
  "customization": { ... }
}
```

## 📈 모니터링 요구사항

### 1. 필수 지표
- API 응답 시간
- 에러율 (목표: 0.1% 이하)
- 요청 빈도
- 가용성 (목표: 99.9% 이상)

### 2. 로깅
- 모든 API 요청/응답 로깅
- 에러 발생 시 상세 로그
- 성능 지표 수집

### 3. 알림
- 응답 시간 1초 초과 시 알림
- 에러율 1% 초과 시 알림
- 서비스 다운 시 즉시 알림

## 🧪 테스트 요구사항

### 1. 단위 테스트
- 데모 데이터 구조 검증
- API 응답 형식 검증
- 에러 처리 로직 테스트

### 2. 통합 테스트
- 전체 API 플로우 테스트
- 프론트엔드와의 연동 테스트
- 성능 테스트 (응답 시간)

### 3. 부하 테스트
- 동시 접속자 100명 처리 가능
- 초당 50 요청 처리 가능
- 메모리 사용량 모니터링

## 📝 완료 체크리스트

### 개발 완료
- [ ] `/api/demo/store` 엔드포인트 구현
- [ ] 데모 데이터 구조 정의 및 구현
- [ ] 로딩 시뮬레이션 (500ms) 구현
- [ ] 에러 처리 로직 구현
- [ ] 응답 데이터 형식 검증

### 테스트 완료
- [ ] 단위 테스트 작성 및 통과
- [ ] 통합 테스트 작성 및 통과
- [ ] 프론트엔드 연동 테스트 완료
- [ ] 성능 테스트 완료 (응답 시간 500ms 이내)

### 배포 준비
- [ ] 환경 설정 완료
- [ ] 모니터링 설정 완료
- [ ] 로깅 설정 완료
- [ ] 문서화 완료

### 운영 준비
- [ ] 알림 설정 완료
- [ ] 백업 전략 수립
- [ ] 장애 대응 매뉴얼 작성
- [ ] 성능 기준선 설정

## 🤝 협업 가이드

### 프론트엔드와의 협업
1. **API 명세서 공유**: 이 문서를 프론트엔드 팀과 공유
2. **테스트 환경 제공**: 개발 중인 API를 테스트할 수 있는 환경 제공
3. **변경사항 공지**: API 변경 시 사전 공지 (최소 24시간 전)

### QA 팀과의 협업
1. **테스트 케이스 제공**: API 테스트를 위한 상세 케이스 제공
2. **버그 리포트 대응**: 24시간 내 버그 확인 및 수정 계획 제공
3. **성능 기준 공유**: 응답 시간, 에러율 등 성능 기준 명확히 공유

이 프롬프트를 바탕으로 SpotLine 데모 시스템의 백엔드 API를 구현해주세요. 궁금한 점이나 추가 요구사항이 있으면 언제든 문의해주세요!