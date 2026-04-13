"use client";

import { useState, useCallback } from "react";
import { Search, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddressData {
  address: string;
  latitude: number;
  longitude: number;
  area: string;
  sido: string;
  sigungu: string;
  dong: string;
}

interface AddressSearchProps {
  value: AddressData | null;
  onChange: (data: AddressData) => void;
}

export default function AddressSearch({ value, onChange }: AddressSearchProps) {
  const [isLoading, setIsLoading] = useState(false);

  const openDaumPostcode = useCallback(() => {
    const script = document.createElement("script");
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.onload = () => {
      new (window as any).daum.Postcode({
        oncomplete: async (data: any) => {
          const address = data.roadAddress || data.jibunAddress;
          const sido = data.sido;
          const sigungu = data.sigungu;
          const dong = data.bname;
          const area = `${sido} ${sigungu}`;

          setIsLoading(true);
          try {
            const coords = await geocodeAddress(address);
            onChange({
              address,
              latitude: coords.lat,
              longitude: coords.lng,
              area,
              sido,
              sigungu,
              dong,
            });
          } catch {
            onChange({ address, latitude: 0, longitude: 0, area, sido, sigungu, dong });
          } finally {
            setIsLoading(false);
          }
        },
      }).open();
    };
    document.head.appendChild(script);
  }, [onChange]);

  return (
    <div>
      <button
        type="button"
        onClick={openDaumPostcode}
        disabled={isLoading}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-left transition-colors hover:border-blue-400",
          value ? "border-blue-500 bg-blue-50" : "text-gray-400"
        )}
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate">
          {isLoading ? "주소 확인 중..." : value ? value.address : "주소를 검색해주세요"}
        </span>
      </button>
      {value && (
        <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="h-3.5 w-3.5" />
          <span>{value.area} · {value.dong}</span>
        </div>
      )}
    </div>
  );
}

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!(window as any).kakao?.maps?.services) {
      reject(new Error("Kakao Maps SDK not loaded"));
      return;
    }
    const geocoder = new (window as any).kakao.maps.services.Geocoder();
    geocoder.addressSearch(address, (result: any[], status: string) => {
      if (status === "OK" && result.length > 0) {
        resolve({ lat: parseFloat(result[0].y), lng: parseFloat(result[0].x) });
      } else {
        reject(new Error("Geocoding failed"));
      }
    });
  });
}
