import { describe, expect, it, vi } from 'vitest';
import { createUpdateGate } from '../../src/app/updateReload';

describe('createUpdateGate', () => {
  it('reloads right away when the player is not busy', () => {
    const reload = vi.fn();
    createUpdateGate(reload).requestReload();
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('waits until the round is over', () => {
    const reload = vi.fn();
    const gate = createUpdateGate(reload);
    gate.setBusy(true);
    gate.requestReload();
    expect(reload).not.toHaveBeenCalled();
    gate.setBusy(false);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('does not reload when nothing is pending', () => {
    const reload = vi.fn();
    const gate = createUpdateGate(reload);
    gate.setBusy(true);
    gate.setBusy(false);
    expect(reload).not.toHaveBeenCalled();
  });

  it('reloads only once per update', () => {
    const reload = vi.fn();
    const gate = createUpdateGate(reload);
    gate.setBusy(true);
    gate.requestReload();
    gate.setBusy(false);
    gate.setBusy(true);
    gate.setBusy(false);
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
