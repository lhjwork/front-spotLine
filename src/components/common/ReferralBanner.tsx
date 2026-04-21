"use client";

export interface ReferralBannerProps {
  referrerId: string;
}

export function ReferralBanner({ referrerId }: ReferralBannerProps) {
  return (
    <div className="bg-primary/5 border-b border-primary/10 px-4 py-2 text-center text-sm text-primary">
      친구가 공유한 콘텐츠입니다
    </div>
  );
}
