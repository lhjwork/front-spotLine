"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CloudSun } from "lucide-react";
import { getNowRecommendations } from "@/lib/api";
import OptimizedImage from "@/components/common/OptimizedImage";
import WeatherBadge from "@/components/common/WeatherBadge";
import type { NowRecommendedSpot, WeatherInfo, TimeOfDay } from "@/types";

const WEATHER_LABEL: Record<string, string> = {
  SUNNY: "맑음",
  CLOUDY: "흐림",
  RAINY: "비",
  SNOWY: "눈",
  ANY: "보통",
};

const TIME_LABEL: Record<string, string> = {
  DAWN: "새벽",
  MORNING: "오전",
  AFTERNOON: "오후",
  SUNSET: "일몰",
  NIGHT: "밤",
  ANY: "",
};

export default function NowRecommendationSection() {
  const [spots, setSpots] = useState<NowRecommendedSpot[]>([]);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [timeContext, setTimeContext] = useState<TimeOfDay | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLoaded(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        getNowRecommendations(latitude, longitude, 10)
          .then((res) => {
            setWeather(res.weather);
            setSpots(res.spots);
            setTimeContext(res.timeContext);
          })
          .catch(() => {})
          .finally(() => setLoaded(true));
      },
      () => setLoaded(true),
      { timeout: 5000 }
    );
  }, []);

  if (!loaded || spots.length === 0) return null;

  const weatherText = weather
    ? `${Math.round(weather.temperature)}° ${WEATHER_LABEL[weather.condition] || ""}`
    : "";
  const timeText = timeContext ? TIME_LABEL[timeContext] : "";
  const heading = [timeText, weatherText].filter(Boolean).join(" · ");

  return (
    <section className="px-4 py-3">
      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
        <CloudSun className="h-4 w-4 text-sky-500" />
        지금 가기 좋은 곳
        {heading && (
          <span className="ml-1 text-xs font-normal text-sky-600">{heading}</span>
        )}
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {spots.map((spot) => (
          <Link
            key={spot.id}
            href={`/spot/${spot.slug}`}
            className="w-44 shrink-0"
          >
            <div className="relative h-28 w-full overflow-hidden rounded-xl bg-gray-100">
              {spot.thumbnailUrl ? (
                <OptimizedImage
                  src={spot.thumbnailUrl}
                  alt={spot.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl text-gray-300">
                  📍
                </div>
              )}
              {spot.contextScore >= 0.8 && (
                <span className="absolute right-1.5 top-1.5 rounded-full bg-sky-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  지금 딱!
                </span>
              )}
            </div>
            <p className="mt-1.5 truncate text-sm font-medium text-gray-900">
              {spot.title}
            </p>
            {spot.crewNote && (
              <p className="truncate text-xs text-gray-500">{spot.crewNote}</p>
            )}
            <WeatherBadge
              timeOfDay={spot.bestTimeOfDay}
              weather={spot.bestWeatherCondition}
              isIndoor={spot.isIndoor}
              className="mt-1"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
