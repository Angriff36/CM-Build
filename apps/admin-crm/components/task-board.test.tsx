import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TaskBoard } from '../components/task-board';

// Mock Supabase client - must be first
vi.mock('@caterkingapp/supabase', () => ({
  createClient: vi.fn(() => ({
    channel: () => ({
      on: () => ({ subscribe: () => {} }),
    }),
    removeChannel: vi.fn(),
    auth: {
      getUser: () => Promise.resolve({ data: { user: { user_metadata: { company_id: 'test' } } } }),
    },
  })),
}));

// Mock the shared hooks
vi.mock('@caterkingapp/shared/hooks/useRealtimeSync', () => ({
  useRealtimeSync: () => ({
    isConnected: true,
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  }),
}));

vi.mock('@caterkingapp/shared/hooks/useTasks', () => ({
  useTasks: () => ({
    tasks: [{ id: '1', name: 'Test Task', status: 'pending', assigned_user_id: null }],
    isLoading: false,
  }),
}));

vi.mock('@caterkingapp/shared/hooks/useStaff', () => ({
  useStaff: () => ({
    staff: [
      {
        id: 'staff1',
        display_name: 'John Doe',
        role: 'staff',
        status: 'active',
        presence: 'online',
      },
    ],
    isLoading: false,
  }),
}));

vi.mock('@caterkingapp/shared/hooks/useAssignments', () => ({
  useAssignments: () => ({
    assignTask: vi.fn(),
    isAssigning: false,
  }),
}));

describe('TaskBoard', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  it('renders task board with staff columns', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TaskBoard />
      </QueryClientProvider>,
    );

    expect(screen.getByText('Unassigned')).toBeInTheDocument();
    expect(screen.getAllByText('John Doe')).toHaveLength(2);
  });
});
