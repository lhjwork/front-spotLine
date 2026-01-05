'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '@/components/common/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-6xl font-bold text-gray-300 mb-4">404</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="text-gray-600 mb-8">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
          
          <div className="space-y-3">
            <Link href="/">
              <Button fullWidth>
                <Home className="mr-2 h-4 w-4" />
                홈으로 돌아가기
              </Button>
            </Link>
            
            <Button 
              variant="outline"
              onClick={() => window.history.back()}
              fullWidth
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              이전 페이지로
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}