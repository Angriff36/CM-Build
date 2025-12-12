'use client';

import React from 'react';

interface SummaryCard {
  type: string;
  count: number;
  urgent: boolean;
  event_id?: string;
  station_id?: string;
  avg_duration_ms?: number;
}

interface SummaryGridProps {
  cards: SummaryCard[];
  capturedAt: string;
  stalenessMs: number;
}

export function SummaryGrid({ cards, capturedAt, stalenessMs }: SummaryGridProps) {
  const formatDuration = (ms: number) => {
    if (ms < 60000) return Math.round(ms / 1000) + 's';
    return Math.round(ms / 60000) + 'm';
  };

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {cards.map((card, index) => (
          <div
            key={card.type + '-' + (card.event_id || 'global') + '-' + index}
            className={
              'bg-white rounded-lg shadow-lg p-6 border-4 ' +
              (card.urgent ? 'border-red-500 bg-red-50' : 'border-gray-300')
            }
          >
            <div className="text-center">
              <div className="text-6xl font-bold text-gray-800 mb-2">{card.count}</div>
              <div className="text-4xl font-semibold text-gray-600 capitalize mb-2">
                {card.type}
              </div>
              {card.avg_duration_ms && (
                <div className="text-3xl text-gray-500">
                  Avg: {formatDuration(card.avg_duration_ms)}
                </div>
              )}
              {card.urgent && (
                <div className="text-3xl text-red-600 font-bold animate-pulse">URGENT</div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 text-center text-4xl text-gray-500">
        Last updated: {new Date(capturedAt).toLocaleString()}
        {stalenessMs > 0 ? ' (' + Math.round(stalenessMs / 1000) + 's ago)' : ''}
      </div>
    </div>
  );
}
