/**
 * Class recipes for the few looks shared across screens (buttons, cards, small
 * text styles). Each returns a Tailwind class string; pass extra classes
 * through cn() at the call site to adjust one instance.
 */
import { cn } from '../lib/cn';

const DISABLED =
  'disabled:cursor-not-allowed disabled:border-dashed disabled:border-border disabled:bg-surface-2 disabled:text-muted disabled:shadow-none ' +
  'aria-disabled:cursor-not-allowed aria-disabled:border-dashed aria-disabled:border-border aria-disabled:bg-surface-2 aria-disabled:text-muted aria-disabled:shadow-none';

/** Raised pill button. Presses down onto its edge unless reduced motion is on. */
export function button({
  variant = 'default',
  size = 'default',
  block = false,
}: { variant?: 'default' | 'primary' | 'danger'; size?: 'default' | 'small'; block?: boolean } = {}) {
  return cn(
    'mb-[3px] inline-flex min-h-[48px] min-w-[44px] cursor-pointer items-center justify-center gap-[0.4rem] rounded-full border-2 border-line bg-surface px-5 py-2 text-center font-semibold text-fg shadow-edge',
    'hover:not-disabled:bg-stage focus-visible:shadow-halo',
    'motion-safe:transition-[background-color,color] motion-safe:duration-120 motion-safe:ease-[ease]',
    'motion-safe:active:not-disabled:translate-y-[2px] motion-safe:active:not-disabled:shadow-pressed',
    variant === 'primary' &&
      'border-accent bg-accent text-on-accent shadow-edge-accent hover:not-disabled:bg-accent hover:not-disabled:underline motion-safe:active:not-disabled:shadow-pressed-accent',
    variant === 'danger' && 'border-incorrect text-incorrect shadow-edge-danger',
    DISABLED,
    size === 'small' && 'min-h-[44px] px-4 py-1',
    block && 'w-full',
  );
}

/** A button that reads as an inline link. */
export const linkButton =
  'inline-flex min-h-[44px] cursor-pointer items-center bg-transparent px-1 font-semibold text-link underline underline-offset-3';

/** Round, borderless icon button; `solid` sits on the surface color. */
export function iconButton({ solid = false }: { solid?: boolean } = {}) {
  return cn(
    'inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-[22px] bg-transparent text-fg hover:bg-stage',
    solid && 'bg-surface hover:bg-surface',
  );
}

/**
 * Stage-colored blocks. A card inside a panel (`nested`) sits on the surface
 * color instead so it stays visible.
 */
export function card({ nested = false }: { nested?: boolean } = {}) {
  return cn(
    'rounded-card border border-card-border bg-stage p-5 [&>h2:first-child]:mt-0',
    nested && 'bg-surface',
  );
}
export const panel =
  'rounded-stage border border-card-border bg-stage px-5 pt-5 pb-6 [&>h2:first-child]:mt-0';

/** Small uppercase label above a heading or group. */
export const eyebrow = 'text-[0.8rem] font-bold tracking-[0.06em] text-muted uppercase';

/** Secondary help text under a control. */
export const hint = 'mt-[0.4rem] mb-0 text-[0.9rem] text-muted';

/** 1rem between children. (Not space-y-4: that sets bottom margins, which fights heading margins.) */
export const stack = '[&>*+*]:mt-4';
