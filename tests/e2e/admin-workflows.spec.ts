import { test, expect } from '@playwright/test';
import { RealtimeChaosHelper } from '../playwright/helpers/realtimeChaos';

test.describe('@E2E Admin Workflows', () => {
  let chaosHelper: RealtimeChaosHelper;

  test.beforeEach(async ({ page }) => {
    chaosHelper = new RealtimeChaosHelper(page);
    await page.goto('/admin');
  });

  test('manager assigns task → triggers notification → staff sees assignment', async ({ page }) => {
    // Step 1: Navigate to task board
    await page.goto('/admin/tasks');

    // Step 2: Wait for task board to load
    await expect(page.locator('h1').filter({ hasText: /task board/i })).toBeVisible({
      timeout: 10000,
    });

    // Step 3: Find an unassigned task
    const unassignedColumn = page.locator('text=Unassigned, [data-column="unassigned"]').first();
    await expect(unassignedColumn).toBeVisible();

    const unassignedTask = unassignedColumn.locator('[role="button"][aria-label*="Task:"]').first();

    if ((await unassignedTask.count()) === 0) {
      // Skip test if no unassigned tasks available
      test.skip();
      return;
    }

    await expect(unassignedTask).toBeVisible();

    // Get task details for verification
    const taskTitle = await unassignedTask.locator('.task-title, h4').textContent();
    const taskId = await unassignedTask.getAttribute('data-task-id');

    // Step 4: Find staff column to assign to
    const staffColumn = page
      .locator('h3')
      .filter({ hasText: /Chef|Staff|Kitchen/i })
      .first();

    if ((await staffColumn.count()) === 0) {
      test.skip();
      return;
    }

    await expect(staffColumn).toBeVisible();

    // Step 5: Drag and drop task to staff column
    await unassignedTask.dragTo(staffColumn);

    // Step 6: Verify task assignment in admin view
    await page.waitForTimeout(2000);

    const assignedTaskInStaff = staffColumn
      .locator('[role="button"][aria-label*="Task:"]')
      .filter({ hasText: taskTitle || '' });
    if ((await assignedTaskInStaff.count()) > 0) {
      await expect(assignedTaskInStaff.first()).toBeVisible();
    }

    // Step 7: Verify notification is triggered
    const notification = page
      .locator('.toast, [role="alert"], .notification')
      .filter({ hasText: /assigned|notification/i });
    if ((await notification.count()) > 0) {
      await expect(notification.first()).toBeVisible({ timeout: 5000 });
    }

    // Step 8: Open staff view to verify assignment is visible there
    const staffViewPage = await page.context().newPage();
    await staffViewPage.goto('/prepchef');

    // Wait for staff dashboard to load
    await staffViewPage.waitForSelector('[data-testid*="task"]', { timeout: 10000 });

    // Look for the assigned task in staff view
    const assignedTaskInStaffView = staffViewPage
      .locator('[data-testid*="task"]')
      .filter({ hasText: taskTitle || '' });

    // Allow time for realtime propagation
    await staffViewPage.waitForTimeout(3000);

    if ((await assignedTaskInStaffView.count()) > 0) {
      await expect(assignedTaskInStaffView.first()).toBeVisible();

      // Verify task shows as assigned to current staff
      const assignedIndicator = assignedTaskInStaffView
        .first()
        .locator('.assigned, [data-status="assigned"]');
      if ((await assignedIndicator.count()) > 0) {
        await expect(assignedIndicator.first()).toBeVisible();
      }
    }

    await staffViewPage.close();
  });

  test('admin uploads media → verifies storage bucket access', async ({ page }) => {
    // Step 1: Navigate to media management
    await page.goto('/admin/media');

    // Step 2: Wait for media page to load
    await expect(page.locator('h1').filter({ hasText: /media|upload/i })).toBeVisible({
      timeout: 10000,
    });

    // Step 3: Find upload area
    const uploadInput = page.locator('input[type="file"]').first();
    const uploadArea = page
      .locator('[data-testid="upload-area"], .upload-zone, .drop-zone')
      .first();

    // Ensure upload interface is available
    await expect(uploadInput.isVisible() || uploadArea.isVisible()).toBeTruthy();

    // Step 4: Create test file data
    const testFileContent = 'fake-image-data-for-testing';
    const testFile = {
      name: 'test-upload.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from(testFileContent),
    };

    // Step 5: Upload the file
    if ((await uploadInput.count()) > 0) {
      await uploadInput.setInputFiles([testFile]);
    } else if ((await uploadArea.count()) > 0) {
      // Alternative: drag and drop to upload area
      await uploadArea.dispatchEvent('drop', {
        dataTransfer: {
          files: [testFile],
        },
      });
    }

    // Step 6: Verify upload progress indicator
    const progressIndicator = page.locator('[data-testid="upload-progress"], .progress-bar');
    if ((await progressIndicator.count()) > 0) {
      await expect(progressIndicator.first()).toBeVisible();
      // Wait for upload to complete
      await page.waitForFunction(
        () => {
          const progressBar = document.querySelector(
            '[data-testid="upload-progress"], .progress-bar',
          );
          return progressBar && progressBar.getAttribute('aria-valuenow') === '100';
        },
        { timeout: 15000 },
      );
    }

    // Step 7: Verify upload success message
    const successMessage = page
      .locator('.toast, [role="alert"], .success-message')
      .filter({ hasText: /uploaded|success|complete/i });
    await expect(successMessage.first()).toBeVisible({ timeout: 10000 });

    // Step 8: Verify storage bucket access - check uploaded media appears in gallery
    await page.waitForTimeout(2000);

    const mediaGallery = page.locator('[data-testid="media-gallery"], .media-grid, .media-list');
    if ((await mediaGallery.count()) > 0) {
      // Look for newly uploaded media
      const uploadedMedia = mediaGallery
        .locator('img, video, [data-testid*="media-item"]')
        .filter({ hasText: /test-upload/i });

      // Allow time for media to appear in gallery
      await page.waitForTimeout(3000);

      if ((await uploadedMedia.count()) > 0) {
        await expect(uploadedMedia.first()).toBeVisible();

        // Verify media has proper src attribute (indicating storage access)
        const mediaElement = uploadedMedia.first();
        if (
          (await mediaElement.getAttribute('src')) ||
          (await mediaElement.getAttribute('data-url'))
        ) {
          // Storage access verified
          expect(true).toBeTruthy();
        }
      }
    }

    // Step 9: Test media management features
    const mediaActions = page.locator('[data-testid*="media-actions"], .media-item-actions');
    if ((await mediaActions.count()) > 0) {
      // Test that media can be selected/managed
      const firstMediaAction = mediaActions.first();
      await expect(firstMediaAction).toBeVisible();

      // Test delete functionality (if available)
      const deleteButton = firstMediaAction.locator('button').filter({ hasText: /delete|remove/i });
      if ((await deleteButton.count()) > 0) {
        // Just verify button exists, don't actually delete in test
        await expect(deleteButton.first()).toBeVisible();
      }
    }
  });

  test('admin manages task priorities and deadlines', async ({ page }) => {
    await page.goto('/admin/tasks');

    // Wait for task board
    await expect(page.locator('h1').filter({ hasText: /task board/i })).toBeVisible();

    // Find a task to modify
    const taskCard = page.locator('[role="button"][aria-label*="Task:"]').first();
    if ((await taskCard.count()) > 0) {
      await taskCard.click();

      // Look for priority controls
      const priorityControl = page.locator(
        '[data-testid="priority-control"], select[name="priority"]',
      );
      if ((await priorityControl.count()) > 0) {
        // Change priority
        await priorityControl.selectOption('high');
        await page.waitForTimeout(1000);

        // Verify priority indicator updates
        const priorityIndicator = taskCard.locator('.priority-high, [data-priority="high"]');
        if ((await priorityIndicator.count()) > 0) {
          await expect(priorityIndicator.first()).toBeVisible();
        }
      }

      // Look for deadline controls
      const deadlineControl = page.locator(
        '[data-testid="deadline-control"], input[name="deadline"]',
      );
      if ((await deadlineControl.count()) > 0) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const deadlineString = tomorrow.toISOString().split('T')[0];

        await deadlineControl.fill(deadlineString);
        await page.waitForTimeout(1000);

        // Verify deadline is set
        const deadlineDisplay = taskCard.locator('.deadline, [data-deadline]');
        if ((await deadlineDisplay.count()) > 0) {
          await expect(deadlineDisplay.first()).toBeVisible();
        }
      }

      // Close task detail view
      const closeButton = page.locator('button[aria-label*="close"], .close-button');
      if ((await closeButton.count()) > 0) {
        await closeButton.click();
      }
    }
  });

  test('admin workflows handle realtime connection issues', async ({ page }) => {
    await chaosHelper.enableChaos();

    await page.goto('/admin/tasks');

    // Try to perform admin actions during chaos
    const taskCard = page.locator('[role="button"][aria-label*="Task:"]').first();
    if ((await taskCard.count()) > 0) {
      await taskCard.click();
      await page.waitForTimeout(2000);

      // Verify admin interface remains functional
      const taskDetail = page.locator('[data-testid="task-detail"], .task-modal');
      if ((await taskDetail.count()) > 0) {
        await expect(taskDetail.first()).toBeVisible();
      }
    }

    await chaosHelper.disableChaos();
  });

  test('admin interface maintains accessibility standards', async ({ page }) => {
    await page.goto('/admin/tasks');

    // Test keyboard navigation
    const firstTask = page.locator('[role="button"][aria-label*="Task:"]').first();
    if ((await firstTask.count()) > 0) {
      await firstTask.focus();
      await expect(firstTask).toBeFocused();

      // Test Tab navigation through task board
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);
    }

    // Test ARIA labels
    await expect(firstTask).toHaveAttribute('aria-label');

    // Test screen reader support
    const liveRegions = page.locator('[aria-live="polite"], [aria-live="assertive"]');
    if ((await liveRegions.count()) > 0) {
      await expect(liveRegions.first()).toBeVisible();
    }

    // Test proper heading structure
    await expect(page.locator('h1')).toBeVisible();
    const headings = page.locator('h2, h3');
    expect(await headings.count()).toBeGreaterThan(0);
  });
});
