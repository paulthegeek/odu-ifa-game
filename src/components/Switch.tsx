import type { ReactNode } from 'react';

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
    <div className="switch-field">
      <label className="switch-row">
        <span className="switch-text">{children}</span>
        <input
          type="checkbox"
          className="switch"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
      </label>
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}
