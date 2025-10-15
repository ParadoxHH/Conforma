import { expect, test, Page } from '@playwright/test';

test.describe('Conforma marketing surfaces', () => {
  const ensureServer = async (page: Page) => {
    try {
      await page.goto('/contractors', { waitUntil: 'domcontentloaded' });
    } catch (error) {
      test.skip(true, 'Frontend dev server must be running');
    }
  };

  test('contractor search page renders filters', async ({ page }) => {
    await ensureServer(page);
    await expect(page.getByText('Find verified Texas contractors')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Apply filters' })).toBeVisible();
  });

  test('invite acceptance screen loads', async ({ page }) => {
    await ensureServer(page);
    await page.goto('/invitations/example-token', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Conforma invitation')).toBeVisible();
  });
});
