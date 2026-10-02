# Build Prompt: Odù Practice Game

## Role and goal

You are building a web-based practice game that helps Ifá practitioners learn to recognize Odù signs quickly and accurately. The player sees a sign — cast on an **opẹ̀lẹ̀** or marked on an **ọpọ́n Ifá** — and chooses the correct Odù name before time runs out. In **Build the sign** mode it works in reverse: the player sees a name and builds its sign. The game also shows ẹsẹ Ifá and meanings for study, and it tracks progress over time so players can see and drill their weakest Odù. Treat the subject with respect: this is a study aid for a sacred system of knowledge, not a novelty quiz. Keep the tone calm and focused, with no jokey copy, cartoon mascots, or "game show" styling.

Follow traditional Yoruba (Nigerian) conventions for names, ordering, and reading direction.

---

## Spelling and language

All Yoruba words follow standard Yoruba orthography as used in Ìṣẹ̀ṣẹ (traditional Yoruba religion):

- Use the full set of tone marks (à, á) and underdots (ẹ, ọ, ṣ) exactly as written in this prompt. Don't simplify, re-spell, or "correct" them.
- Don't use Lucumí, Spanish, or Portuguese spellings (for example "Meyi", "Oshe", "Oyekun", "Baba Ejiogbe", "Otura Niko"). Write ṣ, not "sh"; write Méjì, not "Meyi".
- The spellings in this prompt are the source of truth. If a spelling isn't given here, leave a clearly marked placeholder for review rather than guessing.
- The "diacritics off" display option only removes the marks on screen (e.g. Ọ̀sẹ́ → Ose). It never changes the stored names, and it's off by default.
- Put Yoruba text in `lang="yo"` elements, and make sure the font renders combined marks (such as ẹ̀ and ọ́) correctly.

## Core data

### The 16 Ojú Odù (in traditional Nigerian order of seniority)

Each principal Odù is a column of four marks, read top to bottom. `I` = single mark, `II` = double mark.

| # | Odù | Pattern (top → bottom) |
|---|-----|------------------------|
| 1 | Ogbè | I · I · I · I |
| 2 | Ọ̀yẹ̀kú | II · II · II · II |
| 3 | Ìwòrì | II · I · I · II |
| 4 | Òdí | I · II · II · I |
| 5 | Ìrosùn | I · I · II · II |
| 6 | Ọ̀wọ́nrín | II · II · I · I |
| 7 | Ọ̀bàrà | I · II · II · II |
| 8 | Ọ̀kànràn | II · II · II · I |
| 9 | Ògúndá | I · I · I · II |
| 10 | Ọ̀sá | II · I · I · I |
| 11 | Ìká | II · I · II · II |
| 12 | Òtúrúpọ̀n (also written Òtúúrúpọ̀n) | II · II · I · II |
| 13 | Òtúrá (also written Òtúá) | I · II · I · I |
| 14 | Ìrẹtẹ̀ | I · I · II · I |
| 15 | Ọ̀sẹ́ | I · II · I · II |
| 16 | Òfún | II · I · II · I |

### The 256 Odù

- A full sign has two legs: the **right leg** (read first) and the **left leg**.
- **Naming rule for the 16 principal Odù (same Odù on both legs):** the name changes. It is **not** written as the leg name twice (never "Ogbè Ogbè" or "Òtúrá Òtúrá").
  - Ogbè on both legs → **Èjì Ogbè** (the only exception to the Méjì pattern)
  - Every other principal Odù → *[Odù] **Méjì***, e.g. Òtúrá on both legs → **Òtúrá Méjì**, Ọ̀yẹ̀kú on both legs → **Ọ̀yẹ̀kú Méjì**
  - The 16 principal names are: Èjì Ogbè, Ọ̀yẹ̀kú Méjì, Ìwòrì Méjì, Òdí Méjì, Ìrosùn Méjì, Ọ̀wọ́nrín Méjì, Ọ̀bàrà Méjì, Ọ̀kànràn Méjì, Ògúndá Méjì, Ọ̀sá Méjì, Ìká Méjì, Òtúrúpọ̀n Méjì, Òtúrá Méjì, Ìrẹtẹ̀ Méjì, Ọ̀sẹ́ Méjì, Òfún Méjì.
  - Implement this in one naming function used everywhere names appear (answer choices, results, screen-reader text), so the rule can't be missed in one place.
  - Store "Ogbè Méjì" as an alias of Èjì Ogbè for search and future use, but always display Èjì Ogbè.
