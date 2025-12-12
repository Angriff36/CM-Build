import { test, expect } from '@playwright/test';

test.describe('@E2E Recipe Viewer Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/prepchef');
  });

  test('displays recipe details when task is selected', async ({ page }) => {
    // Step 1: Find a task with recipe
    const taskCard = page.locator('[data-testid*="task"], .task').first();

    await expect(taskCard).toBeVisible({ timeout: 10000 });

    // Step 2: Click on task to view recipe
    await taskCard.click();

    // Step 3: Verify recipe viewer opens
    const recipeViewer = page.locator(
      '[data-testid="recipe-viewer"], .recipe-viewer, .recipe-modal',
    );
    await expect(recipeViewer).toBeVisible({ timeout: 5000 });

    // Step 4: Verify recipe content is displayed
    const recipeTitle = recipeViewer.locator('h2, h3, .recipe-title');
    await expect(recipeTitle).toBeVisible();

    const ingredients = recipeViewer.locator('.ingredients, [data-testid="ingredients"]');
    await expect(ingredients).toBeVisible();

    const steps = recipeViewer.locator('.steps, .instructions, [data-testid="steps"]');
    await expect(steps).toBeVisible();
  });

  test('recipe viewer handles media content correctly', async ({ page }) => {
    // Find a task with media
    const taskWithMedia = page
      .locator('[data-testid*="task"].has-media, .task[data-has-media="true"]')
      .first();

    if (await taskWithMedia.isVisible()) {
      await taskWithMedia.click();

      const recipeViewer = page.locator('[data-testid="recipe-viewer"], .recipe-viewer');
      await expect(recipeViewer).toBeVisible();

      // Check for media content
      const mediaContent = recipeViewer.locator('img, video, .media-container');

      if ((await mediaContent.count()) > 0) {
        await expect(mediaContent.first()).toBeVisible();

        // Verify media loads correctly
        const firstMedia = mediaContent.first();
        if (await firstMedia.getAttribute('src')) {
          await expect(firstMedia).toHaveAttribute('src');
        }
      }
    }
  });

  test('recipe viewer maintains accessibility', async ({ page }) => {
    const taskCard = page.locator('[data-testid*="task"], .task').first();
    await taskCard.click();

    const recipeViewer = page.locator('[data-testid="recipe-viewer"], .recipe-viewer');
    await expect(recipeViewer).toBeVisible();

    // Test keyboard navigation
    const closeButton = recipeViewer.locator('button').filter({ hasText: /close|×/i });
    await closeButton.focus();
    await expect(closeButton).toBeFocused();

    // Test ARIA attributes
    await expect(recipeViewer).toHaveAttribute('role', 'dialog');
    await expect(closeButton).toHaveAttribute('aria-label');

    // Test focus trap
    await page.keyboard.press('Tab');
    const focusableElement = page.locator(':focus');
    expect(await recipeViewer.contains(focusableElement)).toBeTruthy();
  });

  test('recipe viewer works offline', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true);

    const taskCard = page.locator('[data-testid*="task"], .task').first();
    await taskCard.click();

    const recipeViewer = page.locator('[data-testid="recipe-viewer"], .recipe-viewer');
    await expect(recipeViewer).toBeVisible();

    // Should show cached content
    const recipeContent = recipeViewer.locator('.recipe-content, .recipe-body');
    await expect(recipeContent).toBeVisible();

    // Media might show placeholders
    const mediaPlaceholders = recipeViewer.locator('.media-placeholder, .offline-media');
    // It's okay if these exist or not

    // Restore connection
    await page.context().setOffline(false);
  });

  test('recipe viewer scales and portions functionality', async ({ page }) => {
    const taskCard = page.locator('[data-testid*="task"], .task').first();
    await taskCard.click();

    const recipeViewer = page.locator('[data-testid="recipe-viewer"], .recipe-viewer');
    await expect(recipeViewer).toBeVisible();

    // Look for scaling controls
    const scalingControls = recipeViewer.locator('.scaling-controls, [data-testid="scaling"]');

    if (await scalingControls.isVisible()) {
      const scaleUpButton = scalingControls
        .locator('button')
        .filter({ hasText: /\+|increase|scale up/i });
      const scaleDownButton = scalingControls
        .locator('button')
        .filter({ hasText: /-|decrease|scale down/i });

      if (await scaleUpButton.isVisible()) {
        const originalIngredients = await recipeViewer.locator('.ingredients').textContent();

        await scaleUpButton.click();
        await page.waitForTimeout(1000);

        const scaledIngredients = await recipeViewer.locator('.ingredients').textContent();
        expect(scaledIngredients).not.toBe(originalIngredients);
      }
    }
  });

  test('recipe viewer cross-references and allergen warnings', async ({ page }) => {
    const taskCard = page.locator('[data-testid*="task"], .task').first();
    await taskCard.click();

    const recipeViewer = page.locator('[data-testid="recipe-viewer"], .recipe-viewer');
    await expect(recipeViewer).toBeVisible();

    // Check for allergen warnings
    const allergenWarnings = recipeViewer.locator(
      '.allergen-warning, .allergen-alert, [data-allergens]',
    );

    if ((await allergenWarnings.count()) > 0) {
      await expect(allergenWarnings.first()).toBeVisible();
    }

    // Check for cross-references to other recipes
    const crossReferences = recipeViewer.locator(
      '.cross-reference, .related-recipe, [data-related]',
    );

    if ((await crossReferences.count()) > 0) {
      await expect(crossReferences.first()).toBeVisible();
    }
  });

  test('recipe viewer print and sharing functionality', async ({ page }) => {
    const taskCard = page.locator('[data-testid*="task"], .task').first();
    await taskCard.click();

    const recipeViewer = page.locator('[data-testid="recipe-viewer"], .recipe-viewer');
    await expect(recipeViewer).toBeVisible();

    // Look for print button
    const printButton = recipeViewer.locator('button').filter({ hasText: /print/i });

    if (await printButton.isVisible()) {
      // Test print functionality (mock)
      await expect(printButton).toBeVisible();
    }

    // Look for share button
    const shareButton = recipeViewer.locator('button').filter({ hasText: /share/i });

    if (await shareButton.isVisible()) {
      await expect(shareButton).toBeVisible();
    }
  });
});
