import { Metadata } from 'next';

export async function generateMetadata({ 
  params 
}: { 
  params: { qrId: string } 
}): Promise<Metadata> {
  const qrId = params.qrId;
  
  return {
    title: `매장 정보 - QR ${qrId}`,
    description: '현재 매장에서 다음에 가기 좋은 장소들을 추천받아보세요.',
    openGraph: {
      title: 'Spotline - 다음에 가기 좋은 곳',
      description: '현재 매장에서 다음에 가기 좋은 장소들을 추천받아보세요.',
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function QRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}