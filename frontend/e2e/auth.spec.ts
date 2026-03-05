import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('should show validation errors on empty login submission', async ({ page }) => {
        await page.goto('/login');

        // Submit the form without entering anything
        await page.locator('button[type="submit"]').click();

        // Verify validation messages appear
        await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
        await expect(page.locator('text=Password is required')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
        await page.goto('/login');

        // Fill the login form with fake credentials
        await page.fill('input[type="email"]', 'fakeuser@example.com');
        await page.fill('input[type="password"]', 'WrongPassword123!');

        await page.locator('button[type="submit"]').click();

        // Wait for the red error box to appear
        const errorBox = page.locator('.text-red-600').first();
        await expect(errorBox).toBeVisible({ timeout: 5000 });
    });
});
