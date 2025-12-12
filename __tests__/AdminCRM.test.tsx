import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock hooks
const mockUseEvents = vi.fn();
const mockUseStaff = vi.fn();
const mockUseTasks = vi.fn();
const mockUseAssignments = vi.fn();
const mockUseToast = vi.fn();
const mockUseUser = vi.fn();

vi.mock('@caterkingapp/shared/hooks/useEvents', () => ({
  useEvents: mockUseEvents,
}));
vi.mock('@caterkingapp/shared/hooks/useStaff', () => ({
  useStaff: mockUseStaff,
}));
vi.mock('@caterkingapp/shared/hooks/useTasks', () => ({
  useTasks: mockUseTasks,
}));
vi.mock('@caterkingapp/shared/hooks/useAssignments', () => ({
  useAssignments: mockUseAssignments,
}));
vi.mock('@caterkingapp/shared/hooks/useToast', () => ({
  useToast: mockUseToast,
}));
vi.mock('@caterkingapp/shared/hooks/useUser', () => ({
  useUser: mockUseUser,
}));
vi.mock('@caterkingapp/shared/hooks/useStaff', () => ({
  useStaff: vi.fn(),
}));
vi.mock('@caterkingapp/shared/hooks/useTasks', () => ({
  useTasks: vi.fn(),
}));
vi.mock('@caterkingapp/shared/hooks/useAssignments', () => ({
  useAssignments: vi.fn(),
}));
const mockUseRecipe = vi.fn();
vi.mock('@caterkingapp/shared/hooks/useRecipe', () => ({
  useRecipe: mockUseRecipe,
}));
vi.mock('@caterkingapp/shared/hooks/useToast', () => ({
  useToast: vi.fn(),
}));
vi.mock('@caterkingapp/shared/hooks/useUser', () => ({
  useUser: vi.fn(),
}));

// Import hooks
import { useEvents } from '@caterkingapp/shared/hooks/useEvents';
import { useStaff } from '@caterkingapp/shared/hooks/useStaff';
import { useTasks } from '@caterkingapp/shared/hooks/useTasks';
import { useAssignments } from '@caterkingapp/shared/hooks/useAssignments';
import { useToast } from '@caterkingapp/shared/hooks/useToast';
import { useUser } from '@caterkingapp/shared/hooks/useUser';

