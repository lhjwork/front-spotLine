import { NextResponse } from 'next/server';

// 더 안정적인 Picsum Photos 서비스를 활용한 데모 데이터
const DEMO_STORE_DATA = {
  id: "demo-store",
  name: "아늑한 카페 스토리",
  shortDescription: "따뜻한 분위기의 동네 카페",
  representativeImage: "https://picsum.photos/seed/cafe-main/800/600",
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
    content: "바쁜 일상 속에서 잠시 멈춰 서서 향긋한 커피 한 잔과 함께하는 소중한 시간을 선사합니다. 정성스럽게 내린 원두커피와 수제 디저트로 특별한 순간을 만들어보세요.",
    tags: ["커피", "휴식", "분위기", "수제디저트"]
  },
  externalLinks: [
    {
      type: "instagram",
      url: "https://instagram.com/demo_cafe",
      title: "인스타그램"
    },
    {
      type: "website", 
      url: "https://demo-cafe.com",
      title: "홈페이지"
    }
  ],
  demoNotice: "이것은 SpotLine 서비스 소개용 데모입니다. 실제 매장이 아닙니다."
};

// 데모 근처 Spot 데이터 (더 안정적인 Picsum Photos 서비스 활용)
const DEMO_NEXT_SPOTS_DATA = [
  {
    id: "demo_bakery_001",
    name: "달콤한 베이커리",
    shortDescription: "갓 구운 빵의 향기",
    representativeImage: "https://picsum.photos/seed/bakery-spot/400/300",
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
    representativeImage: "https://picsum.photos/seed/bookstore-spot/400/300",
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
    representativeImage: "https://picsum.photos/seed/flower-spot/400/300",
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
    representativeImage: "https://picsum.photos/seed/gallery-spot/400/300",
    category: "art",
    distance: 250,
    walkingTime: 3,
    spotlineStory: {
      title: "예술이 있는 공간",
      content: "지역 작가들의 작품을 감상하며 영감을 얻어보세요."
    }
  }
];

export async function GET() {
  try {
    // 로딩 시뮬레이션 (실제 DB 조회하는 것처럼)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json({
      success: true,
      data: {
        store: DEMO_STORE_DATA,
        nextSpots: DEMO_NEXT_SPOTS_DATA
      },
      message: "데모 데이터를 성공적으로 가져왔습니다.",
      meta: {
        isDemo: true,
        scenario: "cafe",
        timestamp: new Date().toISOString(),
        imageSource: "picsum" // 이미지 출처 명시
      }
    });
  } catch (error) {
    console.error('데모 데이터 조회 오류:', error);
    return NextResponse.json({
      success: false,
      message: "데모 데이터를 가져올 수 없습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류"
    }, { status: 500 });
  }
}