import { test, expect } from '@playwright/test';

test('shows segment creation panel when logged-in user clicks add segment button', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Segment toevoegen' }).click();
  const panel = page.getByTestId('segment-creation-panel');
  await expect(panel).toBeVisible();
});
