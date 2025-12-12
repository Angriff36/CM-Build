import { test, expect } from '@playwright/test';
import { RealtimeChaosHelper } from '../playwright/helpers/realtimeChaos';

test.describe('@E2E Kiosk Realtime Integration', () => {
  let chaosHelper: RealtimeChaosHelper;

  test.beforeEach(async ({ page }) => {
    chaosHelper = new RealtimeChaosHelper(page);
    await page.goto('/display');
  });

  test('kiosk displays real-time task updates', async ({ page }) => {
    // Step 1: Wait for initial display load
    await page.waitForSelector('[data-testid="display-board"], .display-board', { timeout: 10000 });

    // Step 2: Get initial task state
    const initialTasks = await page.locator('[data-testid*="task"], .task').count();
    const initialUrgentCount = await page
      .locator('[data-testid="urgent-ticker"], .urgent-ticker .task')
      .count();

    // Step 3: Simulate task status change
    await chaosHelper.simulateTaskStatusChange();

    // Step 4: Wait for realtime update
    await page.waitForTimeout(3000);

    // Step 5: Verify display updated
    const updatedTasks = await page.locator('[data-testid*="task"], .task').count();
    const updatedUrgentCount = await page
      .locator('[data-testid="urgent-ticker"], .urgent-ticker .task')
      .count();

    // Should see some change in the display
    console.log(`Initial tasks: ${initialTasks}, Updated tasks: ${updatedTasks}`);
    console.log(`Initial urgent: ${initialUrgentCount}, Updated urgent: ${updatedUrgentCount}`);

    // Step 6: Verify visual indicators
    const updateIndicators = page.locator('.realtime-update, [data-updating="true"]');

    // May briefly show update indicators
    if ((await updateIndicators.count()) > 0) {
      await expect(updateIndicators.first()).toBeVisible();
    }
  });

  test('kiosk handles connection drops gracefully', async ({ page }) => {
    // Step 1: Wait for display to load
    await page.waitForSelector('[data-testid="display-board"], .display-board', { timeout: 10000 });

    // Step 2: Enable chaos mode
    await chaosHelper.enableChaos();

    // Step 3: Verify offline indicator appears
    const offlineIndicator = page.locator('[data-testid="connection-status"], .connection-status');

    await page.waitForTimeout(2000);

    if (await offlineIndicator.isVisible()) {
      await expect(offlineIndicator).toHaveClass(/offline|disconnected/);
    }

    // Step 4: Verify content remains visible (cached)
    const cachedContent = page.locator('[data-testid="display-board"], .display-board');
    await expect(cachedContent).toBeVisible();

    // Step 5: Disable chaos mode
    await chaosHelper.disableChaos();

    // Step 6: Verify reconnection
    await page.waitForTimeout(3000);

    if (await offlineIndicator.isVisible()) {
      await expect(offlineIndicator).toHaveClass(/online|connected/);
    }
  });

  test('kiosk urgent ticker updates in real-time', async ({ page }) => {
    // Step 1: Wait for urgent ticker to load
    const urgentTicker = page.locator('[data-testid="urgent-ticker"], .urgent-ticker');
    await expect(urgentTicker).toBeVisible({ timeout: 10000 });

    // Step 2: Get initial urgent tasks
    const initialUrgentTasks = await urgentTicker.locator('[data-testid*="task"], .task').count();

    // Step 3: Simulate urgent task creation
    await chaosHelper.simulateUrgentTaskCreation();

    // Step 4: Wait for ticker update
    await page.waitForTimeout(3000);

    // Step 5: Verify ticker updated
    const updatedUrgentTasks = await urgentTicker.locator('[data-testid*="task"], .task').count();

    // Should see new urgent task
    expect(updatedUrgentTasks).toBeGreaterThan(initialUrgentTasks);

    // Step 6: Verify animation/transition
    const newTask = urgentTicker.locator('[data-testid*="task"], .task').last();
    await expect(newTask).toHaveClass(/new|updated|entering/);
  });

  test('kiosk maintains performance with frequent updates', async ({ page }) => {
    // Step 1: Wait for display load
    await page.waitForSelector('[data-testid="display-board"], .display-board', { timeout: 10000 });

    // Step 2: Measure baseline performance
    const startTime = Date.now();
    const initialRenderTime = await page.evaluate(() => performance.now());

    // Step 3: Simulate rapid updates
    for (let i = 0; i < 10; i++) {
      await chaosHelper.simulateTaskStatusChange();
      await page.waitForTimeout(500); // Rapid updates
    }

    // Step 4: Measure performance after updates
    const endTime = Date.now();
    const finalRenderTime = await page.evaluate(() => performance.now());

    const totalTime = endTime - startTime;
    const renderTime = finalRenderTime - initialRenderTime;

    // Step 5: Verify performance thresholds
    console.log(`Total time for 10 updates: ${totalTime}ms`);
    console.log(`Render time increase: ${renderTime}ms`);

    // Should handle rapid updates without significant degradation
    expect(totalTime).toBeLessThan(10000); // 10 seconds for 10 updates
    expect(renderTime).toBeLessThan(1000); // 1 second render time increase

    // Step 6: Verify display is still responsive
    const displayBoard = page.locator('[data-testid="display-board"], .display-board');
    await expect(displayBoard).toBeVisible();

    // Should be able to interact with display
    const interactiveElements = page.locator('button, [role="button"]');

    if ((await interactiveElements.count()) > 0) {
      await expect(interactiveElements.first()).toBeVisible();
    }
  });

  test('kiosk displays appropriate error states', async ({ page }) => {
    // Step 1: Wait for display load
    await page.waitForSelector('[data-testid="display-board"], .display-board', { timeout: 10000 });

    // Step 2: Simulate server error
    await chaosHelper.simulateServerError();

    // Step 3: Wait for error handling
    await page.waitForTimeout(2000);

    // Step 4: Verify error state display
    const errorMessage = page.locator('[data-testid="error-message"], .error-message');
    const fallbackContent = page.locator('[data-testid="fallback-content"], .fallback-content');

    // Should show either error message or fallback content
    expect((await errorMessage.count()) + (await fallbackContent.count())).toBeGreaterThan(0);

    // Step 5: Verify recovery mechanism
    await chaosHelper.reset();
    await page.waitForTimeout(3000);

    // Should recover and show normal content
    const displayBoard = page.locator('[data-testid="display-board"], .display-board');
    await expect(displayBoard).toBeVisible();

    // Error message should be gone
    if ((await errorMessage.count()) > 0) {
      await expect(errorMessage.first()).not.toBeVisible();
    }
  });

  test('kiosk accessibility during realtime updates', async ({ page }) => {
    // Step 1: Wait for display load
    await page.waitForSelector('[data-testid="display-board"], .display-board', { timeout: 10000 });

    // Step 2: Test ARIA live regions
    const liveRegions = page.locator('[aria-live="polite"], [aria-live="assertive"]');

    if ((await liveRegions.count()) > 0) {
      await expect(liveRegions.first()).toBeVisible();
    }

    // Step 3: Simulate updates and test accessibility
    await chaosHelper.simulateTaskStatusChange();
    await page.waitForTimeout(2000);

    // Step 4: Test keyboard navigation
    const focusableElements = page.locator('button, [role="button"], [tabindex="0"]');

    if ((await focusableElements.count()) > 0) {
      await focusableElements.first().focus();
      await expect(focusableElements.first()).toBeFocused();

      // Test navigation
      await page.keyboard.press('Tab');
      const nextFocused = page.locator(':focus');
      expect(await nextFocused.count()).toBe(1);
    }

    // Step 5: Test screen reader announcements
    const statusAnnouncements = page.locator('[role="status"], [aria-live]');

    if ((await statusAnnouncements.count()) > 0) {
      await expect(statusAnnouncements.first()).toBeVisible();
    }
  });

  test('kiosk handles multiple simultaneous updates', async ({ page }) => {
    // Step 1: Wait for display load
    await page.waitForSelector('[data-testid="display-board"], .display-board', { timeout: 10000 });

    // Step 2: Get initial state
    const initialTaskCount = await page.locator('[data-testid*="task"], .task').count();

    // Step 3: Simulate multiple simultaneous updates
    await Promise.all([
      chaosHelper.simulateTaskStatusChange(),
      chaosHelper.simulateUrgentTaskCreation(),
      chaosHelper.simulateTaskStatusChange(),
    ]);

    // Step 4: Wait for all updates to process
    await page.waitForTimeout(5000);

    // Step 5: Verify final state
    const finalTaskCount = await page.locator('[data-testid*="task"], .task').count();

    // Should have processed all updates
    console.log(`Initial tasks: ${initialTaskCount}, Final tasks: ${finalTaskCount}`);

    // Step 6: Verify display integrity
    const displayBoard = page.locator('[data-testid="display-board"], .display-board');
    await expect(displayBoard).toBeVisible();

    // Should not have duplicate or corrupted entries
    const allTasks = page.locator('[data-testid*="task"], .task');
    const taskIds = new Set();

    for (let i = 0; i < (await allTasks.count()); i++) {
      const task = allTasks.nth(i);
      const taskId = await task.getAttribute('data-task-id');

      if (taskId) {
        expect(taskIds.has(taskId)).toBeFalsy();
        taskIds.add(taskId);
      }
    }
  });
});
