/** Line chart of round scores over time, for one settings combination. */
import type { ReactNode } from 'react';
import type { RoundRecord } from '../../logic/progress';
import { ChartFrame } from './ChartFrame';

const W = 600;
const H = 240;
const PAD = { top: 20, right: 24, bottom: 34, left: 40 };

const fmtDate = (ts: number) =>
  new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export function scoreSummary(rounds: readonly RoundRecord[]): string {
  if (rounds.length === 0) return 'No timed rounds with these settings yet.';
  if (rounds.length === 1) return `One round so far, scoring ${rounds[0]!.score}.`;
  const first = rounds[0]!.score;
  const last = rounds[rounds.length - 1]!.score;
  const best = Math.max(...rounds.map((r) => r.score));
  const trend =
    last > first
      ? `Scores rose from ${first} to ${last}`
      : last < first
        ? `Scores fell from ${first} to ${last}`
        : `Scores held at ${last}`;
  return `${trend} over your last ${rounds.length} rounds. Best: ${best}.`;
}

export function ScoreChart({ rounds, controls }: { rounds: readonly RoundRecord[]; controls?: ReactNode }) {
  const maxY = Math.max(5, ...rounds.map((r) => r.score));
  const niceMax = Math.ceil(maxY / 5) * 5;
  const iw = W - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (rounds.length <= 1 ? iw / 2 : (i / (rounds.length - 1)) * iw);
  const y = (v: number) => PAD.top + ih - (v / niceMax) * ih;
  const ticks = [0, niceMax / 5, (2 * niceMax) / 5, (3 * niceMax) / 5, (4 * niceMax) / 5, niceMax].map(
    Math.round,
  );
  const path = rounds.map((r, i) => `${i ? 'L' : 'M'} ${x(i).toFixed(1)} ${y(r.score).toFixed(1)}`).join(' ');
  const bestIndex = rounds.reduce((b, r, i) => (r.score > rounds[b]!.score ? i : b), 0);
  const labelEvery = Math.max(1, Math.ceil(rounds.length / 6));

  const chart =
    rounds.length === 0 ? (
      <p className="muted">Play a timed round with these settings to see your scores here.</p>
    ) : (
      <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={scoreSummary(rounds)}>
        {ticks.map((t) => (
          <g key={t}>
            <line className="chart-grid-line" x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} />
            <text className="chart-axis-text" x={PAD.left - 8} y={y(t) + 4} textAnchor="end">
              {t}
            </text>
          </g>
        ))}
        {rounds.map((r, i) =>
          i % labelEvery === 0 || i === rounds.length - 1 ? (
            <text key={r.id} className="chart-axis-text" x={x(i)} y={H - 10} textAnchor="middle">
              {fmtDate(r.ts)}
            </text>
          ) : null,
        )}
        <path className="chart-line" d={path} />
        {rounds.map((r, i) => (
          <g key={r.id}>
            <circle className="chart-dot" cx={x(i)} cy={y(r.score)} r={5}>
              <title>{`${fmtDate(r.ts)}: ${r.score} correct of ${r.attempted}`}</title>
            </circle>
            {/* Invisible, larger hover target */}
            <circle cx={x(i)} cy={y(r.score)} r={14} fill="transparent">
              <title>{`${fmtDate(r.ts)}: ${r.score} correct of ${r.attempted}`}</title>
            </circle>
          </g>
        ))}
        {/* Selective direct labels: latest and best only */}
        <text
          className="chart-value"
          x={x(rounds.length - 1)}
          y={y(rounds[rounds.length - 1]!.score) - 10}
          textAnchor="middle"
        >
          {rounds[rounds.length - 1]!.score}
        </text>
        {bestIndex !== rounds.length - 1 && (
          <text
            className="chart-value"
            x={x(bestIndex)}
            y={y(rounds[bestIndex]!.score) - 10}
            textAnchor="middle"
          >
            {`best ${rounds[bestIndex]!.score}`}
          </text>
        )}
      </svg>
    );

  const table = (
    <table className="data-table">
      <caption className="sr-only">Round scores</caption>
      <thead>
        <tr>
          <th scope="col">Date</th>
          <th scope="col">Score</th>
          <th scope="col">Attempted</th>
        </tr>
      </thead>
      <tbody>
        {rounds.map((r) => (
          <tr key={r.id}>
            <td>{new Date(r.ts).toLocaleString()}</td>
            <td>{r.score}</td>
            <td>{r.attempted}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <ChartFrame
      title="Score over time"
      summary={scoreSummary(rounds)}
      chart={chart}
      table={table}
      controls={controls}
    />
  );
}
