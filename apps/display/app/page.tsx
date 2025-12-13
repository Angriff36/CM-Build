'use client';

import { useEffect, useState } from 'react';
import { useDisplayData } from '../hooks/useDisplayData';
import { SummaryGrid } from '../components/summary-grid';
import { RealtimeUpdater } from '../components/RealtimeUpdater';
import { UrgentTicker } from '../components/urgent-ticker';
import { DeviceStatus } from '../components/device-status';

type View = 'summary' | 'urgent' | 'presence' | 'diagnostics';

export default function DisplayPage() {
  const queryResult = useDisplayData({ agg: 'live' });
  const { data, isLoading, error } = queryResult;
  const [currentView, setCurrentView] = useState<View>('summary');
  const [cachedData, setCachedData] = useState<any>(null);
  const [realtimeData, setRealtimeData] = useState<any>(null);

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
    // Rotation scheduling - 15 second SLA
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
    }, 15000); // 15 seconds as per SLA

    return () => clearInterval(interval);
  }, []);

  const displayData = realtimeData || data || cachedData;

  if (isLoading && !cachedData) return <div className="text-2xl p-8">Loading...</div>;
  if (error && !cachedData)
    return <div className="text-2xl p-8 text-red-600">Error: {(error as Error).message}</div>;

  const offlineBanner = !data && cachedData && (
    <div className="bg-gray-500 text-white p-4 text-center font-bold">
      Offline mode. Data from {new Date(cachedData.captured_at).toLocaleString()}.
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {offlineBanner}
      {currentView === 'summary' && (
        <div>
          <UrgentTicker assignments={displayData?.assignments || []} />
          <div className="pt-20">
            <h1 className="text-6xl font-bold text-center p-4">Display Dashboard</h1>
            <SummaryGrid
              cards={displayData?.cards || []}
              capturedAt={displayData?.captured_at || ''}
              stalenessMs={displayData?.staleness_ms || 0}
            />
            {/* Show who is working on what */}
            <div className="mt-8 px-4">
              <h2 className="text-5xl font-bold text-center mb-6">Current Assignments</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayData?.assignments?.map((assignment: any) => (
                  <div
                    key={assignment.task_id}
                    className="border rounded-lg p-6 bg-white shadow-sm"
                  >
                    <div className="text-3xl font-bold">{assignment.user_display_name}</div>
                    <div className="text-2xl text-gray-600">Status: {assignment.status}</div>
                    {assignment.priority && (
                      <div className="text-xl text-gray-500">Priority: {assignment.priority}</div>
                    )}
                  </div>
                )) || []}
              </div>
            </div>
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
          <h2 className="text-4xl font-bold mb-4">Diagnostics</h2>
          <p className="text-2xl">
            Realtime: {queryResult.offlineBanner ? 'Disconnected' : 'Connected'}
          </p>
          <p className="text-2xl">Data Staleness: {displayData?.staleness_ms}ms</p>
        </div>
      )}
    </div>
  );
}
