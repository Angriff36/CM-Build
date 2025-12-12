import { test, expect } from '@playwright/test';

test.describe('Task Combination E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/prepchef');
    // Assume auth
  });

  test('Task combination suggestion accept and verify merged task', async ({ page }) => {
    // Wait for tasks to load
    await page.waitForSelector('[data-testid*="task"]', { timeout: 10000 });

    // Assume combination suggestion appears (perhaps trigger via API or UI)
    // For E2E, simulate by assuming suggestion is shown
    const suggestion = page.locator('[data-testid="combination-suggestion"], .suggestion').first();
    await expect(suggestion).toBeVisible();

    // Accept the suggestion
    const acceptButton = suggestion.locator('button').filter({ hasText: /accept|merge/i });
    await acceptButton.click();

    // Verify merged task appears in list
    await page.waitForSelector('[data-testid*="task"]:has-text("merged")', { timeout: 5000 });

    // Verify original tasks are removed or updated
    const originalTasks = page.locator('[data-testid*="task"]').filter({ hasText: /original/i });
    await expect(originalTasks).toHaveCount(0);
  });
});
