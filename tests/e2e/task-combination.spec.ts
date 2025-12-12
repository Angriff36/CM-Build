import { test, expect } from '@playwright/test';
import { RealtimeChaosHelper } from '../playwright/helpers/realtimeChaos';

test.describe('@E2E Task Combination Workflow', () => {
  let chaosHelper: RealtimeChaosHelper;

  test.beforeEach(async ({ page }) => {
    chaosHelper = new RealtimeChaosHelper(page);
    await page.goto('/prepchef');
  });

  test('task combination suggestion → accept → verify merged task in list', async ({ page }) => {
    // Step 1: Wait for tasks to load
    await page.waitForSelector('[data-testid*="task"]', { timeout: 10000 });

    // Get initial task count
    const initialTaskCount = await page.locator('[data-testid*="task"]').count();

    // Step 2: Trigger combination suggestion (simulate conflicting approvals)
    await chaosHelper.simulateConflictingApprovals();

    // Step 3: Wait for combination suggestion to appear
    const suggestion = page
      .locator('[data-testid="combination-suggestion"], .suggestion, .combination-modal')
      .first();
    await expect(suggestion).toBeVisible({ timeout: 15000 });

    // Verify suggestion shows tasks to be combined
    const suggestionTasks = suggestion.locator('[data-testid*="task"], .task-item');
    expect(await suggestionTasks.count()).toBeGreaterThan(1);

    // Step 4: Accept the combination suggestion
    const acceptButton = suggestion.locator('button').filter({ hasText: /accept|merge|combine/i });
    await expect(acceptButton).toBeVisible();
    await acceptButton.click();

    // Step 5: Verify suggestion disappears
    await expect(suggestion).not.toBeVisible({ timeout: 5000 });

    // Step 6: Verify merged task appears in the main task list
    const mergedTask = page
      .locator('[data-testid*="task"]')
      .filter({ hasText: /merged|combined|combined task/i })
      .first();
    await expect(mergedTask).toBeVisible({ timeout: 10000 });

    // Step 7: Verify merged task has combined properties
    const mergedTitle = await mergedTask.locator('h3, .task-title').textContent();
    expect(mergedTitle).toMatch(/combined|merged/i);

    // Step 8: Verify original tasks are no longer visible (or marked as merged)
    const finalTaskCount = await page.locator('[data-testid*="task"]').count();
    expect(finalTaskCount).toBeLessThan(initialTaskCount);

    // Step 9: Verify merged task can be claimed/completed
    const claimButton = mergedTask.locator('button').filter({ hasText: /claim|take/i });
    if ((await claimButton.count()) > 0) {
      await expect(claimButton).toBeVisible();
    }

    await chaosHelper.reset();
  });

  test('handles combination suggestion rejection', async ({ page }) => {
    // Trigger combination suggestion
    await chaosHelper.simulateConflictingApprovals();

    // Wait for suggestion
    const suggestion = page.locator('[data-testid="combination-suggestion"], .suggestion').first();
    await expect(suggestion).toBeVisible({ timeout: 15000 });

    // Get initial task count
    const initialTaskCount = await page.locator('[data-testid*="task"]').count();

    // Reject the suggestion
    const rejectButton = suggestion.locator('button').filter({ hasText: /reject|cancel|dismiss/i });
    if ((await rejectButton.count()) > 0) {
      await rejectButton.click();

      // Verify suggestion disappears
      await expect(suggestion).not.toBeVisible({ timeout: 5000 });

      // Verify tasks remain unchanged
      const finalTaskCount = await page.locator('[data-testid*="task"]').count();
      expect(finalTaskCount).toBe(initialTaskCount);
    }

    await chaosHelper.reset();
  });

  test('maintains accessibility during combination workflow', async ({ page }) => {
    // Trigger combination suggestion
    await chaosHelper.simulateConflictingApprovals();

    // Wait for suggestion
    const suggestion = page.locator('[data-testid="combination-suggestion"], .suggestion').first();
    await expect(suggestion).toBeVisible({ timeout: 15000 });

    // Test keyboard navigation
    const acceptButton = suggestion.locator('button').filter({ hasText: /accept|merge/i });
    await acceptButton.focus();
    await expect(acceptButton).toBeFocused();

    // Test ARIA labels
    await expect(suggestion).toHaveAttribute('role', 'dialog');
    await expect(acceptButton).toHaveAttribute('aria-label');

    // Test screen reader announcements
    const liveRegion = page.locator('[aria-live="polite"]');
    if ((await liveRegion.count()) > 0) {
      await expect(liveRegion).toBeVisible();
    }

    await chaosHelper.reset();
  });

  test('handles network failures during combination', async ({ page }) => {
    // Enable chaos mode
    await chaosHelper.enableChaos();

    // Try to trigger combination
    await chaosHelper.simulateConflictingApprovals();

    // Wait for suggestion (may take longer with chaos)
    const suggestion = page.locator('[data-testid="combination-suggestion"], .suggestion').first();

    if ((await suggestion.count()) > 0) {
      await expect(suggestion).toBeVisible({ timeout: 20000 });

      // Try to accept despite network issues
      const acceptButton = suggestion.locator('button').filter({ hasText: /accept|merge/i });
      await acceptButton.click();

      // Should eventually complete via polling fallback
      await page.waitForTimeout(5000);

      // Verify either success or error handling
      const errorMessage = page.locator('.error, [role="alert"]');
      const mergedTask = page
        .locator('[data-testid*="task"]')
        .filter({ hasText: /merged|combined/i });

      // Either error should be shown or merge should succeed
      expect((await errorMessage.count()) + (await mergedTask.count())).toBeGreaterThan(0);
    }

    await chaosHelper.disableChaos();
  });
});
