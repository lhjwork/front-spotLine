'use client';

import { useEffect, useRef } from 'react';
import { AnalyticsEvent } from '@/types';
import { logAnalyticsEvent } from '@/lib/api';
import { getSessionId } from '@/lib/utils';

interface EventTrackerProps {
  qrCode: string;
  children: React.ReactNode;
}

export default function EventTracker({ qrCode, children }: EventTrackerProps) {
  const sessionId = useRef<string>(getSessionId());
  const pageViewLogged = useRef<boolean>(false);

  // 페이지 뷰 이벤트 로깅
  useEffect(() => {
    if (!pageViewLogged.current && qrCode) {
      const event: AnalyticsEvent = {
        qrCode,
        eventType: 'page_view',
        sessionId: sessionId.current,
        metadata: {
          duration: 0,
        },
      };
      
      logAnalyticsEvent(event);
      pageViewLogged.current = true;
    }
  }, [qrCode]);

  // 페이지 언마운트 시 체류 시간 로깅
  useEffect(() => {
    const startTime = Date.now();
    
    return () => {
      if (qrCode) {
        const duration = Math.round((Date.now() - startTime) / 1000);
        const event: AnalyticsEvent = {
          qrCode,
          eventType: 'page_view',
          sessionId: sessionId.current,
          metadata: {
            duration,
          },
        };
        
        logAnalyticsEvent(event);
      }
    };
  }, [qrCode]);

  return <>{children}</>;
}

// 개별 이벤트 로깅을 위한 훅
export function useAnalytics(qrCode: string) {
  const sessionId = useRef<string>(getSessionId());

  const trackEvent = (
    eventType: AnalyticsEvent['eventType'],
    targetStore?: string,
    metadata?: AnalyticsEvent['metadata']
  ) => {
    if (!qrCode) return;
    
    const event: AnalyticsEvent = {
      qrCode,
      eventType,
      sessionId: sessionId.current,
      targetStore,
      metadata,
    };
    
    logAnalyticsEvent(event);
  };

  const trackQRScan = () => {
    trackEvent('qr_scan');
  };

  const trackRecommendationClick = (targetStore: string, category?: string, position?: number) => {
    trackEvent('recommendation_click', targetStore, {
      category,
      position,
    });
  };

  const trackMapClick = (targetStore: string) => {
    trackEvent('map_click', targetStore);
  };

  const trackStoreVisit = (targetStore: string) => {
    trackEvent('store_visit', targetStore);
  };

  return {
    trackQRScan,
    trackRecommendationClick,
    trackMapClick,
    trackStoreVisit,
  };
}