'use client';

import { useDisplayData } from '../hooks/useDisplayData';
import { SummaryGrid } from '../components/summary-grid';
import { UrgentTicker } from '../components/urgent-ticker';

export default function DisplayPage() {
  const { data, isLoading, error, offlineBanner } = useDisplayData({ agg: 'live' });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {offlineBanner && (
        <div className="bg-yellow-500 text-black p-2 text-center font-bold">
          Realtime connection lost. Using cached data.
        </div>
      )}
      <UrgentTicker assignments={data?.assignments || []} />
      <div className="pt-20">
        {' '}
        {/* Offset for fixed ticker */}
        <h1 className="text-3xl font-bold text-center p-4">Display Dashboard</h1>
        <SummaryGrid
          cards={data?.cards || []}
          capturedAt={data?.captured_at || ''}
          stalenessMs={data?.staleness_ms || 0}
        />
      </div>
    </div>
  );
}