- When the legs differ, it is an **Ọmọ Odù**, named right leg + left leg by default (e.g. right Ọ̀sá, left Ìrẹtẹ̀ → **Ọ̀sá Ìrẹtẹ̀**).
- Many Ọmọ Odù also have traditional alternate names (e.g. Ogbè Ògúndá is also called Ogbè Yọ̀nú). Store these in an `aliases` field in the data file. **Do not invent aliases.** Leave the field empty unless a name is supplied and verified; I will review and fill it in.
- Keep all Odù data in one clearly structured, editable data file or object (id, name, name without diacritics, right leg, left leg, aliases) so it can be corrected without touching game logic.

---

## Modes

### 1. Opẹ̀lẹ̀ Mode

Show an opẹ̀lẹ̀ as cast in front of the diviner: two parallel strands of four seeds or half-pods each, joined at the top.

- Each seed lands either **open** (concave/inner side up) or **closed** (convex/outer side up).
- Default mapping: open = single mark (`I`), closed = double mark (`II`). Put this mapping in one config setting, since lineages can differ.
- Draw it from the diviner's point of view. The **right leg is on the player's right** and is read first.
- The two seed states must look clearly different in shape and shading, not only in color.
- Optional toggle: "Show marks" overlays the `I` / `II` value beside each seed, for beginners.

### 2. Ọpọ́n Ifá Mode

Show an ọpọ́n Ifá (divination tray) with the sign marked in ìyẹ̀rọ̀sùn (the yellow divining powder).

- Single mark = one vertical stroke; double mark = two parallel vertical strokes.
- Right column (right leg) on the player's right, left column on the left, each read top to bottom.
- Draw the tray as a simple, recognizable round or rectangular board with a carved-border feel. The marks must be high-contrast and easy to read against the powder.
- Optional: a subtle Èṣù face at the top of the tray border (the traditional orientation marker), drawn in a simple, respectful style.

---

## Game setup screen

Before each round the player chooses:

1. **Mode:** Opẹ̀lẹ̀ or Ọpọ́n Ifá
2. **Direction:**
   - **Read the sign** (default): see a sign, choose its name
   - **Build the sign**: see a name, build its sign (see "Reverse mode" below)
