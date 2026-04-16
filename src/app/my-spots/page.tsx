import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import MySpotsList from "@/components/spot/MySpotsList";

export const metadata: Metadata = {
  title: "내 Spot — Spotline",
  description: "내가 등록한 Spot을 관리합니다.",
};

export default function MySpotsPage() {
  return (
    <div className="mx-auto min-h-screen max-w-lg bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">내 Spot</h1>
        <Link
          href="/create-spot"
          className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          새 Spot
        </Link>
      </div>

      {/* Content */}
      <div className="p-4">
        <MySpotsList />
      </div>
    </div>
  );
}
