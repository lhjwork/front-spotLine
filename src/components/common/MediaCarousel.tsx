"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import OptimizedImage from "@/components/common/OptimizedImage";
import VideoPlayer from "@/components/common/VideoPlayer";
import { isVideoMedia } from "@/lib/media";
import type { SpotMediaItem } from "@/types";

interface MediaCarouselProps {
  items: SpotMediaItem[];
  alt: string;
  className?: string;
}

export default function MediaCarousel({ items, alt, className }: MediaCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setCurrentIndex(index);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if (items.length === 0) return null;

  if (items.length === 1) {
    const item = items[0];
    return (
      <div className={cn("relative w-full h-full overflow-hidden", className)}>
        {isVideoMedia(item) ? (
          <VideoPlayer
            src={item.url}
            poster={item.thumbnailUrl}
            durationSec={item.durationSec}
          />
        ) : (
          <OptimizedImage
            src={item.url}
            alt={alt}
            fill
            className="object-cover"
          />
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative w-full h-full", className)}>
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            className="flex-none w-full h-full snap-center"
          >
            {isVideoMedia(item) ? (
              <VideoPlayer
                src={item.url}
                poster={item.thumbnailUrl}
                durationSec={item.durationSec}
              />
            ) : (
              <div className="relative w-full h-full">
                <OptimizedImage
                  src={item.url}
                  alt={`${alt} ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Counter badge */}
      <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
        {currentIndex + 1}/{items.length}
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
        {items.map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-colors",
              index === currentIndex ? "bg-white" : "bg-white/50"
            )}
          />
        ))}
      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
    </div>
  );
}
