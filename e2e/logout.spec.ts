import { test, expect } from '@playwright/test';

import { TOAST_MESSAGES } from '@/lib/toastMessages';

test('successful logout shows confirmation and updates header', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /uitloggen/i }).click();
  await expect(page.getByRole('button', { name: /uitloggen/i })).not.toBeVisible();
  await expect(page.getByRole('link', { name: /inloggen/i })).toBeVisible();
  await expect(page.getByTestId('toast')).toBeVisible();
  await expect(page.getByTestId('toast')).toContainText(TOAST_MESSAGES.loggedOut.message);
  await expect(page.getByTestId('toast')).not.toBeVisible();
});
