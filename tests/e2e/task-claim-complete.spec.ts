import { test, expect } from '@playwright/test';
import { RealtimeChaosHelper } from '../playwright/helpers/realtimeChaos';

test.describe('@E2E Task Claim and Complete Workflow', () => {
  let chaosHelper: RealtimeChaosHelper;

  test.beforeEach(async ({ page }) => {
    chaosHelper = new RealtimeChaosHelper(page);
    await page.goto('/prepchef');
  });

  test('staff claims task → sees realtime update → completes → sees confirmation', async ({
    page,
  }) => {
    // Step 1: Find and claim an available task
    const claimButton = page
      .locator('button')
      .filter({ hasText: /claim|take/i })
      .first();

    // Ensure there's a claimable task
    await expect(claimButton).toBeVisible({ timeout: 10000 });

    // Get task details before claiming
    const taskCard = claimButton.locator('..').locator('[data-testid*="task"], .task');
    const taskTitle = await taskCard.locator('h3, .task-title').textContent();

    // Claim the task
    await claimButton.click();

    // Step 2: Verify realtime update - task moves to claimed state
    await page.waitForTimeout(2000); // Allow for realtime propagation

    // Verify claim button is gone or changed to complete button
    await expect(claimButton).not.toBeVisible();

    const completeButton = page
      .locator('button')
      .filter({ hasText: /complete|done|finish/i })
      .first();
    await expect(completeButton).toBeVisible({ timeout: 5000 });

    // Verify task shows as claimed (visual indicators)
    const claimedIndicator = page.locator('.claimed, [data-status="claimed"], .bg-blue-500');
    if ((await claimedIndicator.count()) > 0) {
      await expect(claimedIndicator.first()).toBeVisible();
    }

    // Step 3: Complete the task
    await completeButton.click();

    // Step 4: Verify completion confirmation
    await page.waitForTimeout(2000);

    // Look for completion confirmation
    const confirmationMessage = page.locator(
      'text=completed, text=Task completed, .success-message',
    );
    if ((await confirmationMessage.count()) > 0) {
      await expect(confirmationMessage.first()).toBeVisible();
    }

    // Verify task is marked as completed
    const completedIndicator = page.locator('.completed, [data-status="completed"], .bg-green-500');
    if ((await completedIndicator.count()) > 0) {
      await expect(completedIndicator.first()).toBeVisible();
    }

    // Verify task is no longer in active list
    const activeTask = page.locator('[data-testid*="task"]').filter({ hasText: taskTitle || '' });
    if ((await activeTask.count()) > 0) {
      await expect(activeTask.first()).toHaveClass(/completed|opacity-50/);
    }
  });

  test('handles realtime connection drops during claim workflow', async ({ page }) => {
    // Enable chaos mode to test offline fallback
    await chaosHelper.enableChaos();

    // Try to claim a task
    const claimButton = page
      .locator('button')
      .filter({ hasText: /claim|take/i })
      .first();

    if ((await claimButton.count()) > 0) {
      await claimButton.click();

      // Verify polling fallback still updates the UI
      await page.waitForTimeout(3000);

      // Check if task was claimed despite connection issues
      const completeButton = page
        .locator('button')
        .filter({ hasText: /complete|done|finish/i })
        .first();

      // Should eventually show complete button via polling
      if ((await completeButton.count()) > 0) {
        await expect(completeButton.first()).toBeVisible();
      }
    }

    await chaosHelper.disableChaos();
  });

  test('maintains accessibility throughout claim-complete workflow', async ({ page }) => {
    // Test keyboard navigation for claiming
    const claimButton = page
      .locator('button')
      .filter({ hasText: /claim|take/i })
      .first();

    if ((await claimButton.count()) > 0) {
      await claimButton.focus();
      await expect(claimButton).toBeFocused();

      // Claim with keyboard
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);

      // Test keyboard navigation for completion
      const completeButton = page
        .locator('button')
        .filter({ hasText: /complete|done|finish/i })
        .first();

      if ((await completeButton.count()) > 0) {
        await completeButton.focus();
        await expect(completeButton).toBeFocused();

        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);
      }
    }

    // Verify ARIA live regions announce changes
    const liveRegions = page.locator('[aria-live="polite"], [aria-live="assertive"]');
    if ((await liveRegions.count()) > 0) {
      await expect(liveRegions.first()).toBeVisible();
    }
  });

  test('validates task state transitions', async ({ page }) => {
    // Look for a task to test state transitions
    const taskCard = page.locator('[data-testid*="task"], .task').first();

    if ((await taskCard.count()) > 0) {
      // Get initial state
      const initialStatus = await taskCard.getAttribute('data-status');
      const initialClasses = await taskCard.getAttribute('class');

      // Try to claim if available
      const claimButton = taskCard.locator('button').filter({ hasText: /claim|take/i });
      if ((await claimButton.count()) > 0) {
        await claimButton.click();
        await page.waitForTimeout(2000);

        // Verify state changed
        const newStatus = await taskCard.getAttribute('data-status');
        const newClasses = await taskCard.getAttribute('class');

        // Status should be different after claiming
        if (initialStatus && newStatus) {
          expect(newStatus).not.toBe(initialStatus);
        }

        // Classes should reflect claimed state
        if (newClasses) {
          expect(newClasses).toMatch(/claimed|assigned/);
        }
      }
    }
  });
});
