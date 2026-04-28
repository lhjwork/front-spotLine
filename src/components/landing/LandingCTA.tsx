import Link from "next/link";

export default function LandingCTA() {
  return (
    <section className="bg-blue-600 px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-2xl font-bold text-white lg:text-3xl">
          나만의 SpotLine을 만들어보세요
        </h2>
        <p className="mt-3 text-blue-100">
          좋아하는 장소를 연결해 나만의 코스를 만들고 공유하세요
        </p>
        <Link
          href="/feed"
          className="mt-6 inline-block rounded-lg bg-white px-8 py-3 font-semibold text-blue-600 transition-colors hover:bg-blue-50"
        >
          시작하기
        </Link>
      </div>
    </section>
  );
}