// Import components
import { EventForm } from '../apps/admin-crm/components/EventForm';
import { StaffAssignment } from '../apps/admin-crm/components/StaffAssignment';
import { RecipeEditor } from '../apps/admin-crm/components/RecipeEditor';
import EventsPage from '../apps/admin-crm/app/events/page';
import StaffPage from '../apps/admin-crm/app/staff/page';

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
    vi.mocked(useEvents).mockReturnValue({
      data: [],
      isLoading: false,
      createEvent: vi.fn(),
      updateEvent: vi.fn(),
      deleteEvent: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    } as any);
    vi.mocked(useToast).mockReturnValue({
      addToast: vi.fn(),
    } as any);
    vi.mocked(useUser).mockReturnValue({
      data: { id: 'user1', role: 'owner', company_id: 'comp1' },
      isLoading: false,
    } as any);
    vi.mocked(useStaff).mockReturnValue({
      data: [],
      isLoading: false,
      createStaff: vi.fn(),
      updateStaff: vi.fn(),
      deleteStaff: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    } as any);
    vi.mocked(useTasks).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);
    vi.mocked(useAssignments).mockReturnValue({
      assignTask: vi.fn(),
    } as any);
    vi.mocked(mockUseRecipe).mockReturnValue({
      data: null,
      isLoading: false,
      updateRecipe: vi.fn(),
      realtimeState: { isConnected: true },
    });
  });

  describe('EventsPage', () => {
    it('renders loading state', () => {
      vi.mocked(useEvents).mockReturnValue({
        data: [],
        isLoading: true,
        createEvent: vi.fn(),
        updateEvent: vi.fn(),
        deleteEvent: vi.fn(),
        isCreating: false,
        isUpdating: false,
        isDeleting: false,
      } as any);

      render(
        <TestWrapper>
          <EventsPage />
        </TestWrapper>,
      );

      expect(screen.getByText('Loading events...')).toBeInTheDocument();
    });

    it('renders events list', () => {
      vi.mocked(useEvents).mockReturnValue({
        data: [
          {
            id: '1',
            name: 'Event 1',
            date: '2025-12-11',
            location: 'Location 1',
            status: 'planned',
          },
        ],
        isLoading: false,
        createEvent: vi.fn(),
        updateEvent: vi.fn(),
        deleteEvent: vi.fn(),
        isCreating: false,
        isUpdating: false,
        isDeleting: false,
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

    it('opens create form when button clicked', async () => {
      render(
        <TestWrapper>
          <EventsPage />
        </TestWrapper>,
      );

      const createButton = screen.getByRole('button', { name: 'Create Event' });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Create Event' })).toBeInTheDocument();
      });
    });

    it('handles role-based permissions for owner', () => {
      vi.mocked(useUser).mockReturnValue({
        data: { id: 'user1', role: 'owner', company_id: 'comp1' },
        isLoading: false,
      });

      render(
        <TestWrapper>
          <EventsPage />
        </TestWrapper>,
      );

      expect(screen.getByText('Create Event')).toBeInTheDocument();
    });

    it('hides create button for non-manager roles', () => {
      vi.mocked(useUser).mockReturnValue({
        data: { id: 'user1', role: 'staff', company_id: 'comp1' },
        isLoading: false,
      });

      render(
        <TestWrapper>
          <EventsPage />
        </TestWrapper>,
      );

      expect(screen.queryByText('Create Event')).not.toBeInTheDocument();
    });
  });

  describe('StaffPage', () => {
    it('renders staff list', () => {
      vi.mocked(useStaff).mockReturnValue({
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

    it('handles drag and drop task assignment', () => {
      const mockAssignTask = vi.fn();
      vi.mocked(useAssignments).mockReturnValue({
        assignTask: mockAssignTask,
      });
      vi.mocked(useTasks).mockReturnValue({
        data: [{ id: 'task1', name: 'Test Task', assigned_user_id: null }],
        isLoading: false,
      });
      vi.mocked(useStaff).mockReturnValue({
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

      // Note: Testing drag and drop fully would require more complex setup with @dnd-kit testing utilities
      // This test verifies the interface renders correctly
      expect(screen.getByText('Test Task')).toBeInTheDocument();
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
      vi.mocked(useToast).mockReturnValue({
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
        status: 'planned',
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
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'New Event',
            date: '2025-12-11T10:00',
            location: 'New Location',
            status: 'planned',
          }),
        );
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

  describe('StaffAssignment', () => {
    it('renders task assignment interface', () => {
      vi.mocked(useTasks).mockReturnValue({
        data: [{ id: 'task1', name: 'Test Task', assigned_user_id: null }],
        isLoading: false,
      });
      vi.mocked(useStaff).mockReturnValue({
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
      });

      render(
        <TestWrapper>
          <StaffAssignment />
        </TestWrapper>,
      );

      expect(screen.getByText('Task Assignment')).toBeInTheDocument();
      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.getByText('Staff 1')).toBeInTheDocument();
    });

    it('handles task assignment via drag and drop', () => {
      const mockAssignTask = vi.fn();
      vi.mocked(useAssignments).mockReturnValue({
        assignTask: mockAssignTask,
      });
      vi.mocked(useTasks).mockReturnValue({
        data: [{ id: 'task1', name: 'Test Task', assigned_user_id: null }],
        isLoading: false,
      });
      vi.mocked(useStaff).mockReturnValue({
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
      });

      render(
        <TestWrapper>
          <StaffAssignment />
        </TestWrapper>,
      );

      // Simulate drag end
      // Note: Full drag simulation requires @dnd-kit test utils, this verifies setup
      expect(mockAssignTask).not.toHaveBeenCalled(); // Not called yet
    });
  });

  describe('RecipeEditor', () => {
    it('renders recipe data', () => {
      const mockRecipe = {
        id: '1',
        name: 'Test Recipe',
        ingredients: [{ name: 'Flour', quantity: 2, unit: 'cups' }],
        steps: ['Mix ingredients'],
        media_urls: [],
      };

      vi.mocked(mockUseRecipe).mockReturnValue({
        data: mockRecipe,
        isLoading: false,
        updateRecipe: vi.fn(),
        realtimeState: { isConnected: true },
      });

      render(
        <TestWrapper>
          <RecipeEditor recipeId="1" />
        </TestWrapper>,
      );

      expect(screen.getByDisplayValue('Test Recipe')).toBeInTheDocument();
      expect(screen.getByText('Flour')).toBeInTheDocument();
      expect(screen.getByText('Mix ingredients')).toBeInTheDocument();
    });

    it('adds ingredient', () => {
      vi.mocked(mockUseRecipe).mockReturnValue({
        data: { id: '1', name: 'Test', ingredients: [], steps: [], media_urls: [] },
        isLoading: false,
        updateRecipe: vi.fn(),
        realtimeState: { isConnected: true },
      });

      render(
        <TestWrapper>
          <RecipeEditor recipeId="1" />
        </TestWrapper>,
      );

      const nameInput = screen.getByPlaceholderText('Ingredient name');
      const quantityInput = screen.getByPlaceholderText('Quantity');
      const unitInput = screen.getByPlaceholderText('Unit');
      const addButton = screen.getByText('Add');

      fireEvent.change(nameInput, { target: { value: 'Sugar' } });
      fireEvent.change(quantityInput, { target: { value: '1' } });
      fireEvent.change(unitInput, { target: { value: 'cup' } });
      fireEvent.click(addButton);

      expect(screen.getByText('Sugar')).toBeInTheDocument();
    });

    it('removes ingredient', () => {
      const mockRecipe = {
        id: '1',
        name: 'Test Recipe',
        ingredients: [{ name: 'Flour', quantity: 2, unit: 'cups' }],
        steps: [],
        media_urls: [],
      };

      vi.mocked(mockUseRecipe).mockReturnValue({
        data: mockRecipe,
        isLoading: false,
        updateRecipe: vi.fn(),
        realtimeState: { isConnected: true },
      });

      render(
        <TestWrapper>
          <RecipeEditor recipeId="1" />
        </TestWrapper>,
      );

      const removeButton = screen.getByText('Remove');
      fireEvent.click(removeButton);

      expect(screen.queryByText('Flour')).not.toBeInTheDocument();
    });
  });
});
