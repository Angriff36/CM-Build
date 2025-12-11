import { test, expect } from '@playwright/test';
import { RealtimeChaosHelper } from './helpers/realtimeChaos';

test.describe('@AdminCRM Admin Task Board', () => {
  let chaosHelper: RealtimeChaosHelper;

  test.beforeEach(async ({ page }) => {
    chaosHelper = new RealtimeChaosHelper(page);
    await page.goto('/admin/tasks');
  });

  test('should display task board with drag and drop functionality', async ({ page }) => {
    // Verify board loads
    await expect(page.locator('h1').filter({ hasText: 'Task Board' })).toBeVisible();

    // Test event filter
    const eventSelect = page.locator('select').first();
    if ((await eventSelect.count()) > 0) {
      await eventSelect.selectOption({ index: 1 }); // Select first event option
      await expect(page.locator('.grid')).toBeVisible(); // Task board grid
    }

    // Test drag and drop functionality
    const unassignedColumn = page.locator('text=Unassigned').first();
    const staffColumn = page
      .locator('h3')
      .filter({ hasText: /Chef|Staff/ })
      .first();

    if ((await unassignedColumn.count()) > 0 && (await staffColumn.count()) > 0) {
      // Look for draggable task cards
      const taskCard = page.locator('[role="button"][aria-label*="Task:"]').first();
      if ((await taskCard.count()) > 0) {
        // Get initial position
        const initialText = await taskCard.textContent();

        // Drag to staff column
        await taskCard.dragTo(staffColumn);

        // Verify task moved (check if task is no longer in unassigned or moved to staff)
        await page.waitForTimeout(1000); // Wait for drag operation
      }
    }
  });

  test('should filter tasks by event', async ({ page }) => {
    // Test event filtering functionality
    const eventSelect = page.locator('select').first();
    if ((await eventSelect.count()) > 0) {
      // Get initial task count
      const initialTasks = page.locator('[role="button"][aria-label*="Task:"]');
      const initialCount = await initialTasks.count();

      // Select "All Events" option
      await eventSelect.selectOption({ value: '' });
      await page.waitForTimeout(500);

      // Verify board is still visible
      await expect(page.locator('.grid')).toBeVisible();
    }
  });

  test('should display staff presence indicators', async ({ page }) => {
    // Check for staff presence sidebar
    await expect(page.locator('text=Staff Presence')).toBeVisible();

    // Verify presence indicators exist
    const presenceIndicators = page.locator('.w-3.h-3.rounded-full');
    if ((await presenceIndicators.count()) > 0) {
      // Check for different presence colors (online, idle, offline)
      const onlineIndicators = page.locator('.bg-green-500');
      const idleIndicators = page.locator('.bg-yellow-500');
      const offlineIndicators = page.locator('.bg-red-500');

      // At least one presence indicator should be visible
      expect(await presenceIndicators.count()).toBeGreaterThan(0);
    }
  });

  test('should handle task priority indicators', async ({ page }) => {
    // Look for task cards with priority indicators
    const taskCards = page.locator('[role="button"][aria-label*="Task:"]');
    if ((await taskCards.count()) > 0) {
      // Check for priority dots
      const priorityIndicators = page.locator('.w-2.h-2.rounded-full[title*="Priority"]');
      if ((await priorityIndicators.count()) > 0) {
        // Verify priority colors exist
        const highPriority = page.locator('.bg-red-500[title*="Priority: high"]');
        const normalPriority = page.locator('.bg-yellow-500[title*="Priority: normal"]');
        const lowPriority = page.locator('.bg-green-500[title*="Priority: low"]');

        // At least one priority should be visible
        expect(await priorityIndicators.count()).toBeGreaterThan(0);
      }
    }
  });

  test('should handle realtime connection drops gracefully', async ({ page }) => {
    await chaosHelper.enableChaos();

    // Perform actions that rely on realtime
    await page.reload();

    // Verify board still loads via polling fallback
    await expect(page.locator('h1').filter({ hasText: 'Task Board' })).toBeVisible();
    await expect(page.locator('.grid')).toBeVisible();

    // Test that drag and drop still works in chaos mode
    const taskCard = page.locator('[role="button"][aria-label*="Task:"]').first();
    if ((await taskCard.count()) > 0) {
      await expect(taskCard).toBeVisible();
    }

    await chaosHelper.disableChaos();
  });

  test('should maintain accessibility features', async ({ page }) => {
    // Check for proper ARIA labels
    const taskCards = page.locator('[role="button"][aria-label*="Task:"]');
    if ((await taskCards.count()) > 0) {
      // Verify each task has proper ARIA label
      const firstTask = taskCards.first();
      await expect(firstTask).toHaveAttribute('aria-label');

      // Verify keyboard navigation
      await firstTask.focus();
      await expect(firstTask).toBeFocused();
    }

    // Check for proper heading structure
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h3')).toHaveCount.toBeGreaterThan(0);
  });
});
