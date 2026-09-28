/**
 * Ọpọ́n Ifá drawing: a round tray with a carved border (left uncarved at the
 * top as the orientation marker), with marks drawn in ìyẹ̀rọ̀sùn.
 * Single mark = one vertical stroke; double mark = two parallel strokes.
 */
import type { Cell } from '../logic/build';
import { OPON_GEOMETRY as G, positionPoint } from './signGeometry';
import { SignFrame, type SignFrameProps } from './SignFrame';

const C = 150;
const OUTER = 146;
const INNER = 116;
const HALF = 12;

export function TrayMark({ cell, x, y }: { cell: Cell; x: number; y: number }) {
  if (cell === 0) {
    return (
      <rect className="slot-empty" x={x - 16} y={y - HALF - 2} width={32} height={HALF * 2 + 4} rx={5} />
    );
  }
  if (cell === 1) return <line className="tray-mark" x1={x} y1={y - HALF} x2={x} y2={y + HALF} />;
  return (
    <g>
      <line className="tray-mark" x1={x - 7} y1={y - HALF} x2={x - 7} y2={y + HALF} />
      <line className="tray-mark" x1={x + 7} y1={y - HALF} x2={x + 7} y2={y + HALF} />
    </g>
  );
}

/** Radial notches around the border, leaving the top uncarved. */
function Carving() {
  const notches = [];
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2 - Math.PI / 2;
    if (i <= 2 || i >= 46) continue;
    const r1 = INNER + 6;
    const r2 = OUTER - 6;
    notches.push(
      <line
        key={i}
        className="tray-carving"
        x1={C + Math.cos(a) * r1}
        y1={C + Math.sin(a) * r1}
        x2={C + Math.cos(a) * r2}
        y2={C + Math.sin(a) * r2}
      />,
    );
  }
  return <>{notches}</>;
}

function OponArt({ cells }: { cells: readonly Cell[] }) {
  return (
    <>
      <circle className="tray-rim" cx={C} cy={C} r={OUTER} />
      <Carving />
      <circle className="tray-powder" cx={C} cy={C} r={INNER} />
      <circle className="tray-inner-edge" cx={C} cy={C} r={INNER} />
      {cells.map((cell, i) => {
        const { x, y } = positionPoint(G, i);
        return <TrayMark key={i} cell={cell} x={x} y={y} />;
      })}
    </>
  );
}

export type OponIfaProps = Omit<SignFrameProps, 'mode' | 'children'>;

export function OponIfa(props: OponIfaProps) {
  return (
    <SignFrame mode="opon" {...props}>
      <OponArt cells={props.cells} />
    </SignFrame>
  );
}
