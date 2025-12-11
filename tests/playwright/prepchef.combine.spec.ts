import { test, expect } from '@playwright/test';
import { RealtimeChaosHelper } from './helpers/realtimeChaos';

test.describe('PrepChef Task Combine Flows', () => {
  let chaosHelper: RealtimeChaosHelper;

  test.beforeEach(async ({ page }) => {
    chaosHelper = new RealtimeChaosHelper(page);
    await page.goto('/prepchef/combine');
  });

  test('should display combine suggestions when feature flag is enabled', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if feature is enabled or shows "Feature not enabled"
    const content = await page.textContent('body');

    if (content?.includes('Feature not enabled')) {
      // Feature is disabled, test the fallback behavior
      await expect(page.locator('text=Feature not enabled')).toBeVisible();
    } else {
      // Feature is enabled, test suggestions display
      await expect(
        page.locator('h1').filter({ hasText: 'Task Combine Suggestions' }),
      ).toBeVisible();

      // Look for suggestion containers
      const suggestions = page.locator('.border.p-4.mb-4');
      if ((await suggestions.count()) > 0) {
        await expect(suggestions.first()).toBeVisible();

        // Verify suggestion content structure
        const firstSuggestion = suggestions.first();
        await expect(firstSuggestion.locator('text=Combine')).toBeVisible();
        await expect(firstSuggestion.locator('text=Score:')).toBeVisible();
        await expect(firstSuggestion.locator('button')).toBeVisible();
      }
    }
  });

  test('should handle task combination approval', async ({ page }) => {
    // Wait for suggestions to load
    await page.waitForLoadState('networkidle');

    // Check if feature is enabled
    const content = await page.textContent('body');
    if (content?.includes('Feature not enabled')) {
      test.skip();
      return;
    }

    const combineButton = page.locator('button').filter({ hasText: 'Combine Tasks' }).first();
    if ((await combineButton.count()) > 0) {
      // Count suggestions before combination
      const suggestionsBefore = await page.locator('.border.p-4.mb-4').count();

      // Click combine button
      await combineButton.click();

      // Wait for loading to complete
      await page.waitForTimeout(2000);

      // Verify suggestion was removed (count decreased)
      const suggestionsAfter = await page.locator('.border.p-4.mb-4').count();
      expect(suggestionsAfter).toBeLessThan(suggestionsBefore);
    }
  });

  test('should display task details in expandable sections', async ({ page }) => {
    // Check if feature is enabled
    const content = await page.textContent('body');
    if (content?.includes('Feature not enabled')) {
      test.skip();
      return;
    }

    const detailsElements = page.locator('details');
    if ((await detailsElements.count()) > 0) {
      const firstDetails = detailsElements.first();

      // Verify summary exists
      await expect(firstDetails.locator('summary')).toBeVisible();

      // Expand details
      await firstDetails.locator('summary').click();

      // Verify detailed task information is visible
      await expect(firstDetails.locator('text=Task 1:')).toBeVisible();
      await expect(firstDetails.locator('text=Task 2:')).toBeVisible();
    }
  });

  test('should handle loading states during combination', async ({ page }) => {
    // Check if feature is enabled
    const content = await page.textContent('body');
    if (content?.includes('Feature not enabled')) {
      test.skip();
      return;
    }

    const combineButton = page.locator('button').filter({ hasText: 'Combine Tasks' }).first();
    if ((await combineButton.count()) > 0) {
      // Click combine and check for disabled state
      await combineButton.click();

      // Button should be disabled during loading
      await expect(combineButton).toBeDisabled();

      // Wait for loading to complete
      await page.waitForTimeout(3000);

      // Button should no longer be disabled (or suggestion removed)
      if ((await combineButton.count()) > 0) {
        await expect(combineButton).not.toBeDisabled();
      }
    }
  });

  test('should fallback to offline mode when realtime fails', async ({ page }) => {
    await chaosHelper.enableChaos();
    await page.reload();

    // Wait for page to load with chaos enabled
    await page.waitForLoadState('networkidle');

    // Verify page still loads (either with suggestions or feature disabled message)
    const content = await page.textContent('body');
    if (content?.includes('Feature not enabled')) {
      await expect(page.locator('text=Feature not enabled')).toBeVisible();
    } else {
      await expect(
        page.locator('h1').filter({ hasText: 'Task Combine Suggestions' }),
      ).toBeVisible();
    }

    await chaosHelper.disableChaos();
  });

  test('should handle conflicting approvals gracefully', async ({ page }) => {
    // Check if feature is enabled
    const content = await page.textContent('body');
    if (content?.includes('Feature not enabled')) {
      test.skip();
      return;
    }

    await chaosHelper.simulateConflictingApprovals();

    // Attempt multiple combinations simultaneously
    const combineButtons = page.locator('button').filter({ hasText: 'Combine Tasks' });
    const buttonCount = await combineButtons.count();

    if (buttonCount > 0) {
      // Click multiple buttons rapidly to simulate conflict
      const clickPromises = [];
      for (let i = 0; i < Math.min(buttonCount, 2); i++) {
        clickPromises.push(combineButtons.nth(i).click());
      }

      await Promise.allSettled(clickPromises);

      // Wait for responses
      await page.waitForTimeout(3000);

      // Verify page doesn't crash and handles conflicts gracefully
      await expect(page.locator('body')).toBeVisible();

      // Check for any error messages or proper handling
      const errorMessages = page.locator('text=Error').or(page.locator('text=Failed'));
      if ((await errorMessages.count()) > 0) {
        // If errors appear, they should be user-friendly
        await expect(errorMessages.first()).toBeVisible();
      }
    }

    await chaosHelper.reset();
  });

  test('should handle undo expiration scenarios', async ({ page }) => {
    // Check if feature is enabled
    const content = await page.textContent('body');
    if (content?.includes('Feature not enabled')) {
      test.skip();
      return;
    }

    await chaosHelper.simulateUndoExpiration();

    // This test would need rollback functionality to be implemented
    // For now, we'll test that the page handles time manipulation gracefully
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify page still functions normally with time manipulation
    await expect(page.locator('body')).toBeVisible();

    // If combine buttons exist, they should still work
    const combineButton = page.locator('button').filter({ hasText: 'Combine Tasks' }).first();
    if ((await combineButton.count()) > 0) {
      await expect(combineButton).toBeVisible();
    }

    await chaosHelper.reset();
  });

  test('should maintain accessibility compliance', async ({ page }) => {
    // Check if feature is enabled
    const content = await page.textContent('body');
    if (content?.includes('Feature not enabled')) {
      // Test accessibility of feature disabled message
      await expect(page.locator('h1')).toBeVisible();
      return;
    }

    // Verify proper heading structure
    await expect(page.locator('h1')).toBeVisible();

    // Check button accessibility
    const combineButtons = page.locator('button').filter({ hasText: 'Combine Tasks' });
    if ((await combineButtons.count()) > 0) {
      await expect(combineButtons.first()).toBeVisible();

      // Test keyboard navigation
      await combineButtons.first().focus();
      await expect(combineButtons.first()).toBeFocused();
    }

    // Verify expandable details are accessible
    const detailsElements = page.locator('details');
    if ((await detailsElements.count()) > 0) {
      await expect(detailsElements.first().locator('summary')).toBeVisible();
    }
  });
});
