import { test, expect } from '@playwright/test';

test.describe('Recipe Viewer E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/prepchef');
  });

  test('Recipe viewer opens, displays media, user can interact', async ({ page }) => {
    // Wait for tasks with recipes
    await page.waitForSelector('[data-testid*="task"]', { timeout: 10000 });

    // Find task with recipe link
    const recipeLink = page.locator('[data-testid*="recipe-link"], a[href*="recipe"]').first();
    await expect(recipeLink).toBeVisible();

    // Open recipe drawer
    await recipeLink.click();

    // Verify drawer opens
    const drawer = page.locator('[data-testid="recipe-drawer"], .drawer').first();
    await expect(drawer).toBeVisible();

    // Verify media display
    const media = drawer.locator('img, video, [data-testid*="media"]');
    await expect(media.first()).toBeVisible();

    // Interact: perhaps scale or navigate tabs
    const scaleSlider = drawer.locator('input[type="range"], [data-testid="scale-slider"]');
    if ((await scaleSlider.count()) > 0) {
      await scaleSlider.fill('2'); // Scale to 2x
      // Verify ingredients update
      const ingredients = drawer.locator('[data-testid*="ingredient"]');
      await expect(ingredients.first()).toContainText('2'); // Assuming scaled
    }

    // Close drawer
    const closeButton = drawer.locator('button[aria-label*="close"], .close');
    await closeButton.click();
    await expect(drawer).not.toBeVisible();
  });
});
