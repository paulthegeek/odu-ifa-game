/**
 * Shared frame for Opẹ̀lẹ̀ and Ọpọ́n Ifá drawings: the SVG, its text
 * alternative, wrong-position markers, and (in Build mode) the position buttons.
 */
import type { KeyboardEvent, ReactNode, RefObject } from 'react';
import type { Cell } from '../logic/build';
import type { Mode } from '../logic/game';
import { geometryFor, positionPoint, signDescription } from './signGeometry';

export interface EditableConfig {
  readonly labels: readonly string[];
  readonly activeIndex: number;
  readonly onActivate: (index: number) => void;
  readonly onKeyDown: (e: KeyboardEvent<HTMLButtonElement>, index: number) => void;
  readonly onFocusIndex: (index: number) => void;
  readonly buttonRefs: RefObject<(HTMLButtonElement | null)[]>;
}

export interface SignFrameProps {
  readonly mode: Mode;
  readonly cells: readonly Cell[];
  readonly size?: 'large' | 'medium' | 'small';
  /** Indexes of positions to mark as wrong (outline + ✕ icon). */
  readonly wrong?: readonly number[];
  /** Overrides the generated text alternative. */
  readonly label?: string;
  readonly editable?: EditableConfig;
  /** Hide from assistive tech when the surrounding control already names the sign. */
  readonly decorative?: boolean;
  readonly children: ReactNode;
}

function WrongMarker({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const bx = x + w / 2 - 2;
  const by = y - h / 2 + 2;
  return (
    <g>
      <rect className="diff-box" x={x - w / 2} y={y - h / 2} width={w} height={h} rx={8} />
      <circle className="diff-badge" cx={bx} cy={by} r={8} />
      <path
        className="diff-x"
        d={`M ${bx - 3.5} ${by - 3.5} L ${bx + 3.5} ${by + 3.5} M ${bx + 3.5} ${by - 3.5} L ${bx - 3.5} ${by + 3.5}`}
      />
    </g>
  );
}

export function SignFrame({
  mode,
  cells,
  size = 'large',
  wrong = [],
  label,
  editable,
  decorative,
  children,
}: SignFrameProps) {
  const g = geometryFor(mode);
  const description = label ?? signDescription(mode, cells);
  const svg = (
    <svg
      viewBox={`0 0 ${g.width} ${g.height}`}
      {...(editable || decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': description })}
      focusable="false"
    >
      {children}
      {wrong.map((i) => {
        const { x, y } = positionPoint(g, i);
        return <WrongMarker key={`w${i}`} x={x} y={y} w={g.hit.w} h={g.hit.h} />;
      })}
    </svg>
  );

  if (!editable) {
    return (
      <div className="sign" data-size={size} data-mode={mode}>
        {svg}
      </div>
    );
  }

  return (
    <div
      className="sign"
      data-size={size}
      data-mode={mode}
      role="group"
      aria-label={mode === 'opele' ? 'Opẹ̀lẹ̀ to build' : 'Ọpọ́n Ifá to build'}
    >
      {svg}
      {cells.map((_, i) => {
        const { x, y } = positionPoint(g, i);
        return (
          <button
            key={i}
            ref={(el) => {
              editable.buttonRefs.current[i] = el;
            }}
            type="button"
            className="position-btn"
            style={{
              left: `${(x / g.width) * 100}%`,
              top: `${(y / g.height) * 100}%`,
              width: `${(g.hit.w / g.width) * 100}%`,
              height: `${(g.hit.h / g.height) * 100}%`,
            }}
            tabIndex={i === editable.activeIndex ? 0 : -1}
            aria-label={editable.labels[i]}
            onClick={() => editable.onActivate(i)}
            onKeyDown={(e) => editable.onKeyDown(e, i)}
            onFocus={() => editable.onFocusIndex(i)}
          />
        );
      })}
    </div>
  );
}
