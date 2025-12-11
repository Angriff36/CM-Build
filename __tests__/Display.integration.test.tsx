import { render, screen, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import DisplayPage from '../apps/display/app/page';

// Mock the hooks and components
jest.mock('../apps/display/hooks/useDisplayData', () => ({
  useDisplayData: () => ({
    data: {
      cards: [
        { type: 'available', count: 5, urgent: false },
        { type: 'claimed', count: 3, urgent: false },
        { type: 'completed', count: 10, urgent: false },
      ],
      assignments: [
        { task_id: '1', user_display_name: 'John Doe', status: 'claimed', priority: 'high' },
        {
          task_id: '2',
          user_display_name: 'Jane Smith',
          status: 'in_progress',
          priority: 'medium',
        },
      ],
      captured_at: new Date().toISOString(),
      staleness_ms: 5000,
    },
    isLoading: false,
    error: null,
    offlineBanner: null,
  }),
}));

jest.mock('../apps/display/components/StatusSummary', () => ({
  StatusSummary: ({ cards, capturedAt, stalenessMs }: any) => (
    <div data-testid="status-summary">
      <div data-testid="card-count">{cards.length}</div>
      <div data-testid="captured-at">{capturedAt}</div>
      <div data-testid="staleness">{stalenessMs}</div>
    </div>
  ),
}));

jest.mock('../apps/display/components/RealtimeUpdater', () => ({
  RealtimeUpdater: ({ onDataUpdate }: any) => {
    // Simulate realtime update after 1 second
    setTimeout(() => {
      onDataUpdate({
        cards: [{ type: 'available', count: 6, urgent: false }],
        captured_at: new Date().toISOString(),
        staleness_ms: 1000,
      });
    }, 1000);
    return null;
  },
}));

jest.mock('../apps/display/components/urgent-ticker', () => ({
  UrgentTicker: ({ assignments }: any) => (
    <div data-testid="urgent-ticker">
      {assignments.map((assignment: any) => (
        <div key={assignment.task_id}>{assignment.user_display_name}</div>
      ))}
    </div>
  ),
}));

jest.mock('../apps/display/components/device-status', () => ({
  DeviceStatus: () => <div data-testid="device-status">Device Status</div>,
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Display Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('displays task counts with large readable fonts', async () => {
    render(<DisplayPage />);

    // Check for large font title
    const title = screen.getByText('Display Dashboard');
    expect(title).toHaveClass('text-6xl');

    // Check for status summary
    const statusSummary = screen.getByTestId('status-summary');
    expect(statusSummary).toBeInTheDocument();

    // Check card counts are displayed
    const cardCount = screen.getByTestId('card-count');
    expect(cardCount).toHaveTextContent('3');
  });

  test('shows who is working on what via realtime updates', async () => {
    render(<DisplayPage />);

    // Check for assignments section
    expect(screen.getByText('Current Assignments')).toBeInTheDocument();

    // Check for user names
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();

    // Check for status information
    expect(screen.getByText('Status: claimed')).toBeInTheDocument();
    expect(screen.getByText('Status: in_progress')).toBeInTheDocument();
  });

  test('auto-refreshes every 15 seconds without user interaction', async () => {
    render(<DisplayPage />);

    // Initial render should show summary view
    expect(screen.getByText('Display Dashboard')).toBeInTheDocument();

    // Fast-forward 15 seconds to trigger view rotation
    jest.advanceTimersByTime(15000);

    await waitFor(() => {
      // Should rotate to urgent view
      expect(screen.getByTestId('urgent-ticker')).toBeInTheDocument();
    });

    // Fast-forward another 15 seconds
    jest.advanceTimersByTime(15000);

    await waitFor(() => {
      // Should rotate to presence view
      expect(screen.getByTestId('device-status')).toBeInTheDocument();
    });
  });

  test('realtime updates within 15-second SLA', async () => {
    const startTime = Date.now();

    render(<DisplayPage />);

    // Wait for realtime update (simulated after 1 second)
    await waitFor(
      () => {
        const staleness = screen.getByTestId('staleness');
        expect(staleness).toHaveTextContent('1000');
      },
      { timeout: 2000 },
    );

    const endTime = Date.now();
    const updateDuration = endTime - startTime;

    // Verify update occurred within SLA (15 seconds)
    expect(updateDuration).toBeLessThan(15000);
  });

  test('uses large fonts (minimum 32px)', async () => {
    render(<DisplayPage />);

    // Check main title has large font
    const title = screen.getByText('Display Dashboard');
    expect(title).toHaveClass('text-6xl'); // This should be at least 32px

    // Check section titles
    const assignmentsTitle = screen.getByText('Current Assignments');
    expect(assignmentsTitle).toHaveClass('text-5xl');
  });

  test('responsive for 4K displays', async () => {
    // Mock 4K display width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 3840,
    });

    render(<DisplayPage />);

    // Should still render properly on 4K
    expect(screen.getByText('Display Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('status-summary')).toBeInTheDocument();
  });

  test('no interactive controls (passive display only)', async () => {
    render(<DisplayPage />);

    // Should not have any buttons, inputs, or interactive elements
    const buttons = screen.queryAllByRole('button');
    const inputs = screen.queryAllByRole('textbox');
    const links = screen.queryAllByRole('link');

    expect(buttons).toHaveLength(0);
    expect(inputs).toHaveLength(0);
    expect(links).toHaveLength(0);
  });

  test('handles offline fallback gracefully', async () => {
    // Mock empty data to trigger offline fallback
    jest.doMock('../apps/display/hooks/useDisplayData', () => ({
      useDisplayData: () => ({
        data: null,
        isLoading: false,
        error: null,
        offlineBanner: null,
      }),
    }));

    // Mock cached data
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify({
        cards: [{ type: 'available', count: 2, urgent: false }],
        captured_at: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        staleness_ms: 300000,
      }),
    );

    render(<DisplayPage />);

    // Should show offline banner with cached data
    expect(screen.getByText(/Offline mode/)).toBeInTheDocument();
  });
});
