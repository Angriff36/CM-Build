'use client';

import { useEffect, useState } from 'react';
import { useDisplayData } from '../hooks/useDisplayData';
import { SummaryGrid } from '../components/summary-grid';
import { UrgentTicker } from '../components/urgent-ticker';
import { DeviceStatus } from '../components/device-status';

type View = 'summary' | 'urgent' | 'presence' | 'diagnostics';

export default function DisplayPage() {
  const { data, isLoading, error, offlineBanner } = useDisplayData({ agg: 'live' });
  const [currentView, setCurrentView] = useState<View>('summary');
  const [cachedData, setCachedData] = useState<any>(null);

  useEffect(() => {
    // Load cached data on mount
    const cached = localStorage.getItem('displayData');
    if (cached) {
      setCachedData(JSON.parse(cached));
    }
  }, []);

  useEffect(() => {
    // Cache data when fetched
    if (data) {
      localStorage.setItem('displayData', JSON.stringify(data));
      setCachedData(data);
    }
  }, [data]);

  useEffect(() => {
    // Rotation scheduling
    const interval = setInterval(() => {
      setCurrentView((prev: View) => {
        const views: View[] = ['summary', 'urgent', 'presence', 'diagnostics'];
        const nextIndex = (views.indexOf(prev) + 1) % views.length;
        const next = views[nextIndex];
        // Emit telemetry
        console.log('Rotation event:', {
          from: prev,
          to: next,
          timestamp: new Date().toISOString(),
        });
        return next;
      });
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const displayData = data || cachedData;

  if (isLoading && !cachedData) return <div>Loading...</div>;
  if (error && !cachedData) return <div>Error: {error.message}</div>;

  const offlineFallback = !data && cachedData && (
    <div className="bg-gray-500 text-white p-2 text-center font-bold">
      Offline mode. Data from {new Date(cachedData.captured_at).toLocaleString()}.
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {offlineBanner || offlineFallback}
      {currentView === 'summary' && (
        <div>
          <UrgentTicker assignments={displayData?.assignments || []} />
          <div className="pt-20">
            {' '}
            {/* Offset for fixed ticker */}
            <h1 className="text-3xl font-bold text-center p-4">Display Dashboard</h1>
            <SummaryGrid
              cards={displayData?.cards || []}
              capturedAt={displayData?.captured_at || ''}
              stalenessMs={displayData?.staleness_ms || 0}
            />
          </div>
        </div>
      )}
      {currentView === 'urgent' && (
        <div className="flex items-center justify-center min-h-screen">
          <UrgentTicker assignments={displayData?.assignments || []} />
        </div>
      )}
      {currentView === 'presence' && (
        <div className="flex items-center justify-center min-h-screen">
          <DeviceStatus />
        </div>
      )}
      {currentView === 'diagnostics' && (
        <div className="p-4">
          <h2>Diagnostics</h2>
          <p>Realtime: {offlineBanner ? 'Disconnected' : 'Connected'}</p>
          <p>Data Staleness: {displayData?.staleness_ms}ms</p>
        </div>
      )}
    </div>
  );
}
