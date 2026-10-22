# Odù Game

A study aid for learning to recognize Odù Ifá signs quickly and accurately, on the **opẹ̀lẹ̀** and the **ọpọ́n Ifá**.

- **Read the sign**: see a sign and choose its name.
- **Build the sign**: see a name and build its sign.
- **Study cards** show approved ẹsẹ Ifá and meanings.
- **Progress tracking** stays on your device, and a practice set targets the Odù you miss most.

Names, ordering and reading direction follow traditional Yoruba (Nigerian) conventions. The right leg is read first.

## Run locally

Requires Node 24 or later and [pnpm](https://pnpm.io). The pnpm version is pinned in `package.json`. Run `corepack enable pnpm` once to use it.

```sh
pnpm install
pnpm dev           # http://localhost:5173/
```

## Tests and checks

```sh
pnpm test          # unit tests (Vitest)
pnpm lint          # ESLint
pnpm typecheck     # TypeScript
pnpm format        # Prettier
pnpm size          # bundle size budget (run after a build)

pnpm exec playwright install chromium   # once
pnpm test:e2e                           # end-to-end + axe WCAG 2.2 AA checks, every theme, desktop and phone
```

Every pull request runs these in [`.github/workflows/ci.yml`](.github/workflows/ci.yml): the `checks` job (format, lint, type-check, unit tests, build, size budget) and the `e2e` job. Both must pass before a PR can merge into `main`.

The size budgets are in [`.size-limit.json`](.size-limit.json). JavaScript and CSS are measured gzipped, as GitHub Pages serves them. If a change goes over on purpose, raise the limit in the same PR and say why.

PRs also get a Lighthouse check ([`.github/workflows/lighthouse.yml`](.github/workflows/lighthouse.yml)). It audits the built site three times on mobile settings and reports the median scores in the run summary. Accessibility must stay at 100 and best practices at 90 or more. Performance and SEO below 90 only warn. The thresholds are in [`lighthouserc.json`](lighthouserc.json). The check is advisory: it can fail without blocking the merge or the deploy. To run it locally after a build: `npx @lhci/cli@0.15.1 autorun`.

Dependabot ([`.github/dependabot.yml`](.github/dependabot.yml)) opens PRs every Monday. Minor and patch updates come grouped in one PR, and each major update gets its own PR. It doesn't update the Wrangler and Lighthouse CI versions pinned in the workflows, or pnpm itself.

## Editing the Odù data and aliases

All Odù data is in [`src/data/odu.ts`](src/data/odu.ts):

- `PRINCIPAL_ODU` lists the 16 principal Odù in order of seniority. Each has an `id`, a `name` with full diacritics and a `pattern` read top to bottom (`1` = single mark I, `2` = double mark II). The 256 are generated from these in `src/logic/odu.ts`.
- `ODU_ALIASES` holds traditional alternate names, keyed by full Odù id `<right>_<left>` (e.g. `ogbe_ogunda`). **Only add aliases that have been verified.** One suggested alias is commented out and waiting for review.
- **Never change an existing `id`.** Saved progress refers to Odù by id.
- Names are composed in one function (`composeName` in `src/logic/odu.ts`):
  - Ogbè on both legs is **Èjì Ogbè**.
  - Any other principal Odù on both legs is **[Odù] Méjì**.
  - Different legs are named right leg, then left leg.

Other settings are in [`src/data/config.ts`](src/data/config.ts). These include:

- the opẹ̀lẹ̀ open/closed → single/double mapping (lineages differ)
- round lengths and extended-time multiplier
- the weak-Odù thresholds and weighting.

## Adding ẹsẹ Ifá and meanings

Study content is in [`src/data/ese.ts`](src/data/ese.ts), separate from the Odù data.

> Every word in this file must come from the project owner or an approved source. Never generate, paraphrase or "fill in" ẹsẹ, translations or meanings.

1. Find the entry for the Odù. Entries for the 16 Méjì are already there. For an Ọmọ Odù, add a new entry with its id (`<right>_<left>`, e.g. `osa_irete`).
2. Fill in `meaning`, a short English summary.
3. Add one or more `snippets`. Each snippet needs:
   - `yoruba`: full orthography, NFC-normalized
   - `english`: the translation
   - `source`: e.g. `"Book title, p. 42"` or `"from [teacher/house], oral teaching"`
4. Set `reviewed: true` once the entry has been checked. **Entries with `reviewed: false` are never shown.** Odù without reviewed content show only their name and sign.

```ts
{
  oduId: 'osa_irete',
  meaning: '…',
  snippets: [{ yoruba: '…', english: '…', source: '…' }],
  reviewed: true,
},
```

## Deploying (GitHub Pages)

1. In the repository settings, set **Pages → Source** to **GitHub Actions**.
2. Merge a pull request into `main`. [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) then:
   1. runs the same checks and e2e tests as CI (the deploy stops if any fail)
   2. builds the site
   3. publishes it to [odugame.com](https://odugame.com)
   4. tags that commit and creates a [GitHub release](https://github.com/paulthegeek/odu-ifa-game/releases) listing the merged PRs. Tags are dated in UTC, numbered from 1 each day: `v2026.10.22-1`, `v2026.10.22-2`, …

### Rolling back

To put an earlier version back on odugame.com:

1. Open **Actions → Deploy to GitHub Pages → Run workflow**.
2. Leave the branch as `main`, enter the release tag (for example `v2026.10.22-1`) and run it.

This deploys that tag without running the checks again, because it passed them when it was released. Then fix the problem in a PR. Merging it deploys `main` again as a new release. Leaving the tag empty redeploys the current `main`.

The custom domain is set in the repository settings under **Pages → Custom domain**, not in a `CNAME` file (GitHub ignores that file when deploying with Actions). The domain's DNS points at GitHub Pages.

The base path is set in one place: `BASE` in [`vite.config.ts`](vite.config.ts). It is `'/'` because the site is served from the root of the domain. Without a custom domain, set it to `'/odu-ifa-game/'`.

The PWA manifest and service worker use the same value, so the app installs and works offline under either path.

To regenerate the PNG app icons from `public/favicon.svg`, run `pnpm icons`.

The fonts in `src/assets/fonts/` are cut down so slow connections download as little as possible. To regenerate them, run `pnpm fonts` (it needs fonttools: `pip install fonttools brotli`). If you add text with a Latin letter outside the current set (for example ń), add it to `YO_EXT` in [`scripts/build-fonts.mjs`](scripts/build-fonts.mjs) and to the matching `unicode-range` in [`src/styles/fonts.css`](src/styles/fonts.css) first.

## PR previews (Cloudflare)

Every pull request gets its own preview of the site, so changes can be tried on a phone before merging. [`.github/workflows/preview.yml`](.github/workflows/preview.yml) builds the PR and deploys it as a [Cloudflare Worker Preview](https://developers.cloudflare.com/workers/previews/), and comments the URL on the PR. The URL stays the same on later pushes. The preview is deleted when the PR is closed or merged.

- **Setup:** the `odu-game` Worker is configured in [`wrangler.jsonc`](wrangler.jsonc). Previews need two repository secrets, `CLOUDFLARE_API_TOKEN` (from the **Edit Cloudflare Workers** token template) and `CLOUDFLARE_ACCOUNT_ID`.
- **Wrangler:** it runs with `npx` at the version in `WRANGLER_VERSION` in the workflow, so it is not a project dependency. Update that version there.
- **Analytics and search:** previews are public to anyone with the link. They don't count in analytics (Umami only runs on odugame.com), and search engines are told not to index them.
- **Not run for forks or Dependabot:** those PRs don't get the Cloudflare secrets.
- **Not a required check:** if a preview fails, the PR can still merge.

To remove a preview by hand, run `npx wrangler preview delete --name pr-<number>` or delete it under **Workers & Pages → odu-game → Previews** in the Cloudflare dashboard.

## Project layout

```
src/data/        Odù data, study content, configuration (editable)
src/logic/       naming, distractors, rounds, build checking, progress, storage (pure, unit-tested)
src/components/  sign drawings (SVG), answer choices, study card, charts; ui.ts holds shared class recipes
src/lib/         cn() for joining Tailwind classes
src/screens/     Home, Play, Build, Results, Progress, Odù reference, Help, Settings
src/styles/      Tailwind entry (app.css) and theme tokens (Light, Dark, Night, High-contrast)
tests/unit/      Vitest
tests/e2e/       Playwright + axe
```

### Styling

Components are styled with [Tailwind CSS](https://tailwindcss.com) v4 utility classes. Colors are CSS variables in `src/styles/themes.css`, exposed to Tailwind as `bg-surface`, `text-muted`, `border-border` and so on, so every theme works without `dark:` variants. Use `@wide/app:` for layouts that depend on the width of the main column, and `large:`, `roomy:` and `hc:` for the large-text, spacing and high-contrast settings. The SVG parts of the sign drawings and charts keep named classes in `app.css`.

Progress is stored in IndexedDB and settings in localStorage. Your progress never leaves the device unless you export it from the Progress screen.
