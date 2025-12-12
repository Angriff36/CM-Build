import { test, expect } from '@playwright/test';

test.describe('@E2E Offline Fallback Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/prepchef');
  });

  test('displays cached content when offline', async ({ page }) => {
    // Step 1: Load content while online
    await page.waitForSelector('[data-testid*="task"]', { timeout: 10000 });
    const onlineTaskCount = await page.locator('[data-testid*="task"]').count();

    // Step 2: Go offline
    await page.context().setOffline(true);

    // Step 3: Verify offline banner appears
    const offlineBanner = page.locator('.offline-banner, [data-testid="offline-indicator"]');
    await expect(offlineBanner).toBeVisible({ timeout: 5000 });

    // Step 4: Verify cached content is still displayed
    const cachedTasks = page.locator('[data-testid*="task"]');
    expect(await cachedTasks.count()).toBe(onlineTaskCount);

    // Step 5: Verify interactive elements show offline state
    const claimButtons = page.locator('button').filter({ hasText: /claim|take/i });

    for (let i = 0; i < Math.min(await claimButtons.count(), 3); i++) {
      const button = claimButtons.nth(i);
      await expect(button).toHaveAttribute('disabled');
    }

    // Step 6: Restore connection
    await page.context().setOffline(false);

    // Step 7: Verify offline banner disappears
    await expect(offlineBanner).not.toBeVisible({ timeout: 5000 });

    // Step 8: Verify interactive elements are re-enabled
    await page.waitForTimeout(2000);
    const reEnabledButtons = page.locator('button').filter({ hasText: /claim|take/i });

    if ((await reEnabledButtons.count()) > 0) {
      await expect(reEnabledButtons.first()).not.toHaveAttribute('disabled');
    }
  });

  test('handles realtime connection drops gracefully', async ({ page }) => {
    // Step 1: Wait for initial load
    await page.waitForSelector('[data-testid*="task"]', { timeout: 10000 });

    // Step 2: Simulate connection drop
    await page.context().setOffline(true);

    // Step 3: Verify connection indicator changes
    const connectionIndicator = page.locator(
      '.connection-status, [data-testid="connection-status"]',
    );

    if (await connectionIndicator.isVisible()) {
      await expect(connectionIndicator).toHaveClass(/offline|disconnected/);
    }

    // Step 4: Try to perform an action that would normally use realtime
    const taskCard = page.locator('[data-testid*="task"]').first();
    await taskCard.click();

    // Step 5: Verify appropriate error/fallback handling
    const errorMessage = page.locator('.error-message, [data-testid="offline-error"]');
    const fallbackMessage = page.locator('.fallback-message, [data-testid="offline-fallback"]');

    // Should show either error or fallback message
    expect((await errorMessage.count()) + (await fallbackMessage.count())).toBeGreaterThan(0);

    // Step 6: Restore connection
    await page.context().setOffline(false);

    // Step 7: Verify automatic reconnection
    await page.waitForTimeout(3000);

    if (await connectionIndicator.isVisible()) {
      await expect(connectionIndicator).toHaveClass(/online|connected/);
    }
  });

  test('maintains accessibility during offline mode', async ({ page }) => {
    // Go offline
    await page.context().setOffline(true);

    // Wait for offline banner
    const offlineBanner = page.locator('.offline-banner, [data-testid="offline-indicator"]');
    await expect(offlineBanner).toBeVisible({ timeout: 5000 });

    // Test keyboard navigation
    await offlineBanner.focus();
    await expect(offlineBanner).toBeFocused();

    // Test ARIA live regions announce offline status
    const liveRegions = page.locator('[aria-live="polite"], [aria-live="assertive"]');

    if ((await liveRegions.count()) > 0) {
      await expect(liveRegions.first()).toBeVisible();
    }

    // Test screen reader compatibility
    await expect(offlineBanner).toHaveAttribute('role', 'status');

    // Restore connection
    await page.context().setOffline(false);
  });

  test('offline mode preserves data integrity', async ({ page }) => {
    // Step 1: Load and interact with data while online
    await page.waitForSelector('[data-testid*="task"]', { timeout: 10000 });

    const initialTaskData = [];
    const taskCards = page.locator('[data-testid*="task"]');

    for (let i = 0; i < Math.min(await taskCards.count(), 3); i++) {
      const card = taskCards.nth(i);
      const title = await card.locator('h3, .task-title').textContent();
      const status = await card.getAttribute('data-status');

      initialTaskData.push({ title, status });
    }

    // Step 2: Go offline
    await page.context().setOffline(true);

    // Step 3: Verify data is preserved in cache
    await page.waitForTimeout(2000);

    for (let i = 0; i < initialTaskData.length; i++) {
      const expectedData = initialTaskData[i];
      const card = taskCards.nth(i);

      const currentTitle = await card.locator('h3, .task-title').textContent();
      expect(currentTitle).toBe(expectedData.title);
    }

    // Step 4: Restore connection
    await page.context().setOffline(false);

    // Step 5: Verify data syncs correctly when back online
    await page.waitForTimeout(3000);

    // Data should match what was cached
    for (let i = 0; i < initialTaskData.length; i++) {
      const expectedData = initialTaskData[i];
      const card = taskCards.nth(i);

      const currentTitle = await card.locator('h3, .task-title').textContent();
      expect(currentTitle).toBe(expectedData.title);
    }
  });

  test('handles intermittent connection issues', async ({ page }) => {
    // Step 1: Start with online connection
    await page.waitForSelector('[data-testid*="task"]', { timeout: 10000 });

    // Step 2: Simulate intermittent connection drops
    for (let i = 0; i < 3; i++) {
      // Go offline
      await page.context().setOffline(true);
      await page.waitForTimeout(1000);

      // Verify offline indicator
      const offlineBanner = page.locator('.offline-banner, [data-testid="offline-indicator"]');
      await expect(offlineBanner).toBeVisible();

      // Go back online
      await page.context().setOffline(false);
      await page.waitForTimeout(2000);

      // Verify recovery
      await expect(offlineBanner).not.toBeVisible();
    }

    // Step 3: Verify application remains stable
    const taskCards = page.locator('[data-testid*="task"]');
    expect(await taskCards.count()).toBeGreaterThan(0);

    // Step 4: Verify functionality still works
    const firstTask = taskCards.first();
    await firstTask.click();

    // Should be able to interact despite connection issues
    await page.waitForTimeout(1000);
  });
});
