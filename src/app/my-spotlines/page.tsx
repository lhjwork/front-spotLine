import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import MySpotLinesList from "@/components/spotline/MySpotLinesList";

export const metadata: Metadata = {
  title: "내 일정 | Spotline",
  description: "복제한 SpotLine을 관리하고 완주를 기록하세요",
};

export default function MySpotLinesPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center border-b border-gray-200 bg-white px-4 py-3">
        <Link href="/feed" className="mr-3 rounded-full p-1 hover:bg-gray-100">
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        </Link>
        <h1 className="text-lg font-bold text-gray-900">내 일정</h1>
      </header>

      <MySpotLinesList />
    </main>
  );
}
