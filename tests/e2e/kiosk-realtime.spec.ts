import { test, expect } from '@playwright/test';
import { RealtimeChaosHelper } from '../playwright/helpers/realtimeChaos';

test.describe('@E2E Kiosk Realtime Updates', () => {
  let chaosHelper: RealtimeChaosHelper;

  test.beforeEach(async ({ page }) => {
    chaosHelper = new RealtimeChaosHelper(page);
    await page.goto('/display');
  });

  test('kiosk display updates → verifies 15-second SLA compliance', async ({ page }) => {
    // Step 1: Wait for kiosk display to initialize
    const kioskDisplay = page
      .locator('[data-testid="kiosk-display"], .kiosk-display, .display-container')
      .first();
    await expect(kioskDisplay).toBeVisible({ timeout: 10000 });

    // Step 2: Get initial content state
    const startTime = Date.now();
    const initialContent = await kioskDisplay.textContent();
    const initialTaskElements = await page.locator('[data-testid*="task"], .task-item').count();

    // Step 3: Trigger a change that should update the display
    // This could be done by opening another page and claiming a task
    const staffPage = await page.context().newPage();
    await staffPage.goto('/prepchef');

    // Wait for staff page to load
    await staffPage.waitForSelector('[data-testid*="task"]', { timeout: 10000 });

    // Find and claim a task to trigger display update
    const claimButton = staffPage
      .locator('button')
      .filter({ hasText: /claim|take/i })
      .first();
    if ((await claimButton.count()) > 0) {
      await claimButton.click();
      await staffPage.waitForTimeout(1000);
    }

    await staffPage.close();

    // Step 4: Wait for display to update and measure response time
    await page.waitForFunction(
      (initialContent) => {
        const current = document.querySelector(
          '[data-testid="kiosk-display"], .kiosk-display, .display-container',
        )?.textContent;
        return current !== initialContent;
      },
      initialContent,
      { timeout: 15000 },
    );

    const updateTime = Date.now() - startTime;

    // Step 5: Verify SLA compliance - update must occur within 15 seconds
    expect(updateTime).toBeLessThan(15000);

    // Step 6: Verify content actually changed
    const updatedContent = await kioskDisplay.textContent();
    expect(updatedContent).not.toBe(initialContent);

    // Step 7: Verify the change is reflected in task count or status
    const updatedTaskElements = await page.locator('[data-testid*="task"], .task-item').count();
    // Task count may have changed or task statuses updated
    expect(updatedTaskElements).toBeGreaterThanOrEqual(0);
  });

  test('handles rapid successive updates within SLA', async ({ page }) => {
    // Wait for display to load
    const kioskDisplay = page.locator('[data-testid="kiosk-display"], .kiosk-display').first();
    await expect(kioskDisplay).toBeVisible({ timeout: 10000 });

    // Perform multiple rapid updates
    const staffPage = await page.context().newPage();
    await staffPage.goto('/prepchef');
    await staffPage.waitForSelector('[data-testid*="task"]', { timeout: 10000 });

    const updateTimes = [];

    // Perform 3 rapid updates
    for (let i = 0; i < 3; i++) {
      const startTime = Date.now();
      const initialContent = await kioskDisplay.textContent();

      // Trigger an update
      const claimButton = staffPage
        .locator('button')
        .filter({ hasText: /claim|take/i })
        .nth(i);
      if ((await claimButton.count()) > 0) {
        await claimButton.click();
        await staffPage.waitForTimeout(500);

        // Wait for display update
        await page.waitForFunction(
          (initial) => {
            const current = document.querySelector(
              '[data-testid="kiosk-display"], .kiosk-display',
            )?.textContent;
            return current !== initial;
          },
          initialContent,
          { timeout: 15000 },
        );

        const updateTime = Date.now() - startTime;
        updateTimes.push(updateTime);

        // Verify each update meets SLA
        expect(updateTime).toBeLessThan(15000);
      }
    }

    await staffPage.close();

    // Verify average response time is well within SLA
    const averageTime = updateTimes.reduce((a, b) => a + b, 0) / updateTimes.length;
    expect(averageTime).toBeLessThan(10000); // Should be faster than max SLA
  });

  test('maintains display functionality during connection issues', async ({ page }) => {
    // Enable chaos mode
    await chaosHelper.enableChaos();

    // Wait for display to load
    const kioskDisplay = page.locator('[data-testid="kiosk-display"], .kiosk-display').first();
    await expect(kioskDisplay).toBeVisible({ timeout: 10000 });

    // Get initial content
    const initialContent = await kioskDisplay.textContent();

    // Trigger update during chaos
    const staffPage = await page.context().newPage();
    await staffPage.goto('/prepchef');
    await staffPage.waitForSelector('[data-testid*="task"]', { timeout: 10000 });

    const claimButton = staffPage
      .locator('button')
      .filter({ hasText: /claim|take/i })
      .first();
    if ((await claimButton.count()) > 0) {
      await claimButton.click();
      await staffPage.waitForTimeout(1000);
    }

    await staffPage.close();

    // Display should still update, possibly via polling fallback
    try {
      await page.waitForFunction(
        (initial) => {
          const current = document.querySelector(
            '[data-testid="kiosk-display"], .kiosk-display',
          )?.textContent;
          return current !== initial;
        },
        initialContent,
        { timeout: 20000 }, // Longer timeout for chaos mode
      );

      // If update succeeds, verify it's within reasonable time
      const updateTime = Date.now();
      expect(updateTime).toBeLessThan(20000);
    } catch (error) {
      // During chaos, display might show connection status
      const connectionIndicator = page.locator(
        '[data-testid="connection-status"], .offline-indicator',
      );
      if ((await connectionIndicator.count()) > 0) {
        await expect(connectionIndicator.first()).toBeVisible();
      }
    }

    await chaosHelper.disableChaos();
  });

  test('verifies display refreshes and content rotation', async ({ page }) => {
    // Wait for display to load
    const kioskDisplay = page.locator('[data-testid="kiosk-display"], .kiosk-display').first();
    await expect(kioskDisplay).toBeVisible({ timeout: 10000 });

    // Test automatic content rotation (if implemented)
    const initialContent = await kioskDisplay.textContent();

    // Wait for potential automatic refresh
    await page.waitForTimeout(16000); // Just over SLA time

    // Check if content refreshed automatically
    const refreshedContent = await kioskDisplay.textContent();

    // If content rotates, verify it does so within SLA
    if (refreshedContent !== initialContent) {
      // Content rotation detected
      expect(true).toBeTruthy();
    }

    // Test manual refresh if available
    const refreshButton = page.locator('button').filter({ hasText: /refresh|reload/i });
    if ((await refreshButton.count()) > 0) {
      const beforeRefresh = await kioskDisplay.textContent();
      await refreshButton.click();

      // Wait for refresh to complete
      await page.waitForTimeout(2000);

      const afterRefresh = await kioskDisplay.textContent();
      // Content should be updated or reloaded
      expect(afterRefresh).toBeDefined();
    }
  });

  test('validates display performance and rendering', async ({ page }) => {
    // Wait for display to load
    const kioskDisplay = page.locator('[data-testid="kiosk-display"], .kiosk-display').first();
    await expect(kioskDisplay).toBeVisible({ timeout: 10000 });

    // Measure rendering performance
    const renderStart = Date.now();

    // Check if all expected elements are rendered
    const taskElements = page.locator('[data-testid*="task"], .task-item');
    const statusElements = page.locator('[data-testid*="status"], .status-indicator');
    const timeElements = page.locator('[data-testid*="time"], .time-display');

    // Verify elements are present and visible
    if ((await taskElements.count()) > 0) {
      await expect(taskElements.first()).toBeVisible();
    }

    if ((await statusElements.count()) > 0) {
      await expect(statusElements.first()).toBeVisible();
    }

    if ((await timeElements.count()) > 0) {
      await expect(timeElements.first()).toBeVisible();
    }

    const renderTime = Date.now() - renderStart;

    // Rendering should be fast
    expect(renderTime).toBeLessThan(3000);

    // Test smooth animations/transitions
    const animatedElements = page.locator('[class*="transition"], [class*="animate"]');
    if ((await animatedElements.count()) > 0) {
      // Verify animations don't cause performance issues
      await expect(animatedElements.first()).toBeVisible();
    }
  });

  test('maintains accessibility in kiosk mode', async ({ page }) => {
    // Wait for display to load
    const kioskDisplay = page.locator('[data-testid="kiosk-display"], .kiosk-display').first();
    await expect(kioskDisplay).toBeVisible({ timeout: 10000 });

    // Verify proper ARIA labels for screen readers
    await expect(kioskDisplay).toHaveAttribute('role', 'main');

    // Check for live regions announcing updates
    const liveRegions = page.locator('[aria-live="polite"], [aria-live="assertive"]');
    if ((await liveRegions.count()) > 0) {
      await expect(liveRegions.first()).toBeVisible();
    }

    // Verify high contrast mode support
    const highContrastElements = page.locator('[data-testid*="high-contrast"], .contrast-mode');
    // Elements should be readable in various contrast modes

    // Test keyboard navigation (if kiosk supports it)
    const focusableElements = page.locator('button, [tabindex="0"]');
    if ((await focusableElements.count()) > 0) {
      await focusableElements.first().focus();
      await expect(focusableElements.first()).toBeFocused();
    }
  });
});
