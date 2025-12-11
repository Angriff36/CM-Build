import React, { type ReactNode } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { createClient } from '@caterkingapp/supabase/client';
import { useTasks } from '@caterkingapp/shared/hooks/useTasks';
import { TaskDashboard } from '../apps/prepchef/components/TaskDashboard';
import { TaskFilters } from '../apps/prepchef/components/TaskFilters';
import { TaskRow } from '../apps/prepchef/components/TaskRow';

vi.mock('@caterkingapp/shared/hooks/useTasks', () => ({
  useTasks: vi.fn(),
}));

const buildSupabaseClient = (userId: string | null = 'user1') => {
  const channel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn(),
  };

  return {
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: userId ? { id: userId } : null } })),
    },
    channel: vi.fn(() => channel),
    removeChannel: vi.fn(),
    rpc: vi.fn(),
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  };
};

vi.mock('@caterkingapp/supabase/client', () => {
  const client = buildSupabaseClient();
  return {
    createClient: vi.fn(() => client),
  };
});

vi.mock('@caterkingapp/ui', () => ({
  Button: ({ children, onClick, disabled, className, variant }: any) => (
    <button onClick={onClick} disabled={disabled} className={className} data-variant={variant}>
      {children}
    </button>
  ),
}));

const mockUseTasks = vi.mocked(useTasks);
const mockCreateClient = vi.mocked(createClient);

type UseTasksResult = ReturnType<typeof useTasks>;

const createUseTasksResult = (overrides: Partial<UseTasksResult>): UseTasksResult =>
  ({
    data: [],
    isLoading: false,
    error: null,
    ...overrides,
  }) as UseTasksResult;

const TestWrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUseTasks.mockReset();
  mockCreateClient.mockReturnValue(buildSupabaseClient());
});

describe('TaskDashboard', () => {
  it('renders the dashboard with loading state', () => {
    mockUseTasks.mockReturnValue(createUseTasksResult({ data: [], isLoading: true }));

    render(
      <TestWrapper>
        <TaskDashboard />
      </TestWrapper>,
    );

    expect(screen.getByText('Task Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });

  it('renders the dashboard with no tasks', () => {
    mockUseTasks.mockReturnValue(createUseTasksResult({ data: [], isLoading: false }));

    render(
      <TestWrapper>
        <TaskDashboard />
      </TestWrapper>,
    );

    expect(screen.getByText('Task Dashboard')).toBeInTheDocument();
    expect(screen.getByText('No tasks found.')).toBeInTheDocument();
  });

  it('renders the dashboard with tasks', () => {
    const mockTasks = [
      {
        id: '1',
        name: 'Test Task',
        quantity: 10,
        unit: 'kg',
        status: 'available',
        priority: 'high',
        assigned_user_id: null,
        event_id: 'event1',
      },
    ];
    mockUseTasks.mockReturnValue(createUseTasksResult({ data: mockTasks, isLoading: false }));

    render(
      <TestWrapper>
        <TaskDashboard />
      </TestWrapper>,
    );

    expect(screen.getByText('Task Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('10 kg')).toBeInTheDocument();
    expect(screen.getByText('Priority: high | Status: available')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseTasks.mockReturnValue(
      createUseTasksResult({ data: [], isLoading: false, error: { message: 'Test error' } as any }),
    );

    render(
      <TestWrapper>
        <TaskDashboard />
      </TestWrapper>,
    );

    expect(screen.getByText('Error loading tasks: Test error')).toBeInTheDocument();
  });

  it('renders loading user state', () => {
    mockUseTasks.mockReturnValue(createUseTasksResult({ data: [], isLoading: false }));
    mockCreateClient.mockReturnValue(buildSupabaseClient(null));

    render(
      <TestWrapper>
        <TaskDashboard />
      </TestWrapper>,
    );

    expect(screen.getByText('Loading user...')).toBeInTheDocument();
  });
});

describe('TaskFilters', () => {
  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    mockOnFilterChange.mockClear();
  });

  it('renders filter components', () => {
    render(
      <TestWrapper>
        <TaskFilters onFilterChange={mockOnFilterChange} />
      </TestWrapper>,
    );

    expect(screen.getByLabelText('Search Tasks')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by Event')).toBeInTheDocument();
    expect(screen.getByText('Filter by Status')).toBeInTheDocument();
  });

  it('handles search input change', async () => {
    render(
      <TestWrapper>
        <TaskFilters onFilterChange={mockOnFilterChange} />
      </TestWrapper>,
    );

    const searchInput = screen.getByLabelText('Search Tasks');
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'test search' }),
      );
    });
  });

  it('handles status filter toggle', async () => {
    render(
      <TestWrapper>
        <TaskFilters onFilterChange={mockOnFilterChange} />
      </TestWrapper>,
    );

    const availableButton = screen.getByText('Available');
    fireEvent.click(availableButton);

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ status: ['available'] }),
      );
    });
  });
});

