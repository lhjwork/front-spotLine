interface QrBannerProps {
  storeName: string;
}

export default function QrBanner({ storeName }: QrBannerProps) {
  return (
    <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
      <div className="flex items-center">
        <span className="shrink-0 text-lg text-green-600">📍</span>
        <p className="ml-3 text-sm text-green-800">
          <span className="font-semibold">현재 방문 중인 매장</span> — QR 코드로 접속하셨습니다
        </p>
      </div>
    </div>
  );
}
