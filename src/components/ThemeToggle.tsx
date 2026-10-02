/**
 * Theme controls. `ThemeMenu` is the compact button shown on every screen,
 * including during a round; `ThemeChoices` is the full radio group used inside
 * it and on the Settings screen. "Auto" follows the device's light/dark setting.
 */
import { useEffect, useId, useRef, useState } from 'react';
import { useApp } from '../app/AppContext';
import type { ThemeChoice } from '../logic/storage';
import { Choices } from './Choices';
import { Icon, type IconName } from './Icon';
import { iconButton } from './ui';
import { cn } from '../lib/cn';

const OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: 'system', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'night', label: 'Night' },
];

const ICONS: Record<ThemeChoice, IconName> = {
  system: 'auto',
  light: 'sun',
  dark: 'moon',
  night: 'night',
};

export function ThemeChoices({ name, legendHidden = false }: { name: string; legendHidden?: boolean }) {
  const { settings, updateSettings } = useApp();
  return (
    <Choices
      variant="segmented"
      legend="Theme"
      legendHidden={legendHidden}
      name={name}
      value={settings.theme}
      options={OPTIONS}
      onChange={(theme) => updateSettings({ theme })}
    />
  );
}

/** `sidebar`: in the wide-screen sidebar, show the label and open the menu upward. */
export function ThemeMenu({ sidebar = false }: { sidebar?: boolean }) {
  const { settings } = useApp();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div
      className="relative"
      ref={wrapRef}
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className={cn(
          iconButton(),
          sidebar && 'md:gap-[0.6rem] md:pr-[0.9rem] md:pl-[0.6rem] md:font-semibold',
        )}
        aria-expanded={open}
        aria-controls={popId}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name={ICONS[settings.theme]} />
        {/* Visually hidden in compact bars, shown beside the icon in the wide-screen sidebar. */}
        <span className={cn('sr-only', sidebar && 'md:not-sr-only')}>Theme</span>
      </button>
      <div
        id={popId}
        className={cn(
          'absolute top-[calc(100%+0.5rem)] right-0 z-40 w-max max-w-[calc(100vw-2rem)] rounded-ctl border-2 border-border bg-surface p-2 shadow-card',
          sidebar && 'md:top-auto md:right-auto md:bottom-[calc(100%+0.5rem)] md:left-0',
        )}
        hidden={!open}
      >
        {open && <ThemeChoices name="theme" legendHidden />}
      </div>
    </div>
  );
}
