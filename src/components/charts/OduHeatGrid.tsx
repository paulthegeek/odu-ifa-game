/**
 * 16 × 16 accuracy grid: right leg as rows, left leg as columns.
 * Accuracy is shown by shade AND pattern (never color alone); cells with no
 * attempts are dashed outlines. Rows/columns are numbered by seniority, with a key.
 */
import { useId, type ReactNode } from 'react';
import { PRINCIPAL_ODU } from '../../data/odu';
import type { OduStat } from '../../logic/progress';
import { oduId } from '../../logic/odu';
import { OduName, Yo } from '../OduName';
import { ChartFrame, pct } from './ChartFrame';

const CELL = 22;
const GAP = 2;
const LABEL = 26;
const SIZE = LABEL + 16 * (CELL + GAP);

type Band = 'none' | 'low' | 'mid' | 'high';
const band = (s: OduStat | undefined): Band =>
  !s || s.attempts === 0 ? 'none' : s.accuracy < 0.5 ? 'low' : s.accuracy < 0.8 ? 'mid' : 'high';

const BAND_TEXT: Record<Band, string> = {
  none: 'Not yet practiced',
  low: 'Below 50%',
  mid: '50–79%',
  high: '80% and above',
};

function Cell({ b, x, y, patternId }: { b: Band; x: number; y: number; patternId: string }) {
  if (b === 'none')
    return (
      <rect className="heat-cell-empty" x={x + 0.5} y={y + 0.5} width={CELL - 1} height={CELL - 1} rx={3} />
    );
  const opacity = b === 'low' ? 0.3 : b === 'mid' ? 0.6 : 1;
  return (
    <g>
      <rect
        className="heat-cell"
        x={x}
        y={y}
        width={CELL}
        height={CELL}
        rx={3}
        style={{ fill: 'var(--heat)', opacity }}
      />
      {b === 'low' && <rect x={x} y={y} width={CELL} height={CELL} rx={3} fill={`url(#${patternId}-low)`} />}
      {b === 'mid' && <rect x={x} y={y} width={CELL} height={CELL} rx={3} fill={`url(#${patternId}-mid)`} />}
    </g>
  );
}

function Swatch({ b, patternId }: { b: Band; patternId: string }) {
  return (
    <svg width={CELL} height={CELL} viewBox={`0 0 ${CELL} ${CELL}`} aria-hidden="true">
      <Cell b={b} x={0} y={0} patternId={patternId} />
    </svg>
  );
}

function Patterns({ id }: { id: string }) {
  return (
    <defs>
      {/* Low: diagonal hatching */}
      <pattern
        id={`${id}-low`}
        width={6}
        height={6}
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line className="heat-hatch" x1={0} y1={0} x2={0} y2={6} />
      </pattern>
      {/* Mid: dots */}
      <pattern id={`${id}-mid`} width={6} height={6} patternUnits="userSpaceOnUse">
        <circle cx={3} cy={3} r={1.2} style={{ fill: 'var(--surface)' }} />
      </pattern>
    </defs>
  );
}

export function OduHeatGrid({
  stats,
  controls,
}: {
  stats: ReadonlyMap<string, OduStat>;
  controls?: ReactNode;
}) {
  const pid = useId().replace(/:/g, '');
  let practiced = 0;
  let strong = 0;
  for (const s of stats.values()) {
    if (s.attempts > 0) practiced++;
    if (s.attempts > 0 && s.accuracy >= 0.8) strong++;
  }
  const summary =
    practiced === 0
      ? 'You have not practiced any of the 256 Odù with these filters yet.'
      : `You have practiced ${practiced} of 256 Odù; ${strong} are at 80% accuracy or above.`;

  const chart = (
    <div className="stack">
      <svg
        className="chart-svg"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ maxWidth: '34rem' }}
        role="img"
        aria-label={summary}
      >
        <Patterns id={pid} />
        {PRINCIPAL_ODU.map((p, i) => (
          <g key={p.id}>
            <text
              className="chart-axis-text"
              x={LABEL + i * (CELL + GAP) + CELL / 2}
              y={LABEL - 8}
              textAnchor="middle"
            >
              {i + 1}
            </text>
            <text
              className="chart-axis-text"
              x={LABEL - 6}
              y={LABEL + i * (CELL + GAP) + CELL / 2 + 4}
              textAnchor="end"
            >
              {i + 1}
            </text>
          </g>
        ))}
        {PRINCIPAL_ODU.map((r, ri) =>
          PRINCIPAL_ODU.map((l, li) => {
            const s = stats.get(oduId(r.id, l.id));
            const b = band(s);
            return (
              <g key={`${r.id}-${l.id}`}>
                <Cell b={b} x={LABEL + li * (CELL + GAP)} y={LABEL + ri * (CELL + GAP)} patternId={pid} />
                <title>{`Right ${r.name}, left ${l.name}: ${s?.attempts ? `${pct(s.accuracy)} of ${s.attempts}` : 'not yet practiced'}`}</title>
              </g>
            );
          }),
        )}
      </svg>
      <ul className="heat-legend" aria-label="Legend">
        {(['none', 'low', 'mid', 'high'] as const).map((b) => (
          <li key={b}>
            <Swatch b={b} patternId={pid} />
            {BAND_TEXT[b]}
          </li>
        ))}
      </ul>
      <details>
        <summary>Key: rows are the right leg, columns the left leg</summary>
        <ol className="heat-key list-decimal">
          {PRINCIPAL_ODU.map((p) => (
            <li key={p.id}>
              <Yo>{p.name}</Yo>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );

  const practicedRows = PRINCIPAL_ODU.flatMap((r) =>
    PRINCIPAL_ODU.map((l) => ({ id: oduId(r.id, l.id), s: stats.get(oduId(r.id, l.id)) })),
  ).filter((x) => x.s && x.s.attempts > 0);

  const table = (
    <table className="data-table">
      <caption className="sr-only">Accuracy for all practiced Odù</caption>
      <thead>
        <tr>
          <th scope="col">Odù</th>
          <th scope="col">Accuracy</th>
          <th scope="col">Attempts</th>
        </tr>
      </thead>
      <tbody>
        {practicedRows.length === 0 ? (
          <tr>
            <td colSpan={3}>Not yet practiced</td>
          </tr>
        ) : (
          practicedRows.map(({ id, s }) => (
            <tr key={id}>
              <th scope="row">
                <OduName id={id} />
              </th>
              <td>{pct(s!.accuracy)}</td>
              <td>{s!.attempts}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  return (
    <ChartFrame
      title="Accuracy: all 256 Odù"
      summary={summary}
      chart={chart}
      table={table}
      controls={controls}
    />
  );
}
