import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EventsPage from '../app/events/page';
import StaffPage from '../app/staff/page';
import { RecipeEditor } from '../components/RecipeEditor';
import { EventForm } from '../components/EventForm';

// Mock hooks
let mockUseEvents: any;
let mockUseStaff: any;
let mockUseRecipe: any;
let mockUseToast: any;
let mockUseTasks: any;
let mockUseAssignments: any;
let mockUseUser: any;
let mockCreateClient: any;

vi.mock('@caterkingapp/shared/hooks/useEvents', () => ({
  useEvents: (...args: any[]) => mockUseEvents(...args),
}));
vi.mock('@caterkingapp/shared/hooks/useStaff', () => ({
  useStaff: (...args: any[]) => mockUseStaff(...args),
}));
vi.mock('@caterkingapp/shared/hooks/useRecipe', () => ({
  useRecipe: (...args: any[]) => mockUseRecipe(...args),
}));
vi.mock('@caterkingapp/shared/hooks/useToast', () => ({
  useToast: (...args: any[]) => mockUseToast(...args),
}));
vi.mock('@caterkingapp/shared/hooks/useTasks', () => ({
  useTasks: (...args: any[]) => mockUseTasks(...args),
}));
vi.mock('@caterkingapp/shared/hooks/useAssignments', () => ({
  useAssignments: (...args: any[]) => mockUseAssignments(...args),
}));
vi.mock('@caterkingapp/shared/hooks/useUser', () => ({
  useUser: (...args: any[]) => mockUseUser(...args),
}));
vi.mock('@caterkingapp/supabase/client', () => ({
  createClient: (...args: any[]) => mockCreateClient(...args),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
);

describe('AdminCRM Components', () => {
  beforeEach(() => {
    mockUseEvents = vi.fn();
    mockUseStaff = vi.fn();
    mockUseRecipe = vi.fn();
    mockUseToast = vi.fn().mockReturnValue({ addToast: vi.fn() });
    mockUseTasks = vi.fn();
    mockUseAssignments = vi.fn().mockReturnValue({ assignTask: vi.fn() });
    mockUseUser = vi.fn().mockReturnValue({ data: { role: 'owner' }, isLoading: false });
    mockCreateClient = vi.fn();
  });

  describe('EventsPage', () => {
    it('renders loading state', () => {
      mockUseEvents.mockReturnValue({
        data: [],
        isLoading: true,
        createEvent: vi.fn(),
        updateEvent: vi.fn(),
        deleteEvent: vi.fn(),
      } as any);

      render(<EventsPage />, { wrapper });
      expect(screen.getByText('Loading events...')).toBeInTheDocument();
    });

    it('renders events list', () => {
      mockUseEvents.mockReturnValue({
        data: [
          {
            id: '1',
            name: 'Test Event',
            date: '2023-12-01',
            location: 'Test Location',
            status: 'planned',
          },
        ],
        isLoading: false,
        createEvent: vi.fn(),
        updateEvent: vi.fn(),
        deleteEvent: vi.fn(),
      } as any);

      mockUseToast.mockReturnValue({
        addToast: vi.fn(),
      } as any);

      mockUseUser.mockReturnValue({
        data: { role: 'owner' },
        isLoading: false,
      } as any);

      render(<EventsPage />, { wrapper });
      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByText('Create Event')).toBeInTheDocument();
    });

    it('opens create form when button clicked', () => {
      mockUseEvents.mockReturnValue({
        data: [],
        isLoading: false,
        createEvent: vi.fn(),
        updateEvent: vi.fn(),
        deleteEvent: vi.fn(),
      } as any);

      mockUseToast.mockReturnValue({
        addToast: vi.fn(),
      } as any);

      mockUseUser.mockReturnValue({
        data: { role: 'owner' },
        isLoading: false,
      } as any);

      render(<EventsPage />, { wrapper });
      fireEvent.click(screen.getByRole('button', { name: 'Create Event' }));
      expect(screen.getByRole('heading', { name: 'Create Event' })).toBeInTheDocument();
    });
  });

  describe('StaffPage', () => {
    it('renders staff list', () => {
      mockUseStaff.mockReturnValue({
        data: [
          {
            id: '1',
            display_name: 'John Doe',
            role: 'staff',
            status: 'active',
            presence: 'online',
            shift_start: '09:00',
            shift_end: '17:00',
          },
        ],
        isLoading: false,
        createStaff: vi.fn(),
        updateStaff: vi.fn(),
        deleteStaff: vi.fn(),
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
      } as any);

      mockUseUser.mockReturnValue({
        data: { role: 'owner' },
        isLoading: false,
      } as any);

      render(<StaffPage />, { wrapper });
      expect(screen.getAllByText('John Doe')).toHaveLength(2);
      expect(screen.getByText('Add Staff Member')).toBeInTheDocument();
    });

    it('renders task assignment interface', () => {
      mockUseStaff.mockReturnValue({
        data: [
          {
            id: '1',
            display_name: 'John Doe',
            role: 'staff',
            status: 'active',
            presence: 'online',
            shift_start: '09:00',
            shift_end: '17:00',
          },
        ],
        isLoading: false,
        createStaff: vi.fn(),
        updateStaff: vi.fn(),
        deleteStaff: vi.fn(),
      } as any);

      mockUseTasks.mockReturnValue({
        data: [
          {
            id: 'task1',
            name: 'Prepare ingredients',
            assigned_user_id: null,
          },
        ],
        isLoading: false,
      } as any);

      mockUseAssignments.mockReturnValue({
        assignTask: vi.fn(),
      } as any);

      mockUseToast.mockReturnValue({
        addToast: vi.fn(),
      } as any);

      mockUseUser.mockReturnValue({
        data: { role: 'owner' },
        isLoading: false,
      } as any);

      render(<StaffPage />, { wrapper });
      expect(screen.getByText('Task Assignment')).toBeInTheDocument();
      expect(screen.getByText('Unassigned Tasks')).toBeInTheDocument();
      expect(screen.getByText('Prepare ingredients')).toBeInTheDocument();
    });
  });

  describe('RecipeEditor', () => {
    it('renders recipe data', () => {
      mockUseRecipe.mockReturnValue({
        data: {
          id: '1',
          name: 'Test Recipe',
          ingredients: [],
          steps: [],
          media_urls: [],
        },
        isLoading: false,
        updateRecipe: vi.fn(),
      } as any);

      mockUseToast.mockReturnValue({
        addToast: vi.fn(),
      } as any);

      render(<RecipeEditor recipeId="1" />, { wrapper });
      expect(screen.getByDisplayValue('Test Recipe')).toBeInTheDocument();
      expect(screen.getByText('Save Recipe')).toBeInTheDocument();
    });

    it('adds ingredient', () => {
      mockUseRecipe.mockReturnValue({
        data: {
          id: '1',
          name: 'Test Recipe',
          ingredients: [],
          steps: [],
          media_urls: [],
        },
        isLoading: false,
        updateRecipe: vi.fn(),
      } as any);

      mockUseToast.mockReturnValue({
        addToast: vi.fn(),
      } as any);

      render(<RecipeEditor recipeId="1" />, { wrapper });

      fireEvent.change(screen.getByPlaceholderText('Ingredient name'), {
        target: { value: 'Flour' },
      });
      fireEvent.change(screen.getByPlaceholderText('Quantity'), { target: { value: '2' } });
      fireEvent.change(screen.getByPlaceholderText('Unit'), { target: { value: 'cups' } });
      fireEvent.click(screen.getByText('Add'));

      expect(screen.getByText('Flour')).toBeInTheDocument();
    });

    it('uploads media file', async () => {
      const mockSupabaseClient = {
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user1' } } }) },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockReturnValue({ data: { company_id: 'company1' } }),
            }),
          }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { url: 'https://example.com/test.jpg' } }),
            }),
          }),
        }),
        storage: {
          from: vi.fn().mockReturnValue({
            upload: vi.fn().mockResolvedValue({ error: null }),
            getPublicUrl: vi
              .fn()
              .mockReturnValue({ data: { publicUrl: 'https://example.com/test.jpg' } }),
          }),
        },
      };

      mockCreateClient.mockReturnValue(mockSupabaseClient as any);

      mockUseRecipe.mockReturnValue({
        data: {
          id: '1',
          name: 'Test Recipe',
          ingredients: [],
          steps: [],
          media_urls: [],
        },
        isLoading: false,
        updateRecipe: vi.fn(),
      } as any);

      mockUseToast.mockReturnValue({
        addToast: vi.fn(),
      } as any);

      render(<RecipeEditor recipeId="1" />, { wrapper });

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/Drag and drop/);
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('media');
      });
    });
  });

  describe('EventForm', () => {
    it('validates required fields', async () => {
      const mockOnSubmit = vi.fn();
      const mockOnCancel = vi.fn();

      render(<EventForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.click(screen.getByText('Create'));

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
    });

    it('submits valid form', async () => {
      const mockOnSubmit = vi.fn();
      const mockOnCancel = vi.fn();

      render(<EventForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test Event' } });
      fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2023-12-01T10:00' } });
      fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'Test Location' } });
      fireEvent.click(screen.getByText('Create'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          id: '',
          name: 'Test Event',
          date: '2023-12-01T10:00',
          location: 'Test Location',
          status: 'planned',
        });
      });
    });
  });
});
