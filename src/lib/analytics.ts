/**
 * Anonymous usage counts through Umami (https://umami.is). The script is loaded in
 * index.html with id "umami-script". An id of "umami" would make window.umami point at the
 * script element. When the script isn't there (ad blocker, offline, dev, tests) nothing is sent.
 */
type EventData = Record<string, string | number | boolean | null | undefined>;
type Payload = Record<string, unknown>;

interface Umami {
  track(build: (props: Payload) => Payload): void;
  track(name: string, data?: EventData): void;
}

declare global {
  interface Window {
    umami?: Umami;
  }
}

// The script loads async, so early calls wait here. Capped so a blocked script can't grow it.
const pending: ((umami: Umami) => void)[] = [];
const MAX_PENDING = 20;

function send(call: (umami: Umami) => void) {
  if (window.umami) {
    call(window.umami);
    return;
  }
  if (pending.length >= MAX_PENDING) return;
  pending.push(call);
  if (pending.length === 1) {
    document.getElementById('umami-script')?.addEventListener('load', flush, { once: true });
  }
}

function flush() {
  const umami = window.umami;
  if (!umami) return;
  for (const call of pending.splice(0)) call(umami);
}

/** Count a screen as a page view, since the app only has one URL */
export function trackScreen(screen: string) {
  send((umami) => umami.track((props) => ({ ...props, url: `/${screen}`, title: screen })));
}

export function trackEvent(name: string, data?: EventData) {
  send((umami) => umami.track(name, data));
}
