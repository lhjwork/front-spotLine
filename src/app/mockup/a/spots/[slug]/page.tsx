"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Star,
  Heart,
  Share2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Navigation,
  Instagram,
  Globe,
  User,
  Calendar,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";

// 상세 목업 데이터
const SPOT_DETAILS: Record<string, {
  name: string;
  category: string;
  area: string;
  address: string;
  description: string;
  image: string;
  images: string[];
  rating: number;
  tags: string[];
  author: string;
  date: string;
  story: { title: string; content: string };
  externalLinks: { type: string; url: string; title: string }[];
  nextSpots: {
    id: string;
    name: string;
    category: string;
    description: string;
    image: string;
    distance: number;
    walkingTime: number;
    rating: number;
    reason: string;
  }[];
}> = {
  "ondo-coffee": {
    name: "온도 커피",
    category: "카페",
    area: "성수",
    address: "서울 성동구 성수이로 12길 21",
    description: "핸드드립 전문 카페. 조용한 분위기에서 원두의 풍미를 즐길 수 있는 곳.",
    image: "https://picsum.photos/seed/cafe1/800/600",
    images: [
      "https://picsum.photos/seed/cafe1-1/400/300",
      "https://picsum.photos/seed/cafe1-2/400/300",
      "https://picsum.photos/seed/cafe1-3/400/300",
    ],
    rating: 4.8,
    tags: ["핸드드립", "디저트", "작업하기 좋은", "조용한"],
    author: "크루 민지",
    date: "2026.03.05",
    story: {
      title: "성수에서 찾은 조용한 커피 한 잔",
      content:
        "성수동의 번화한 거리에서 조금 벗어난 골목에 위치한 온도 커피. 입구는 소박하지만, 문을 열고 들어서면 따뜻한 조명과 원목 인테리어가 맞아줍니다.\n\n이곳의 시그니처는 단연 핸드드립 커피. 바리스타가 직접 선별한 싱글 오리진 원두로, 주문이 들어오면 한 잔 한 잔 정성스럽게 내려줍니다. 에티오피아 예가체프의 꽃향기와 과일 같은 산미가 특히 인상적이었습니다.\n\n2층에는 조용한 작업 공간이 마련되어 있어, 노트북을 가져와 작업하기에도 좋습니다. 다만 점심시간에는 꽤 붐비니 오전이나 오후 늦게 방문하는 것을 추천드립니다.\n\n수제 디저트도 빼놓을 수 없는데, 특히 당근 케이크와 스콘이 커피와 완벽한 궁합을 이룹니다.",
    },
    externalLinks: [
      { type: "instagram", url: "#", title: "@ondo_coffee" },
      { type: "website", url: "#", title: "홈페이지" },
    ],
    nextSpots: [
      {
        id: "eulji-gallery",
        name: "을지 갤러리",
        category: "전시",
        description: "현대미술 기획전이 열리는 소규모 갤러리",
        image: "https://picsum.photos/seed/gallery1/400/300",
        distance: 280,
        walkingTime: 4,
        rating: 4.6,
        reason: "커피 후 가볍게 문화생활",
      },
      {
        id: "moment-shop",
        name: "소품샵 모먼트",
        category: "쇼핑",
        description: "감성적인 소품과 문구를 큐레이션하는 작은 가게",
        image: "https://picsum.photos/seed/shop1/400/300",
        distance: 150,
        walkingTime: 2,
        rating: 4.5,
        reason: "바로 옆 골목의 숨겨진 소품샵",
      },
      {
        id: "mido-restaurant",
        name: "미도식당",
        category: "맛집",
        description: "40년 전통의 수제 돈까스",
        image: "https://picsum.photos/seed/restaurant1/400/300",
        distance: 200,
        walkingTime: 3,
        rating: 4.9,
        reason: "근처에서 점심 먹기 좋은 곳",
      },
    ],
  },
};

// 기본 데이터 (slug가 없을 때)
const DEFAULT_SPOT = SPOT_DETAILS["ondo-coffee"];

