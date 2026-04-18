import type { Metadata } from "next";
import PartnerApplyForm from "@/components/partner/PartnerApplyForm";

export const metadata: Metadata = {
  title: "파트너 신청 | Spotline",
  description: "매장을 Spotline 파트너로 등록하고 QR 코드로 고객에게 특별한 혜택을 제공하세요.",
  openGraph: {
    title: "파트너 신청 | Spotline",
    description: "매장을 Spotline 파트너로 등록하고 QR 코드로 고객에게 특별한 혜택을 제공하세요.",
  },
};

export default function PartnerApplyPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">파트너 신청</h1>
      <p className="mb-6 text-sm text-gray-500">
        매장을 등록하고 QR 코드로 고객에게 혜택을 제공하세요.
      </p>
      <PartnerApplyForm />
    </div>
  );
}
