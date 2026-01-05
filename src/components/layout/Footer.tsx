'use client';

import Link from 'next/link';
import { QrCode, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          {/* 로고 */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
              <QrCode className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Spotline</span>
          </div>
          
          {/* 설명 */}
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            QR 코드 기반 로컬 연결 서비스로 다음에 가기 좋은 장소를 추천받아보세요
          </p>
          
          {/* 링크들 */}
          <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
            <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
              서비스 소개
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">
              개인정보처리방침
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">
              이용약관
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
              문의하기
            </Link>
          </div>
          
          {/* 저작권 */}
          <div className="flex items-center justify-center space-x-1 text-sm text-gray-500">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>by Spotline Team</span>
          </div>
          
          <p className="text-xs text-gray-400 mt-2">
            © 2024 Spotline. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}