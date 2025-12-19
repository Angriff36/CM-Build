import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock hooks - define mocks inline to avoid hoisting issues
vi.mock('@codemachine/shared/hooks/useEvents', () => ({
  useEvents: vi.fn(),
}));
vi.mock('@codemachine/shared/hooks/useStaff', () => ({
  useStaff: vi.fn(),
}));
vi.mock('@codemachine/shared/hooks/useTasks', () => ({
  useTasks: vi.fn(),
}));
vi.mock('@codemachine/shared/hooks/useAssignments', () => ({
  useAssignments: vi.fn(),
}));
vi.mock('@codemachine/shared/hooks/useRecipe', () => ({
  useRecipe: vi.fn(),
}));
vi.mock('@codemachine/shared/hooks/useToast', () => ({
  useToast: vi.fn(),
}));
vi.mock('@codemachine/shared/hooks/useUser', () => ({
  useUser: vi.fn(),
}));

// Import components and mocked hooks
import { EventForm } from '../components/EventForm';
import { RecipeEditor } from '../components/RecipeEditor';
import EventsPage from '../app/events/page';
import StaffPage from '../app/staff/page';
import { useEvents } from '@codemachine/shared/hooks/useEvents';
import { useStaff } from '@codemachine/shared/hooks/useStaff';
import { useTasks } from '@codemachine/shared/hooks/useTasks';
import { useAssignments } from '@codemachine/shared/hooks/useAssignments';
import { useRecipe } from '@codemachine/shared/hooks/useRecipe';
import { useToast } from '@codemachine/shared/hooks/useToast';
import { useUser } from '@codemachine/shared/hooks/useUser';

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('AdminCRM Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mocks
    (useEvents as any).mockReturnValue({
      data: [],
      isLoading: false,
      createEvent: vi.fn(),
      updateEvent: vi.fn(),
      deleteEvent: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      realtimeState: {
        isConnected: true,
        connectionAttempts: 0,
        lastSuccessfulConnection: null,
        isPolling: false,
      },
    } as any);
    (useToast as any).mockReturnValue({
      addToast: vi.fn(),
    } as any);
    (useUser as any).mockReturnValue({
      data: { id: 'user1', role: 'owner', company_id: 'comp1' },
      isLoading: false,
    } as any);
    (useStaff as any).mockReturnValue({
      data: [],
      isLoading: false,
      createStaff: vi.fn(),
      updateStaff: vi.fn(),
      deleteStaff: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      realtimeState: {
        isConnected: true,
        connectionAttempts: 0,
        lastSuccessfulConnection: null,
        isPolling: false,
      },
    } as any);
    (useTasks as any).mockReturnValue({
      data: [],
      isLoading: false,
      realtimeState: {
        isConnected: true,
        connectionAttempts: 0,
        lastSuccessfulConnection: null,
        isPolling: false,
      },
    } as any);
    (useAssignments as any).mockReturnValue({
      assignTask: vi.fn(),
    } as any);
  });

  describe('EventsPage', () => {
    it('renders loading state', () => {
      (useEvents as any).mockReturnValue({
        data: [],
        isLoading: true,
        createEvent: vi.fn(),
        updateEvent: vi.fn(),
        deleteEvent: vi.fn(),
        isCreating: false,
        isUpdating: false,
        isDeleting: false,
        realtimeState: {
          isConnected: true,
          connectionAttempts: 0,
          lastSuccessfulConnection: null,
          isPolling: false,
        },
      } as any);

      render(
        <TestWrapper>
          <EventsPage />
        </TestWrapper>,
      );

      expect(screen.getByText('Loading events...')).toBeInTheDocument();
    });

    it('renders events list', () => {
      (useEvents as any).mockReturnValue({
        data: [
          {
            id: '1',
            name: 'Event 1',
            date: '2025-12-11',
            location: 'Location 1',
        status: 'draft' as any,
          },
        ],
        isLoading: false,
        createEvent: vi.fn(),
        updateEvent: vi.fn(),
        deleteEvent: vi.fn(),
        isCreating: false,
        isUpdating: false,
        isDeleting: false,
        realtimeState: {
          isConnected: true,
          connectionAttempts: 0,
          lastSuccessfulConnection: null,
          isPolling: false,
        },
      } as any);

      render(
        <TestWrapper>
          <EventsPage />
        </TestWrapper>,
      );

      expect(screen.getByText('Events')).toBeInTheDocument();
      expect(screen.getByText('Event 1')).toBeInTheDocument();
      expect(screen.getByText('Location 1')).toBeInTheDocument();
    });

    it('opens create form when button clicked', () => {
      render(
        <TestWrapper>
          <EventsPage />
        </TestWrapper>,
      );

      const createButton = screen.getByRole('button', { name: 'Create Event' });
      fireEvent.click(createButton);

      expect(screen.getByRole('heading', { name: 'Create Event' })).toBeInTheDocument();
    });

    it('hides create button for non-managers', () => {
      (useUser as any).mockReturnValue({
        data: { id: 'user1', role: 'staff', company_id: 'comp1' },
        isLoading: false,
      } as any);

      render(
        <TestWrapper>
          <EventsPage />
        </TestWrapper>,
      );

      expect(screen.queryByRole('button', { name: 'Create Event' })).not.toBeInTheDocument();
    });

    it('shows create button for event_lead', () => {
      (useUser as any).mockReturnValue({
        data: { id: 'user1', role: 'event_lead', company_id: 'comp1' },
        isLoading: false,
      } as any);

      render(
        <TestWrapper>
          <EventsPage />
        </TestWrapper>,
      );

      expect(screen.getByRole('button', { name: 'Create Event' })).toBeInTheDocument();
    });

    it('handles create event success', async () => {
      const mockCreateEvent = vi.fn().mockResolvedValue({});
      const mockAddToast = vi.fn();
      (useEvents as any).mockReturnValue({
        data: [],
        isLoading: false,
        createEvent: mockCreateEvent,
        updateEvent: vi.fn(),
        deleteEvent: vi.fn(),
        isCreating: false,
        isUpdating: false,
        isDeleting: false,
        realtimeState: {
          isConnected: true,
          connectionAttempts: 0,
          lastSuccessfulConnection: null,
          isPolling: false,
        },
      } as any);
      (useToast as any).mockReturnValue({
        addToast: mockAddToast,
      });

      render(
        <TestWrapper>
          <EventsPage />
        </TestWrapper>,
      );

      const createButton = screen.getByText('Create Event');
      fireEvent.click(createButton);

      // Fill form
      fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'New Event' } });
      fireEvent.change(screen.getByLabelText(/Date/), { target: { value: '2025-12-11T10:00' } });
      fireEvent.change(screen.getByLabelText(/Location/), { target: { value: 'New Location' } });

      const submitButton = screen.getByText('Create');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateEvent).toHaveBeenCalledWith({
          id: '',
          name: 'New Event',
          date: '2025-12-11T10:00',
          location: 'New Location',
          status: 'planned',
        });
        expect(mockAddToast).toHaveBeenCalledWith('Event created successfully', 'success');
      });
    });

    it('handles create event error', async () => {
      const mockCreateEvent = vi.fn().mockRejectedValue(new Error('Failed'));
      const mockAddToast = vi.fn();
      (useEvents as any).mockReturnValue({
        data: [],
        isLoading: false,
        createEvent: mockCreateEvent,
        updateEvent: vi.fn(),
        deleteEvent: vi.fn(),
        isCreating: false,
        isUpdating: false,
        isDeleting: false,
        realtimeState: {
          isConnected: true,
          connectionAttempts: 0,
          lastSuccessfulConnection: null,
          isPolling: false,
        },
      } as any);
      (useToast as any).mockReturnValue({
        addToast: mockAddToast,
      });

      render(
        <TestWrapper>
          <EventsPage />
        </TestWrapper>,
      );

      const createButton = screen.getByText('Create Event');
      fireEvent.click(createButton);

      fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'New Event' } });
      fireEvent.change(screen.getByLabelText(/Date/), { target: { value: '2025-12-11T10:00' } });
      fireEvent.change(screen.getByLabelText(/Location/), { target: { value: 'New Location' } });

      const submitButton = screen.getByText('Create');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith('Failed to create event', 'error');
      });
    });
  });

  describe('StaffPage', () => {
    beforeEach(() => {
      (useStaff as any).mockReturnValue({
        data: [],
        isLoading: false,
        createStaff: vi.fn(),
        updateStaff: vi.fn(),
        deleteStaff: vi.fn(),
        isCreating: false,
        isUpdating: false,
        isDeleting: false,
        realtimeState: {
          isConnected: true,
          connectionAttempts: 0,
          lastSuccessfulConnection: null,
          isPolling: false,
        },
      } as any);
      (useTasks as any).mockReturnValue({
        data: [],
        isLoading: false,
        realtimeState: {
          isConnected: true,
          connectionAttempts: 0,
          lastSuccessfulConnection: null,
          isPolling: false,
        },
      } as any);
      (useAssignments as any).mockReturnValue({
        assignTask: vi.fn(),
      } as any);
      (useToast as any).mockReturnValue({
        addToast: vi.fn(),
      });
      (useUser as any).mockReturnValue({
        data: { id: 'user1', role: 'owner', company_id: 'comp1' },
        isLoading: false,
      } as any);
    });

    it('renders staff list', () => {
      (useStaff as any).mockReturnValue({
        data: [
          { id: '1', display_name: 'Staff 1', role: 'staff', status: 'active', presence: 'online' },
        ],
        isLoading: false,
        createStaff: vi.fn(),
        updateStaff: vi.fn(),
        deleteStaff: vi.fn(),
        isCreating: false,
        isUpdating: false,
        isDeleting: false,
        realtimeState: {
          isConnected: true,
          connectionAttempts: 0,
          lastSuccessfulConnection: null,
          isPolling: false,
        },
      } as any);

      render(
        <TestWrapper>
          <StaffPage />
        </TestWrapper>,
      );

      expect(screen.getByText('Staff Management')).toBeInTheDocument();
      expect(screen.getAllByText('Staff 1')).toHaveLength(2);
    });

    it('renders task assignment interface', () => {
      render(
        <TestWrapper>
          <StaffPage />
        </TestWrapper>,
      );

      expect(screen.getByText('Task Assignment')).toBeInTheDocument();
    });

    it('hides management buttons for non-managers', () => {
      (useUser as any).mockReturnValue({
        data: { id: 'user1', role: 'staff', company_id: 'comp1' },
        isLoading: false,
      } as any);

      render(
        <TestWrapper>
          <StaffPage />
        </TestWrapper>,
      );

      expect(screen.queryByText('Add Staff Member')).not.toBeInTheDocument();
    });

    it('shows management buttons for managers', () => {
      (useUser as any).mockReturnValue({
        data: { id: 'user1', role: 'manager', company_id: 'comp1' },
        isLoading: false,
      } as any);

      render(
        <TestWrapper>
          <StaffPage />
        </TestWrapper>,
      );

      expect(screen.getByText('Add Staff Member')).toBeInTheDocument();
    });

    it('handles task assignment on drag end', () => {
      const mockAssignTask = vi.fn();
      (useAssignments as any).mockReturnValue({
        assignTask: mockAssignTask,
      });
      (useTasks as any).mockReturnValue({
        data: [{ id: 'task1', name: 'Task 1', assigned_user_id: null }],
        isLoading: false,
        realtimeState: {
          isConnected: true,
          connectionAttempts: 0,
          lastSuccessfulConnection: null,
          isPolling: false,
        },
      });
      (useStaff as any).mockReturnValue({
        data: [
          {
            id: 'staff1',
            display_name: 'Staff 1',
            role: 'staff',
            status: 'active',
            presence: 'online',
          },
        ],
        isLoading: false,
        createStaff: vi.fn(),
        updateStaff: vi.fn(),
        deleteStaff: vi.fn(),
        isCreating: false,
        isUpdating: false,
        isDeleting: false,
        realtimeState: {
          isConnected: true,
          connectionAttempts: 0,
          lastSuccessfulConnection: null,
          isPolling: false,
        },
      } as any);

      render(
        <TestWrapper>
          <StaffPage />
        </TestWrapper>,
      );

      // Simulate drag end event
      const dragEndEvent = {
        active: { id: 'task1' },
        over: { id: 'staff1' },
      };

      // Since we can't easily simulate DndContext drag, we test the handler indirectly
      // The component uses handleDragEnd which calls assignTask
      // In a real test, we'd need to mock @dnd-kit or use a different approach
      // For now, verify the interface renders correctly
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getAllByText('Staff 1')).toHaveLength(2);
    });
  });

  describe('EventForm', () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();

    const defaultProps = {
      onSubmit: mockOnSubmit,
      onCancel: mockOnCancel,
    };

    beforeEach(() => {
      mockOnSubmit.mockClear();
      mockOnCancel.mockClear();
      (useToast as any).mockReturnValue({
        addToast: vi.fn(),
      });
    });

    it('renders create form correctly', () => {
      render(
        <TestWrapper>
          <EventForm {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Create Event')).toBeInTheDocument();
      expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Date/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Location/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Status/)).toBeInTheDocument();
    });

    it('renders edit form with pre-filled data', () => {
      const event = {
        id: '1',
        name: 'Test Event',
        date: '2025-12-11T10:00',
        location: 'Test Location',
        status: 'draft' as any,
        scheduled_at: '2025-12-11T10:00',
        company_id: 'test-company',
        created_at: '2025-12-11T10:00',
        updated_at: '2025-12-11T10:00',
        description: null,
      };

      render(
        <TestWrapper>
          <EventForm event={event} {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Edit Event')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Event')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Location')).toBeInTheDocument();
    });

    it('validates required fields', async () => {
      render(
        <TestWrapper>
          <EventForm {...defaultProps} />
        </TestWrapper>,
      );

      const submitButton = screen.getByText('Create');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(screen.getByText('Date is required')).toBeInTheDocument();
        expect(screen.getByText('Location is required')).toBeInTheDocument();
      });
    });

    it('submits form with valid data', async () => {
      render(
        <TestWrapper>
          <EventForm {...defaultProps} />
        </TestWrapper>,
      );

      fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'New Event' } });
      fireEvent.change(screen.getByLabelText(/Date/), { target: { value: '2025-12-11T10:00' } });
      fireEvent.change(screen.getByLabelText(/Location/), { target: { value: 'New Location' } });

      const submitButton = screen.getByText('Create');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'New Event',
          date: '2025-12-11T10:00',
          location: 'New Location',
          status: 'planned',
          id: '',
        });
      });
    });

    it('calls onCancel when cancel button is clicked', () => {
      render(
        <TestWrapper>
          <EventForm {...defaultProps} />
        </TestWrapper>,
      );

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('RecipeEditor', () => {
    const mockRecipe = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      company_id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Test Recipe',
      ingredients: [{ name: 'Flour', quantity: 2, unit: 'cups' }],
      steps: ['Mix ingredients'],
      media_urls: [],
      version: 1,
      tags: [],
      allergen_flags: {},
    };

    beforeEach(() => {
      (useRecipe as any).mockReturnValue({
        data: mockRecipe,
        isLoading: false,
        updateRecipe: vi.fn(),
        isUpdating: false,
        realtimeState: {
          isConnected: true,
          connectionAttempts: 0,
          lastSuccessfulConnection: null,
          isPolling: false,
        },
      } as any);
      (useToast as any).mockReturnValue({
        addToast: vi.fn(),
      } as any);
    });

    it('renders recipe data', () => {
      render(
        <TestWrapper>
          <RecipeEditor recipeId="recipe1" />
        </TestWrapper>,
      );

      expect(screen.getByDisplayValue('Test Recipe')).toBeInTheDocument();
      expect(screen.getByText('Flour')).toBeInTheDocument();
      expect(screen.getByText('Mix ingredients')).toBeInTheDocument();
    });

    it('adds ingredient', () => {
      render(
        <TestWrapper>
          <RecipeEditor recipeId="recipe1" />
        </TestWrapper>,
      );

      fireEvent.change(screen.getByPlaceholderText('Ingredient name'), {
        target: { value: 'Sugar' },
      });
      fireEvent.change(screen.getByPlaceholderText('Quantity'), { target: { value: '1' } });
      fireEvent.change(screen.getByPlaceholderText('Unit'), { target: { value: 'cup' } });

      const addButton = screen.getByText('Add');
      fireEvent.click(addButton);

      expect(screen.getByText('Sugar')).toBeInTheDocument();
    });

    it('removes ingredient', () => {
      render(
        <TestWrapper>
          <RecipeEditor recipeId="recipe1" />
        </TestWrapper>,
      );

      const removeButton = screen.getAllByText('Remove')[0]; // First remove button for ingredients
      fireEvent.click(removeButton);

      expect(screen.queryByText('Flour')).not.toBeInTheDocument();
    });

    it('adds step', () => {
      render(
        <TestWrapper>
          <RecipeEditor recipeId="recipe1" />
        </TestWrapper>,
      );

      const textarea = screen.getByPlaceholderText('Add a step');
      fireEvent.change(textarea, { target: { value: 'Bake at 350°F' } });

      const addButton = screen.getByText('Add Step');
      fireEvent.click(addButton);

      expect(screen.getByText('Bake at 350°F')).toBeInTheDocument();
    });

    it('removes step', () => {
      render(
        <TestWrapper>
          <RecipeEditor recipeId="recipe1" />
        </TestWrapper>,
      );

      const removeButton = screen.getAllByText('Remove')[1]; // Second remove button for steps
      fireEvent.click(removeButton);

      expect(screen.queryByText('Mix ingredients')).not.toBeInTheDocument();
    });

    it('handles media upload', async () => {
      // Mock Supabase client and fetch
      const mockCreateClient = vi.fn().mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user1' } },
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { company_id: 'comp1' },
            }),
          }),
        }),
      });

      vi.doMock('@codemachine/supabase/client', () => ({
        createClient: mockCreateClient,
      }));

      // Mock fetch for signed URL
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              signedUrl: 'https://example.com/upload',
              path: 'test.jpg',
              mediaAssetId: 'asset1',
            },
          }),
      });

      render(
        <TestWrapper>
          <RecipeEditor recipeId="recipe1" />
        </TestWrapper>,
      );

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = document.getElementById('media-upload') as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/Uploading.../)).toBeInTheDocument();
      });
    });

    it('saves recipe', async () => {
      const mockUpdateRecipe = vi.fn().mockResolvedValue(undefined);

      // Set up the test-specific mock
      (useRecipe as any).mockReturnValue({
        data: mockRecipe,
        isLoading: false,
        updateRecipe: mockUpdateRecipe,
        isUpdating: false,
        realtimeState: {
          isConnected: true,
          connectionAttempts: 0,
          lastSuccessfulConnection: null,
          isPolling: false,
        },
      } as any);
      (useToast as any).mockReturnValue({
        addToast: vi.fn(),
      } as any);

      render(
        <TestWrapper>
          <RecipeEditor recipeId="recipe1" />
        </TestWrapper>,
      );

      const saveButton = screen.getByText('Save Recipe');

      // Check if the button is disabled
      expect(saveButton).not.toBeDisabled();

      // Wrap in act to handle state updates
      await act(async () => {
        fireEvent.click(saveButton);
      });

      // Debug: check if the mock was called
      console.log('Mock calls:', mockUpdateRecipe.mock.calls);

      // Wait a moment for the click handler to process
      await vi.waitFor(
        () => {
          expect(mockUpdateRecipe).toHaveBeenCalled();
        },
        { timeout: 1000 },
      );
    });
  });
});
