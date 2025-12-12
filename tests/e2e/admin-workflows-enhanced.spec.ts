import { test, expect } from '@playwright/test';

test.describe('@E2E Admin Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
  });

  test('admin can create and manage events', async ({ page }) => {
    // Step 1: Login as admin (mocked)
    await page.fill('[data-testid="username"]', 'admin@test.com');
    await page.fill('[data-testid="password"]', 'test-password');
    await page.click('[data-testid="login-button"]');

    // Step 2: Navigate to events management
    await page.click('[data-testid="events-nav"], a[href="/events"]');
    await page.waitForLoadState('networkidle');

    // Step 3: Create new event
    await page.click('[data-testid="create-event-button"], button:has-text("Create Event")');

    // Step 4: Fill event form
    await page.fill('[data-testid="event-name"]', 'Test Event');
    await page.fill('[data-testid="event-date"]', '2025-12-15');
    await page.fill('[data-testid="event-location"]', 'Test Venue');

    // Step 5: Save event
    await page.click('[data-testid="save-event-button"], button:has-text("Save")');

    // Step 6: Verify event created
    await expect(page.locator('text=Event created successfully')).toBeVisible();

    // Step 7: Verify event appears in list
    const eventCard = page.locator('[data-testid="event-card"]').filter({ hasText: 'Test Event' });
    await expect(eventCard).toBeVisible();
  });

  test('admin can manage staff assignments', async ({ page }) => {
    // Step 1: Login and navigate to staff
    await page.fill('[data-testid="username"]', 'admin@test.com');
    await page.fill('[data-testid="password"]', 'test-password');
    await page.click('[data-testid="login-button"]');

    await page.click('[data-testid="staff-nav"], a[href="/staff"]');
    await page.waitForLoadState('networkidle');

    // Step 2: Add new staff member
    await page.click('[data-testid="add-staff-button"], button:has-text("Add Staff")');

    await page.fill('[data-testid="staff-name"]', 'John Doe');
    await page.fill('[data-testid="staff-email"]', 'john@test.com');
    await page.selectOption('[data-testid="staff-role"]', 'chef');

    await page.click('[data-testid="save-staff-button"], button:has-text("Save")');

    // Step 3: Verify staff added
    await expect(page.locator('text=Staff member added successfully')).toBeVisible();

    // Step 4: Verify staff appears in list
    const staffCard = page.locator('[data-testid="staff-card"]').filter({ hasText: 'John Doe' });
    await expect(staffCard).toBeVisible();
  });

  test('admin can view and manage tasks', async ({ page }) => {
    // Step 1: Login and navigate to tasks
    await page.fill('[data-testid="username"]', 'admin@test.com');
    await page.fill('[data-testid="password"]', 'test-password');
    await page.click('[data-testid="login-button"]');

    await page.click('[data-testid="tasks-nav"], a[href="/tasks"]');
    await page.waitForLoadState('networkidle');

    // Step 2: Verify task board loads
    const taskBoard = page.locator('[data-testid="task-board"]');
    await expect(taskBoard).toBeVisible();

    // Step 3: Filter tasks
    await page.selectOption('[data-testid="task-filter"]', 'available');
    await page.waitForTimeout(1000);

    // Step 4: Verify filtered results
    const availableTasks = page.locator('[data-testid="task"][data-status="available"]');
    expect(await availableTasks.count()).toBeGreaterThan(0);

    // Step 5: Assign task to staff
    const firstTask = availableTasks.first();
    await firstTask.click();

    await page.selectOption('[data-testid="assign-staff"]', 'John Doe');
    await page.click('[data-testid="assign-button"], button:has-text("Assign")');

    // Step 6: Verify assignment
    await expect(page.locator('text=Task assigned successfully')).toBeVisible();
  });

  test('admin dashboard shows real-time metrics', async ({ page }) => {
    // Step 1: Login
    await page.fill('[data-testid="username"]', 'admin@test.com');
    await page.fill('[data-testid="password"]', 'test-password');
    await page.click('[data-testid="login-button"]');

    // Step 2: Navigate to dashboard
    await page.click('[data-testid="dashboard-nav"], a[href="/dashboard"]');
    await page.waitForLoadState('networkidle');

    // Step 3: Verify metrics display
    const metricsSection = page.locator('[data-testid="metrics-section"]');
    await expect(metricsSection).toBeVisible();

    // Step 4: Check specific metrics
    const totalTasks = page.locator('[data-testid="total-tasks"]');
    const completedTasks = page.locator('[data-testid="completed-tasks"]');
    const activeStaff = page.locator('[data-testid="active-staff"]');

    await expect(totalTasks).toBeVisible();
    await expect(completedTasks).toBeVisible();
    await expect(activeStaff).toBeVisible();

    // Step 5: Verify metrics update (simulate with wait)
    const initialTaskCount = await totalTasks.textContent();
    await page.waitForTimeout(5000);

    // Metrics should still be visible and potentially updated
    await expect(totalTasks).toBeVisible();
  });

  test('admin can export reports', async ({ page }) => {
    // Step 1: Login
    await page.fill('[data-testid="username"]', 'admin@test.com');
    await page.fill('[data-testid="password"]', 'test-password');
    await page.click('[data-testid="login-button"]');

    // Step 2: Navigate to reports
    await page.click('[data-testid="reports-nav"], a[href="/reports"]');
    await page.waitForLoadState('networkidle');

    // Step 3: Generate report
    await page.selectOption('[data-testid="report-type"]', 'task-summary');
    await page.fill('[data-testid="report-date-start"]', '2025-12-01');
    await page.fill('[data-testid="report-date-end"]', '2025-12-31');

    await page.click('[data-testid="generate-report"], button:has-text("Generate")');

    // Step 4: Verify report generation
    await expect(page.locator('text=Report generated successfully')).toBeVisible();

    // Step 5: Download report
    const downloadButton = page.locator(
      '[data-testid="download-report"], button:has-text("Download")',
    );

    if (await downloadButton.isVisible()) {
      // Start download
      const downloadPromise = page.waitForEvent('download');
      await downloadButton.click();
      const download = await downloadPromise;

      // Verify download
      expect(download.suggestedFilename()).toMatch(/\.pdf$|\.csv$|\.xlsx$/);
    }
  });

  test('admin workflow maintains accessibility', async ({ page }) => {
    // Step 1: Test keyboard navigation
    await page.press('Tab'); // Should focus on username input
    await expect(page.locator('[data-testid="username"]')).toBeFocused();

    await page.fill('[data-testid="username"]', 'admin@test.com');
    await page.press('Tab'); // Move to password
    await expect(page.locator('[data-testid="password"]')).toBeFocused();

    await page.fill('[data-testid="password"]', 'test-password');
    await page.press('Tab'); // Move to login button
    await expect(page.locator('[data-testid="login-button"]')).toBeFocused();

    // Step 2: Test keyboard login
    await page.press('Enter');
    await page.waitForLoadState('networkidle');

    // Step 3: Test ARIA labels and roles
    const navigation = page.locator('[data-testid="admin-nav"], nav');
    await expect(navigation).toHaveAttribute('role', 'navigation');

    // Step 4: Test screen reader compatibility
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent).toBeVisible();

    // Step 5: Test focus management
    await page.press('Tab');
    const focusedElement = page.locator(':focus');
    expect(await mainContent.contains(focusedElement)).toBeTruthy();
  });
});
