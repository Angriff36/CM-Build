import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TaskBoard } from '../components/task-board';

// Mock the hooks
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

// Mock Supabase client
vi.mock('@caterkingapp/supabase', () => ({
  createClient: () => ({
    channel: () => ({
      on: () => ({ subscribe: () => {} }),
    }),
    removeChannel: vi.fn(),
    auth: {
      getUser: () => Promise.resolve({ data: { user: { user_metadata: { company_id: 'test' } } } }),
    },
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
