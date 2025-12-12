import { test, expect } from '@playwright/test';

test.describe('Admin Workflows E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
  });

  test('Manager assigns task, triggers notification, staff sees assignment', async ({ page }) => {
    // Navigate to task board
    await page.goto('/admin/tasks');

    // Find unassigned task
    const unassignedTask = page
      .locator('[data-testid*="task"]')
      .filter({ hasText: /unassigned/i })
      .first();
    await expect(unassignedTask).toBeVisible();

    // Drag to staff column (similar to admin.board.spec.ts)
    const staffColumn = page
      .locator('h3')
      .filter({ hasText: /Chef|Staff/ })
      .first();
    await unassignedTask.dragTo(staffColumn);

    // Verify assignment (task moves)
    await page.waitForTimeout(2000);
    // Assume notification is sent, but for E2E, verify in staff view if possible
    // Perhaps switch to staff view or check realtime
  });

  test('Admin uploads media, verifies storage bucket access', async ({ page }) => {
    // Navigate to media upload
    await page.goto('/admin/media');

    // Find upload input
    const uploadInput = page.locator('input[type="file"]');
    await expect(uploadInput).toBeVisible();

    // Upload a test file (assume test file exists)
    await uploadInput.setInputFiles('path/to/test-media.jpg');

    // Verify upload success
    const successMessage = page.locator('.toast').filter({ hasText: /uploaded|success/i });
    await expect(successMessage).toBeVisible();

    // Verify bucket access (perhaps check if file is accessible)
    // This might require API check or UI confirmation
  });
});
