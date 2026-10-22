# Analytics

How Odù Game counts usage, why it's set up this way, and how to work with it. Plan details and prices were checked in October 2026.

---

## Contents

1. [At a glance](#1-at-a-glance)
2. [Why Umami](#2-why-umami)
3. [What is sent](#3-what-is-sent)
4. [How it works](#4-how-it-works)
5. [Adding an event](#5-adding-an-event)
6. [Using the Umami dashboard](#6-using-the-umami-dashboard)
7. [Excluding your own visits](#7-excluding-your-own-visits)
8. [Testing](#8-testing)
9. [Privacy and consent](#9-privacy-and-consent)
10. [Limits and costs](#10-limits-and-costs)
11. [Gotchas and troubleshooting](#11-gotchas-and-troubleshooting)

---

## 1. At a glance

|            |                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------- |
| Service    | [Umami Cloud](https://umami.is), free Hobby plan                                            |
| Dashboard  | [cloud.umami.is](https://cloud.umami.is)                                                    |
| Website ID | In the `<script id="umami-script">` tag in [`index.html`](../index.html). Public by design. |
| Script     | `https://cloud.umami.is/script.js`, about 2.3 KB gzipped, loaded `async`                    |
| Cookies    | None. The script stores nothing on the device.                                              |
| Runs on    | `odugame.com` only. Local dev, previews and tests send nothing.                             |
| Code       | [`src/lib/analytics.ts`](../src/lib/analytics.ts) plus the calls listed in section 4        |

---

## 2. Why Umami

The app has some unusual needs:

- **One URL.** Screens are switched with React state, so the URL never changes. A tool that only counts page views would see one page per visit. The tool has to support custom events with data.
- **Slow, expensive connections.** Many players are on mobile data, so the script has to be small.
- **A privacy promise.** Progress stays on the device. Analytics shouldn't need cookies or a consent banner.
- **Static hosting.** GitHub Pages has no server and no site traffic stats of its own. Repo **Insights → Traffic** counts visits to the repository, not to odugame.com.

Umami's free plan covers all of these. The alternatives that were considered:

| Tool                          | Why not                                                                     |
| ----------------------------- | --------------------------------------------------------------------------- |
| GoatCounter                   | Free and light, but events can't carry data (no mode, direction and so on). |
| Plausible                     | $9/month, and event data (custom properties) needs the $19 plan.            |
| Cloudflare Web Analytics      | No custom events, so it would count about one page view per visit.          |
| Google Analytics 4            | About 154 KB of script, sets cookies, needs a consent banner.               |
| Microsoft Clarity and PostHog | Heavy scripts, and cookies or consent for their main features.              |

**When to revisit:** if traffic goes past the free plan's limit (section 10), the next Umami Cloud plan is $20/month. At that point, self-hosting Umami (open source, MIT) or moving to Plausible may make more sense. Only [`src/lib/analytics.ts`](../src/lib/analytics.ts) and the script tag in `index.html` would need to change.

---

## 3. What is sent

### Screen views

Each screen is sent as a page view with a made-up path, so Umami's **Pages** list reads like a normal site:

`/home`, `/round`, `/results`, `/progress`, `/reference`, `/help`, `/settings`

### Events

| Event               | Sent when                                            | Data                                                                                                                                                          |
| ------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `round-started`     | A round starts                                       | `mode` (`opele`, `opon`), `direction` (`read`, `build`), `set` (`meji`, `all`, `weak`), `timing` (`standard`, `extended`, `untimed`), `practice` (true/false) |
| `round-finished`    | A round ends                                         | `mode`, `direction`, `answered`, `correct`                                                                                                                    |
| `study-card-opened` | A study card opens                                   | `odu`: the Odù id, for example `ogbe_ogunda`                                                                                                                  |
| `setting-changed`   | An on/off switch in Settings changes                 | `setting`: the setting's key, for example `highContrast`; `on`: true/false                                                                                    |
| `js-error`          | An uncaught error or rejected promise                | `message`: the error message, cut to 100 characters                                                                                                           |
| `boot-failed`       | The app script fails to load and **Try again** shows | none                                                                                                                                                          |

Umami also records what it collects for every visit: country, browser, operating system, device type, screen size, language and referrer.

### Never sent

- Individual answers, which Odù were missed, mix-ups or saved progress.
- Anything typed or imported by the player.
- URL search parameters (`data-exclude-search="true"`).

---

## 4. How it works

### Files

| File                                                      | What it does                                                                                        |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [`index.html`](../index.html)                             | Loads the script. Skips it in the boot error handler. Sends `boot-failed` from `showRetry()`.       |
| [`src/lib/analytics.ts`](../src/lib/analytics.ts)         | `trackScreen()` and `trackEvent()`. The only code that talks to `window.umami`.                     |
| [`src/app/App.tsx`](../src/app/App.tsx)                   | Screen views (one `useEffect` on `screen`), `round-started`, `round-finished`, `study-card-opened`. |
| [`src/main.tsx`](../src/main.tsx)                         | `js-error` listeners for `error` and `unhandledrejection`.                                          |
| [`src/screens/Settings.tsx`](../src/screens/Settings.tsx) | `setting-changed`, inside the `toggle` helper.                                                      |

### The script tag

```html
<script
  async
  id="umami-script"
  src="https://cloud.umami.is/script.js"
  data-website-id="…"
  data-domains="odugame.com"
  data-auto-pageview="false"
  data-exclude-search="true"
></script>
```

- **`async`, not `defer`.** The app's own script is a module, and module and `defer` scripts run in page order. With `defer`, a slow Umami download would hold up the app.
- **`id="umami-script"`, never `id="umami"`.** Browsers make every element with an id available as a global. An id of `umami` makes `window.umami` point to the script tag until Umami loads, and calling `.track()` on it crashes the app.
- **`data-domains`** limits sending to `odugame.com`.
- **`data-auto-pageview="false"`** turns off Umami's own page view. The app sends its own screen views instead.

### The wrapper

[`analytics.ts`](../src/lib/analytics.ts) checks for `window.umami` before every call.

- **Script loaded:** the call goes straight through.
- **Script not loaded yet:** the call waits in a short queue (at most 20) and is sent when the script's `load` event fires. This is how the first `/home` view is counted even though the app usually starts before Umami arrives.
- **Script blocked or offline:** the queue is never sent, and nothing breaks.

### Offline and the PWA

The service worker doesn't cache the Umami script, and Umami doesn't store events to send later. Anything that happens offline is not counted.

---

## 5. Adding an event

1. Import the wrapper where the action happens:
   ```ts
   import { trackEvent } from '../lib/analytics';
   ```
2. Call it with a short kebab-case name and, if useful, a flat object of strings, numbers and booleans:
   ```ts
   trackEvent('reference-searched', { results: matches.length });
   ```
3. Put the call in the handler for the user's action, not in a render or a general state setter. For example, `updateSettings` is also called by `startRound`, which is why `setting-changed` is sent from the Settings screen instead.
4. Don't send anything personal or anything the player typed.
5. Add the event to the table in section 3.

Umami's limits: event names up to 50 characters, up to 50 properties per event, strings up to 500 characters.

---

## 6. Using the Umami dashboard

- **Domain:** the site's **Domain** setting in Umami should be `odugame.com`. Umami uses it to keep the site's own pages out of the referrer list.
- **Pages:** screen views (`/home`, `/round` and so on).
- **Events:** event counts by name.
- **Event data:** the data sent with each event, for example `round-started` split by `mode`. Open it from the site's top menu.
- **Reports**, from the site's Reports section:
  - **Funnel:** `/home` → `/round` → `/results`, to see where people drop off.
  - **Goals:** for example, a goal on `round-finished`, or the average of its `correct` property.
  - **Journey:** common paths between screens.

New events need no setup. They appear in the dashboard the first time they're sent.

---

## 7. Excluding your own visits

Umami skips any browser that has `umami.disabled` set in its `localStorage` **for odugame.com**.

1. Open **odugame.com**. The setting must be made on this site, not a blank tab.
2. Open the console: Chrome or Edge Cmd+Option+J; Firefox Cmd+Option+K; Safari Cmd+Option+C (turn on Settings → Advanced → "Show features for web developers" first).
3. Run:
   ```js
   localStorage.setItem('umami.disabled', '1');
   ```
   If Chrome blocks pasting, type `allow pasting`, press Return, and paste again.
4. Check it with `localStorage.getItem('umami.disabled')`. It should return `'1'`.

Notes:

- It applies to one browser on one device. Repeat it everywhere you use the app.
- Phones have no console. Connect the phone to the Mac and use Safari → Develop (iPhone) or `chrome://inspect` (Android).
- On iPhone, the installed home-screen app has its own storage, separate from Safari.
- Clearing the site's data removes the setting.
- To undo it: `localStorage.removeItem('umami.disabled')`.

---

## 8. Testing

- **Nothing is sent locally.** `data-domains` blocks `pnpm dev`, `vite preview` and the Playwright tests.
- **Unit tests** run in jsdom, where there's no Umami script, so every call does nothing.
- **To check the code paths locally,** load the built app in Playwright and replace the script with a stand-in that records calls:
  ```js
  await page.route('https://cloud.umami.is/**', (route) =>
    route.fulfill({
      contentType: 'text/javascript',
      body: 'window.__calls=[];window.umami={track:(a,d)=>window.__calls.push(typeof a==="function"?a({}).url:[a,d])};',
    }),
  );
  ```
  Delay the `fulfill` to test the queue, or use `route.abort()` to test a blocked script. Either way the page should load with no errors.
- **To check the live site,** open odugame.com with the browser's Network tab open and filter for `api/send`. Each screen change and event should show a request with status 200. Then check the dashboard.

---

## 9. Privacy and consent

- Umami sets no cookies and stores nothing on the device. The one `localStorage` read is the `umami.disabled` opt-out check.
- The Progress screen's "Your data" section tells players about the usage counts. If what's sent changes, check that wording in [`src/screens/Progress.tsx`](../src/screens/Progress.tsx) is still true.

**Consent banners.** These come from EU and UK law (the ePrivacy Directive and GDPR) and, since 2025, Nigeria's data protection guidance (GAID). They apply based on where visitors are, not where the site owner lives. The US has no equivalent requirement for a site like this.

The idea that cookieless analytics needs no banner is how Umami and similar vendors read those rules. No regulator has formally confirmed it:

- The EU's privacy regulators (EDPB Guidelines 2/2023) say "cookieless" isn't automatically exempt.
- Nigeria's GAID requires consent for analytics cookies and tracking tools. Whether it covers cookieless tools that collect no personal data is not settled.

For a free, non-commercial study app that sends no personal data, the risk is low. Adding anything that identifies a person (accounts, a distinct ID, session recording) would change that.

---

## 10. Limits and costs

Umami Cloud plans as of October 2026:

| Plan  | Price     | Events per month | History  | Sites |
| ----- | --------- | ---------------- | -------- | ----- |
| Hobby | Free      | 100,000          | 6 months | 1     |
| Pro   | $20/month | 1,000,000        | 2 years  | 20    |

Every screen view and event counts toward the limit. A typical visit sends around 5 to 10, so the free plan covers roughly 10,000 to 20,000 visits a month.

The Hobby plan has no API access, and data older than 6 months is deleted. Export anything you want to keep.

---

## 11. Gotchas and troubleshooting

- **Blank page or "track is not a function":** something has the id `umami` again. See section 4.
- **"Couldn't finish loading" flashes when offline:** the boot error handler in `index.html` must skip `t.id === 'umami-script'`.
- **Nothing in the dashboard:**
  - Are you on `odugame.com`? Any other host is ignored, including `www.odugame.com` if it doesn't redirect.
  - Is `umami.disabled` set in this browser?
  - Is an ad blocker blocking `cloud.umami.is`?
- **Counts look low:** some ad blockers and privacy browsers block Umami, and offline use isn't counted. Treat the numbers as a minimum, not an exact total.
- **Screen views counted twice in dev:** `StrictMode` runs effects twice in development. Nothing is sent from dev, and production runs them once.
