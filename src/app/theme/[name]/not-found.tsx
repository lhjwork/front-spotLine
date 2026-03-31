import Link from "next/link";
import { Route } from "lucide-react";

export default function ThemeNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <Route className="mb-4 h-12 w-12 text-gray-300" />
      <h1 className="mb-2 text-lg font-bold text-gray-900">존재하지 않는 테마입니다</h1>
      <p className="mb-6 text-sm text-gray-500">요청하신 테마 페이지를 찾을 수 없습니다</p>
      <Link
        href="/feed"
        className="rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-purple-700"
      >
        피드로 이동
      </Link>
    </div>
  );
}
