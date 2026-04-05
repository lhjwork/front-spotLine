import Link from "next/link";
import { Plus } from "lucide-react";

export default function FeedCreateCTA() {
  return (
    <Link
      href="/create-spotline"
      className="flex items-center gap-3 rounded-xl border border-dashed border-purple-200 bg-purple-50/30 p-4 transition-colors hover:bg-purple-50/60"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
        <Plus className="h-5 w-5 text-purple-600" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">나만의 SpotLine 만들기</p>
        <p className="text-xs text-gray-500">좋아하는 장소를 모아 나만의 코스를 만들어보세요</p>
      </div>
    </Link>
  );
}
