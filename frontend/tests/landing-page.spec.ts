import { test, expect } from '@playwright/test';

test('landing page has main heading', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Conforma/);

  // Expect the main heading to be visible.
  await expect(page.getByRole('heading', { name: 'Secure Your Home Project with Confidence' })).toBeVisible();
});

test('navigation links work', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'How It Works' }).click();
    await expect(page).toHaveURL('/how-it-works');

    await page.getByRole('link', { name: 'For Homeowners' }).click();
    await expect(page).toHaveURL('/homeowners');

    await page.getByRole('link', { name: 'For Contractors' }).click();
    await expect(page).toHaveURL('/contractors');
});
