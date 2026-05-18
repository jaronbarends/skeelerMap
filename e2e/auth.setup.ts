import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto('/inloggen');
  await page
    .getByRole('textbox', { name: 'E-mailadres' })
    .fill(process.env.PLAYWRIGHT_TEST_USER_EMAIL!);
  await page
    .getByRole('textbox', { name: 'Wachtwoord' })
    .fill(process.env.PLAYWRIGHT_TEST_USER_PASSWORD!);
  await page.getByRole('button', { name: 'Inloggen' }).click();
  await page.screenshot({ path: 'playwright/.auth/debug.png' });
  await page.waitForURL('/');

  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});
