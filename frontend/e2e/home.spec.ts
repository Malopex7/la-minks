import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
    test('should load the homepage and display key elements', async ({ page }) => {
        await page.goto('/');

        await expect(page).toHaveTitle(/La-Minks/);
        await expect(page.locator('h1').first()).toBeVisible();

        const getQuoteBtn = page.getByRole('link', { name: 'Get a Quote' }).first();
        await expect(getQuoteBtn).toBeVisible();
        await expect(getQuoteBtn).toHaveAttribute('href', '/quote');
    });

    test('should navigate to the Services page', async ({ page }) => {
        await page.goto('/');

        // Click on the Services link in the navigation
        await page.locator('nav a[href="/services"]').click();

        await expect(page).toHaveURL(/\/services/);

        // The "Our Services" heading
        await expect(page.getByRole('heading', { name: 'Our Services' })).toBeVisible();
    });
});
