import { test, expect } from '@playwright/test';

test.describe('Super Admin Journey (End-to-End)', () => {
    test.beforeEach(async ({ page }) => {
        // Log in as Super Admin
        await page.goto('/login');
        await page.fill('input[type="email"]', 'info@cryobyte.co.za');
        await page.fill('input[type="password"]', 'L0c@l@6m1n');
        await page.locator('button[type="submit"]').click();

        // Should redirect to Admin Dashboard
        await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
    });

    test('should view overview KPIs, manage services, users, bookings, and audit logs', async ({ page }) => {
        // 1. Overview KPIs
        await expect(page.locator('text=Total Services')).toBeVisible();
        await expect(page.locator('text=Total Bookings')).toBeVisible();
        await expect(page.locator('text=Completed Revenue')).toBeVisible();

        // 2. Services Management
        await page.locator('aside a[href="/admin/services"]').click();
        await expect(page).toHaveURL(/\/admin\/services/, { timeout: 10000 });
        await expect(page.getByRole('heading', { name: 'Services Management' })).toBeVisible();

        // 3. Super Admin User Management
        const usersLink = page.locator('aside a[href="/admin/users"]');
        await expect(usersLink).toBeVisible();
        await usersLink.click();
        await expect(page).toHaveURL(/\/admin\/users/, { timeout: 10000 });
        await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();

        // Filter by role
        const roleSelect = page.locator('select').first();
        await roleSelect.selectOption('staff');
        await expect(page.locator('table')).toBeVisible();

        // 4. Bookings Management & Export
        await page.locator('aside a[href="/admin/bookings"]').click();
        await expect(page).toHaveURL(/\/admin\/bookings/, { timeout: 10000 });
        await expect(page.getByRole('heading', { name: 'Bookings' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Export CSV' })).toBeVisible();

        // 5. System Audit Log
        await page.locator('aside a[href="/admin/audit"]').click();
        await expect(page).toHaveURL(/\/admin\/audit/, { timeout: 10000 });
        await expect(page.getByRole('heading', { name: 'Audit Log' })).toBeVisible();

        // 6. Admin Guide
        await page.locator('aside a[href="/admin/guide"]').click();
        await expect(page).toHaveURL(/\/admin\/guide/, { timeout: 10000 });
        await expect(page.getByRole('heading', { name: 'Admin How-To Guide' })).toBeVisible();
    });
});
