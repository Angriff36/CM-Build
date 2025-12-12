import { test, expect } from '@playwright/test';

test.describe('Kiosk Realtime E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/display');
  });

  test('Kiosk display updates within 15-second SLA', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[data-testid="kiosk-display"], .kiosk', { timeout: 10000 });

    // Record initial state
    const initialContent = await page.locator('.kiosk-content').textContent();

    // Wait for update (less than 15s)
    await page.waitForTimeout(14000); // 14s to ensure within 15s

    // Verify content changed
    const updatedContent = await page.locator('.kiosk-content').textContent();
    expect(updatedContent).not.toBe(initialContent);

    // Verify SLA: check if update happened within 15s (by timing)
    // Since we waited 14s and it updated, assume compliance
  });
});
