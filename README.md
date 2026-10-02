# Odù Practice

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
pnpm dev           # http://localhost:5173/odu-ifa-game/
```

## Tests and checks

```sh
pnpm test          # unit tests (Vitest)
pnpm lint          # ESLint
pnpm typecheck     # TypeScript
pnpm format        # Prettier

pnpm exec playwright install chromium   # once
pnpm test:e2e                           # end-to-end + axe WCAG 2.2 AA checks, every theme, desktop and phone
```

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
4. Set `reviewed: true` once the entry has been checked. **Entries with `reviewed: false` are never shown.** Odù without reviewed content show "Study notes for this Odù haven't been added yet."

```ts
{
  oduId: 'osa_irete',
  meaning: '…',
  snippets: [{ yoruba: '…', english: '…', source: '…' }],
  reviewed: true,
},
```

The file also contains one example entry marked `PLACEHOLDER — replace before release`. It appears only in `pnpm dev` and is stripped from production builds.

## Deploying (GitHub Pages)

1. In the repository settings, set **Pages → Source** to **GitHub Actions**.
2. Push to `main`. [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) then:
   1. runs lint, type-check and unit tests (the deploy stops if any fail)
   2. builds the site
   3. publishes it to `https://<username>.github.io/odu-ifa-game/`

The base path is set in one place: `BASE` in [`vite.config.ts`](vite.config.ts). For a custom domain:

1. Set `BASE` to `'/'`.
2. Add a `CNAME` file to `public/`.

The PWA manifest and service worker use the same value, so the app installs and works offline under either path.

To regenerate the PNG app icons from `public/favicon.svg`, run `pnpm icons`.

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

Progress is stored in IndexedDB and settings in localStorage. Nothing leaves the device unless you export it from the Progress screen.
