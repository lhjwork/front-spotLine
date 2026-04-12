"use client";

import { useState } from "react";

interface SpotMapPreviewProps {
  latitude: number;
  longitude: number;
  title: string;
  kakaoPlaceId: string | null;
}

export default function SpotMapPreview({ latitude, longitude, title, kakaoPlaceId }: SpotMapPreviewProps) {
  const [error, setError] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;

  if (!apiKey || error) return null;

  const mapUrl = kakaoPlaceId
    ? `https://place.map.kakao.com/${kakaoPlaceId}`
    : `https://map.kakao.com/?q=${encodeURIComponent(title)}`;

  const staticMapUrl = `https://dapi.kakao.com/v2/maps/staticmap?appkey=${apiKey}&center=${longitude},${latitude}&level=3&size=640x200&markers=type:default_red|pos:${longitude}%20${latitude}`;

  return (
    <section className="mt-4 overflow-hidden rounded-2xl border border-gray-100">
      <a href={mapUrl} target="_blank" rel="noopener noreferrer">
        <img
          src={staticMapUrl}
          alt={`${title} 위치`}
          className="h-[140px] w-full object-cover md:h-[200px]"
          loading="lazy"
          onError={() => setError(true)}
        />
      </a>
    </section>
  );
}
