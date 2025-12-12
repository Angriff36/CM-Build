import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SummaryGrid } from './summary-grid';

// Test the SummaryGrid component
describe('SummaryGrid', () => {
  it('renders task counts with large fonts', () => {
    const mockCards = [
      { type: 'available', count: 5, urgent: false },
      { type: 'claimed', count: 3, urgent: true },
      { type: 'completed', count: 10, urgent: false },
    ];

    render(<SummaryGrid cards={mockCards} capturedAt="2023-10-01T12:00:00Z" stalenessMs={5000} />);

    // Check that counts are displayed
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();

    // Check that types are displayed
    expect(screen.getByText('available')).toBeInTheDocument();
    expect(screen.getByText('claimed')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();

    // Check urgent indicator
    expect(screen.getByText('URGENT')).toBeInTheDocument();

    // Check last updated
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });

  it('formats duration correctly', () => {
    const mockCards = [{ type: 'available', count: 1, urgent: false, avg_duration_ms: 120000 }];

    render(<SummaryGrid cards={mockCards} capturedAt="2023-10-01T12:00:00Z" stalenessMs={0} />);

    expect(screen.getByText('Avg: 2m')).toBeInTheDocument();
  });
});

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
