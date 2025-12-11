import React from 'react';

interface SummaryCard {
  type: string;
  count: number;
  urgent: boolean;
  event_id?: string;
  station_id?: string;
  avg_duration_ms?: number;
}

interface StatusSummaryProps {
  cards: SummaryCard[];
  capturedAt: string;
  stalenessMs: number;
}

export function StatusSummary({ cards, capturedAt, stalenessMs }: StatusSummaryProps) {
  const isStale = stalenessMs > 60000; // Consider stale if over 1 minute

  // Group cards by event and station
  const groupedCards = cards.reduce(
    (acc, card) => {
      const eventKey = card.event_id || 'general';
      const stationKey = card.station_id || 'unassigned';
      const key = `${eventKey}-${stationKey}`;

      if (!acc[key]) {
        acc[key] = {
          event_id: eventKey,
          station_id: stationKey,
          cards: [],
        };
      }
      acc[key].cards.push(card);
      return acc;
    },
    {} as Record<string, { event_id: string; station_id: string; cards: SummaryCard[] }>,
  );

  const formatDuration = (ms?: number) => {
    if (!ms) return '';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className="p-4">
      {Object.entries(groupedCards).map(([key, group]) => (
        <div key={key} className="mb-8">
          <h2 className="text-3xl font-bold mb-4 text-gray-700 text-display">
            {group.event_id !== 'general' && `Event: ${group.event_id}`}
            {group.station_id !== 'unassigned' && ` • Station: ${group.station_id}`}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {group.cards.map((card, index) => (
              <div
                key={`${key}-${index}`}
                className={`border rounded-lg p-6 shadow-sm transition-all ${
                  card.urgent ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-2xl capitalize text-display">
                    {card.type.replace('_', ' ')}
                  </h3>
                  {card.urgent && (
                    <span className="bg-red-500 text-white text-lg px-3 py-1 rounded font-bold">
                      URGENT
                    </span>
                  )}
                </div>
                <div className="text-5xl font-bold mb-3 text-display">{card.count}</div>
                {card.avg_duration_ms && (
                  <div className="text-lg text-gray-600 text-display">
                    Avg duration: {formatDuration(card.avg_duration_ms)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-8 text-center">
        <div className="text-lg text-gray-500 text-display">
          Last updated: {new Date(capturedAt).toLocaleString()}
          {isStale && (
            <span className="text-yellow-600 ml-2 font-medium text-display">
              ⚠️ Data may be stale
            </span>
          )}
        </div>
        <div className="text-base text-gray-400 mt-1 text-display">
          Staleness: {Math.floor(stalenessMs / 1000)}s
        </div>
      </div>
    </div>
  );
}
