'use client';

import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import ErrorBoundary from '@/components/common/ErrorBoundary';

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  showBackButton?: boolean;
  title?: string;
  className?: string;
}

export default function Layout({
  children,
  showHeader = true,
  showFooter = true,
  showBackButton = false,
  title,
  className = '',
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {showHeader && (
        <Header showBackButton={showBackButton} title={title} />
      )}
      
      <main className={`flex-1 ${className}`}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
}