import { useId, useState, type ReactNode } from 'react';

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
    <section className="chart-frame card" aria-describedby={summaryId}>
      <div className="chart-head">
        <h3>{title}</h3>
        <button type="button" className="btn" aria-pressed={asTable} onClick={() => setAsTable((v) => !v)}>
          {asTable ? 'Show as chart' : 'Show as table'}
        </button>
      </div>
      {controls}
      <p id={summaryId} className="muted" style={{ margin: 0 }}>
        {summary}
      </p>
      {asTable ? <div className="data-table-wrap">{table}</div> : chart}
    </section>
  );
}

export const pct = (x: number) => `${Math.round(x * 100)}%`;
