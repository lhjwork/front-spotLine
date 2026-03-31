"use client";

import { cn } from "@/lib/utils";

interface DiscoverSkeletonProps {
  className?: string;
}

export default function DiscoverSkeleton({ className }: DiscoverSkeletonProps) {
  return (
    <div className={cn("", className)}>
      {/* ExploreNavBar skeleton */}
      <nav className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="flex animate-pulse gap-2 px-4 pb-2 pt-3" style={{ animationDelay: "0ms" }}>
          <div className="h-8 w-14 rounded-full bg-gray-200" />
          <div className="h-8 w-14 rounded-full bg-gray-200" />
        </div>
        <div className="flex gap-2 overflow-hidden px-4 pb-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-7 w-12 shrink-0 animate-pulse rounded-full bg-gray-200" />
          ))}
        </div>
      </nav>

      <div className="space-y-6 px-4 py-6">
        {/* Location header skeleton */}
        <div className="flex animate-pulse items-center gap-2" style={{ animationDelay: "150ms" }}>
          <div className="h-5 w-5 rounded-full bg-gray-200" />
          <div className="h-5 w-32 rounded bg-gray-200" />
        </div>

        {/* Current spot block skeleton */}
        <div
          className="animate-pulse rounded-2xl border border-blue-100 bg-white p-4 shadow-sm"
          style={{ animationDelay: "300ms" }}
        >
          <div className="mb-3 h-4 w-24 rounded bg-blue-100" />
          <div className="mb-3 h-48 w-full rounded-xl bg-gray-200" />
          <div className="mb-2 h-6 w-48 rounded bg-gray-200" />
          <div className="h-4 w-full rounded bg-gray-100" />
        </div>

        {/* Transition info skeleton */}
        <div
          className="flex animate-pulse items-center justify-center gap-2 py-2"
          style={{ animationDelay: "450ms" }}
        >
          <div className="h-8 w-8 rounded-full bg-gray-200" />
          <div className="h-4 w-24 rounded bg-gray-200" />
        </div>

        {/* Next spot block skeleton */}
        <div
          className="animate-pulse rounded-2xl border border-green-100 bg-white p-4 shadow-sm"
          style={{ animationDelay: "600ms" }}
        >
          <div className="mb-3 h-4 w-24 rounded bg-green-100" />
          <div className="mb-3 h-48 w-full rounded-xl bg-gray-200" />
          <div className="mb-2 h-6 w-48 rounded bg-gray-200" />
          <div className="h-4 w-full rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}
