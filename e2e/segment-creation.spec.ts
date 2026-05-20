import { test, expect } from '@playwright/test';

import { deleteTestUserSegments } from './helpers/cleanup';

test('full segment creation flow', async ({ page }) => {
  // page.on('console', (msg) => console.log('browser:', msg.text()));
  await page.goto('/');
  await page.getByRole('button', { name: 'Segment toevoegen' }).click();
  const panel = page.getByTestId('segment-creation-panel');
  await expect(panel).toBeVisible();
  await page.locator('.leaflet-container').waitFor();
  await expect(page.getByTestId('segments-loading-indicator')).not.toBeVisible({ timeout: 10000 });
  const initialSegmentCount = await page.locator('.leaflet-overlay-pane path').count();
  await page.getByTestId('map-container').click({ position: { x: 100, y: 100 } });
  // check control point 1
  await expect(page.locator('.leaflet-overlay-pane path')).toHaveCount(initialSegmentCount + 1);
  await page.getByTestId('map-container').click({ position: { x: 400, y: 400 } });
  // check control point 2
  await expect(page.locator('.leaflet-overlay-pane path')).toHaveCount(initialSegmentCount + 2);
  // check segment
  await expect(page.locator('.leaflet-overlay-pane path')).toHaveCount(initialSegmentCount + 3, {
    timeout: 10000,
  });
  await expect(page.getByTestId('rating-buttons')).toBeVisible();
  await page
    .getByTestId('rating-buttons')
    .getByRole('button', { name: /kansloos/i })
    .click();
  // checking pending text is also necessary to prevent the test's browser tearing down before the segment's save is complete - that would abort the request
  await expect(page.getByTestId('save-segment-pending-text')).toBeVisible();
  await expect(page.getByTestId('save-segment-pending-text')).not.toBeVisible();
  // check panel is closed - if saving the segment fails, it remains open
  await expect(page.getByTestId('segment-creation-panel')).not.toBeVisible();
});

test.afterEach(async () => {
  await deleteTestUserSegments();
});
