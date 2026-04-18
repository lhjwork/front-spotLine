import PartnerDashboard from "@/components/partner/PartnerDashboard";

interface DashboardPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function PartnerDashboardPage({ searchParams }: DashboardPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="py-12 text-center">
        <h1 className="mb-2 text-xl font-bold text-gray-900">접근 권한이 필요합니다</h1>
        <p className="text-sm text-gray-500">파트너 대시보드 링크를 통해 접속해주세요.</p>
      </div>
    );
  }

  return <PartnerDashboard token={token} />;
}
