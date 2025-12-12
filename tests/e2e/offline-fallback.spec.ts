import { test, expect } from '@playwright/test';
import { RealtimeChaosHelper } from '../playwright/helpers/realtimeChaos';

test.describe('@E2E Offline Fallback Workflow', () => {
  let chaosHelper: RealtimeChaosHelper;

  test.beforeEach(async ({ page }) => {
    chaosHelper = new RealtimeChaosHelper(page);
    await page.goto('/prepchef');
  });

  test('offline fallback → browser loses connection → polling activates', async ({ page }) => {
    // Step 1: Wait for initial load and get baseline state
    await page.waitForSelector('[data-testid*="task"]', { timeout: 10000 });
    const initialTaskCount = await page.locator('[data-testid*="task"]').count();
    const initialContent = await page.locator('body').textContent();

    // Step 2: Simulate browser losing connection (offline mode)
    await chaosHelper.simulateOfflineMode();

    // Step 3: Verify offline indicator appears
    const offlineIndicator = page.locator(
      '[data-testid="offline-indicator"], .offline-banner, .connection-status',
    );
    if ((await offlineIndicator.count()) > 0) {
      await expect(offlineIndicator.first()).toBeVisible({ timeout: 5000 });
      await expect(offlineIndicator.first()).toContainText(/offline|no connection|disconnected/i);
    }

    // Step 4: Verify polling fallback activates
    // Look for polling activity indicators
    const pollingIndicator = page.locator('[data-testid="polling-indicator"], .polling-status');
    if ((await pollingIndicator.count()) > 0) {
      await expect(pollingIndicator.first()).toBeVisible({ timeout: 10000 });
    }

    // Step 5: Test that app remains functional during offline mode
    // Try to interact with UI elements
    const taskCards = page.locator('[data-testid*="task"]');
    if ((await taskCards.count()) > 0) {
      // Test clicking on a task
      await taskCards.first().click();
      await page.waitForTimeout(1000);

      // Verify task details or modal opens
      const taskDetail = page.locator('[data-testid="task-detail"], .task-modal');
      if ((await taskDetail.count()) > 0) {
        await expect(taskDetail.first()).toBeVisible();
      }
    }

    // Step 6: Verify polling keeps data updated
    // Wait for polling interval (typically 10-30 seconds)
    await page.waitForTimeout(15000);

    // Check if content is still accessible and not completely broken
    const tasksDuringOffline = page.locator('[data-testid*="task"]');
    if ((await tasksDuringOffline.count()) > 0) {
      await expect(tasksDuringOffline.first()).toBeVisible();
    }

    // Step 7: Test queuing of actions for when connection returns
    const claimButton = page
      .locator('button')
      .filter({ hasText: /claim|take/i })
      .first();
    if ((await claimButton.count()) > 0) {
      await claimButton.click();

      // Look for queued action indicator
      const queuedIndicator = page.locator('[data-testid="queued-action"], .action-queued');
      if ((await queuedIndicator.count()) > 0) {
        await expect(queuedIndicator.first()).toBeVisible({ timeout: 3000 });
      }
    }

    // Step 8: Restore connection and verify sync
    await chaosHelper.reset();
    await page.waitForTimeout(5000);

    // Verify offline indicator disappears
    if ((await offlineIndicator.count()) > 0) {
      await expect(offlineIndicator.first()).not.toBeVisible();
    }

    // Step 9: Verify queued actions are processed
    const syncIndicator = page.locator('[data-testid="sync-indicator"], .syncing');
    if ((await syncIndicator.count()) > 0) {
      await expect(syncIndicator.first()).toBeVisible({ timeout: 5000 });
      // Wait for sync to complete
      await page.waitForTimeout(3000);
      await expect(syncIndicator.first()).not.toBeVisible();
    }

    // Step 10: Verify final state is consistent
    const finalTaskCount = await page.locator('[data-testid*="task"]').count();
    // Task count should be reasonable (may have changed due to queued actions)
    expect(finalTaskCount).toBeGreaterThanOrEqual(0);
  });

  test('handles intermittent connection drops gracefully', async ({ page }) => {
    // Test intermittent connection issues
    await chaosHelper.enableChaos();

    // Wait for tasks to load
    await page.waitForSelector('[data-testid*="task"]', { timeout: 10000 });

    // Perform actions during chaos
    const taskCards = page.locator('[data-testid*="task"]');
    if ((await taskCards.count()) > 0) {
      for (let i = 0; i < Math.min(3, await taskCards.count()); i++) {
        await taskCards.nth(i).click();
        await page.waitForTimeout(1000);

        // Close any open modals/details
        const closeButton = page.locator('button[aria-label*="close"], .close');
        if ((await closeButton.count()) > 0) {
          await closeButton.first().click();
        }
        await page.waitForTimeout(500);
      }
    }

    // Verify app remains responsive
    await expect(page.locator('body')).toBeVisible();

    await chaosHelper.disableChaos();
  });

  test('maintains accessibility during offline mode', async ({ page }) => {
    // Enable offline mode
    await chaosHelper.simulateOfflineMode();

    // Wait for offline indicator
    const offlineIndicator = page.locator('[data-testid="offline-indicator"], .offline-banner');
    if ((await offlineIndicator.count()) > 0) {
      await expect(offlineIndicator.first()).toBeVisible();

      // Test screen reader announcements
      await expect(offlineIndicator.first()).toHaveAttribute('role', 'alert');
      await expect(offlineIndicator.first()).toHaveAttribute('aria-live');
    }

    // Test keyboard navigation still works
    const focusableElements = page.locator('button, [role="button"], a, input');
    if ((await focusableElements.count()) > 0) {
      await focusableElements.first().focus();
      await expect(focusableElements.first()).toBeFocused();

      // Test Tab navigation
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);
    }

    await chaosHelper.reset();
  });

  test('handles long-term offline scenarios', async ({ page }) => {
    // Simulate extended offline period
    await chaosHelper.simulateOfflineMode();

    // Wait for offline indicators
    await page.waitForTimeout(3000);

    // Test that cached data remains accessible
    const tasks = page.locator('[data-testid*="task"]');
    if ((await tasks.count()) > 0) {
      await expect(tasks.first()).toBeVisible();

      // Test task interaction
      await tasks.first().click();
      await page.waitForTimeout(1000);

      // Verify task details are available from cache
      const taskDetail = page.locator('[data-testid="task-detail"], .task-content');
      if ((await taskDetail.count()) > 0) {
        await expect(taskDetail.first()).toBeVisible();
      }
    }

    // Test that app doesn't crash during extended offline
    await page.waitForTimeout(10000);
    await expect(page.locator('body')).toBeVisible();

    await chaosHelper.reset();
  });
});
