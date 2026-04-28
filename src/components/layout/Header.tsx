'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { QrCode, ArrowLeft, Search, Plus } from 'lucide-react';
import NotificationBell from '@/components/notification/NotificationBell';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: "발견", href: "/", match: (p: string) => p === "/" },
  { label: "피드", href: "/feed", match: (p: string) => p.startsWith("/feed") },
  { label: "저장", href: "/saves", match: (p: string) => p.startsWith("/saves") },
  { label: "마이", href: "/profile/me", match: (p: string) => p.startsWith("/profile") },
] as const;

interface HeaderProps {
  showBackButton?: boolean;
  title?: string;
  userId?: string | null;
}

export default function Header({ showBackButton = false, title, userId }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 왼쪽: 뒤로가기 버튼 또는 로고 */}
          <div className="flex items-center">
            {showBackButton ? (
              <button
                onClick={() => window.history.back()}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm font-medium">뒤로</span>
              </button>
            ) : (
              <Link href="/" className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                  <QrCode className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Spotline</span>
              </Link>
            )}
          </div>

          {/* 중앙: 제목 (모바일) 또는 네비게이션 (PC) */}
          {title ? (
            <div className="flex-1 text-center md:hidden">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {title}
              </h1>
            </div>
          ) : null}

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    active
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* 오른쪽: 새로 만들기 (PC) + 알림 + 검색 */}
          <div className="flex items-center gap-1">
            <Link
              href="/create-spot"
              className="hidden md:flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>등록</span>
            </Link>
            <NotificationBell userId={userId ?? null} />
            <Link
              href="/search"
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="검색"
            >
              <Search className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
