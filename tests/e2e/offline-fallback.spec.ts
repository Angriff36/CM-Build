import { test, expect } from '@playwright/test';
import { RealtimeChaosHelper } from '../playwright/helpers/realtimeChaos';

test.describe('Offline Fallback E2E', () => {
  let chaosHelper: RealtimeChaosHelper;

  test.beforeEach(async ({ page }) => {
    chaosHelper = new RealtimeChaosHelper(page);
    await page.goto('/prepchef');
  });

  test('Offline fallback activates polling when connection lost', async ({ page }) => {
    // Enable offline simulation
    await chaosHelper.simulateOfflineMode();

    // Verify offline banner appears
    const banner = page.locator('[data-testid="offline-banner"], .banner:has-text("Offline")');
    await expect(banner).toBeVisible();

    // Verify polling fallback: wait and check for updates (assuming polling fetches data)
    await page.waitForTimeout(15000); // Wait for polling interval

    // Verify tasks still load via polling
    const tasks = page.locator('[data-testid*="task"]');
    await expect(tasks.first()).toBeVisible();

    // Reset
    await chaosHelper.reset();
  });
});
