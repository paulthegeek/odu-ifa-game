/**
 * Opẹ̀lẹ̀ drawing: two strands of four half-pods joined at the top.
 * Open seed (concave side up) shows a pale hollow inside a rim;
 * closed seed (convex side up) is a solid shell with a ridge down the middle.
 * The two states differ in shape and shading, not only color.
 */
import { OPELE_MAPPING } from '../data/config';
import type { Cell } from '../logic/build';
import { OPELE_GEOMETRY as G, positionPoint } from './signGeometry';
import { SignFrame, type SignFrameProps } from './SignFrame';

const RX = 17;
const RY = 22;

function OpenSeed({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <ellipse className="seed-rim" cx={x} cy={y} rx={RX} ry={RY} />
      <ellipse className="seed-inner" cx={x} cy={y + 1} rx={RX - 6} ry={RY - 6} />
      <path className="seed-hollow" d={`M ${x - 8} ${y - 8} Q ${x} ${y - 14} ${x + 8} ${y - 8}`} />
    </g>
  );
}

function ClosedSeed({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <ellipse className="seed-shell" cx={x} cy={y} rx={RX} ry={RY} />
      <line className="seed-ridge" x1={x} y1={y - RY + 6} x2={x} y2={y + RY - 6} />
    </g>
  );
}

function EmptySlot({ x, y }: { x: number; y: number }) {
  return <ellipse className="slot-empty" cx={x} cy={y} rx={RX} ry={RY} />;
}

export function Seed({ cell, x, y }: { cell: Cell; x: number; y: number }) {
  if (cell === 0) return <EmptySlot x={x} y={y} />;
  return cell === OPELE_MAPPING.open ? <OpenSeed x={x} y={y} /> : <ClosedSeed x={x} y={y} />;
}

function OpeleArt({ cells, showMarks }: { cells: readonly Cell[]; showMarks: boolean }) {
  const top = G.rows[0]! - RY;
  const bottom = G.rows[3]! + RY;
  return (
    <>
      {/* Strands joined at the top */}
      <path className="cord" d={`M ${G.leftX} ${top} C ${G.leftX} 22, ${G.rightX} 22, ${G.rightX} ${top}`} />
      <circle className="seed-shell" cx={(G.leftX + G.rightX) / 2} cy={28} r={5} />
      {[G.leftX, G.rightX].map((x) => (
        <g key={x}>
          <line className="cord" x1={x} y1={top} x2={x} y2={bottom + 14} />
          <circle className="seed-shell" cx={x} cy={bottom + 18} r={4} />
        </g>
      ))}
      {cells.map((cell, i) => {
        const { x, y } = positionPoint(G, i);
        return <Seed key={i} cell={cell} x={x} y={y} />;
      })}
      {showMarks &&
        cells.map((cell, i) => {
          if (cell === 0) return null;
          const { x, y } = positionPoint(G, i);
          const lx = i < 4 ? x + RX + 8 : x - RX - 8;
          return (
            <text key={`m${i}`} className="mark-label" x={lx} y={y + 5} textAnchor={i < 4 ? 'start' : 'end'}>
              {cell === 1 ? 'I' : 'II'}
            </text>
          );
        })}
    </>
  );
}

export type OpeleProps = Omit<SignFrameProps, 'mode' | 'children'> & { showMarks?: boolean };

export function Opele({ showMarks = false, ...props }: OpeleProps) {
  return (
    <SignFrame mode="opele" {...props}>
      <OpeleArt cells={props.cells} showMarks={showMarks} />
    </SignFrame>
  );
}
