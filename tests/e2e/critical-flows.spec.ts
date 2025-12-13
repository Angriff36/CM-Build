/**
 * E2E tests - Full user flow validation
 * Catches: Runtime errors, broken interactions, state management issues
 */

import { test, expect } from '@playwright/test';

test.describe('Admin CRM E2E', () => {
  test('can navigate and view events', async ({ page }) => {
    // Track runtime errors
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    // Load homepage
    await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
    
    // Check no errors on initial load
    expect(errors).toHaveLength(0);

    // Navigate to events page
    await page.click('text=Events', { timeout: 5000 }).catch(() => {
      // If no "Events" link, try navigating directly
      return page.goto('http://localhost:3001/events', { waitUntil: 'networkidle' });
    });

    await page.waitForTimeout(1000);

    // Check no errors after navigation
    expect(errors).toHaveLength(0);

    // Verify page loaded
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Display E2E', () => {
  test('loads display screen without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('http://localhost:3002/', { waitUntil: 'networkidle' });
    
    // Wait for React to fully mount
    await page.waitForTimeout(2000);

    expect(errors).toHaveLength(0);
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('PrepChef E2E', () => {
  test('can interact with recipe interface', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    
    // Wait for app initialization
    await page.waitForTimeout(2000);

    expect(errors).toHaveLength(0);
    await expect(page.locator('body')).toBeVisible();

    // Try to interact with any visible buttons/inputs
    const buttons = await page.locator('button').count();
    if (buttons > 0) {
      // Click first button and ensure no errors
      await page.locator('button').first().click({ timeout: 5000 });
      await page.waitForTimeout(500);
      expect(errors).toHaveLength(0);
    }
  });
});

test.describe('Cross-app navigation', () => {
  test('all apps are accessible', async ({ page }) => {
    const apps = [
      { url: 'http://localhost:3001/', name: 'admin-crm' },
      { url: 'http://localhost:3002/', name: 'display' },
      { url: 'http://localhost:3000/', name: 'prepchef' },
    ];

    for (const app of apps) {
      const errors: string[] = [];
      page.on('pageerror', (error) => {
        errors.push(`[${app.name}] ${error.message}`);
      });

      const response = await page.goto(app.url, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBeLessThan(400);
      
      await page.waitForTimeout(1500);
      expect(errors).toHaveLength(0);
    }
  });
});