export default function SpotDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const spot = SPOT_DETAILS[slug] || DEFAULT_SPOT;

  const [liked, setLiked] = useState(false);
  const [storyExpanded, setStoryExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <Layout showFooter={false} showHeader={false}>
      <div className="max-w-2xl mx-auto bg-white min-h-screen">
        {/* 히어로 이미지 */}
        <div className="relative h-72 md:h-96 bg-gray-200">
          <img
            src={spot.image}
            alt={spot.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* 상단 네비게이션 */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
            <Link
              href="/mockup/a/explore"
              className="flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLiked(!liked)}
                className="flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow"
              >
                <Heart
                  className={`h-5 w-5 ${
                    liked ? "text-red-500 fill-red-500" : "text-gray-700"
                  }`}
                />
              </button>
              <button className="flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow">
                <Share2 className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          </div>

          {/* 하단 기본 정보 오버레이 */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                {spot.category}
              </span>
              <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                {spot.area}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
              {spot.name}
            </h1>
            <p className="text-white/80 text-sm">{spot.description}</p>
          </div>
        </div>

        {/* 이미지 갤러리 */}
        <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {spot.images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedImage(i)}
              className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                selectedImage === i ? "border-blue-600" : "border-transparent"
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* 메타 정보 */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-bold">{spot.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-4 w-4" />
                <span>{spot.address}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {spot.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {spot.date}
            </span>
          </div>

          {/* 태그 */}
          <div className="flex flex-wrap gap-2 mt-3">
            {spot.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* 외부 링크 */}
        <div className="px-4 py-3 flex gap-2 border-b border-gray-100">
          {spot.externalLinks.map((link) => (
            <button
              key={link.type}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {link.type === "instagram" ? (
                <Instagram className="h-4 w-4" />
              ) : (
                <Globe className="h-4 w-4" />
              )}
              {link.title}
              <ExternalLink className="h-3 w-3 text-gray-400" />
            </button>
          ))}
          <button
            onClick={() =>
              window.open(
                `https://map.kakao.com/link/search/${encodeURIComponent(spot.name + " " + spot.address)}`,
                "_blank",
                "noopener,noreferrer"
              )
            }
            className="flex items-center gap-1.5 px-3 py-2 bg-yellow-50 rounded-lg text-sm text-yellow-700 hover:bg-yellow-100 transition-colors"
          >
            <Navigation className="h-4 w-4" />
            카카오맵
            <ExternalLink className="h-3 w-3 text-yellow-400" />
          </button>
          <button
            onClick={() =>
              window.open(
                `https://map.naver.com/v5/search/${encodeURIComponent(spot.name + " " + spot.address)}`,
                "_blank",
                "noopener,noreferrer"
              )
            }
            className="flex items-center gap-1.5 px-3 py-2 bg-green-50 rounded-lg text-sm text-green-700 hover:bg-green-100 transition-colors"
          >
            <Navigation className="h-4 w-4" />
            네이버지도
            <ExternalLink className="h-3 w-3 text-green-400" />
          </button>
        </div>

        {/* SpotLine Story (확장 가능) */}
        <div className="px-4 py-5">
          <button
            onClick={() => setStoryExpanded(!storyExpanded)}
            className="w-full text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-900">
                {spot.story.title}
              </h2>
              {storyExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </button>

          <div
            className={`text-sm text-gray-700 leading-relaxed whitespace-pre-line transition-all ${
              storyExpanded ? "" : "line-clamp-4"
            }`}
          >
            {spot.story.content}
          </div>

          {!storyExpanded && (
            <button
              onClick={() => setStoryExpanded(true)}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              더 읽기
            </button>
          )}
        </div>

        {/* 다음 Spot 추천 */}
        <div className="px-4 py-6 bg-gray-50">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-5 bg-blue-600 rounded-full" />
            <h2 className="text-lg font-bold text-gray-900">
              여기서 이어지는 다음 Spot
            </h2>
          </div>
          <p className="text-sm text-gray-500 mb-5 ml-3.5">
            {spot.name}에서 가까운 추천 장소
          </p>

          <div className="space-y-3">
            {spot.nextSpots.map((next) => (
              <Link
                key={next.id}
                href={`/mockup/a/spots/${next.id}`}
                className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex">
                  {/* 이미지 */}
                  <div className="relative w-28 h-28 shrink-0 bg-gray-200">
                    <img
                      src={next.image}
                      alt={next.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 p-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded">
                          {next.category}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-gray-600">
                            {next.rating}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm">
                        {next.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {next.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="h-3 w-3" />
                          {next.distance}m
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          {next.walkingTime}분
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 추천 이유 */}
                <div className="px-3 pb-3">
                  <div className="text-xs text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg inline-block">
                    {next.reason}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 하단 고정 바 */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3">
          <button
            onClick={() =>
              window.open(
                `https://map.kakao.com/link/search/${encodeURIComponent(spot.name + " " + spot.address)}`,
                "_blank",
                "noopener,noreferrer"
              )
            }
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-yellow-500 text-white rounded-xl font-medium hover:bg-yellow-600 transition-colors"
          >
            <Navigation className="h-4 w-4" />
            카카오맵
          </button>
          <button
            onClick={() =>
              window.open(
                `https://map.naver.com/v5/search/${encodeURIComponent(spot.name + " " + spot.address)}`,
                "_blank",
                "noopener,noreferrer"
              )
            }
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
          >
            <Navigation className="h-4 w-4" />
            네이버지도
          </button>
          <button className="flex items-center justify-center gap-2 py-3 px-5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            <Share2 className="h-4 w-4" />
            공유
          </button>
        </div>
      </div>
    </Layout>
  );
}
