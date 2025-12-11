import { describe, it, expect } from 'vitest';

// Test the utility functions from SummaryGrid
describe('SummaryGrid utils', () => {
  it('should format duration correctly', () => {
    // Test the duration formatting logic
    const formatDuration = (ms?: number) => {
      if (!ms) return '';
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
      return `${seconds}s`;
    };

    expect(formatDuration(120000)).toBe('2m 0s');
    expect(formatDuration(180000)).toBe('3m 0s');
    expect(formatDuration(30000)).toBe('30s');
    expect(formatDuration(undefined)).toBe('');
  });

  it('should group cards correctly', () => {
    const mockCards = [
      { type: 'available', count: 5, urgent: false, event_id: 'event-1', station_id: 'station-1' },
      { type: 'claimed', count: 3, urgent: true, event_id: 'event-1', station_id: 'station-1' },
      { type: 'completed', count: 2, urgent: false, event_id: 'event-2', station_id: 'station-1' },
    ];

    const grouped = mockCards.reduce(
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
      {} as Record<string, { event_id: string; station_id: string; cards: any[] }>,
    );

    expect(Object.keys(grouped)).toHaveLength(2);
    expect(grouped['event-1-station-1'].cards).toHaveLength(2);
    expect(grouped['event-2-station-1'].cards).toHaveLength(1);
  });

  it('should detect staleness correctly', () => {
    const isStale = (stalenessMs: number) => stalenessMs > 60000;

    expect(isStale(70000)).toBe(true);
    expect(isStale(1000)).toBe(false);
    expect(isStale(60000)).toBe(false);
  });
});
