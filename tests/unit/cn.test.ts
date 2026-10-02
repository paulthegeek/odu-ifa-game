import { describe, expect, it } from 'vitest';
import { cn } from '../../src/lib/cn';

describe('cn', () => {
  it('lets later theme colors override earlier ones', () => {
    expect(cn('bg-surface text-fg', 'bg-accent text-on-accent')).toBe('bg-accent text-on-accent');
    expect(cn('border-border', 'border-card-border')).toBe('border-card-border');
  });

  it('keeps font size and text color apart', () => {
    expect(cn('text-[0.9rem] text-muted', 'text-fg')).toBe('text-[0.9rem] text-fg');
  });

  it('knows the custom shadows and radii', () => {
    expect(cn('shadow-edge', 'shadow-edge-accent')).toBe('shadow-edge-accent');
    expect(cn('shadow-edge', 'focus-visible:shadow-halo')).toBe('shadow-edge focus-visible:shadow-halo');
    expect(cn('rounded-full', 'rounded-ctl')).toBe('rounded-ctl');
  });

  it('drops falsy values', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b');
  });
});
