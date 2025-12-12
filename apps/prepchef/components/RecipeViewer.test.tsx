import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { RecipeViewer } from './RecipeViewer';
import { useRecipe } from '@caterkingapp/shared/hooks/useRecipe';
import { vi, describe, it, beforeEach, expect } from 'vitest';

// Mock the hook
vi.mock('@caterkingapp/shared/hooks/useRecipe');

const mockUseRecipe = vi.mocked(useRecipe);

describe('RecipeViewer', () => {
  const mockRecipe = {
    id: '1',
    name: 'Test Recipe',
    ingredients: [
      { name: 'Flour', quantity: 2, unit: 'cups' },
      { name: 'Sugar', quantity: 1, unit: 'cup' },
    ],
    steps: ['Mix ingredients', 'Bake at 350F'],
    media_urls: ['image1.jpg'],
  };

  beforeEach(() => {
    cleanup();
    mockUseRecipe.mockReturnValue({
      data: mockRecipe,
      isLoading: false,
      error: null,
      realtimeState: {
        isConnected: true,
        lastUpdate: new Date(),
      },
    } as any);
  });

  it('renders recipe name and tabs', () => {
    render(<RecipeViewer recipeId="1" onClose={() => {}} taskQuantity={1} />);
    expect(screen.getByText('Test Recipe')).toBeTruthy();

    // Use getAllByText since there are multiple tabs rendered across test instances
    const stepsTabs = screen.getAllByText('steps');
    expect(stepsTabs.length).toBeGreaterThan(0);

    const ingredientsTabs = screen.getAllByText('ingredients');
    expect(ingredientsTabs.length).toBeGreaterThan(0);
  });

  it('displays steps when steps tab is active', () => {
    render(<RecipeViewer recipeId="1" onClose={() => {}} taskQuantity={1} />);
    // Click the first steps tab
    const stepsTabs = screen.getAllByText('steps');
    fireEvent.click(stepsTabs[0]);
    expect(screen.getByText('Mix ingredients')).toBeTruthy();
  });

  it('scales ingredients based on slider', () => {
    render(<RecipeViewer recipeId="1" onClose={() => {}} taskQuantity={1} />);
    // Click the first ingredients tab
    const ingredientsTabs = screen.getAllByText('ingredients');
    fireEvent.click(ingredientsTabs[0]);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '2' } });

    // Look for the scaled ingredient
    expect(screen.getByText('4 cups Flour')).toBeTruthy();
  });

  it('calls onClose when close button is clicked', () => {
    const mockOnClose = vi.fn();
    render(<RecipeViewer recipeId="1" onClose={mockOnClose} taskQuantity={1} />);

    // Get the first close button
    const closeButtons = screen.getAllByLabelText('Close recipe viewer');
    fireEvent.click(closeButtons[0]);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
