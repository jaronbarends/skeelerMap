import { test, expect } from '@playwright/test';

test('shows login prompt when logged-out user clicks add segment button', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Segment toevoegen' }).click();
  const panel = page.getByTestId('login-required-panel');
  await expect(panel).toBeVisible();
});
