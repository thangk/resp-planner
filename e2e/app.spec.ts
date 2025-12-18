import { test, expect } from '@playwright/test';

test.describe('RESP Planner App', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.waitForLoadState('networkidle');
  });

  test('should display welcome page for new users', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Should show welcome state
    await expect(page.getByText('Welcome to RESP Planner')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Quick Start Wizard')).toBeVisible();
  });

  test('should navigate to wizard from dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Wait for and click the wizard link
    const wizardLink = page.getByRole('link', { name: /Start Wizard/i });
    await expect(wizardLink).toBeVisible({ timeout: 10000 });
    await wizardLink.click();

    await expect(page).toHaveURL('/wizard', { timeout: 10000 });
    await expect(page.getByText('Welcome to RESP Planner')).toBeVisible();
  });

  test('should navigate through sidebar links', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Navigate to Children page
    const childrenLink = page.getByRole('link', { name: /Children/i }).first();
    await expect(childrenLink).toBeVisible({ timeout: 10000 });
    await childrenLink.click();
    await expect(page).toHaveURL('/children', { timeout: 10000 });

    // Navigate to Portfolio page
    const portfolioLink = page.getByRole('link', { name: /Portfolio/i }).first();
    await portfolioLink.click();
    await expect(page).toHaveURL('/portfolio', { timeout: 10000 });

    // Navigate to Settings page
    const settingsLink = page.getByRole('link', { name: /Settings/i }).first();
    await settingsLink.click();
    await expect(page).toHaveURL('/settings', { timeout: 10000 });
  });

  test('should toggle dark mode', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // Wait for the button to be visible
    const darkButton = page.getByRole('button', { name: /Dark/i });
    await expect(darkButton).toBeVisible({ timeout: 10000 });

    // Click dark mode button
    await darkButton.click();

    // Check that dark class is applied
    await expect(page.locator('html')).toHaveClass(/dark/, { timeout: 5000 });

    // Click light mode button
    await page.getByRole('button', { name: /Light/i }).click();

    // Check that dark class is removed
    await expect(page.locator('html')).not.toHaveClass(/dark/, { timeout: 5000 });
  });
});

test.describe('Children Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should add a new child', async ({ page }) => {
    await page.goto('/children');
    await page.waitForLoadState('networkidle');

    // Click Add Child button
    const addButton = page.getByRole('button', { name: /Add Child/i });
    await expect(addButton).toBeVisible({ timeout: 10000 });
    await addButton.click();

    // Fill in the form
    await page.getByLabel(/Name/i).fill('Test Child');
    await page.getByLabel(/Date of Birth/i).fill('2020-01-15');

    // Submit the form (find the button in the dialog)
    const submitButton = page.getByRole('button', { name: /Add Child/i }).last();
    await submitButton.click();

    // Verify child was added
    await expect(page.getByText('Test Child')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Plans', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // First add a child since plans require children
    await page.goto('/children');
    await page.waitForLoadState('networkidle');

    const addButton = page.getByRole('button', { name: /Add Child/i });
    await expect(addButton).toBeVisible({ timeout: 10000 });
    await addButton.click();
    await page.getByLabel(/Name/i).fill('Test Child');
    await page.getByLabel(/Date of Birth/i).fill('2020-01-15');
    await page
      .getByRole('button', { name: /Add Child/i })
      .last()
      .click();
    await expect(page.getByText('Test Child')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to new plan page', async ({ page }) => {
    await page.goto('/plans/new');
    await page.waitForLoadState('networkidle');

    // Verify the page loaded correctly
    await expect(page.getByText('New Plan')).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel(/Plan Name/i)).toBeVisible();

    // Verify the child we added is listed
    await expect(page.getByText('Test Child')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should have skip link for keyboard navigation', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Tab to focus skip link
    await page.keyboard.press('Tab');

    // Skip link should become visible when focused
    const skipLink = page.getByText('Skip to main content');
    await expect(skipLink).toBeVisible({ timeout: 5000 });
  });

  test('should have proper page structure', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Check for main landmark
    await expect(page.getByRole('main')).toBeVisible({ timeout: 10000 });

    // Check for navigation
    await expect(page.getByRole('navigation', { name: /Main navigation/i })).toBeVisible();
  });
});
