import { createContext, useContext } from 'react';
import type { Settings } from '../logic/storage';

export interface AppContextValue {
  readonly settings: Settings;
  readonly updateSettings: (patch: Partial<Settings>) => void;
  /** Speak a message through the polite live region. */
  readonly announce: (message: string) => void;
  /** Open the study card for an Odù. */
  readonly openStudy: (oduId: string) => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppContext');
  return ctx;
}
