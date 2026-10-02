import { useId, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { button, card } from '../ui';

/** Bordered data table, the accessible alternative to each chart. */
export const dataTable =
  'w-full border-collapse text-[0.9rem] [&_:is(th,td)]:border [&_:is(th,td)]:border-border [&_:is(th,td)]:px-2 [&_:is(th,td)]:py-[0.3rem] [&_:is(th,td)]:text-left [&_thead_th]:bg-surface-2';

/** The SVG chart itself: full width, scaling with its viewBox. */
export const chartSvg = 'block h-auto w-full';

/**
 * Wraps a chart with a heading, a one-sentence summary for screen readers
 * (also visible), and a "Show as table" toggle.
 */
export function ChartFrame({
  title,
  summary,
  chart,
  table,
  controls,
}: {
  title: ReactNode;
  summary: string;
  chart: ReactNode;
  table: ReactNode;
  controls?: ReactNode;
}) {
  const [asTable, setAsTable] = useState(false);
  const summaryId = useId();
  return (
    <section className={cn(card({ nested: true }), 'grid gap-2')} aria-describedby={summaryId}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="m-0">{title}</h3>
        <button
          type="button"
          className={button()}
          aria-pressed={asTable}
          onClick={() => setAsTable((v) => !v)}
        >
          {asTable ? 'Show as chart' : 'Show as table'}
        </button>
      </div>
      {controls}
      <p id={summaryId} className="m-0 text-muted">
        {summary}
      </p>
      {asTable ? <div className="max-w-full overflow-x-auto">{table}</div> : chart}
    </section>
  );
}

export const pct = (x: number) => `${Math.round(x * 100)}%`;
