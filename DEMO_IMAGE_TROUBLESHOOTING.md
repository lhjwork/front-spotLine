# 데모 이미지 문제 해결 가이드

## 🔍 현재 상황 확인

### ✅ 백엔드 API 응답 확인됨
```json
{
  "success": true,
  "data": {
    "store": {
      "representativeImage": "https://picsum.photos/800/600?random=1"
    },
    "nextSpots": [
      {
        "representativeImage": "https://picsum.photos/400/300?random=2"
      }
      // ... 나머지 3개 Spot
    ]
  },
  "meta": {
    "imageSource": "picsum"
  }
}
```

### 🌐 이미지 URL 테스트
- **메인 이미지**: https://picsum.photos/800/600?random=1
- **Spot 이미지들**: https://picsum.photos/400/300?random=2,3,4,5

## 🛠️ 문제 해결 방법

### 1. 브라우저에서 직접 확인
브라우저 주소창에 다음 URL을 입력해서 이미지가 로딩되는지 확인:
```
https://picsum.photos/800/600?random=1
```

### 2. 개발자 도구 Network 탭 확인
1. 데모 페이지 접속: `http://localhost:3004/spotline/demo-store?qr=demo_cafe_001`
2. F12 → Network 탭 열기
3. 페이지 새로고침
4. 이미지 요청들의 상태 코드 확인

### 3. 대안 1: 더 안정적인 이미지 서비스
만약 Picsum이 불안정하다면 다른 서비스로 변경:

```javascript
// 백엔드 API에서 변경
representativeImage: "https://via.placeholder.com/800x600/8f7a66/ffffff?text=Cafe"
```

### 4. 대안 2: 로컬 이미지 파일 사용
완전히 안정적인 방법으로 로컬 이미지 사용:

```javascript
// 백엔드 API에서 변경
representativeImage: "/images/demo-cafe.jpg"
```

### 5. 대안 3: Base64 인코딩 이미지
네트워크에 의존하지 않는 방법:

```javascript
representativeImage: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4..."
```

## 🔧 즉시 적용 가능한 해결책

### Option A: Via Placeholder 사용 (가장 안정적)
```javascript
const DEMO_STORE_DATA = {
  representativeImage: "https://via.placeholder.com/800x600/8f7a66/ffffff?text=Cozy+Cafe",
  // ...
};

const DEMO_NEXT_SPOTS_DATA = [
  {
    representativeImage: "https://via.placeholder.com/400x300/d4a574/ffffff?text=Bakery",
    // ...
  },
  {
    representativeImage: "https://via.placeholder.com/400x300/7a9cc6/ffffff?text=Bookstore",
    // ...
  },
  {
    representativeImage: "https://via.placeholder.com/400x300/c67a9c/ffffff?text=Flower+Shop",
    // ...
  },
  {
    representativeImage: "https://via.placeholder.com/400x300/9cc67a/ffffff?text=Gallery",
    // ...
  }
];
```

### Option B: 로컬 이미지 파일 사용
```javascript
const DEMO_STORE_DATA = {
  representativeImage: "/images/demo-cafe.jpg",
  // ...
};
```

## 🎯 권장사항

1. **즉시 해결**: Via Placeholder 사용 (Option A)
2. **장기적**: 실제 이미지 파일을 서버에 업로드하여 사용
3. **프로덕션**: CDN 서비스 (Cloudinary, AWS S3 등) 사용

## 📞 다음 단계

어떤 방법을 선택하시겠습니까?

1. **Via Placeholder로 즉시 변경** → 100% 안정적
2. **로컬 이미지 파일 생성** → 완전한 제어
3. **다른 이미지 서비스 시도** → Unsplash API 키 사용 등

선택해주시면 바로 적용해드리겠습니다! 🚀