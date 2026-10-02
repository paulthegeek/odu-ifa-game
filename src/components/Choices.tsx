/**
 * A radio group drawn as chips, a segmented control, or a list of tiles.
 * Native radios stay in the DOM (invisible, covering each option) so keyboard,
 * form and screen-reader behavior are the browser's own.
 *
 * Segmented groups draw the selection as one thumb that slides between options.
 * Each label carries a hidden bold copy so selecting it never changes its width.
 */
import type { CSSProperties, ReactNode } from 'react';
import { Icon } from './Icon';

export interface ChoiceOption<T extends string | number> {
  value: T;
  label: ReactNode;
  detail?: ReactNode;
  disabled?: boolean;
  describedBy?: string;
}

export function Choices<T extends string | number>({
  legend,
  legendHidden = false,
  name,
  value,
  options,
  onChange,
  hint,
  variant = 'chips',
  className,
}: {
  legend: ReactNode;
  legendHidden?: boolean;
  name: string;
  value: T;
  options: readonly ChoiceOption<T>[];
  onChange: (v: T) => void;
  hint?: ReactNode;
  variant?: 'chips' | 'segmented' | 'list';
  className?: string;
}) {
  const selected = options.findIndex((o) => o.value === value);
  const thumb = variant === 'segmented' && selected >= 0;
  const thumbStyle = thumb
    ? ({ '--count': options.length, '--index': selected } as CSSProperties)
    : undefined;
  return (
    <fieldset className={className ? `choices ${className}` : 'choices'} data-variant={variant}>
      <legend className={legendHidden ? 'visually-hidden' : 'choices-legend'}>{legend}</legend>
      <div className="choices-options" style={thumbStyle}>
        {thumb && <span className="choices-thumb" aria-hidden="true" />}
        {options.map((o) => (
          <label key={String(o.value)} className="choice">
            <input
              type="radio"
              className="choice-input"
              name={name}
              value={String(o.value)}
              checked={value === o.value}
              disabled={o.disabled}
              aria-describedby={o.describedBy}
              onChange={() => onChange(o.value)}
            />
            <Icon name="check" className="choice-check" />
            <span className="choice-text">
              <span className="choice-label">
                <span>{o.label}</span>
                <span className="choice-label-sizer" aria-hidden="true">
                  {o.label}
                </span>
              </span>
              {o.detail && <span className="choice-detail">{o.detail}</span>}
            </span>
          </label>
        ))}
      </div>
      {hint}
    </fieldset>
  );
}