3. **Odù set:**
   - 16 Méjì only (beginner)
   - All 256 (Méjì + Ọmọ Odù)
   - My weak Odù (only enabled once there's enough progress data; see "Progress tracking")
4. **Round length:** 1 minute or 2 minutes
5. **Display options** (remembered between sessions): diacritics on/off, "show marks" helper on/off

Show a short "How to read this sign" help panel (reading order, right leg first, single vs. double marks), reachable from the setup screen and the results screen.

---

## Game loop

1. The timer starts when the first sign appears. Show a clear countdown.
2. Show one sign at a time, randomly chosen from the selected set, and avoid repeating a sign within the same round when possible.
3. Offer **4 multiple-choice answers**: the correct Odù plus 3 plausible distractors.
   - For the 256 set, prefer distractors that share one leg with the answer or that swap the legs (e.g. Ọ̀sá Ìrẹtẹ̀ vs. Ìrẹtẹ̀ Ọ̀sá), so the player has to read both legs.
   - For the 16 Méjì set, prefer distractors whose patterns differ by one mark.
4. **Correct answer:** +1 point, a brief positive confirmation (under 400 ms), then the next sign.
5. **Wrong answer:** no point, a brief neutral indication, then the next sign. Record the miss.
6. No penalty other than losing that point. There is no skip button; answering wrong is the only way past a sign.
7. When time runs out, finish the current sign without scoring it and go to Results.

Keyboard: keys `1`–`4` (or `A`–`D`) choose answers. Touch targets are at least 44×44 px.

---

## Reverse mode: Build the sign

The player sees an Odù name (e.g. **Ọ̀sá Ìrẹtẹ̀**) and builds its sign on an empty opẹ̀lẹ̀ or ọpọ́n, in whichever mode was chosen.

- Show 8 positions: 4 on the right leg and 4 on the left, laid out exactly as in the reading modes (right leg on the player's right).
- Every position starts **empty**, so the starting state gives no hint. Tapping or clicking a position cycles it: empty → single (`I`) → double (`II`) → empty. In Opẹ̀lẹ̀ mode that is empty → open seed → closed seed.
- Provide a **Check** button that is enabled once all 8 positions are filled, and a **Clear** button.
- Scoring follows the same game loop: correct = +1 and go to the next name; wrong = no point, record the miss, and go to the next name. The timer, round lengths, and Odù sets are the same as in reading.
- For the 16 Méjì set, the player can build one leg and the game mirrors it to the other leg (the "Mirror legs" option, on by default for Méjì only).
- **Keyboard:** arrow keys move between positions; `Space` cycles the focused position; `1` sets single and `2` sets double; `Enter` checks; `Backspace` clears the focused position.
- **Screen reader:** each position is a button with a label such as *"Right leg, mark 2 of 4: double"*. Announce the new value when it changes.
- **Results:** for each miss, show the target sign next to the sign the player built. Mark the wrong positions with an outline and an icon, not color alone, and describe them in text (e.g. *"Left leg, mark 3: you placed single, correct is double"*).
- Keep personal bests separate for Read and Build.

---

## Results screen

- Final score and number of signs attempted (e.g. "18 correct of 23").
- **Missed Odù list:** for each miss, show:
  - the sign as it appeared (small version of the opẹ̀lẹ̀ / ọpọ́n drawing, plus a text version such as `I I I II | II I I I`)
  - the correct name
  - the answer the player chose
- **Ẹsẹ Ifá and meanings:** each missed Odù in the list can be expanded to show its study card (see below). Also offer a **Study** link for every Odù seen in the round, not only the misses.
- Buttons: **Play again** (same settings), **Practice my misses** (a short untimed round using only the missed signs), **View progress**, **Change settings**.
- Keep a personal best score for each mode + direction + set + length combination, saved on the device.

---

## Ẹsẹ Ifá and meanings

Each Odù can have a **study card** shown from the results screen, the progress screen, and an **Odù reference** screen that lists all 16 principal Odù (and all 256, filterable by right leg).

A study card shows:

- the name (with aliases, if any) and its sign
- a short **meaning or summary** in English
- one or more **ẹsẹ Ifá snippets**: Yoruba text with an English translation beneath it
- the **source** for each snippet (book and page, or "from [teacher/house], oral teaching"), shown on the card

Content rules, which matter most:

- **Do not write, generate, paraphrase, or "fill in" any ẹsẹ Ifá, translations, or meanings.** Ẹsẹ are sacred verses; an invented or misattributed one would teach something false. All study content comes from me or from sources I approve.
- Put all study content in its own data file (`src/data/ese.ts`), separate from the Odù data. Each entry has: Odù id, meaning, list of snippets (Yoruba text, English translation, source), and a `reviewed` flag.
- Ship the file with the correct structure and **empty entries**, plus one clearly marked example entry that is labeled "PLACEHOLDER — replace before release" and never shown in production.
- Only show entries with `reviewed: true`. When an Odù has no reviewed content yet, show a calm "Study notes for this Odù haven't been added yet" message instead of hiding the card.
- Yoruba text follows the "Spelling and language" rules and uses `lang="yo"`; the English uses `lang="en"`.
- Add a short guide to the README on how to add or edit an entry.

---

## Progress tracking and weak-Odù analysis

The game records every answer on the device so players can see how they're improving and which Odù they struggle with. No accounts; the data never leaves the device unless the player exports it.

**What to record** for each answer: Odù id, mode (Opẹ̀lẹ̀ / Ọpọ́n), direction (Read / Build), correct or not, the answer given, response time in ms, timestamp, and whether the round was timed. Also record a summary for each round (settings, score, attempted, date).

**Progress screen** (reachable from Setup and Results):

- **Overview:** rounds played, total answers, overall accuracy, average response time, and current practice streak (days in a row with at least one round).
- **Score over time:** a simple line chart of round scores for a chosen mode + direction + set + length, so scores from different settings aren't mixed together.
- **Accuracy by Odù:**
  - 16 principal Odù: a grid of 16 tiles, in order of seniority, each showing accuracy and number of attempts.
  - 256 Odù: a 16 × 16 grid (right leg as rows, left leg as columns), each cell shaded by accuracy, with cells that have no attempts shown as clearly "not yet practiced".
  - Filters for mode and direction.
- **Weakest Odù:** a list of up to 10 Odù ranked by lowest accuracy, using only Odù with at least 3 attempts, with slow average response time as a tiebreaker. Each links to its study card.
- **Common mix-ups:** the pairs most often confused (e.g. "You chose Ìrẹtẹ̀ Ọ̀sá when it was Ọ̀sá Ìrẹtẹ̀ — 4 times"), which often points to a reading-direction habit.

**Practicing weak Odù:**

- The "My weak Odù" set in Setup picks signs weighted toward low accuracy and slow response times, still mixing in some stronger Odù so the round isn't discouraging. It is enabled once there are at least 20 recorded answers; before that, explain why it's unavailable.
- Weak-Odù rounds count toward progress data but have their own personal best.

**Data management:**

- Store progress in IndexedDB (a small wrapper library such as `idb-keyval` is fine), with a fallback that keeps the game playable if storage is unavailable.
- Keep the most recent 10,000 answers; older answers are rolled up into per-Odù totals so long-term accuracy isn't lost.
- **Export** progress as a JSON file and **Import** it back (to move to a new device or keep a backup). Validate imported files and reject bad data with a clear message.
- **Reset progress**, with a confirmation step that names what will be deleted.

**Charts:**

- Draw charts as hand-built SVG React components using the theme variables (no heavy chart library), so they work in Light, Dark, Night, and High-contrast.
- Every chart has a text or table alternative (a "Show as table" toggle) and a one-sentence summary for screen readers (e.g. *"Accuracy rose from 55% to 78% over your last 12 rounds."*).
- Never use color alone to show accuracy: tiles and cells also show the percentage or a pattern, and the grid has a legend.

---

## Look and feel

- Clean, uncluttered, intuitive. One primary action per screen.
- Warm, grounded palette (earth tones: wood, ìyẹ̀rọ̀sùn yellow, deep indigo or charcoal), with a neutral high-contrast base so the sign is always the focal point.
- Typography must display Yoruba diacritics correctly (ẹ, ọ, ṣ, and tone marks). Use a font with full coverage, such as Noto Sans or Noto Serif.
- **Responsive:** works on phones (portrait first), tablets, and laptops. On small screens, stack the sign above the answers; on wide screens, place them side by side. No horizontal scrolling.
- **Themes:** Light, Dark, and Night, chosen from a toggle that is always visible in the header (not buried in settings). By default the app follows the device's light/dark setting, and it remembers the player's choice.
  - **Dark:** deep charcoal/indigo background (not pure black), off-white text (not pure white), and softened wood and ìyẹ̀rọ̀sùn tones for the opẹ̀lẹ̀ and ọpọ́n.
  - **Night mode** (for practicing in a dark room): dimmer and warmer than Dark. Very dark background, low-brightness amber/warm text and marks, and no bright whites or blues anywhere. Correct/incorrect feedback uses muted tones instead of bright flashes. The signs must still meet the 3:1 contrast minimum.
  - The theme loads before the first paint, so there's no white flash when the page opens.
  - Every screen, including the SVG sign drawings, modals, and the results screen, takes its colors from shared theme variables so no element stays bright in Dark or Night.

---

## Accessibility (WCAG 2.2 AA minimum)

- Fully keyboard-operable with visible focus indicators; logical tab order.
- Every sign has a text alternative for screen readers, e.g. *"Opẹ̀lẹ̀. Right leg, top to bottom: open, open, open, closed. Left leg: closed, open, open, open."*
- Announce score changes, correct/incorrect feedback, and "30 seconds left" and "10 seconds left" through a polite ARIA live region. Don't announce every second.
- Never rely on color alone: correct/incorrect feedback also uses an icon and text.
- Color contrast of at least 4.5:1 for text and 3:1 for the sign marks and UI components.
- Respect `prefers-reduced-motion`. No flashing content.
- **Accessibility settings panel:**
  - High-contrast mode (pure black/white marks, thick strokes)
  - Large text / large sign mode
  - Extended time or untimed practice option (WCAG 2.2.1, Timing Adjustable). Untimed rounds are clearly labeled and don't count toward personal bests.
  - Sound cues on/off (off by default)
  - Dyslexia-friendly spacing option
- Include the Yoruba language attribute (`lang="yo"`) on Odù names so screen readers pronounce them properly where supported.
- In Build mode, each sign position is a labeled toggle button that can be operated by keyboard, touch, and switch access (see "Reverse mode").
- Charts on the Progress screen have table alternatives and text summaries (see "Progress tracking").

---

## Technical requirements

### Tech stack

| Part | Choice |
|---|---|
| Language | **TypeScript** (strict mode) |
| UI framework | **React** (function components and hooks) |
| Build tool | **Vite** |
| Sign drawings | **SVG** React components, generated from the Odù data rather than stored as fixed images |
| Styling | **Plain CSS** with CSS custom properties for theme tokens (Light, Dark, Night, High-contrast); CSS Modules or plain stylesheets, no UI component library |
| Odù data | A standalone typed data file (`src/data/odu.ts`) |
| Study content | A separate typed data file for ẹsẹ and meanings (`src/data/ese.ts`) |
| Progress storage | **IndexedDB** via `idb-keyval`; `localStorage` for settings and personal bests |
| Charts | Hand-built **SVG** React components (no chart library) |
| Unit tests | **Vitest** |
| End-to-end and accessibility tests | **Playwright** with **@axe-core/playwright** |
| Offline / installable | **PWA** via `vite-plugin-pwa` (manifest, icons, offline caching) |
| Code quality | ESLint + Prettier |
| Hosting | **GitHub Pages**, deployed with GitHub Actions |

No backend, database, or user accounts. Everything runs in the browser.

### Project structure

```
src/
  data/
    odu.ts            # 16 principal Odù + generated 256, names, aliases (editable)
    ese.ts            # ẹsẹ Ifá snippets, meanings, sources, reviewed flag (editable)
    config.ts         # opẹ̀lẹ̀ open/closed mapping, round lengths, thresholds, etc.
  logic/
    odu.ts            # build 256 from 16, name composition, lookups
    distractors.ts    # choose plausible wrong answers
    game.ts           # round state, timer, scoring, missed list (Read and Build)
    build.ts          # Build-mode position state, checking, diffing against target
    progress.ts       # record answers, stats, weak-Odù ranking, mix-ups, weighting
    storage.ts        # localStorage for settings and personal bests (try/catch wrapped)
    progressStore.ts  # IndexedDB storage, roll-up, export/import validation
  components/
    Opele.tsx         # SVG opẹ̀lẹ̀ drawing (read-only or editable for Build mode)
    OponIfa.tsx       # SVG ọpọ́n Ifá drawing (read-only or editable for Build mode)
    AnswerChoices.tsx
    StudyCard.tsx
    Timer.tsx
    ThemeToggle.tsx
    charts/           # SVG line chart, 16-tile grid, 16×16 grid, with table views
    ...
  screens/
    Setup.tsx
    Play.tsx          # Read the sign
    Build.tsx         # Build the sign
    Results.tsx
    Progress.tsx
    OduReference.tsx  # browse all Odù and their study cards
    Help.tsx
    AccessibilitySettings.tsx
  styles/
    themes.css        # color tokens per theme
    global.css
tests/
  unit/               # Vitest
  e2e/                # Playwright + axe
.github/workflows/
  deploy.yml          # build, test, deploy to GitHub Pages
```

### Implementation rules

- Keep Odù data, config, and game logic separate from UI components so each can be changed on its own.
- Save settings and personal bests in `localStorage`, wrapped in try/catch so the game still works if storage is unavailable.
- Set the theme with a small inline script in `index.html` before the first paint, so there's no white flash.
- There is no client-side router: switch screens with app state, which avoids 404 problems on GitHub Pages.
- Load the Noto font from the site's own files (bundled, not a CDN) so the game works offline and diacritics render reliably.
- Unit tests must cover:
  - All 16 patterns match the table above.
  - Exactly 256 unique Odù are generated.
  - Right-leg-first naming, and principal-Odù naming: Ogbè + Ogbè = "Èjì Ogbè", every other doubled Odù = "[Odù] Méjì", and no name ever repeats the same leg twice.
  - Distractors are never the correct answer and never duplicated.
  - Scoring and missed-list tracking.
  - Build mode: a correctly built sign matches its name, every wrong position is identified, and Check stays disabled until all 8 positions are filled.
  - Progress: accuracy and weakest-Odù ranking (including the 3-attempt minimum), mix-up counts, roll-up of old answers, and export → import round-trips without data loss.
  - Study content: only `reviewed: true` entries are shown, and the placeholder entry never appears in a production build.
- Playwright + axe must report no WCAG 2.2 AA violations on the Setup, Play, Build, Results, Progress, and Odù Reference screens in every theme.
- Include a `README.md` covering how to run locally (`npm install`, `npm run dev`), run tests, edit the Odù data and aliases, add ẹsẹ and meanings, and deploy.

### Hosting on GitHub Pages

- Set Vite's `base` to the repository name (e.g. `base: '/odu-ifa-game/'`) so assets load from `https://<username>.github.io/<repo>/`. Put the value in one place so it's easy to change for a custom domain later (then `base: '/'`).
- Add `.github/workflows/deploy.yml` that runs on every push to `main`:
  1. Install dependencies (`npm ci`) on Node LTS.
  2. Lint, type-check, and run unit tests. Stop the deploy if any fail.
  3. `npm run build`.
  4. Upload `dist/` with `actions/upload-pages-artifact` and publish with `actions/deploy-pages`.
- In the repository settings, set **Pages → Source** to **GitHub Actions**.
- Make sure the PWA manifest `start_url` and `scope` and the service worker respect the `base` path.
- Optional later: add a custom domain with a `CNAME` file in `public/`.

---

## Out of scope for v1 (possible later additions)

- Ikin mode (one or two ikin remaining → marks)
- Pronunciation audio for names
