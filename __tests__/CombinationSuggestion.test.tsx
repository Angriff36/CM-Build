import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CombinationSuggestion } from '../CombinationSuggestion';
import { createClient } from '@codemachine/supabase/client';
import { useToast } from '@codemachine/shared/hooks/useToast';

// Mock dependencies
vi.mock('@codemachine/supabase/client');
vi.mock('@codemachine/shared/hooks/useCombinationSuggestions');
vi.mock('@codemachine/shared/hooks/useToast');
vi.mock('@codemachine/ui', () => ({
  Button: ({ children, onClick, disabled, variant }: any) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  ),
}));

const mockSupabase = {
  rpc: vi.fn(),
  from: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
};

const mockAddToast = vi.fn();

describe('CombinationSuggestion', () => {
  const queryClient = new QueryClient();
  const companyId = 'test-company-id';

  const mockSuggestion = {
    id: 'suggestion-1',
    company_id: companyId,
    task_id: 'task-1',
    suggested_task_id: 'task-2',
    similarity_score: 0.75,
    created_at: '2025-12-11T10:00:00Z',
    task: {
      id: 'task-1',
      name: 'Chop Onions',
      quantity: 2,
      unit: 'lbs',
      status: 'available',
      priority: 'high',
    },
    suggested_task: {
      id: 'task-2',
      name: 'Dice Onions',
      quantity: 1.5,
      unit: 'lbs',
      status: 'available',
      priority: 'medium',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockReturnValue(mockSupabase);
    (useToast as any).mockReturnValue({ addToast: mockAddToast });
  });

  it('renders loading state', () => {
    (
      require('@codemachine/shared/hooks/useCombinationSuggestions') as any
    ).useCombinationSuggestions.mockReturnValue({
      data: [],
      isLoading: true,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CombinationSuggestion companyId={companyId} />
      </QueryClientProvider>,
    );

    expect(screen.getByText('Loading suggestions...')).toBeInTheDocument();
  });

  it('renders nothing when no suggestions', () => {
    (
      require('@codemachine/shared/hooks/useCombinationSuggestions') as any
    ).useCombinationSuggestions.mockReturnValue({
      data: [],
      isLoading: false,
    });

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <CombinationSuggestion companyId={companyId} />
      </QueryClientProvider>,
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders suggestion with side-by-side comparison', () => {
    (
      require('@codemachine/shared/hooks/useCombinationSuggestions') as any
    ).useCombinationSuggestions.mockReturnValue({
      data: [mockSuggestion],
      isLoading: false,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CombinationSuggestion companyId={companyId} />
      </QueryClientProvider>,
    );

    expect(screen.getByText('Task A')).toBeInTheDocument();
    expect(screen.getByText('Chop Onions')).toBeInTheDocument();
    expect(screen.getByText('Quantity: 2 lbs')).toBeInTheDocument();
    expect(screen.getByText('Task B')).toBeInTheDocument();
    expect(screen.getByText('Dice Onions')).toBeInTheDocument();
    expect(screen.getByText('Quantity: 1.5 lbs')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Accept' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument();
  });

  it('handles accept button click successfully', async () => {
    mockSupabase.rpc.mockResolvedValue({ error: null });
    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    });

    (
      require('@codemachine/shared/hooks/useCombinationSuggestions') as any
    ).useCombinationSuggestions.mockReturnValue({
      data: [mockSuggestion],
      isLoading: false,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CombinationSuggestion companyId={companyId} />
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Accept' }));

    await waitFor(() => {
      expect(mockSupabase.rpc).toHaveBeenCalledWith('combine_tasks', {
        task_ids: ['task-1', 'task-2'],
      });
      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
      expect(mockAddToast).toHaveBeenCalledWith('Tasks combined successfully', 'success');
    });
  });

  it('handles reject button click successfully', async () => {
    mockSupabase.from.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    });

    (
      require('@codemachine/shared/hooks/useCombinationSuggestions') as any
    ).useCombinationSuggestions.mockReturnValue({
      data: [mockSuggestion],
      isLoading: false,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CombinationSuggestion companyId={companyId} />
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Reject' }));

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('task_similarity_suggestions');
      expect(mockAddToast).toHaveBeenCalledWith('Suggestion rejected', 'success');
    });
  });

  it('shows error toast on accept failure', async () => {
    mockSupabase.rpc.mockResolvedValue({ error: { message: 'RPC error' } });

    (
      require('@codemachine/shared/hooks/useCombinationSuggestions') as any
    ).useCombinationSuggestions.mockReturnValue({
      data: [mockSuggestion],
      isLoading: false,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CombinationSuggestion companyId={companyId} />
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Accept' }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith('Failed to combine tasks: RPC error', 'error');
    });
  });

  it('shows error toast on reject failure', async () => {
    mockSupabase.from.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'Delete error' } }),
      }),
    });

    (
      require('@codemachine/shared/hooks/useCombinationSuggestions') as any
    ).useCombinationSuggestions.mockReturnValue({
      data: [mockSuggestion],
      isLoading: false,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CombinationSuggestion companyId={companyId} />
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Reject' }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        'Failed to reject suggestion: Delete error',
        'error',
      );
    });
  });

  it('has proper accessibility attributes', () => {
    (
      require('@codemachine/shared/hooks/useCombinationSuggestions') as any
    ).useCombinationSuggestions.mockReturnValue({
      data: [mockSuggestion],
      isLoading: false,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CombinationSuggestion companyId={companyId} />
      </QueryClientProvider>,
    );

    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByLabelText('Dismiss suggestion')).toBeInTheDocument();
  });

  it('disables buttons during pending mutations', () => {
    // Mock pending state by not resolving immediately
    mockSupabase.rpc.mockImplementation(() => new Promise(() => {}));

    (
      require('@codemachine/shared/hooks/useCombinationSuggestions') as any
    ).useCombinationSuggestions.mockReturnValue({
      data: [mockSuggestion],
      isLoading: false,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CombinationSuggestion companyId={companyId} />
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Accept' }));

    expect(screen.getByRole('button', { name: 'Accept' })).toBeDisabled();
  });
});
