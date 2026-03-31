import type { CityInfo } from "@/types";

export const CITIES: CityInfo[] = [
  { slug: "seongsu", name: "성수", area: "성수", description: "성수의 인기 카페, 맛집, 문화 공간을 만나보세요" },
  { slug: "euljiro", name: "을지로", area: "을지로", description: "을지로의 레트로 감성 카페와 맛집을 탐색하세요" },
  { slug: "yeonnam", name: "연남", area: "연남", description: "연남동의 감성 카페와 숨은 맛집을 발견하세요" },
  { slug: "hongdae", name: "홍대", area: "홍대", description: "홍대의 활기찬 문화와 다양한 맛집을 즐겨보세요" },
  { slug: "itaewon", name: "이태원", area: "이태원", description: "이태원의 글로벌 맛집과 독특한 문화를 경험하세요" },
  { slug: "hannam", name: "한남", area: "한남", description: "한남동의 세련된 카페와 갤러리를 둘러보세요" },
  { slug: "jongno", name: "종로", area: "종로", description: "종로의 전통과 현대가 어우러진 경험을 만나보세요" },
];

export const findCityBySlug = (slug: string): CityInfo | undefined =>
  CITIES.find((c) => c.slug === slug);
