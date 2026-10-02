import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import { hint as hintText } from './ui';

/** A checkbox drawn as an on/off switch. The knob's position, not only its color, shows the state. */
export function Switch({
  checked,
  onChange,
  children,
  hint,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  hint?: ReactNode;
}) {
  return (
    // Consecutive switches are divided by a hairline.
    <div className="border-line [&+&]:border-t">
      <label className="flex min-h-[48px] cursor-pointer items-center justify-between gap-4 py-2">
        <span>{children}</span>
        <input
          type="checkbox"
          className={cn(
            'relative m-0 h-[32px] w-[52px] flex-none cursor-pointer appearance-none rounded-[16px] border-2 border-border bg-surface checked:border-accent checked:bg-accent',
            // The knob
            'before:absolute before:top-[4px] before:left-[4px] before:size-[20px] before:rounded-full before:bg-border checked:before:left-[24px] checked:before:bg-on-accent',
            'motion-safe:before:transition-[left] motion-safe:before:duration-120 motion-safe:before:ease-[ease]',
          )}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
      </label>
      {hint && <p className={cn(hintText, '-mt-[0.35rem] mb-2')}>{hint}</p>}
    </div>
  );
}
