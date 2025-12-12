import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRealtimeSync } from '@caterkingapp/shared/hooks/useRealtimeSync';
import { createClient } from '@caterkingapp/supabase/client';

// Mock Supabase client
jest.mock('@caterkingapp/supabase/client', () => ({
  createClient: jest.fn(),
}));

// Mock analytics
global.window = {
  analytics: {
    track: jest.fn(),
  },
} as any;

const mockSupabase = {
  channel: jest.fn().mockReturnThis(),
  on: jest.fn().mockReturnThis(),
  subscribe: jest.fn(),
  removeChannel: jest.fn(),
};

(createClient as jest.Mock).mockReturnValue(mockSupabase);

describe('RealtimeIntegration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    jest.clearAllMocks();
  });

  test('useRealtimeSync subscribes to channel and handles postgres changes', async () => {
    const TestComponent = () => {
      const state = useRealtimeSync({
        channelConfig: {
          name: 'test_channel',
          postgresChanges: [
            {
              event: '*',
              schema: 'public',
              table: 'test_table',
            },
          ],
        },
        queryKeysToInvalidate: [['test']],
      });

      return (
        <div data-testid="connection-status">
          {state.isConnected ? 'connected' : 'disconnected'}
        </div>
      );
    };

    render(
      <QueryClientProvider client={queryClient}>
        <TestComponent />
      </QueryClientProvider>,
    );

    // Check that channel was created and subscribed
    expect(mockSupabase.channel).toHaveBeenCalledWith('test_channel');
    expect(mockSupabase.on).toHaveBeenCalledWith(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'test_table',
      },
      expect.any(Function),
    );
    expect(mockSupabase.subscribe).toHaveBeenCalled();

    // Simulate subscription success
    const subscribeCallback = mockSupabase.subscribe.mock.calls[0][0];
    subscribeCallback('SUBSCRIBED');

    await waitFor(() => {
      expect(screen.getByTestId('connection-status')).toHaveTextContent('connected');
    });

    // Check telemetry
    expect(window.analytics.track).toHaveBeenCalledWith(
      'realtime_channel_subscribed',
      expect.objectContaining({
        channel: 'test_channel',
        postgresChanges: 1,
      }),
    );
  });

  test('useRealtimeSync handles connection loss and fallback polling', async () => {
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const TestComponent = () => {
      const state = useRealtimeSync({
        channelConfig: {
          name: 'test_channel',
          postgresChanges: [
            {
              event: '*',
              schema: 'public',
              table: 'test_table',
            },
          ],
        },
        queryKeysToInvalidate: [['test']],
        enablePollingOnDisconnect: true,
        pollingInterval: 1000, // Short for test
      });

      return <div data-testid="polling-status">{state.isPolling ? 'polling' : 'not polling'}</div>;
    };

    render(
      <QueryClientProvider client={queryClient}>
        <TestComponent />
      </QueryClientProvider>,
    );

    // Simulate connection loss
    const subscribeCallback = mockSupabase.subscribe.mock.calls[0][0];
    subscribeCallback('CLOSED');

    await waitFor(() => {
      expect(screen.getByTestId('polling-status')).toHaveTextContent('polling');
    });

    // Wait for polling to trigger invalidation
    await waitFor(
      () => {
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['test'] });
      },
      { timeout: 2000 },
    );

    // Check telemetry for connection status
    expect(window.analytics.track).toHaveBeenCalledWith(
      'realtime_connection_status',
      expect.objectContaining({
        channel: 'test_channel',
        status: 'CLOSED',
      }),
    );
  });

  test('useRealtimeSync triggers cache invalidation on postgres changes', async () => {
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    render(
      <QueryClientProvider client={queryClient}>
        <div>Test</div>
      </QueryClientProvider>,
    );

    // Simulate postgres change
    const onCallback = mockSupabase.on.mock.calls[0][2]; // The callback function
    onCallback();

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['test'] });
  });
});
