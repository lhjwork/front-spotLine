import Link from "next/link";
import { MapPin } from "lucide-react";

export default function SpotNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <MapPin className="mb-4 h-16 w-16 text-gray-300" />
      <h1 className="mb-2 text-xl font-bold text-gray-900">
        Spot을 찾을 수 없습니다
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        삭제되었거나 잘못된 주소입니다.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        홈으로 돌아가기
      </Link>
    </main>
  );
}
