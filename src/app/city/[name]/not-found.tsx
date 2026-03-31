import Link from "next/link";
import { MapPin } from "lucide-react";

export default function CityNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <MapPin className="mb-4 h-12 w-12 text-gray-300" />
      <h1 className="mb-2 text-lg font-bold text-gray-900">존재하지 않는 도시입니다</h1>
      <p className="mb-6 text-sm text-gray-500">요청하신 도시 페이지를 찾을 수 없습니다</p>
      <Link
        href="/feed"
        className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        피드로 이동
      </Link>
    </div>
  );
}
