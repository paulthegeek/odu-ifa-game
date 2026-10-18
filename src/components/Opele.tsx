/**
 * Opẹ̀lẹ̀ drawing: two strands of four half-pods joined at the top.
 * Open seed (concave inner side up) is a pale hollow cup inside a rim, with the
 * pod's ridge running down the middle of the hollow; closed seed (convex shell up)
 * is a plain dark dome with only a soft highlight.
 * The two states differ in shape and shading, not only color.
 */
import { OPELE_MAPPING } from '../data/config';
import type { Cell } from '../logic/build';
import { OPELE_GEOMETRY as G, positionPoint } from './signGeometry';
import { SignFrame, type SignFrameProps } from './SignFrame';

const RX = 17;
const RY = 22;

function OpenSeed({ x, y }: { x: number; y: number }) {
  const hx = RX - 5;
  const hy = RY - 5;
  const cy = y + 1;
  return (
    <g data-seed="open">
      <ellipse className="seed-rim" cx={x} cy={y} rx={RX} ry={RY} />
      <ellipse className="seed-inner" cx={x} cy={cy} rx={hx} ry={hy} />
      <path
        className="seed-shadow"
        d={`M ${x - hx} ${cy} A ${hx} ${hy} 0 0 1 ${x + hx} ${cy} A ${hx} ${hy - 5} 0 0 0 ${x - hx} ${cy} Z`}
      />
      <path
        className="seed-ridge"
        d={`M ${x} ${y - 9} Q ${x + 4} ${y + 3} ${x} ${y + 14} Q ${x - 4} ${y + 3} ${x} ${y - 9} Z`}
      />
    </g>
  );
}

function ClosedSeed({ x, y }: { x: number; y: number }) {
  return (
    <g data-seed="closed">
      <ellipse className="seed-shell" cx={x} cy={y} rx={RX} ry={RY} />
      <path className="seed-shine" d={`M ${x - 12} ${y + 1.5} A 12 17 0 0 1 ${x - 3.1} ${y - 16.4}`} />
    </g>
  );
}

function EmptySlot({ x, y }: { x: number; y: number }) {
  return <ellipse className="slot-empty" data-seed="empty" cx={x} cy={y} rx={RX} ry={RY} />;
}

export function Seed({ cell, x, y }: { cell: Cell; x: number; y: number }) {
  if (cell === 0) return <EmptySlot x={x} y={y} />;
  return cell === OPELE_MAPPING.open ? <OpenSeed x={x} y={y} /> : <ClosedSeed x={x} y={y} />;
}

function OpeleArt({
  cells,
  showMarks,
  labels,
  markTop,
}: {
  cells: readonly Cell[];
  showMarks: boolean;
  labels?: readonly string[];
  markTop: boolean;
}) {
  const top = G.rows[0]! - RY;
  const bottom = G.rows[3]! + RY;
  const text = labels ?? (showMarks ? cells.map((c) => (c === 1 ? 'I' : 'II')) : null);
  return (
    <>
      {/* Strands joined at the top */}
      <path className="cord" d={`M ${G.leftX} ${top} C ${G.leftX} 22, ${G.rightX} 22, ${G.rightX} ${top}`} />
      <circle className="cord-bead" cx={(G.leftX + G.rightX) / 2} cy={28} r={5} />
      {[G.leftX, G.rightX].map((x) => (
        <g key={x}>
          <line className="cord" x1={x} y1={top} x2={x} y2={bottom + 14} />
          <circle className="cord-bead" cx={x} cy={bottom + 18} r={4} />
        </g>
      ))}
      {cells.map((cell, i) => {
        const { x, y } = positionPoint(G, i);
        return <Seed key={i} cell={cell} x={x} y={y} />;
      })}
      {/* The join at the top of the chain, circled to show which way up to read. */}
      {markTop && <circle className="top-ring" cx={(G.leftX + G.rightX) / 2} cy={30} r={17} />}
      {text &&
        cells.map((cell, i) => {
          if (cell === 0 || !text[i]) return null;
          const { x, y } = positionPoint(G, i);
          const lx = i < 4 ? x + RX + 8 : x - RX - 8;
          return (
            <text key={`m${i}`} className="mark-label" x={lx} y={y + 5} textAnchor={i < 4 ? 'start' : 'end'}>
              {text[i]}
            </text>
          );
        })}
    </>
  );
}

export type OpeleProps = Omit<SignFrameProps, 'mode' | 'children'> & {
  showMarks?: boolean;
  /** Text beside each seed (index order), e.g. reading order 1–8. Overrides showMarks. */
  labels?: readonly string[];
  /** Circle the join at the top of the chain. */
  markTop?: boolean;
};

export function Opele({ showMarks = false, labels, markTop = false, ...props }: OpeleProps) {
  return (
    <SignFrame mode="opele" {...props}>
      <OpeleArt cells={props.cells} showMarks={showMarks} labels={labels} markTop={markTop} />
    </SignFrame>
  );
}
