"use client";

import Link from "next/link";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import SpotStatusBadge from "./SpotStatusBadge";
import OptimizedImage from "@/components/common/OptimizedImage";
import type { SpotDetailResponse } from "@/types";

interface MySpotCardProps {
  spot: SpotDetailResponse;
  onDelete: (slug: string) => void;
}

export default function MySpotCard({ spot, onDelete }: MySpotCardProps) {
  const isEditable = spot.status === "PENDING" || spot.status === "REJECTED";
  const firstImage = spot.mediaItems?.[0]?.url || spot.media?.[0] || null;

  return (
    <div className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3">
      {/* Thumbnail */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {firstImage ? (
          <OptimizedImage
            src={firstImage}
            alt={spot.title}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl text-gray-300">
            📍
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={`/spot/${spot.slug}`}
              className="truncate text-sm font-semibold text-gray-900 hover:underline"
            >
              {spot.title}
            </Link>
            <SpotStatusBadge status={spot.status} />
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{spot.address}</span>
          </p>
        </div>

        {/* Rejection reason */}
        {spot.status === "REJECTED" && spot.rejectionReason && (
          <p className="mt-1 text-xs text-red-600">
            반려 사유: {spot.rejectionReason}
          </p>
        )}

        {/* Actions */}
        <div className="mt-1.5 flex items-center gap-2">
          {isEditable && (
            <Link
              href={`/my-spots/${spot.slug}/edit`}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
            >
              <Pencil className="h-3 w-3" />
              수정
            </Link>
          )}
          <button
            onClick={() => onDelete(spot.slug)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-500 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3" />
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
