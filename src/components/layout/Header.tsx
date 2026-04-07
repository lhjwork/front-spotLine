'use client';

import Link from 'next/link';
import { QrCode, ArrowLeft, Search } from 'lucide-react';

interface HeaderProps {
  showBackButton?: boolean;
  title?: string;
}

export default function Header({ showBackButton = false, title }: HeaderProps) {
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

          {/* 중앙: 제목 */}
          {title && (
            <div className="flex-1 text-center">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {title}
              </h1>
            </div>
          )}

          {/* 오른쪽: 검색 아이콘 */}
          <div className="w-16 flex justify-end">
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