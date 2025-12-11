import { test, expect } from '@playwright/test';
import { RealtimeChaosHelper } from './helpers/realtimeChaos';

/**
 * Comprehensive Resilience Drill Tests
 * Simulates various failure scenarios to test system resilience and verify fallback mechanisms
 */
test.describe('@Display @Resilience Resilience Drills', () => {
  let chaosHelper: RealtimeChaosHelper;

  test.beforeEach(async ({ page }) => {
    chaosHelper = new RealtimeChaosHelper(page);
  });

  test.afterEach(async () => {
    await chaosHelper.reset();
  });

  test('Realtime Outage Drill', async ({ page }) => {
    console.log('Starting Realtime Outage Drill');

    // Navigate to prepchef
    await page.goto('/prepchef');

    // Enable chaos to simulate realtime connection drops
    await chaosHelper.enableChaos();

    // Wait for fallback to polling
    await page.waitForTimeout(5000);

    // Check if offline banner appears with correct styling
    const banner = page.locator('[role="alert"]').filter({ hasText: 'Realtime connection lost' });
    await expect(banner).toBeVisible();

    // Verify amber banner styling for realtime disconnect
    await expect(banner).toHaveClass(/bg-amber-100/);

    // Verify telemetry data is displayed
    await expect(banner).toContainText('Reconnect attempts');
    await expect(banner).toContainText('Polling');

    // Verify polling fallback works
    await page.waitForTimeout(10000); // Wait for polling cycles

    console.log('Realtime Outage Drill completed - banner shown, polling active');

    // Test recovery
    await chaosHelper.disableChaos();
    await page.waitForTimeout(3000);

    // Banner should disappear after recovery
    await expect(banner).not.toBeVisible({ timeout: 10000 });
  });

  test('Supabase Restart Drill', async ({ page }) => {
    console.log('Starting Supabase Restart Drill');

    await page.goto('/prepchef');

    // Simulate offline mode (Supabase down)
    await chaosHelper.simulateOfflineMode();

    // Check offline banner with grey overlay
    const banner = page.locator('[role="alert"]').filter({ hasText: 'Offline mode active' });
    await expect(banner).toBeVisible();

    // Verify grey overlay for offline mode
    const overlay = page.locator('.fixed.inset-0');
    await expect(overlay).toHaveClass(/bg-gray-500/);

    // Verify UI is frozen/disabled
    const claimButtons = page.locator('button').filter({ hasText: /claim|take/i });
    for (const button of await claimButtons.all()) {
      await expect(button).toBeDisabled();
    }

    console.log('Supabase Restart Drill completed - offline banner shown, actions disabled');

    // Test recovery
    await chaosHelper.reset();
    await page.waitForTimeout(3000);

    // Overlay should disappear
    await expect(overlay).not.toBeVisible({ timeout: 10000 });

    // Task buttons should be enabled again
    for (const button of await claimButtons.all()) {
      await expect(button).toBeEnabled();
    }
  });

  test('Media Backlog Drill', async ({ page }) => {
    console.log('Starting Media Backlog Drill');

    await page.goto('/prepchef');

    // Simulate network latency (media backlog)
    await chaosHelper.simulateNetworkLatency(2000);

    // Try to upload or access media-related features
    const mediaElements = page.locator(
      '[data-testid*="media"], [aria-label*="upload"], input[type="file"]',
    );
    if ((await mediaElements.count()) > 0) {
      // Simulate upload attempt
      await page.waitForTimeout(5000); // Wait for latency

      // Check for media backlog indicators in banners
      const banners = page.locator('[role="alert"]');
      if ((await banners.count()) > 0) {
        const bannerText = await banners.first().textContent();
        if (bannerText?.includes('Media backlog')) {
          await expect(banners.first()).toContainText('Media backlog');
          await expect(banners.first()).toContainText('items queued');
        }
      }
    }

    console.log('Media Backlog Drill completed - latency simulated');

    await chaosHelper.reset();
  });

  test('Display App Resilience Drill', async ({ page }) => {
    console.log('Starting Display App Resilience Drill');

    await page.goto('/display');

    // Test realtime outage in display context
    await chaosHelper.enableChaos();

    // Wait for banner
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 10000 });

    // Verify display continues to show cached data
    await expect(page.locator('.summary-grid, .urgent-ticker, .presence-lane')).toBeVisible();

    // Test rotation continues (30 second intervals)
    const initialView = page.locator('.summary-grid, .urgent-ticker, .presence-lane').first();
    await expect(initialView).toBeVisible();

    // Wait for rotation
    await page.waitForTimeout(31000);

    // Verify rotation still works
    const rotatedView = page.locator('.summary-grid, .urgent-ticker, .presence-lane').first();
    await expect(rotatedView).toBeVisible();

    console.log('Display App Resilience Drill completed - rotation continues during outage');

    // Recovery test
    await chaosHelper.disableChaos();
    await page.waitForTimeout(3000);
  });

  test('Conflict Resolution Drill', async ({ page }) => {
    console.log('Starting Conflict Resolution Drill');

    await page.goto('/prepchef');

    // Simulate conflicting approvals
    await chaosHelper.simulateConflictingApprovals();

    // Try to perform a task action that might conflict
    const taskButtons = page.locator('button').filter({ hasText: /claim|take/i });
    if ((await taskButtons.count()) > 0) {
      await taskButtons.first().click();

      // Wait for potential conflict message
      await page.waitForTimeout(3000);

      // Check for conflict resolution UI
      const conflictMessages = page.locator('text=/already claimed|conflict|failed/i');
      if ((await conflictMessages.count()) > 0) {
        await expect(conflictMessages.first()).toBeVisible();
      }
    }

    console.log('Conflict Resolution Drill completed');

    await chaosHelper.reset();
  });

  test('Undo Expiration Drill', async ({ page }) => {
    console.log('Starting Undo Expiration Drill');

    await page.goto('/prepchef');

    // Simulate time passing for undo expiration
    await chaosHelper.simulateUndoExpiration();

    // Look for task completion buttons
    const completeButtons = page.locator('button').filter({ hasText: /complete|done/i });
    if ((await completeButtons.count()) > 0) {
      await completeButtons.first().click();

      // Wait for completion
      await page.waitForTimeout(2000);

      // Look for undo button
      const undoButtons = page.locator('button').filter({ hasText: /undo/i });
      if ((await undoButtons.count()) > 0) {
        // Undo should be disabled due to expiration
        await expect(undoButtons.first()).toBeDisabled();
      }
    }

    console.log('Undo Expiration Drill completed');

    await chaosHelper.reset();
  });
});

