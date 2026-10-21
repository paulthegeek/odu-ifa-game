/**
 * The service worker fetches a new release in the background, which can take a while
 * on a slow link. Apply it only when the player is not in a round, so a reload never
 * throws away a round in progress.
 */
export function createUpdateGate(reload: () => void) {
  let pending = false;
  let busy = false;
  const apply = () => {
    pending = false;
    reload();
  };
  return {
    setBusy: (next: boolean): void => {
      busy = next;
      if (pending && !busy) apply();
    },
    requestReload: (): void => {
      pending = true;
      if (!busy) apply();
    },
  };
}

export const { setBusy, requestReload } = createUpdateGate(() => window.location.reload());
