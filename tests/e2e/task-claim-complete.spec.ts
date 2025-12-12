import { test, expect } from '@playwright/test';
import { RealtimeChaosHelper } from '../playwright/helpers/realtimeChaos';

test.describe('Task Claim Complete E2E', () => {
  let chaosHelper: RealtimeChaosHelper;

  test.beforeEach(async ({ page }) => {
    chaosHelper = new RealtimeChaosHelper(page);
    await page.goto('/prepchef');
    // Assume authentication is handled via fixtures or global setup
  });

  test('Staff claims task, sees realtime update, completes, sees confirmation', async ({
    page,
  }) => {
    // Wait for tasks to load
    await page.waitForSelector('[data-testid*="task"]', { timeout: 10000 });

    // Find an available task
    const availableTask = page
      .locator('[data-testid*="task"]')
      .filter({ hasText: /available|unclaimed/i })
      .first();
    await expect(availableTask).toBeVisible();

    // Claim the task
    const claimButton = availableTask.locator('button').filter({ hasText: /claim|take/i });
    await claimButton.click();

    // Verify realtime update: task status changes to claimed
    await page.waitForSelector('[data-testid*="task"]:has-text("claimed")', { timeout: 5000 });

    // Complete the task
    const completeButton = page.locator('button').filter({ hasText: /complete|done/i });
    await completeButton.click();

    // Verify confirmation: toast or modal appears
    await expect(
      page.locator('.toast, [role="alert"]').filter({ hasText: /completed|confirmed/i }),
    ).toBeVisible();

    // Verify task is no longer in list or marked complete
    await page.waitForTimeout(1000); // Allow for UI update
    const completedTask = page
      .locator('[data-testid*="task"]')
      .filter({ hasText: /completed|done/i });
    await expect(completedTask).toBeVisible();
  });
});
