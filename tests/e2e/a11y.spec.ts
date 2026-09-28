import { expect, test } from '@playwright/test';
import { THEMES, answerWithKey, expectNoA11yViolations, openWith } from './helpers';

for (const theme of THEMES) {
  test.describe(`WCAG 2.2 AA — ${theme.name}`, () => {
    test('Setup, Odù reference, study card and Help', async ({ page }) => {
      await openWith(page, theme.settings);
      await expectNoA11yViolations(page, `setup (${theme.name})`);

      await page.getByRole('button', { name: 'How to read a sign' }).first().click();
      await expect(page.getByRole('heading', { level: 1, name: 'How to read a sign' })).toBeVisible();
      await expectNoA11yViolations(page, `help (${theme.name})`);
      await page.getByRole('button', { name: 'Back to setup' }).click();

      await page.getByRole('button', { name: 'Odù reference' }).click();
      await expect(page.getByRole('heading', { level: 1, name: 'Odù reference' })).toBeVisible();
      await expectNoA11yViolations(page, `reference 16 (${theme.name})`);
      await page.getByText('All 256').click();
      await expectNoA11yViolations(page, `reference 256 (${theme.name})`);

      await page.getByRole('button', { name: /Study Ọ̀sá Ìrẹtẹ̀/ }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByText('Study notes for this Odù haven’t been added yet.')).toBeVisible();
      await expectNoA11yViolations(page, `study card (${theme.name})`);
      await page.getByRole('button', { name: 'Close', exact: true }).click();

      await page.getByRole('button', { name: 'Accessibility' }).click();
      await expectNoA11yViolations(page, `accessibility settings (${theme.name})`);
    });

    test('Play (opẹ̀lẹ̀), Results, Progress', async ({ page }) => {
      await openWith(page, {
        ...theme.settings,
        timing: 'untimed',
        mode: 'opele',
        direction: 'read',
        set: 'all',
      });
      await page.getByRole('button', { name: 'Begin' }).click();
      await expect(page.getByRole('heading', { level: 1, name: /Read the sign/ })).toBeVisible();
      await expect(page.getByRole('img', { name: /^Opẹ̀lẹ̀\. Right leg, top to bottom:/ })).toBeVisible();
      await expectNoA11yViolations(page, `play (${theme.name})`);

      for (const key of ['1', 'B', '3']) await answerWithKey(page, key);
      await page.getByRole('button', { name: 'End round' }).click();
      await expect(page.getByRole('heading', { level: 1, name: 'Round complete' })).toBeVisible();
      await expect(page.locator('.big-score', { hasText: /correct of 3/ })).toBeVisible();
      await expectNoA11yViolations(page, `results (${theme.name})`);

      await page.getByRole('button', { name: 'View progress' }).click();
      await expect(page.getByRole('heading', { level: 1, name: 'Your progress' })).toBeVisible();
      await expectNoA11yViolations(page, `progress (${theme.name})`);
    });

    test('Build (ọpọ́n Ifá)', async ({ page }) => {
      await openWith(page, {
        ...theme.settings,
        timing: 'untimed',
        mode: 'opon',
        direction: 'build',
        set: 'all',
      });
      await page.getByRole('button', { name: 'Begin' }).click();
      await expect(page.getByRole('heading', { level: 1, name: /Build the sign/ })).toBeVisible();
      await page.getByRole('button', { name: 'Right leg, mark 1 of 4: empty' }).click();
      await expectNoA11yViolations(page, `build (${theme.name})`);
    });
  });
}
