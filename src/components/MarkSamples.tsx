/**
 * Small teaching drawings for Help: one leg as a strip of tray marks, a single
 * tray mark, and a single opẹ̀lẹ̀ seed. Always decorative: the text beside
 * them carries the meaning.
 */
import type { Mark } from '../logic/odu';
import { cn } from '../lib/cn';
import { Seed } from './Opele';
import { TrayMark } from './OponIfa';

const SVG = 'block h-auto flex-none';

/** A leg's four marks, top to bottom, drawn like tray marks. */
export function LegGlyph({ pattern, className }: { pattern: readonly Mark[]; className?: string }) {
  return (
    <svg className={cn(SVG, 'w-[22px]', className)} viewBox="0 0 32 76" aria-hidden="true" focusable="false">
      <rect className="glyph-bg" x={1} y={1} width={30} height={74} rx={8} />
      {pattern.map((m, i) => {
        const y = 14 + i * 16;
        return m === 1 ? (
          <line key={i} className="glyph-mark" x1={16} y1={y - 5} x2={16} y2={y + 5} />
        ) : (
          <g key={i}>
            <line className="glyph-mark" x1={11} y1={y - 5} x2={11} y2={y + 5} />
            <line className="glyph-mark" x1={21} y1={y - 5} x2={21} y2={y + 5} />
          </g>
        );
      })}
    </svg>
  );
}

/** One tray mark on a square of powder. */
export function TrayMarkSample({ mark, className }: { mark: Mark; className?: string }) {
  return (
    <svg className={cn(SVG, 'w-14', className)} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <rect className="glyph-bg" x={1} y={1} width={46} height={46} rx={10} />
      <TrayMark cell={mark} x={24} y={24} />
    </svg>
  );
}

/** One opẹ̀lẹ̀ seed, drawn open or closed for this mark (see OPELE_MAPPING). */
export function SeedSample({ mark, className }: { mark: Mark; className?: string }) {
  return (
    <svg className={cn(SVG, 'w-12', className)} viewBox="0 0 44 52" aria-hidden="true" focusable="false">
      <Seed cell={mark} x={22} y={26} />
    </svg>
  );
}
