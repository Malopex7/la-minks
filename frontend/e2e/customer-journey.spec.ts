import { test, expect } from '@playwright/test';

test.describe('Customer Journey (End-to-End)', () => {
    test('should allow a new customer to get a quote, register, and view their dashboard', async ({ page }) => {
        const timestamp = Date.now();
        const testEmail = `cust_${timestamp}@laminks.test`;
        const testPassword = 'Password123!';

        // 1. Navigate to Quote Wizard
        await page.goto('/quote');
        await expect(page).toHaveURL(/\/quote/);

        // 2. Step 1: Select Service
        await expect(page.getByRole('heading', { name: 'What do you need cleaned?' })).toBeVisible({ timeout: 10000 });
        const serviceCard = page.locator('div.cursor-pointer').first();
        await expect(serviceCard).toBeVisible({ timeout: 10000 });
        await serviceCard.click();
        await page.locator('button', { hasText: 'Continue' }).click();

        // 3. Step 2: Service Details
        await expect(page.getByRole('heading', { name: 'Service Details' })).toBeVisible();
        await page.locator('button', { hasText: 'Continue' }).click();

        // 4. Step 3: Optional Extras
        await expect(page.getByRole('heading', { name: 'Select Extras' })).toBeVisible();
        await page.locator('button', { hasText: 'Continue' }).click();

        // 5. Step 4: Address
        await expect(page.getByRole('heading', { name: 'Property Address' })).toBeVisible();
        await page.fill('input[name="line1"]', '42 Rosebank Boulevard');
        await page.fill('input[name="suburb"]', 'Rosebank');
        await page.fill('input[name="city"]', 'Johannesburg');
        await page.fill('input[name="province"]', 'Gauteng');
        await page.fill('input[name="postalCode"]', '2196');
        await page.locator('button', { hasText: 'Continue' }).click();

        // 6. Step 5: Schedule
        await expect(page.getByRole('heading', { name: 'When do you need us?' })).toBeVisible();
        await page.locator('button', { hasText: 'Pick a date' }).click();

        const activeDays = page.locator('[data-slot="calendar"] button:not([disabled])');
        await expect(activeDays.first()).toBeVisible({ timeout: 5000 });
        await activeDays.last().click();

        const timeCombo = page.locator('button[role="combobox"]');
        await expect(timeCombo).toBeEnabled({ timeout: 5000 });
        await timeCombo.click();
        await page.getByRole('option').first().click();

        await page.locator('button', { hasText: 'Review Quote' }).click();

        // 7. Step 6: Review Quote
        await expect(page.getByRole('heading', { name: 'Your Final Quote' })).toBeVisible();
        await expect(page.locator('text=Total Price')).toBeVisible();

        // 8. Register new account
        await page.goto('/register');
        await page.fill('input[name="firstName"]', 'Jane');
        await page.fill('input[name="lastName"]', 'Doe');
        await page.fill('input[name="email"]', testEmail);
        await page.fill('input[name="password"]', testPassword);
        await page.locator('button[type="submit"]').click();

        // Expect check your email confirmation
        await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible({ timeout: 5000 });

        // 9. Login with pre-verified customer account
        await page.goto('/login');
        await page.fill('input[type="email"]', 'customer@laminks.co.za');
        await page.fill('input[type="password"]', 'L0c@l@6m1n');
        await page.locator('button[type="submit"]').click();

        // 10. Customer Dashboard Verification
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
        await expect(page.getByRole('heading', { name: /Dashboard|My Bookings/i }).first()).toBeVisible();
    });
});
