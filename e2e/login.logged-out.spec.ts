import { test, expect } from '@playwright/test';

import { authFeedbackTranslations } from '@/lib/authFeedbackTranslations';
import { TOAST_MESSAGES } from '@/lib/toastMessages';

test('successful login redirects to home, shows confirmation and updates header', async ({
  page,
}) => {
  await page.goto('/inloggen');
  await page
    .getByRole('textbox', { name: /e-?mail/i })
    .fill(process.env.PLAYWRIGHT_TEST_USER_EMAIL!);
  await page
    .getByRole('textbox', { name: /wachtwoord/i })
    .fill(process.env.PLAYWRIGHT_TEST_USER_PASSWORD!);
  await page.getByRole('button', { name: 'Inloggen' }).click();
  await page.waitForURL('/?toast=loggedIn');
  await expect(page.getByRole('button', { name: /inloggen/i })).not.toBeVisible();
  await expect(page.getByRole('button', { name: /uitloggen/i })).toBeVisible();
  await expect(page.getByTestId('toast')).toBeVisible();
  await expect(page.getByTestId('toast')).toContainText(TOAST_MESSAGES.loggedIn.message);
  await page.waitForURL('/');
  await expect(page.getByTestId('toast')).not.toBeVisible();
});

test('failed login shows error when login fails', async ({ page }) => {
  await page.goto('/inloggen');
  await page.getByRole('textbox', { name: /e-?mail/i }).fill('wrong-email@domain.com');
  await page.getByRole('textbox', { name: /wachtwoord/i }).fill('wrong password');
  await page.getByRole('button', { name: 'Inloggen' }).click();
  if (!('message' in authFeedbackTranslations.invalid_credentials)) {
    throw new Error('invalid_credentials feedback does not have a message');
  }
  const expectedError = authFeedbackTranslations.invalid_credentials.message;
  await expect(page.getByTestId('form-feedback')).toContainText(expectedError);
});