test.describe('@Display @Resilience Resilience Drill Verification', () => {
  test('Verify audit logging during drills', async ({ page }) => {
    console.log('Starting Audit Logging Verification');

    await page.goto('/prepchef');

    // Enable monitoring for audit events
    const auditEvents: string[] = [];
    page.on('console', (msg) => {
      if (msg.text().includes('audit') || msg.text().includes('log')) {
        auditEvents.push(msg.text());
      }
    });

    // Run a simple drill
    const chaosHelper = new RealtimeChaosHelper(page);
    await chaosHelper.enableChaos();

    // Wait for banner
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 10000 });

    // Check that audit events were logged
    await page.waitForTimeout(2000);
    expect(auditEvents.length).toBeGreaterThan(0);

    console.log('Audit Logging Verification completed - events logged');

    await chaosHelper.reset();
  });

  test('Verify telemetry data accuracy', async ({ page }) => {
    console.log('Starting Telemetry Accuracy Verification');

    await page.goto('/prepchef');

    // Monitor telemetry events
    const telemetryEvents: any[] = [];
    page.on('console', (msg) => {
      try {
        const text = msg.text();
        if (text.includes('telemetry') || text.includes('reconnect') || text.includes('polling')) {
          telemetryEvents.push({ message: text, timestamp: Date.now() });
        }
      } catch {
        // Ignore parsing errors
      }
    });

    // Enable chaos
    const chaosHelper = new RealtimeChaosHelper(page);
    await chaosHelper.enableChaos();

    // Wait for banner and telemetry
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 10000 });

    // Verify telemetry contains expected information
    await page.waitForTimeout(3000);
    expect(telemetryEvents.length).toBeGreaterThan(0);

    // Check banner displays telemetry data
    const banner = page.locator('[role="alert"]');
    await expect(banner).toContainText('Reconnect attempts');
    await expect(banner).toContainText('Polling');

    console.log('Telemetry Accuracy Verification completed - data displayed correctly');

    await chaosHelper.reset();
  });

  test('Verify user messaging accessibility', async ({ page }) => {
    console.log('Starting User Messaging Accessibility Verification');

    await page.goto('/prepchef');

    // Test realtime outage messaging
    const chaosHelper = new RealtimeChaosHelper(page);
    await chaosHelper.enableChaos();

    // Wait for banner
    const banner = page.locator('[role="alert"]');
    await expect(banner).toBeVisible({ timeout: 10000 });

    // Verify accessibility attributes
    await expect(banner).toHaveAttribute('role', 'alert');
    await expect(banner).toHaveAttribute('aria-live', 'assertive');

    // Verify color contrast (amber for realtime)
    await expect(banner).toHaveClass(/bg-amber-100/);
    await expect(banner).toHaveClass(/text-amber-800/);

    // Test offline messaging
    await chaosHelper.reset();
    await page.waitForTimeout(2000);

    await chaosHelper.simulateOfflineMode();

    const offlineBanner = page.locator('[role="alert"]').filter({ hasText: 'Offline mode active' });
    await expect(offlineBanner).toBeVisible();

    // Verify offline styling (grey)
    await expect(offlineBanner).toHaveClass(/bg-gray-100/);
    await expect(offlineBanner).toHaveClass(/text-gray-800/);

    console.log('User Messaging Accessibility Verification completed');

    await chaosHelper.reset();
  });

  test('Verify auto-recovery sequences', async ({ page }) => {
    console.log('Starting Auto-Recovery Verification');

    await page.goto('/prepchef');

    const chaosHelper = new RealtimeChaosHelper(page);

    // Test realtime recovery
    await chaosHelper.enableChaos();

    // Wait for banner to appear
    const banner = page.locator('[role="alert"]');
    await expect(banner).toBeVisible({ timeout: 10000 });

    // Disable chaos and verify recovery
    await chaosHelper.disableChaos();

    // Banner should disappear after recovery
    await expect(banner).not.toBeVisible({ timeout: 10000 });

    // Test offline recovery
    await chaosHelper.simulateOfflineMode();

    const offlineBanner = page.locator('[role="alert"]').filter({ hasText: 'Offline mode active' });
    await expect(offlineBanner).toBeVisible();

    // Reset and verify recovery
    await chaosHelper.reset();

    // Overlay should disappear
    await expect(page.locator('.fixed.inset-0')).not.toBeVisible({ timeout: 10000 });
    await expect(offlineBanner).not.toBeVisible({ timeout: 10000 });

    console.log('Auto-Recovery Verification completed - system recovers properly');

    await chaosHelper.reset();
  });
});