describe('TaskRow', () => {
  const mockTask = {
    id: '1',
    name: 'Test Task',
    quantity: 10,
    unit: 'kg',
    status: 'available',
    priority: 'high',
    assigned_user_id: null,
    event_id: 'event1',
  };

  const mockOnClaim = vi.fn();
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    mockOnClaim.mockClear();
    mockOnComplete.mockClear();
  });

  it('renders task information correctly', () => {
    render(
      <TestWrapper>
        <TaskRow task={mockTask} userId="user1" onClaim={mockOnClaim} onComplete={mockOnComplete} />
      </TestWrapper>,
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('10 kg')).toBeInTheDocument();
    expect(screen.getByText('Priority: high | Status: available')).toBeInTheDocument();
  });

  it('shows claim button for available tasks', () => {
    render(
      <TestWrapper>
        <TaskRow task={mockTask} userId="user1" onClaim={mockOnClaim} onComplete={mockOnComplete} />
      </TestWrapper>,
    );

    const claimButton = screen.getByText('Claim');
    expect(claimButton).toBeInTheDocument();
    expect(claimButton).not.toBeDisabled();
  });

  it('shows complete button for claimed tasks assigned to user', () => {
    const claimedTask = { ...mockTask, status: 'claimed', assigned_user_id: 'user1' };

    render(
      <TestWrapper>
        <TaskRow
          task={claimedTask}
          userId="user1"
          onClaim={mockOnClaim}
          onComplete={mockOnComplete}
        />
      </TestWrapper>,
    );

    const completeButton = screen.getByText('Complete');
    expect(completeButton).toBeInTheDocument();
    expect(completeButton).not.toBeDisabled();
  });

  it('disables buttons when loading', () => {
    render(
      <TestWrapper>
        <TaskRow
          task={mockTask}
          userId="user1"
          onClaim={mockOnClaim}
          onComplete={mockOnComplete}
          isLoading
        />
      </TestWrapper>,
    );

    const claimButton = screen.getByText('Claim');
    expect(claimButton).toBeDisabled();
  });

  it('handles claim button click', () => {
    render(
      <TestWrapper>
        <TaskRow task={mockTask} userId="user1" onClaim={mockOnClaim} onComplete={mockOnComplete} />
      </TestWrapper>,
    );

    const claimButton = screen.getByText('Claim');
    fireEvent.click(claimButton);

    expect(mockOnClaim).toHaveBeenCalledWith('1');
  });

  it('handles complete button click', () => {
    const claimedTask = { ...mockTask, status: 'claimed', assigned_user_id: 'user1' };

    render(
      <TestWrapper>
        <TaskRow
          task={claimedTask}
          userId="user1"
          onClaim={mockOnClaim}
          onComplete={mockOnComplete}
        />
      </TestWrapper>,
    );

    const completeButton = screen.getByText('Complete');
    fireEvent.click(completeButton);

    expect(mockOnComplete).toHaveBeenCalledWith('1');
  });

  it('shows assigned user information', () => {
    const claimedTask = { ...mockTask, status: 'claimed', assigned_user_id: 'user1' };

    render(
      <TestWrapper>
        <TaskRow
          task={claimedTask}
          userId="user1"
          onClaim={mockOnClaim}
          onComplete={mockOnComplete}
        />
      </TestWrapper>,
    );

    expect(screen.getByText('Assigned to: You')).toBeInTheDocument();
  });

  it('shows assigned to someone else', () => {
    const claimedTask = { ...mockTask, status: 'claimed', assigned_user_id: 'user2' };

    render(
      <TestWrapper>
        <TaskRow
          task={claimedTask}
          userId="user1"
          onClaim={mockOnClaim}
          onComplete={mockOnComplete}
        />
      </TestWrapper>,
    );

    expect(screen.getByText('Assigned to: Someone else')).toBeInTheDocument();
  });
});
