import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

export const THEMES = [
  { name: 'light', settings: { theme: 'light' } },
  { name: 'dark', settings: { theme: 'dark' } },
  { name: 'night', settings: { theme: 'night' } },
  { name: 'high-contrast', settings: { theme: 'light', highContrast: true } },
] as const;

/** Start the app with the given stored settings. */
export async function openWith(page: Page, settings: Record<string, unknown>) {
  await page.addInitScript((s) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('odu-practice:settings', JSON.stringify(s));
      sessionStorage.setItem('seeded', '1');
    }
  }, settings);
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

/** WCAG 2.2 AA scan; fails with a readable list of violations. */
export async function expectNoA11yViolations(page: Page, label: string) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const summary = results.violations.map(
    (v) =>
      `${v.id} (${v.impact}): ${v.help}\n    ${v.nodes
        .map((n) => n.target.join(' '))
        .slice(0, 5)
        .join('\n    ')}`,
  );
  expect(summary, `axe violations on ${label}`).toEqual([]);
}

/** Answer the current Read-mode sign using the keyboard. */
export async function answerWithKey(page: Page, key: string) {
  await page.keyboard.press(key);
  // Wait for feedback to clear and the next sign to appear.
  await expect(page.locator('[data-testid=feedback][data-kind]')).toHaveCount(0, { timeout: 3000 });
}

/** Start a round from Home with the big Read or Build button. */
export async function startRound(page: Page, direction: 'Read' | 'Build') {
  await page.getByRole('button', { name: direction, exact: true }).click();
}

/** Go to a screen from the main navigation (tab bar on phones, sidebar on wide screens). */
export async function goTo(page: Page, tab: 'Practice' | 'Odù reference' | 'Progress' | 'Settings') {
  await page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('button', { name: tab, exact: true })
    .click();
}

/** Pick a theme from the compact theme menu. */
export async function chooseTheme(page: Page, label: 'Auto' | 'Light' | 'Dark' | 'Night') {
  await page.getByRole('button', { name: 'Theme', exact: true }).click();
  await page.getByRole('radio', { name: label, exact: true }).check();
}

/** Show the round settings: an Edit sheet on phones, already inline on wide screens. */
export async function openRoundSettings(page: Page) {
  const edit = page.getByRole('button', { name: 'Edit round settings' });
  if (await edit.isVisible()) {
    await edit.click();
    await expect(page.getByRole('dialog', { name: 'Round settings' })).toBeVisible();
  }
}
