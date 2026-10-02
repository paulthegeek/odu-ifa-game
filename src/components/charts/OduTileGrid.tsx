/** 16 tiles for the principal Odù (Méjì), in order of seniority, with accuracy and attempts. */
import type { ReactNode } from 'react';
import { useApp } from '../../app/AppContext';
import type { OduStat } from '../../logic/progress';
import { MEJI_ODU } from '../../logic/odu';
import { OduName } from '../OduName';
import { cn } from '../../lib/cn';
import { ChartFrame, dataTable, pct } from './ChartFrame';

function Meter({ value }: { value: number }) {
  return (
    <svg className="block h-[8px] w-full" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true">
      <rect className="meter-track" x={0.5} y={0.5} width={99} height={7} rx={3} />
      <rect className="meter-fill" x={0.5} y={0.5} width={Math.max(0, value * 99)} height={7} rx={3} />
    </svg>
  );
}

export function OduTileGrid({
  stats,
  controls,
}: {
  stats: ReadonlyMap<string, OduStat>;
  controls?: ReactNode;
}) {
  const { openStudy } = useApp();
  const practiced = MEJI_ODU.filter((o) => (stats.get(o.id)?.attempts ?? 0) > 0);
  const summary =
    practiced.length === 0
      ? 'You have not practiced any of the 16 Méjì with these filters yet.'
      : `You have practiced ${practiced.length} of the 16 Méjì.`;

  const chart = (
    <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-2 p-0">
      {MEJI_ODU.map((o) => {
        const s = stats.get(o.id);
        const has = !!s && s.attempts > 0;
        return (
          <li key={o.id}>
            <button
              type="button"
              className={cn(
                'grid w-full cursor-pointer gap-[0.15rem] rounded-[14px] border border-line bg-surface px-3 py-[0.6rem] text-left text-fg',
                has ? 'hover:border-accent' : 'border-dashed border-border',
              )}
              onClick={() => openStudy(o.id)}
            >
              <strong>
                <OduName id={o.id} />
              </strong>
              {has ? (
                <>
                  <span className="text-[1.2rem] font-bold">{pct(s.accuracy)}</span>
                  <Meter value={s.accuracy} />
                  <span className="text-muted">
                    {s.attempts} {s.attempts === 1 ? 'attempt' : 'attempts'}
                  </span>
                </>
              ) : (
                <span className="text-muted">Not yet practiced</span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );

  const table = (
    <table className={dataTable}>
      <caption className="sr-only">Accuracy for the 16 Méjì</caption>
      <thead>
        <tr>
          <th scope="col">Odù</th>
          <th scope="col">Accuracy</th>
          <th scope="col">Attempts</th>
        </tr>
      </thead>
      <tbody>
        {MEJI_ODU.map((o) => {
          const s = stats.get(o.id);
          return (
            <tr key={o.id}>
              <th scope="row">
                <OduName id={o.id} />
              </th>
              <td>{s?.attempts ? pct(s.accuracy) : 'Not yet practiced'}</td>
              <td>{s?.attempts ?? 0}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <ChartFrame title="Accuracy: 16 Méjì" summary={summary} chart={chart} table={table} controls={controls} />
  );
}
