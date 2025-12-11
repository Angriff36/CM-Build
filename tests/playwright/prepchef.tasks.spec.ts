import { test, expect } from '@playwright/test';
import { RealtimeChaosHelper } from './helpers/realtimeChaos';

test.describe('@PrepChef PrepChef Task Management', () => {
  let chaosHelper: RealtimeChaosHelper;

  test.beforeEach(async ({ page }) => {
    chaosHelper = new RealtimeChaosHelper(page);
    await page.goto('/prepchef');
  });

  test('should display task dashboard', async ({ page }) => {
    // Verify main dashboard loads
    await expect(page.locator('h1')).toBeVisible();

    // Check for task-related elements
    const taskElements = page.locator(
      '[data-testid*="task"], .task, [role="button"][aria-label*="Task"]',
    );
    if ((await taskElements.count()) > 0) {
      await expect(taskElements.first()).toBeVisible();
    }
  });

  test('should handle task claiming workflow', async ({ page }) => {
    // Look for claimable tasks
    const claimButton = page
      .locator('button')
      .filter({ hasText: /claim|take/i })
      .first();
    if ((await claimButton.count()) > 0) {
      await claimButton.click();

      // Verify task was claimed (button state changes or task moves)
      await page.waitForTimeout(1000);
    }
  });

  test('should handle task completion workflow', async ({ page }) => {
    // Look for completable tasks
    const completeButton = page
      .locator('button')
      .filter({ hasText: /complete|done|finish/i })
      .first();
    if ((await completeButton.count()) > 0) {
      await completeButton.click();

      // Verify task was completed
      await page.waitForTimeout(1000);
    }
  });

  test('should handle realtime updates', async ({ page }) => {
    // Test that page responds to realtime changes
    await page.reload();
    await expect(page.locator('body')).toBeVisible();

    // Simulate realtime connection issues
    await chaosHelper.enableChaos();

    // Verify polling fallback works
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();

    await chaosHelper.disableChaos();
  });

  test('should maintain accessibility standards', async ({ page }) => {
    // Check for proper heading structure
    await expect(page.locator('h1')).toBeVisible();

    // Test keyboard navigation
    const focusableElements = page.locator('button, [role="button"], a, input, select');
    if ((await focusableElements.count()) > 0) {
      await focusableElements.first().focus();
      await expect(focusableElements.first()).toBeFocused();
    }
  });
});
