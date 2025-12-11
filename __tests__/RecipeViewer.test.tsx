import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { useRecipe } from '@caterkingapp/shared/hooks/useRecipe';
import { RecipeViewer } from '../apps/prepchef/components/RecipeViewer';

vi.mock('@caterkingapp/shared/hooks/useRecipe', () => ({
  useRecipe: vi.fn(),
}));

vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>,
}));

const mockUseRecipe = vi.mocked(useRecipe);

type UseRecipeResult = ReturnType<typeof useRecipe>;

const createUseRecipeResult = (overrides: Partial<UseRecipeResult>): UseRecipeResult =>
  ({
    data: null,
    isLoading: false,
    error: null,
    ...overrides,
  }) as UseRecipeResult;

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

const mockRecipe = {
  id: 'recipe1',
  name: 'Test Recipe',
  ingredients: [
    { name: 'Flour', quantity: 2, unit: 'cups' },
    { name: 'Sugar', quantity: 1, unit: 'cup' },
  ],
  steps: ['Mix ingredients', 'Bake at 350°F'],
  media_urls: ['image1.jpg', 'video1.mp4'],
};

const defaultProps = {
  recipeId: 'recipe1',
  onClose: vi.fn(),
  taskQuantity: 1,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RecipeViewer', () => {
  it('renders loading state', () => {
    mockUseRecipe.mockReturnValue(createUseRecipeResult({ isLoading: true }));

    render(
      <TestWrapper>
        <RecipeViewer {...defaultProps} />
      </TestWrapper>,
    );

    expect(screen.getByText('Loading recipe...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseRecipe.mockReturnValue(createUseRecipeResult({ error: new Error('Test error') }));

    render(
      <TestWrapper>
        <RecipeViewer {...defaultProps} />
      </TestWrapper>,
    );

    expect(screen.getByText('Error loading recipe')).toBeInTheDocument();
  });

  it('renders recipe data correctly', () => {
    mockUseRecipe.mockReturnValue(createUseRecipeResult({ data: mockRecipe }));

    render(
      <TestWrapper>
        <RecipeViewer {...defaultProps} />
      </TestWrapper>,
    );

    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    expect(screen.getByText('Mix ingredients')).toBeInTheDocument();
    expect(screen.getByText('Bake at 350°F')).toBeInTheDocument();
  });

  it('renders ingredients with scaling', () => {
    mockUseRecipe.mockReturnValue(createUseRecipeResult({ data: mockRecipe }));

    render(
      <TestWrapper>
        <RecipeViewer {...defaultProps} />
      </TestWrapper>,
    );

    // Switch to ingredients tab
    const ingredientsTab = screen.getByText('Ingredients');
    fireEvent.click(ingredientsTab);

    expect(screen.getByText('2 cups Flour')).toBeInTheDocument();
    expect(screen.getByText('1 cup Sugar')).toBeInTheDocument();
  });

  it('scales ingredients based on slider', () => {
    mockUseRecipe.mockReturnValue(createUseRecipeResult({ data: mockRecipe }));

    render(
      <TestWrapper>
        <RecipeViewer {...defaultProps} />
      </TestWrapper>,
    );

    // Switch to ingredients tab
    const ingredientsTab = screen.getByText('Ingredients');
    fireEvent.click(ingredientsTab);

    const scaleSlider = screen.getByRole('slider');
    fireEvent.change(scaleSlider, { target: { value: '2' } });

    expect(screen.getByText('4 cups Flour')).toBeInTheDocument();
    expect(screen.getByText('2 cups Sugar')).toBeInTheDocument();
  });

  it('renders media gallery', () => {
    mockUseRecipe.mockReturnValue(createUseRecipeResult({ data: mockRecipe }));

    render(
      <TestWrapper>
        <RecipeViewer {...defaultProps} />
      </TestWrapper>,
    );

    // Switch to media tab
    const mediaTab = screen.getByText('Media');
    fireEvent.click(mediaTab);

    // Should render media thumbnails, not the no media message
    expect(screen.queryByText('No media available for this recipe.')).not.toBeInTheDocument();
    // Check that media gallery is rendered (grid container)
    expect(screen.getByRole('img', { name: 'Recipe image 1' })).toBeInTheDocument();
  });

  it('renders markdown in steps', () => {
    const recipeWithMarkdown = {
      ...mockRecipe,
      steps: ['**Bold** text and *italic* text'],
    };
    mockUseRecipe.mockReturnValue(createUseRecipeResult({ data: recipeWithMarkdown }));

    render(
      <TestWrapper>
        <RecipeViewer {...defaultProps} />
      </TestWrapper>,
    );

    const markdownElement = screen.getByTestId('markdown');
    expect(markdownElement).toHaveTextContent('**Bold** text and *italic* text');
  });

  it('closes on close button click', () => {
    mockUseRecipe.mockReturnValue(createUseRecipeResult({ data: mockRecipe }));

    render(
      <TestWrapper>
        <RecipeViewer {...defaultProps} />
      </TestWrapper>,
    );

    const closeButton = screen.getByLabelText('Close recipe viewer');
    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('closes on escape key', () => {
    mockUseRecipe.mockReturnValue(createUseRecipeResult({ data: mockRecipe }));

    render(
      <TestWrapper>
        <RecipeViewer {...defaultProps} />
      </TestWrapper>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('focuses close button on mount', () => {
    mockUseRecipe.mockReturnValue(createUseRecipeResult({ data: mockRecipe }));

    render(
      <TestWrapper>
        <RecipeViewer {...defaultProps} />
      </TestWrapper>,
    );

    const closeButton = screen.getByLabelText('Close recipe viewer');
    expect(closeButton).toHaveFocus();
  });

  it('shows offline banner when offline', () => {
    mockUseRecipe.mockReturnValue(createUseRecipeResult({ data: mockRecipe }));

    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });

    render(
      <TestWrapper>
        <RecipeViewer {...defaultProps} />
      </TestWrapper>,
    );

    expect(screen.getByText('Offline mode active. Please check connection.')).toBeInTheDocument();
  });

  it('disables scaling when offline', () => {
    mockUseRecipe.mockReturnValue(createUseRecipeResult({ data: mockRecipe }));

    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });

    render(
      <TestWrapper>
        <RecipeViewer {...defaultProps} />
      </TestWrapper>,
    );

    // Switch to ingredients tab
    const ingredientsTab = screen.getByText('Ingredients');
    fireEvent.click(ingredientsTab);

    expect(screen.getByText('Reconnect to scale')).toBeInTheDocument();
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  });

  it('shows media placeholders when offline', () => {
    mockUseRecipe.mockReturnValue(createUseRecipeResult({ data: mockRecipe }));

    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });

    render(
      <TestWrapper>
        <RecipeViewer {...defaultProps} />
      </TestWrapper>,
    );

    // Switch to media tab
    const mediaTab = screen.getByText('Media');
    fireEvent.click(mediaTab);

    expect(screen.getByText('Image')).toBeInTheDocument();
    expect(screen.getByText('Video')).toBeInTheDocument();
  });
});
