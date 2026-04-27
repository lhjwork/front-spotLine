import type { SpotDetailResponse, SpotLineDetailResponse, SpotCategory, CollectionDetail } from "@/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://spotline.kr";

const CATEGORY_SCHEMA_MAP: Record<SpotCategory, string> = {
  CAFE: "CafeOrCoffeeShop",
  RESTAURANT: "Restaurant",
  BAR: "BarOrPub",
  NATURE: "Park",
  WALK: "Park",
  CULTURE: "Museum",
  EXHIBITION: "Museum",
  ACTIVITY: "TouristAttraction",
  SHOPPING: "Store",
  OTHER: "LocalBusiness",
};

/** Spot → LocalBusiness (또는 하위 타입) JSON-LD */
export function generateSpotJsonLd(spot: SpotDetailResponse): Record<string, unknown> {
  const schemaType = CATEGORY_SCHEMA_MAP[spot.category] || "LocalBusiness";
  const url = `${SITE_URL}/spot/${spot.slug}`;
  const description = spot.crewNote || spot.description || `${spot.area}의 ${spot.title}`;

  const images: string[] = [
    ...(spot.placeInfo?.photos || []),
    ...spot.media,
    ...spot.mediaItems.map((m) => m.url),
  ].filter(Boolean);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: spot.title,
    description,
    url,
    address: {
      "@type": "PostalAddress",
      streetAddress: spot.address,
      addressLocality: spot.area,
      addressRegion: spot.sido || "서울",
      addressCountry: "KR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: spot.latitude,
      longitude: spot.longitude,
    },
  };

  if (images.length > 0) {
    jsonLd.image = images;
  }

  if (spot.placeInfo) {
    if (spot.placeInfo.phone) {
      jsonLd.telephone = spot.placeInfo.phone;
    }
    if (spot.placeInfo.dailyHours) {
      const dayMap: Record<string, string> = {
        "월": "Monday", "화": "Tuesday", "수": "Wednesday",
        "목": "Thursday", "금": "Friday", "토": "Saturday", "일": "Sunday",
      };
      jsonLd.openingHoursSpecification = spot.placeInfo.dailyHours
        .filter((h) => h.timeSE)
        .map((h) => {
          const match = h.timeSE.match(/(\d{1,2}:\d{2})~(\d{1,2}:\d{2})/);
          return match
            ? {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: dayMap[h.day] || h.day,
                opens: match[1],
                closes: match[2],
              }
            : null;
        })
        .filter(Boolean);
    } else if (spot.placeInfo.businessHours) {
      jsonLd.openingHours = spot.placeInfo.businessHours;
    }
    if (spot.placeInfo.menuItems?.length) {
      jsonLd.hasMenu = {
        "@type": "Menu",
        hasMenuSection: {
          "@type": "MenuSection",
          hasMenuItem: spot.placeInfo.menuItems.slice(0, 5).map((m) => ({
            "@type": "MenuItem",
            name: m.name,
            ...(m.price && {
              offers: {
                "@type": "Offer",
                price: m.price.replace(/[^0-9]/g, ""),
                priceCurrency: "KRW",
              },
            }),
          })),
        },
      };
    }
    if (spot.placeInfo.rating != null && spot.placeInfo.reviewCount != null && spot.placeInfo.reviewCount > 0) {
      jsonLd.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: spot.placeInfo.rating,
        reviewCount: spot.placeInfo.reviewCount,
      };
    }
  }

  return jsonLd;
}

/** SpotLine → TouristTrip + ItemList JSON-LD */
export function generateSpotLineJsonLd(spotLine: SpotLineDetailResponse): Record<string, unknown> {
  const url = `${SITE_URL}/spotline/${spotLine.slug}`;
  const description = spotLine.description || `${spotLine.area}의 ${spotLine.title} - ${spotLine.spots.length}곳`;

  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: spotLine.title,
    description,
    url,
    touristType: spotLine.theme,
    itinerary: {
      "@type": "ItemList",
      numberOfItems: spotLine.spots.length,
      itemListElement: spotLine.spots.map((spot) => ({
        "@type": "ListItem",
        position: spot.order + 1,
        item: {
          "@type": "Place",
          name: spot.spotTitle,
          address: spot.spotAddress,
        },
      })),
    },
  };
}

/** Organization JSON-LD (layout.tsx) */
export function generateOrganizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Spotline",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: "QR 기반 로컬 연결 서비스. 경험을 기록하고 공유하는 소셜 플랫폼.",
    sameAs: [],
  };
}

/** WebSite + SearchAction JSON-LD (루트 레이아웃용) */
export function generateWebSiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Spotline",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Collection → CollectionPage JSON-LD */
export function generateCollectionJsonLd(collection: CollectionDetail): Record<string, unknown> {
  const url = `${SITE_URL}/collection/${collection.slug}`;
  const description = collection.description || `${collection.area}의 ${collection.title}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.title,
    description,
    url,
    numberOfItems: collection.itemCount,
    hasPart: collection.items.map((item) => ({
      "@type": item.itemType === "SPOT" ? "Place" : "TouristTrip",
      name: item.itemType === "SPOT" ? item.spotTitle : item.spotLineTitle,
      ...(item.itemType === "SPOT" && item.spotSlug
        ? { url: `${SITE_URL}/spot/${item.spotSlug}` }
        : item.spotLineSlug
          ? { url: `${SITE_URL}/spotline/${item.spotLineSlug}` }
          : {}),
    })),
  };
}

/** BreadcrumbList JSON-LD */
export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; url?: string }>
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.url ? { item: `${SITE_URL}${item.url}` } : {}),
    })),
  };
}
