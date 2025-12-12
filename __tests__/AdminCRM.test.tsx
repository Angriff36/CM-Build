import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { useEvents } from '@caterkingapp/shared/hooks/useEvents';
import { useStaff } from '@caterkingapp/shared/hooks/useStaff';
import { useRecipe } from '@caterkingapp/shared/hooks/useRecipe';
import { useToast } from '@caterkingapp/shared/hooks/useToast';
import { EventForm } from '../apps/admin-crm/components/EventForm';
import { RecipeEditor } from '../apps/admin-crm/components/RecipeEditor';

vi.mock('@caterkingapp/shared/hooks/useEvents', () => ({
  useEvents: vi.fn(),
}));

vi.mock('@caterkingapp/shared/hooks/useStaff', () => ({
  useStaff: vi.fn(),
}));

vi.mock('@caterkingapp/shared/hooks/useRecipe', () => ({
  useRecipe: vi.fn(),
}));

vi.mock('@caterkingapp/shared/hooks/useToast', () => ({
  useToast: vi.fn(),
}));

vi.mock('@caterkingapp/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'user1' } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { company_id: 'comp1' } })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 'media1' } })),
        })),
      })),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({})),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'http://example.com/image.jpg' } })),
      })),
    },
  })),
}));

const mockUseEvents = vi.mocked(useEvents);
const mockUseStaff = vi.mocked(useStaff);
const mockUseRecipe = vi.mocked(useRecipe);
const mockUseToast = vi.mocked(useToast);

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
    mockUseToast.mockReturnValue({
      addToast: vi.fn(),
    });
  });

  describe('EventForm', () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();

    const defaultProps = {
      onSubmit: mockOnSubmit,
      onCancel: mockOnCancel,
    };

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
        recipe: mockRecipe,
        isLoading: false,
        updateRecipe: vi.fn(),
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
