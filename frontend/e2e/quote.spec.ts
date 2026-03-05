import { test, expect } from '@playwright/test';

test.describe('Quote Wizard Flow', () => {
    test('should navigate through the quote wizard steps', async ({ page }) => {
        await page.goto('/quote');

        // Step 1: Services 
        const serviceCard = page.locator('div.cursor-pointer').first();
        await expect(serviceCard).toBeVisible({ timeout: 10000 });
        await serviceCard.click();
        await page.locator('button', { hasText: 'Continue' }).click();

        // Step 2: Property Details
        await expect(page.locator('text=Property Details')).toBeVisible();
        await page.fill('input[name="sqm"]', '120');
        await page.locator('button', { hasText: 'Continue' }).click();

        // Step 3: Extras
        await expect(page.locator('text=Optional Extras')).toBeVisible();
        await page.locator('button', { hasText: 'Continue' }).click();

        // Step 4: Address Input
        await expect(page.getByRole('heading', { name: 'Property Address' })).toBeVisible();
        await page.fill('input[name="line1"]', '123 Test Street');
        await page.fill('input[name="suburb"]', 'Testville');
        await page.fill('input[name="city"]', 'Test City');
        await page.fill('input[name="province"]', 'Gauteng');
        await page.fill('input[name="postalCode"]', '1234');
        await page.locator('button', { hasText: 'Continue' }).click();

        // Step 5: Schedule
        await expect(page.getByRole('heading', { name: 'When do you need us?' })).toBeVisible();

        // Open date picker
        await page.locator('button', { hasText: 'Pick a date' }).click();

        // Go to next month to guarantee the day is enabled
        const nextMonthBtn = page.locator('button[name="next-month"]');
        if (await nextMonthBtn.isVisible()) {
            await nextMonthBtn.click();
        }

        // Click the 15th
        await page.getByRole('gridcell', { name: '15' }).first().click();

        // Wait for the combobox to become enabled
        const timeCombo = page.locator('button[role="combobox"]');
        await expect(timeCombo).toBeEnabled({ timeout: 5000 });

        // Open time select combobox
        await timeCombo.click();
        // Click the first available option
        await page.getByRole('option').first().click();

        // Click to advance
        await page.locator('button', { hasText: 'Review Quote' }).click();

        // Step 6: Summary
        await expect(page.getByRole('heading', { name: 'Your Final Quote' })).toBeVisible();
        await expect(page.locator('text=Total Price')).toBeVisible();
    });
});
