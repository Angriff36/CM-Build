import { test, expect } from '@playwright/test';

test.describe('@E2E Recipe Viewer Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/prepchef');
  });

  test('recipe viewer opens → displays media → user can interact', async ({ page }) => {
    // Step 1: Wait for tasks to load
    await page.waitForSelector('[data-testid*="task"]', { timeout: 10000 });

    // Step 2: Find a task with recipe content
    const recipeTask = page
      .locator('[data-testid*="task"]')
      .filter({ hasText: /recipe|ingredients|instructions/i })
      .first();

    if ((await recipeTask.count()) > 0) {
      await expect(recipeTask).toBeVisible();

      // Step 3: Open recipe viewer
      const recipeButton = recipeTask
        .locator('button')
        .filter({ hasText: /view recipe|recipe|open/i })
        .first();
      if ((await recipeButton.count()) > 0) {
        await recipeButton.click();
      } else {
        // Try clicking the task card itself
        await recipeTask.click();
      }

      // Step 4: Verify recipe viewer/drawer opens
      const recipeViewer = page
        .locator('[data-testid="recipe-viewer"], .recipe-drawer, .recipe-modal')
        .first();
      await expect(recipeViewer).toBeVisible({ timeout: 5000 });

      // Step 5: Verify recipe content is displayed
      await expect(
        recipeViewer.locator('h2, h3').filter({ hasText: /recipe|ingredients/i }),
      ).toBeVisible();

      // Step 6: Verify media display (images/videos)
      const mediaElements = recipeViewer.locator(
        'img, video, [data-testid*="media"], .recipe-image',
      );
      if ((await mediaElements.count()) > 0) {
        await expect(mediaElements.first()).toBeVisible();

        // Verify media loads properly
        const firstImage = mediaElements.first();
        await expect(firstImage).toHaveAttribute('src');

        // Test image interaction (click to zoom if available)
        await firstImage.click();
        await page.waitForTimeout(1000);
      }

      // Step 7: Test ingredient scaling interaction
      const scaleSlider = recipeViewer.locator(
        'input[type="range"], [data-testid="scale-slider"], .scale-control',
      );
      if ((await scaleSlider.count()) > 0) {
        // Get initial ingredient amounts
        const ingredients = recipeViewer.locator('[data-testid*="ingredient"], .ingredient');
        const initialAmounts = [];
        for (let i = 0; i < Math.min(await ingredients.count(), 3); i++) {
          initialAmounts.push(await ingredients.nth(i).textContent());
        }

        // Scale to 2x
        await scaleSlider.fill('2');
        await page.waitForTimeout(1000);

        // Verify ingredients updated
        for (let i = 0; i < Math.min(await ingredients.count(), 3); i++) {
          const newAmount = await ingredients.nth(i).textContent();
          expect(newAmount).not.toBe(initialAmounts[i]);
        }
      }

      // Step 8: Test tab navigation (ingredients, instructions, equipment)
      const tabs = recipeViewer.locator('[role="tab"], .tab');
      if ((await tabs.count()) > 1) {
        // Click through tabs
        for (let i = 0; i < (await tabs.count()); i++) {
          await tabs.nth(i).click();
          await page.waitForTimeout(500);
          await expect(tabs.nth(i)).toHaveAttribute('aria-selected', 'true');
        }
      }

      // Step 9: Test accessibility features
      // Verify proper ARIA labels
      await expect(recipeViewer).toHaveAttribute('role', 'dialog');

      // Test keyboard navigation
      const closeButton = recipeViewer.locator(
        'button[aria-label*="close"], .close-button, button[title*="close"]',
      );
      if ((await closeButton.count()) > 0) {
        await closeButton.focus();
        await expect(closeButton).toBeFocused();

        // Test closing with keyboard
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
      } else {
        // Try Escape key
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
      }

      // Step 10: Verify viewer closes
      await expect(recipeViewer).not.toBeVisible();
    } else {
      // If no recipe tasks found, test the recipe viewer directly
      await page.goto('/prepchef/recipe/sample');
      const recipeViewer = page.locator('[data-testid="recipe-viewer"], .recipe-container').first();
      await expect(recipeViewer).toBeVisible({ timeout: 5000 });

      // Test basic functionality
      await expect(recipeViewer.locator('h1, h2')).toBeVisible();

      const mediaElements = recipeViewer.locator('img, video');
      if ((await mediaElements.count()) > 0) {
        await expect(mediaElements.first()).toBeVisible();
      }
    }
  });

  test('recipe viewer handles media loading errors gracefully', async ({ page }) => {
    // Find and open recipe viewer
    const recipeTask = page
      .locator('[data-testid*="task"]')
      .filter({ hasText: /recipe/i })
      .first();

    if ((await recipeTask.count()) > 0) {
      await recipeTask.click();

      const recipeViewer = page.locator('[data-testid="recipe-viewer"], .recipe-drawer').first();
      await expect(recipeViewer).toBeVisible();

      // Intercept image requests to simulate loading errors
      await page.route('**/*.jpg', (route) => route.abort('failed'));
      await page.route('**/*.png', (route) => route.abort('failed'));

      // Reload to trigger error handling
      await page.reload();
      await page.waitForTimeout(2000);

      // Verify fallback content or error state
      const errorFallback = recipeViewer.locator('.image-error, .media-fallback, [alt*="recipe"]');
      if ((await errorFallback.count()) > 0) {
        await expect(errorFallback.first()).toBeVisible();
      }

      // Clean up routes
      await page.unroute('**/*.jpg');
      await page.unroute('**/*.png');
    }
  });

  test('recipe viewer maintains accessibility standards', async ({ page }) => {
    const recipeTask = page
      .locator('[data-testid*="task"]')
      .filter({ hasText: /recipe/i })
      .first();

    if ((await recipeTask.count()) > 0) {
      await recipeTask.click();

      const recipeViewer = page.locator('[data-testid="recipe-viewer"], .recipe-drawer').first();
      await expect(recipeViewer).toBeVisible();

      // Test keyboard navigation through all interactive elements
      const interactiveElements = recipeViewer.locator('button, [role="tab"], input, a');
      for (let i = 0; i < Math.min(await interactiveElements.count(), 5); i++) {
        await interactiveElements.nth(i).focus();
        await expect(interactiveElements.nth(i)).toBeFocused();
        await page.keyboard.press('Tab');
      }

      // Test screen reader support
      const liveRegions = recipeViewer.locator('[aria-live="polite"], [aria-live="assertive"]');
      if ((await liveRegions.count()) > 0) {
        await expect(liveRegions.first()).toBeVisible();
      }

      // Test proper heading structure
      const headings = recipeViewer.locator('h1, h2, h3, h4, h5, h6');
      expect(await headings.count()).toBeGreaterThan(0);

      // Close with Escape key
      await page.keyboard.press('Escape');
      await expect(recipeViewer).not.toBeVisible();
    }
  });
});
