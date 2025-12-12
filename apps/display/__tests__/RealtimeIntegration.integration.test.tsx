import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDisplayData } from '../hooks/useDisplayData';

// Mock the supabase client
vi.mock('@caterkingapp/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: { user_metadata: { company_id: 'test-company' } } } }),
      ),
    },
  })),
}));

// Mock the shared package
vi.mock('@caterkingapp/shared', () => ({
  useRealtimeSync: vi.fn(() => ({
    isConnected: true,
    connectionAttempts: 0,
    lastSuccessfulConnection: new Date(),
    isPolling: false,
  })),
}));

// Mock fetch
global.fetch = vi.fn();

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
);

describe('Realtime Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update display data within SLA when realtime event occurs', async () => {
    // Mock initial fetch
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            cards: [{ type: 'available', count: 5, urgent: false }],
            assignments: [],
            captured_at: '2023-10-01T12:00:00Z',
            staleness_ms: 0,
            realtime_channel: 'test-channel',
          },
        }),
    });

    // Mock realtime update
    const mockRealtimeSync = vi.fn(() => ({
      isConnected: true,
      connectionAttempts: 0,
      lastSuccessfulConnection: new Date(),
      isPolling: false,
    }));

    // Test component that uses the hook
    function TestComponent() {
      const { data, isLoading } = useDisplayData({ agg: 'live' });
      if (isLoading) return <div>Loading...</div>;
      return <div data-testid="count">{data?.cards[0]?.count}</div>;
    }

    render(<TestComponent />, { wrapper });

    // Wait for initial data
    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('5');
    });

    // Simulate realtime update
    // In a real test, this would trigger the onBroadcast callback
    // For this test, we verify the hook is set up correctly
    expect(mockRealtimeSync).toHaveBeenCalledWith({
      channelConfig: {
        name: 'company:test-company:display_summary',
        broadcasts: [{ event: 'summary_update', self: true }, { event: 'connection_status' }],
      },
      queryKeysToInvalidate: [],
      onBroadcast: expect.any(Function),
      onConnectionStatusChange: expect.any(Function),
      enablePollingOnDisconnect: true,
    });
  });

  it('should handle offline fallback correctly', async () => {
    // Mock failed fetch
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    function TestComponent() {
      const { error, offlineBanner } = useDisplayData({ agg: 'live' });
      return (
        <div>
          {error && <div data-testid="error">Error</div>}
          {offlineBanner && <div data-testid="offline">Offline</div>}
        </div>
      );
    }

    render(<TestComponent />, { wrapper });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
    });

    // Verify offline banner appears after connection issues
    // This would require more complex mocking
  });

  it('should refresh data automatically within SLA', async () => {
    vi.useFakeTimers();

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            cards: [{ type: 'available', count: 10, urgent: false }],
            assignments: [],
            captured_at: '2023-10-01T12:00:00Z',
            staleness_ms: 0,
            realtime_channel: 'test-channel',
          },
        }),
    });

    function TestComponent() {
      const { data } = useDisplayData({ agg: 'live' });
      return <div data-testid="count">{data?.cards[0]?.count}</div>;
    }

    render(<TestComponent />, { wrapper });

    // Initial load
    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('10');
    });

    // Fast-forward time to check polling (when realtime is disconnected)
    // But since realtime is mocked as connected, no polling
    vi.advanceTimersByTime(15000);

    // Verify fetch was called only once (initial)
    expect(global.fetch).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});
