import { describe, it, expect, vi } from 'vitest';

describe('useDisplayData utils', () => {
  it('should build query parameters correctly', () => {
    const options = {
      event_scope: 'event-1',
      station_scope: 'station-1',
      agg: 'hourly' as const,
      since: '2024-01-01T09:00:00Z',
    };

    const params = new URLSearchParams();
    if (options.event_scope) params.append('event_scope', options.event_scope);
    if (options.station_scope) params.append('station_scope', options.station_scope);
    if (options.agg) params.append('agg', options.agg);
    if (options.since) params.append('since', options.since);

    expect(params.toString()).toBe(
      'event_scope=event-1&station_scope=station-1&agg=hourly&since=2024-01-01T09%3A00%3A00Z',
    );
  });

  it('should detect stale data correctly', () => {
    const isDataStale = (stalenessMs: number) => stalenessMs > 60000;

    expect(isDataStale(70000)).toBe(true);
    expect(isDataStale(1000)).toBe(false);
    expect(isDataStale(60000)).toBe(false);
  });

  it('should determine refetch interval correctly', () => {
    const getRefetchInterval = (isRealtimeConnected: boolean, connectionAttempts: number) => {
      if (isRealtimeConnected) return false;
      if (connectionAttempts > 3) return 10000;
      return 30000;
    };

    expect(getRefetchInterval(true, 0)).toBe(false);
    expect(getRefetchInterval(false, 0)).toBe(30000);
    expect(getRefetchInterval(false, 5)).toBe(10000);
  });

  it('should handle retry logic correctly', () => {
    const shouldRetry = (failureCount: number, error: any) => {
      if (error instanceof Error && error.message.includes('4')) return false;
      return failureCount < 3;
    };

    expect(shouldRetry(0, new Error('Network error'))).toBe(true);
    expect(shouldRetry(2, new Error('Network error'))).toBe(true);
    expect(shouldRetry(3, new Error('Network error'))).toBe(false);
    expect(shouldRetry(0, new Error('404 Not Found'))).toBe(false);
  });

  it('should calculate retry delay correctly', () => {
    const getRetryDelay = (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000);

    expect(getRetryDelay(0)).toBe(1000);
    expect(getRetryDelay(1)).toBe(2000);
    expect(getRetryDelay(2)).toBe(4000);
    expect(getRetryDelay(10)).toBe(30000);
  });
});
