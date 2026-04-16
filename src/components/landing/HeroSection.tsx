import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white px-4 py-16 text-center lg:py-24">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 lg:text-5xl">
          다음 장소,
          <br />
          Spotline이 추천해요
        </h1>
        <p className="mt-4 text-lg text-gray-600 lg:text-xl">
          지금 있는 장소에서 다음에 가기 좋은 곳을 발견하세요
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/feed"
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 sm:w-auto"
          >
            SpotLine 둘러보기
          </Link>
          <Link
            href="/qr/demo_cafe_001"
            className="w-full rounded-lg border border-blue-600 px-6 py-3 font-semibold text-blue-600 transition-colors hover:bg-blue-50 sm:w-auto"
          >
            데모 체험하기
          </Link>
        </div>
      </div>
    </section>
  );
}
