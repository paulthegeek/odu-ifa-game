import { expect, test } from '@playwright/test';
import { answerWithKey, chooseTheme, goTo, openWith, startRound } from './helpers';

test('Read: keyboard answers score and appear in results', async ({ page }) => {
  await openWith(page, { theme: 'light', timing: 'untimed', set: 'meji' });
  await startRound(page, 'Read');
  const answers = page.getByRole('list', { name: 'Choose the Odù' }).getByRole('button');
  await expect(answers).toHaveCount(4);
  await answerWithKey(page, '1');
  await answerWithKey(page, 'D');
  await expect(page.getByTestId('score')).toContainText('2 answered');
  await page.getByRole('button', { name: 'End round' }).click();
  await expect(page.getByTestId('final-score').filter({ hasText: /correct of 2/ })).toBeVisible();
  await expect(page.getByText('Untimed practice — not counted toward personal bests.')).toBeVisible();
});

test('Timed round shows a countdown', async ({ page }) => {
  await openWith(page, { theme: 'light', timing: 'standard', length: 60 });
  await startRound(page, 'Read');
  await expect(page.getByRole('timer')).toHaveAccessibleName(/Time left: (0|1) minutes/);
});

test('Build: positions start empty, Check needs all 8, keyboard works', async ({ page }) => {
  await openWith(page, { theme: 'light', timing: 'untimed', mode: 'opon', direction: 'build', set: 'all' });
  await startRound(page, 'Build');
  const check = page.getByRole('button', { name: 'Check' });
  await expect(check).toBeDisabled();
  await expect(page.getByRole('button', { name: /: empty$/ })).toHaveCount(8);

  const first = page.getByRole('button', { name: 'Right leg, mark 1 of 4: empty' });
  await first.focus();
  // Fill the right leg with 1s, move left, fill the left leg with 2s.
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('1');
    if (i < 3) await page.keyboard.press('ArrowDown');
  }
  await page.keyboard.press('ArrowLeft');
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('2');
    if (i < 3) await page.keyboard.press('ArrowUp');
  }
  await expect(page.getByRole('button', { name: 'Right leg, mark 2 of 4: single' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Left leg, mark 3 of 4: double' })).toBeVisible();
  await expect(check).toBeEnabled();

  // Space cycles; Backspace clears.
  await page.keyboard.press('Backspace');
  await expect(check).toBeDisabled();
  await page.keyboard.press('Space');
  await expect(check).toBeEnabled();

  await page.keyboard.press('Enter');
  await expect(page.getByTestId('score')).toContainText('1 answered');
  await page.getByRole('button', { name: 'End round' }).click();
  await expect(page.getByTestId('final-score').filter({ hasText: /correct of 1/ })).toBeVisible();
});

test('Build: Méjì mirror legs fills the other leg', async ({ page }) => {
  await openWith(page, {
    theme: 'light',
    timing: 'untimed',
    mode: 'opele',
    direction: 'build',
    set: 'meji',
    mirrorLegs: true,
  });
  await startRound(page, 'Build');
  await page.getByRole('button', { name: 'Right leg, mark 1 of 4: empty' }).click();
  await expect(page.getByRole('button', { name: 'Left leg, mark 1 of 4: single, open seed' })).toBeVisible();
});

test('Diacritics option changes display only', async ({ page }) => {
  await openWith(page, { theme: 'light', showDiacritics: false });
  await goTo(page, 'Odù reference');
  await expect(page.getByText('Ose Meji', { exact: true })).toBeVisible();
  await expect(page.getByText('Eji Ogbe', { exact: true })).toBeVisible();
});

test('Theme loads before first paint and the toggle switches it', async ({ page }) => {
  await openWith(page, { theme: 'night' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
  await chooseTheme(page, 'Dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('Weak set is disabled until 20 answers, with an explanation', async ({ page }) => {
  await openWith(page, { theme: 'light' });
  await expect(page.getByRole('radio', { name: /weak Odù/i })).toBeDisabled();
  await expect(page.getByText('After 20 answers')).toBeVisible();
});

test('No horizontal scrolling', async ({ page }) => {
  await openWith(page, { theme: 'light', timing: 'untimed', set: 'all' });
  const measure = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  for (const nav of ['Odù reference', 'Progress', 'Settings', 'Practice'] as const) {
    await goTo(page, nav);
    expect(await measure(), nav).toBeLessThanOrEqual(0);
  }
  await startRound(page, 'Read');
  expect(await measure(), 'round').toBeLessThanOrEqual(0);
});

test('Round length: on Practice for wide screens, in Settings for phones', async ({ page, isMobile }) => {
  await openWith(page, { theme: 'light', timing: 'standard', length: 60 });
  const start = page.getByRole('button', { name: 'Start round', exact: true });
  await expect(start).toHaveAccessibleDescription(/1 minute$/);
  await expect(page.getByRole('group', { name: 'Round length' })).toHaveCount(isMobile ? 0 : 1);

  await goTo(page, 'Settings');
  await page.getByRole('radio', { name: '2 minutes' }).check();
  await page.getByRole('radio', { name: /^Extended time/ }).check();
  await expect(page.getByRole('radio', { name: '4 minutes' })).toBeChecked();

  await goTo(page, 'Practice');
  await expect(start).toHaveAccessibleDescription(/4 minutes$/);
});
