import { test, expect } from '@playwright/test';

test.describe('Public & Legal Pages (End-to-End)', () => {
    test('should navigate to About Us and render company values and stats', async ({ page }) => {
        await page.goto('/about');
        await expect(page.getByRole('heading', { name: /Elevating the Standard/i })).toBeVisible();
        await expect(page.locator('text=100%')).toBeVisible();
        await expect(page.locator('text=Vetted & Trained Staff')).toBeVisible();
    });

    test('should test interactive FAQs with search and accordion expansion', async ({ page }) => {
        await page.goto('/faqs');
        await expect(page.getByRole('heading', { name: 'Frequently Asked Questions' })).toBeVisible();

        // Click a question to expand
        const questionBtn = page.getByRole('button', { name: /What areas in South Africa do you service/i });
        await questionBtn.click();
        await expect(page.getByText('Johannesburg and Gauteng').first()).toBeVisible();

        // Test search filter
        const searchInput = page.locator('input[placeholder*="Search"]');
        await searchInput.fill('pets');
        await expect(page.getByText('Are your cleaning products safe for pets')).toBeVisible();

        // Expand filtered question
        await page.getByRole('button', { name: /Are your cleaning products safe/i }).click();
        await expect(page.getByText('biodegradable, non-toxic formulations').first()).toBeVisible();
    });

    test('should test Contact Us interactive form submission', async ({ page }) => {
        await page.goto('/contact');
        await expect(page.getByRole('heading', { name: /We're Here to Help/i })).toBeVisible();

        // Fill contact form
        await page.fill('input[type="text"]', 'Alex Morgan');
        await page.fill('input[type="email"]', 'alex@example.com');
        await page.fill('input[type="tel"]', '0831234567');
        await page.fill('textarea', 'Interested in weekly office cleaning.');

        await page.locator('button[type="submit"]').click();

        // Confirmation alert
        await expect(page.getByRole('heading', { name: 'Message Received!' })).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Thank you for contacting La-Minks')).toBeVisible();
    });

    test('should verify Privacy Policy (POPIA) page', async ({ page }) => {
        await page.goto('/privacy');
        await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();
        await expect(page.getByText('POPIA & Data Privacy').first()).toBeVisible();
    });

    test('should verify Terms of Service page', async ({ page }) => {
        await page.goto('/terms');
        await expect(page.getByRole('heading', { name: 'Terms of Service' })).toBeVisible();
        await expect(page.locator('text=Satisfaction Guarantee')).toBeVisible();
    });

    test('should verify Cookie Policy page', async ({ page }) => {
        await page.goto('/cookies');
        await expect(page.getByRole('heading', { name: 'Cookie Policy' })).toBeVisible();
        await expect(page.locator('text=Strictly Necessary Cookies')).toBeVisible();
    });
});
