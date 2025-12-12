import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@caterkingapp/shared/hooks/useEvents');
vi.mock('@caterkingapp/shared/hooks/useStaff');
vi.mock('@caterkingapp/shared/hooks/useTasks');
vi.mock('@caterkingapp/shared/hooks/useAssignments');
vi.mock('@caterkingapp/shared/hooks/useRecipe');
vi.mock('@caterkingapp/shared/hooks/useToast');
vi.mock('@caterkingapp/shared/hooks/useUser');

import { useEvents } from '@caterkingapp/shared/hooks/useEvents';
import { useStaff } from '@caterkingapp/shared/hooks/useStaff';
import { useTasks } from '@caterkingapp/shared/hooks/useTasks';
import { useAssignments } from '@caterkingapp/shared/hooks/useAssignments';
import { useRecipe } from '@caterkingapp/shared/hooks/useRecipe';
import { useToast } from '@caterkingapp/shared/hooks/useToast';
import { useUser } from '@caterkingapp/shared/hooks/useUser';
import { EventForm } from '../apps/admin-crm/components/EventForm';
import { RecipeEditor } from '../apps/admin-crm/components/RecipeEditor';
import EventsPage from '../apps/admin-crm/app/events/page';
import StaffPage from '../apps/admin-crm/app/staff/page';

