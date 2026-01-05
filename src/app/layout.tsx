import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Spotline - QR 기반 로컬 연결 서비스",
    template: "%s | Spotline",
  },
  description: "지금 있는 장소에서, 다음으로 이어지는 최적의 동선을 추천받아보세요. QR 코드 기반 로컬 연결 서비스 Spotline입니다.",
  keywords: ["QR코드", "추천", "로컬", "매장", "카페", "레스토랑", "동선", "장소추천"],
  authors: [{ name: "Spotline Team" }],
  creator: "Spotline Team",
  publisher: "Spotline",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    title: "Spotline - QR 기반 로컬 연결 서비스",
    description: "지금 있는 장소에서, 다음으로 이어지는 최적의 동선을 추천받아보세요.",
    siteName: "Spotline",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spotline - QR 기반 로컬 연결 서비스",
    description: "지금 있는 장소에서, 다음으로 이어지는 최적의 동선을 추천받아보세요.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
