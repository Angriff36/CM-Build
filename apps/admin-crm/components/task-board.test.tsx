import { render, screen } from '@testing-library/react';
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
vi.mock('@caterkingapp/supabase/client', () => ({
  createClient: () => ({
    channel: () => ({
      on: () => ({ subscribe: () => {} }),
    }),
    removeChannel: vi.fn(),
  }),
}));

describe('TaskBoard', () => {
  it('renders task board with staff columns', () => {
    render(<TaskBoard />);

    expect(screen.getByText('Unassigned')).toBeInTheDocument();
    expect(screen.getAllByText('John Doe')).toHaveLength(2);
  });
});
