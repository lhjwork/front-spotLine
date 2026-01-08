"use client";

import { useState } from "react";

interface PlaceholderImageProps {
  width: number;
  height: number;
  text: string;
  className?: string;
  backgroundColor?: string;
  textColor?: string;
}

export default function PlaceholderImage({
  width,
  height,
  text,
  className = "",
  backgroundColor = "#f3f4f6",
  textColor = "#6b7280"
}: PlaceholderImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // SVG 플레이스홀더 생성
  const createPlaceholderSVG = () => {
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${backgroundColor}"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="${textColor}" text-anchor="middle" dy=".3em">
          ${text}
        </text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={createPlaceholderSVG()}
        alt={text}
        width={width}
        height={height}
        className="w-full h-full object-cover"
        onLoad={() => setIsLoaded(true)}
      />
      {!isLoaded && (
        <div 
          className="absolute inset-0 flex items-center justify-center animate-pulse"
          style={{ backgroundColor }}
        >
          <span className="text-sm" style={{ color: textColor }}>
            로딩 중...
          </span>
        </div>
      )}
    </div>
  );
}