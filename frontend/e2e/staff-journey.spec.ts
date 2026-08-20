import { test, expect } from '@playwright/test';

test.describe('Staff Journey (End-to-End)', () => {
    test('should log in as staff, view assigned cleaning jobs, and verify staff dashboard', async ({ page }) => {
        // 1. Staff Login
        await page.goto('/login');
        await page.fill('input[type="email"]', 'staff@laminks.co.za');
        await page.fill('input[type="password"]', 'L0c@l@6m1n');
        await page.locator('button[type="submit"]').click();

        // 2. Staff Dashboard
        await expect(page).toHaveURL(/\/staff/, { timeout: 10000 });
        await expect(page.getByRole('heading', { name: 'My Jobs' })).toBeVisible();

        // 3. Verify Staff Navigation & Profile
        await expect(page.locator('aside').getByText('Sarah Dlamini')).toBeVisible();
    });
});
