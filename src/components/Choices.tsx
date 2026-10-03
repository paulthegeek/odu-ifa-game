/**
 * A radio group drawn as chips, a segmented control, or a list of tiles.
 * Native radios stay in the DOM (invisible, covering each option) so keyboard,
 * form and screen-reader behavior are the browser's own.
 *
 * Segmented groups draw the selection as one thumb that slides between options.
 * Each label carries a hidden bold copy so selecting it never changes its width.
 *
 * `quiet` groups mark the choice with an outline and a check instead of a solid
 * fill, so a setting never looks like the button that acts on it.
 *
 * Checked, focused and disabled looks come from the radio inside each label,
 * via has-* (on the label) and group-has-* (on its children).
 */
import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Icon, type IconName } from './Icon';
import { eyebrow } from './ui';

export interface ChoiceOption<T extends string | number> {
  value: T;
  label: ReactNode;
  detail?: ReactNode;
  disabled?: boolean;
  describedBy?: string;
  /** Shown before the label in place of the check (quiet segmented groups only). */
  icon?: IconName;
}

type Variant = 'chips' | 'segmented' | 'list';

const OPTIONS: Record<Variant, string> = {
  chips: 'flex flex-wrap gap-2',
  segmented:
    'relative isolate grid auto-cols-[minmax(0,1fr)] grid-flow-col gap-[4px] rounded-ctl border-2 border-border bg-surface p-[4px]',
  list: 'grid gap-2',
};

const CHOICE: Record<Variant, string> = {
  chips: 'px-[1.7rem] has-checked:pr-4 has-checked:pl-[2.4rem]',
  segmented:
    'justify-center rounded-[11px] border-0 bg-transparent px-3 text-center has-checked:bg-transparent forced-colors:has-checked:text-[HighlightText] forced-colors:has-checked:forced-color-adjust-none',
  list: 'w-full items-start rounded-ctl px-4 py-3',
};

// Chips show details as hints instead; segmented groups show the choice with the thumb.
const CHECK: Record<Variant, string> = {
  chips: 'absolute left-4',
  segmented: 'sr-only',
  list: 'mt-[0.2rem]',
};

// Quiet: the checked option keeps the surface color and gains an accent outline.
const QUIET_CHOICE: Record<Variant, string> = {
  chips:
    'has-checked:border-accent has-checked:bg-surface has-checked:text-fg has-checked:shadow-[inset_0_0_0_1px_var(--color-accent)]',
  segmented: 'has-checked:text-fg forced-colors:has-checked:text-[CanvasText]',
  list: 'has-checked:border-accent has-checked:bg-surface has-checked:text-fg',
};
const QUIET_THUMB =
  'bg-transparent shadow-[inset_0_0_0_2px_var(--color-accent)] forced-colors:border-2 forced-colors:border-[Highlight] forced-colors:bg-transparent';

export function Choices<T extends string | number>({
  legend,
  legendHidden = false,
  name,
  value,
  options,
  onChange,
  hint,
  variant = 'chips',
  quiet = false,
  className,
  legendClassName,
}: {
  legend: ReactNode;
  legendHidden?: boolean;
  name: string;
  value: T;
  options: readonly ChoiceOption<T>[];
  onChange: (v: T) => void;
  hint?: ReactNode;
  variant?: Variant;
  quiet?: boolean;
  className?: string;
  legendClassName?: string;
}) {
  const selected = options.findIndex((o) => o.value === value);
  const thumb = variant === 'segmented' && selected >= 0;
  const quietSegment = quiet && variant === 'segmented';
  const thumbStyle = thumb
    ? ({ '--count': options.length, '--index': selected } as CSSProperties)
    : undefined;
  return (
    <fieldset className={cn('min-w-0', className)}>
      <legend className={legendHidden ? 'sr-only' : cn(eyebrow, 'mb-2', legendClassName)}>{legend}</legend>
      <div className={OPTIONS[variant]} style={thumbStyle}>
        {thumb && (
          <span
            className={cn(
              'absolute top-[4px] bottom-[4px] left-[4px] -z-1 w-[calc((100%-8px-(var(--count)-1)*4px)/var(--count))] translate-x-[calc(var(--index)*(100%+4px))] rounded-[11px] bg-accent',
              'forced-colors:bg-[Highlight] forced-colors:forced-color-adjust-none',
              'motion-safe:transition-transform motion-safe:duration-240 motion-safe:ease-out-soft',
              quiet && QUIET_THUMB,
            )}
            aria-hidden="true"
          />
        )}
        {options.map((o) => (
          <label
            key={String(o.value)}
            className={cn(
              'group relative inline-flex min-h-[44px] cursor-pointer items-center gap-[0.4rem] rounded-full border-2 border-border bg-surface px-4 py-[0.35rem] font-medium text-fg',
              'has-checked:border-accent has-checked:bg-accent has-checked:font-bold has-checked:text-on-accent',
              'has-focus-visible:shadow-halo has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus',
              'has-disabled:cursor-not-allowed has-disabled:border-dashed has-disabled:bg-transparent has-disabled:text-muted',
              'motion-safe:[transition:background-color_240ms_ease,color_240ms_ease,padding_240ms_cubic-bezier(0.3,0.7,0.4,1)]',
              CHOICE[variant],
              quiet && QUIET_CHOICE[variant],
              // Room on the left for the check, kept whether or not it's chosen, so choosing
              // never changes how the text wraps.
              quietSegment && !o.icon && 'pr-1 pl-5',
            )}
          >
            <input
              type="radio"
              className="absolute inset-0 z-1 m-0 size-full cursor-[inherit] opacity-0"
              name={name}
              value={String(o.value)}
              checked={value === o.value}
              disabled={o.disabled}
              aria-describedby={o.describedBy}
              onChange={() => onChange(o.value)}
            />
            {!quietSegment && (
              <Icon
                name="check"
                className={cn(
                  'size-4 scale-50 stroke-3 opacity-0 group-has-checked:scale-100 group-has-checked:opacity-100',
                  'motion-safe:[transition:opacity_240ms_ease,scale_240ms_cubic-bezier(0.3,0.7,0.4,1)]',
                  CHECK[variant],
                )}
              />
            )}
            <span className="flex flex-col">
              <span className="inline-flex items-center justify-center gap-1">
                {quietSegment && o.icon && (
                  <Icon
                    name={o.icon}
                    className="size-5 group-has-checked:text-accent forced-colors:text-[CanvasText]"
                  />
                )}
                <span className="relative grid *:[grid-area:1/1]">
                  {/* Hangs just left of the title, inside the label's left padding (pl-5). */}
                  {quietSegment && !o.icon && (
                    <Icon
                      name="check"
                      className="absolute top-1/2 right-full mr-1 hidden size-[0.85rem] -translate-y-1/2 stroke-3 text-accent group-has-checked:block"
                    />
                  )}
                  <span>{o.label}</span>
                  <span className="invisible font-bold" aria-hidden="true">
                    {o.label}
                  </span>
                </span>
              </span>
              {o.detail && (
                <span
                  className={cn(
                    'text-[0.8rem] font-normal text-muted group-has-checked:text-inherit',
                    variant === 'chips' && 'sr-only',
                  )}
                >
                  {o.detail}
                </span>
              )}
            </span>
          </label>
        ))}
      </div>
      {hint}
    </fieldset>
  );
}