const mockUseEvents = vi.mocked(useEvents);
const mockUseStaff = vi.mocked(useStaff);
const mockUseTasks = vi.mocked(useTasks);
const mockUseAssignments = vi.mocked(useAssignments);
const mockUseRecipe = vi.mocked(useRecipe);
const mockUseToast = vi.mocked(useToast);
const mockUseUser = vi.mocked(useUser);

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
  });

  describe('EventsPage', () => {
    beforeEach(() => {
      mockUseEvents.mockReturnValue({
        data: [],
        isLoading: false,
        createEvent: vi.fn(),
        updateEvent: vi.fn(),
        deleteEvent: vi.fn(),
        isCreating: false,
        isUpdating: false,
        isDeleting: false,
      } as any);
      mockUseToast.mockReturnValue({
        addToast: vi.fn(),
      });
      mockUseUser.mockReturnValue({
        data: { id: 'user1', role: 'owner', company_id: 'comp1' },
        isLoading: false,
      } as any);
    });

    it('renders loading state', () => {
      mockUseEvents.mockReturnValue({
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
      mockUseEvents.mockReturnValue({
        data: [
          { id: '1', name: 'Event 1', date: '2025-12-11', location: 'Location 1', status: 'planned' },
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

    it('opens create form when button clicked', () => {
      render(
        <TestWrapper>
          <EventsPage />
        </TestWrapper>,
      );

      const createButton = screen.getByText('Create Event');
      fireEvent.click(createButton);

      expect(screen.getByText('Create Event')).toBeInTheDocument();
    });
  });

  describe('StaffPage', () => {
    beforeEach(() => {
      mockUseStaff.mockReturnValue({
        data: [],
        isLoading: false,
        createStaff: vi.fn(),
        updateStaff: vi.fn(),
        deleteStaff: vi.fn(),
        isCreating: false,
        isUpdating: false,
        isDeleting: false,
      } as any);
      mockUseTasks.mockReturnValue({
        data: [],
        isLoading: false,
      } as any);
      mockUseAssignments.mockReturnValue({
        assignTask: vi.fn(),
      } as any);
      mockUseToast.mockReturnValue({
        addToast: vi.fn(),
      });
      mockUseUser.mockReturnValue({
        data: { id: 'user1', role: 'owner', company_id: 'comp1' },
        isLoading: false,
      } as any);
    });

    it('renders staff list', () => {
      mockUseStaff.mockReturnValue({
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
      expect(screen.getByText('Staff 1')).toBeInTheDocument();
    });

    it('renders task assignment interface', () => {
      render(
        <TestWrapper>
          <StaffPage />
        </TestWrapper>,
      );

      expect(screen.getByText('Task Assignment')).toBeInTheDocument();
    });
  });
    mockUseUser.mockReturnValue({
      data: { id: 'user1', role: 'owner', company_id: 'comp1' },
      isLoading: false,
    });
  });

  describe('EventsPage', () => {
    it('renders loading state', () => {
      mockUseEvents.mockReturnValue({
        events: [],
        isLoading: true,
        createEvent: vi.fn(),
        updateEvent: vi.fn(),
        deleteEvent: vi.fn(),
        isCreating: false,
        isUpdating: false,
        isDeleting: false,
      });

      render(
        <TestWrapper>
          <EventsPage />
        </TestWrapper>,
      );

      expect(screen.getByText('Loading events...')).toBeInTheDocument();
    });

    it('renders events list', () => {
      mockUseEvents.mockReturnValue({
        events: [
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
      });

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
      mockUseEvents.mockReturnValue({
        events: [],
        isLoading: false,
        createEvent: vi.fn(),
        updateEvent: vi.fn(),
        deleteEvent: vi.fn(),
        isCreating: false,
        isUpdating: false,
        isDeleting: false,
      });

      render(
        <TestWrapper>
          <EventsPage />
        </TestWrapper>,
      );

      const createButton = screen.getByText('Create Event');
      fireEvent.click(createButton);

      expect(screen.getByText('Create Event')).toBeInTheDocument();
    });
  });

  describe('StaffPage', () => {
    it('renders staff list', () => {
      mockUseStaff.mockReturnValue({
        staff: [
          { id: '1', display_name: 'Staff 1', role: 'staff', status: 'active', presence: 'online' },
        ],
        isLoading: false,
        createStaff: vi.fn(),
        updateStaff: vi.fn(),
        deleteStaff: vi.fn(),
        isCreating: false,
        isUpdating: false,
        isDeleting: false,
      });
      mockUseTasks.mockReturnValue({
        data: [],
        isLoading: false,
      });
      mockUseAssignments.mockReturnValue({
        assignTask: vi.fn(),
      });

      render(
        <TestWrapper>
          <StaffPage />
        </TestWrapper>,
      );

      expect(screen.getByText('Staff Management')).toBeInTheDocument();
      expect(screen.getByText('Staff 1')).toBeInTheDocument();
    });

    it('renders task assignment interface', () => {
      mockUseStaff.mockReturnValue({
        staff: [],
        isLoading: false,
        createStaff: vi.fn(),
        updateStaff: vi.fn(),
        deleteStaff: vi.fn(),
        isCreating: false,
        isUpdating: false,
        isDeleting: false,
      });
      mockUseTasks.mockReturnValue({
        data: [],
        isLoading: false,
      });
      mockUseAssignments.mockReturnValue({
        assignTask: vi.fn(),
      });

      render(
        <TestWrapper>
          <StaffPage />
        </TestWrapper>,
      );

      expect(screen.getByText('Task Assignment')).toBeInTheDocument();
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
      mockUseToast.mockReturnValue({
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
      id: 'recipe1',
      name: 'Test Recipe',
      ingredients: [{ name: 'Flour', quantity: 2, unit: 'cups' }],
      steps: ['Mix ingredients'],
      media_urls: [],
    };

    beforeEach(() => {
      mockUseRecipe.mockReturnValue({
        data: mockRecipe,
        isLoading: false,
        updateRecipe: vi.fn(),
        isUpdating: false,
      } as any);
      mockUseToast.mockReturnValue({
        addToast: vi.fn(),
      });
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

      const removeButton = screen.getByText('Remove');
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
      render(
        <TestWrapper>
          <RecipeEditor recipeId="recipe1" />
        </TestWrapper>,
      );

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText('Upload Media');

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText('Uploading... 100%')).toBeInTheDocument();
      });
    });

    it('saves recipe', () => {
      const mockUpdateRecipe = vi.fn();
      mockUseRecipe.mockReturnValue({
        recipe: mockRecipe,
        isLoading: false,
        updateRecipe: mockUpdateRecipe,
      });

      render(
        <TestWrapper>
          <RecipeEditor recipeId="recipe1" />
        </TestWrapper>,
      );

      const saveButton = screen.getByText('Save Recipe');
      fireEvent.click(saveButton);

      expect(mockUpdateRecipe).toHaveBeenCalled();
    });
  });
});
