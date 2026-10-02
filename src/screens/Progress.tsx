import { useMemo, useRef, useState } from 'react';
import { useApp } from '../app/AppContext';
import { OduHeatGrid } from '../components/charts/OduHeatGrid';
import { OduTileGrid } from '../components/charts/OduTileGrid';
import { ScoreChart } from '../components/charts/ScoreChart';
import { pct } from '../components/charts/ChartFrame';
import { OduName } from '../components/OduName';
import { ScreenTitle } from '../components/ScreenTitle';
import type { Direction, Mode } from '../logic/game';
import {
  mixUps,
  oduStats,
  overview,
  scoreSeries,
  seriesKeys,
  totalAnswers,
  weakestOdu,
  type ProgressData,
  type StatsFilter,
} from '../logic/progress';
import { exportProgress, parseImport } from '../logic/progressStore';
import { WEAKEST_MIN_ATTEMPTS } from '../data/config';

const MODE_TEXT: Record<string, string> = { opele: 'Opẹ̀lẹ̀', opon: 'Ọpọ́n Ifá' };
const DIR_TEXT: Record<string, string> = { read: 'Read', build: 'Build' };
const SET_TEXT: Record<string, string> = { meji: '16 Méjì', all: 'All 256', weak: 'My weak Odù' };

function seriesLabel(key: string): string {
  const [mode, direction, set, length, timing] = key.split('|');
  const len = length === '60' ? '1 min' : '2 min';
  return [
    MODE_TEXT[mode!],
    DIR_TEXT[direction!],
    SET_TEXT[set!],
    len,
    timing === 'extended' ? 'extended time' : '',
  ]
    .filter(Boolean)
    .join(' · ');
}

const secs = (ms: number | null) => (ms === null ? '—' : `${(ms / 1000).toFixed(1)} s`);

function describe(d: ProgressData) {
  const n = totalAnswers(d);
  return `${d.rounds.length} ${d.rounds.length === 1 ? 'round' : 'rounds'} and ${n} ${n === 1 ? 'answer' : 'answers'}`;
}

export function Progress({
  data,
  persistent,
  onReplace,
  onReset,
}: {
  data: ProgressData;
  persistent: boolean;
  onReplace: (data: ProgressData) => Promise<void>;
  onReset: () => Promise<void>;
}) {
  const { openStudy } = useApp();
  const [now] = useState(() => Date.now());
  const [modeFilter, setModeFilter] = useState<Mode | ''>('');
  const [dirFilter, setDirFilter] = useState<Direction | ''>('');
  const keys = useMemo(() => seriesKeys(data.rounds), [data.rounds]);
  const [seriesKey, setSeriesKey] = useState<string>('');
  const activeKey = keys.includes(seriesKey) ? seriesKey : (keys[0] ?? '');
  const filter: StatsFilter = { mode: modeFilter || undefined, direction: dirFilter || undefined };
  const stats = useMemo(
    () => oduStats(data, { mode: modeFilter || undefined, direction: dirFilter || undefined }),
    [data, modeFilter, dirFilter],
  );
  const ov = overview(data, now);
  const weakest = weakestOdu(stats);
  const mix = mixUps(data, filter);

  const [message, setMessage] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);
  const [pendingImport, setPendingImport] = useState<ProgressData | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const doExport = () => {
    const blob = new Blob([exportProgress(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `odu-practice-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setMessage({ kind: 'success', text: `Exported ${describe(data)}.` });
  };

  const onFile = async (file: File | undefined) => {
    setPendingImport(null);
    if (!file) return;
    const result = parseImport(await file.text());
    if (fileRef.current) fileRef.current.value = '';
    if (!result.ok) {
      setMessage({
        kind: 'error',
        text: `Import failed: ${result.error} Your progress has not been changed.`,
      });
      return;
    }
    setMessage(null);
    setPendingImport(result.data);
  };

  const filters = (
    <div className="filters">
      <label>
        Mode
        <select value={modeFilter} onChange={(e) => setModeFilter(e.target.value as Mode | '')}>
          <option value="">Both</option>
          <option value="opele" lang="yo">
            Opẹ̀lẹ̀
          </option>
          <option value="opon" lang="yo">
            Ọpọ́n Ifá
          </option>
        </select>
      </label>
      <label>
        Direction
        <select value={dirFilter} onChange={(e) => setDirFilter(e.target.value as Direction | '')}>
          <option value="">Both</option>
          <option value="read">Read the sign</option>
          <option value="build">Build the sign</option>
        </select>
      </label>
    </div>
  );

  return (
    <div className="page">
      <header className="page-head">
        <ScreenTitle>Your progress</ScreenTitle>
        <p className="muted">Scores, accuracy and mix-ups from rounds on this device.</p>
      </header>
      {!persistent && (
        <p className="notice">
          Storage isn’t available in this browser, so progress will only last until you close this page.
        </p>
      )}

      <section aria-labelledby="ov-h">
        <h2 id="ov-h">Overview</h2>
        <dl className="stat-grid">
          <div className="stat">
            <dt>Rounds played</dt>
            <dd>{ov.rounds}</dd>
          </div>
          <div className="stat">
            <dt>Total answers</dt>
            <dd>{ov.answers}</dd>
          </div>
          <div className="stat">
            <dt>Accuracy</dt>
            <dd>{ov.accuracy === null ? '—' : pct(ov.accuracy)}</dd>
          </div>
          <div className="stat">
            <dt>Average response</dt>
            <dd>{secs(ov.avgMs)}</dd>
          </div>
          <div className="stat">
            <dt>Practice streak</dt>
            <dd>
              {ov.streak} {ov.streak === 1 ? 'day' : 'days'}
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="score-h" className="panel stack">
        <h2 id="score-h">Scores</h2>
        <ScoreChart
          rounds={activeKey ? scoreSeries(data.rounds, activeKey) : []}
          controls={
            keys.length > 0 && (
              <div className="filters">
                <label>
                  Settings
                  <select value={activeKey} onChange={(e) => setSeriesKey(e.target.value)}>
                    {keys.map((k) => (
                      <option key={k} value={k}>
                        {seriesLabel(k)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )
          }
        />
      </section>

      <section aria-labelledby="acc-h" className="panel stack">
        <h2 id="acc-h">Accuracy by Odù</h2>
        {filters}
        <OduTileGrid stats={stats} />
        <OduHeatGrid stats={stats} />
      </section>

      <section aria-labelledby="weak-h" className="panel">
        <h2 id="weak-h">Weakest Odù</h2>
        {weakest.length === 0 ? (
          <p className="muted">
            Odù appear here once you have answered them at least {WEAKEST_MIN_ATTEMPTS} times.
          </p>
        ) : (
          <ol>
            {weakest.map((s) => (
              <li key={s.oduId}>
                <button type="button" className="btn btn-link" onClick={() => openStudy(s.oduId)}>
                  <OduName id={s.oduId} />
                </button>{' '}
                — {pct(s.accuracy)} of {s.attempts}, average {secs(s.avgMs)}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="mix-h" className="panel">
        <h2 id="mix-h">Common mix-ups</h2>
        {mix.length === 0 ? (
          <p className="muted">No mix-ups recorded yet.</p>
        ) : (
          <ul>
            {mix.map((m) => (
              <li key={`${m.targetId}>${m.givenId}`}>
                You chose <OduName id={m.givenId} /> when it was <OduName id={m.targetId} /> — {m.count}{' '}
                {m.count === 1 ? 'time' : 'times'}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="data-h" className="card stack">
        <h2 id="data-h">Your data</h2>
        <p className="muted">
          Progress is stored only on this device. Export it to keep a backup or move it to another device.
        </p>
        <div className="btn-row">
          <button type="button" className="btn" onClick={doExport}>
            Export progress
          </button>
          <label className="btn">
            Import progress
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="visually-hidden"
              onChange={(e) => void onFile(e.target.files?.[0])}
            />
          </label>
          <button type="button" className="btn btn-danger" onClick={() => setConfirmReset(true)}>
            Reset progress
          </button>
        </div>

        <div aria-live="polite">
          {message && (
            <p className="message" data-kind={message.kind}>
              {message.text}
            </p>
          )}
        </div>

        {pendingImport && (
          <div className="message" role="alertdialog" aria-labelledby="imp-h" aria-describedby="imp-d">
            <h3 id="imp-h">Replace your progress?</h3>
            <p id="imp-d">
              The file has {describe(pendingImport)}. It will replace the {describe(data)} on this device.
            </p>
            <div className="btn-row">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  void onReplace(pendingImport).then(() => {
                    setPendingImport(null);
                    setMessage({ kind: 'success', text: `Imported ${describe(pendingImport)}.` });
                  });
                }}
              >
                Replace with imported file
              </button>
              <button type="button" className="btn" onClick={() => setPendingImport(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {confirmReset && (
          <div
            className="message"
            data-kind="error"
            role="alertdialog"
            aria-labelledby="rst-h"
            aria-describedby="rst-d"
          >
            <h3 id="rst-h">Delete all progress?</h3>
            <p id="rst-d">
              This permanently deletes {describe(data)}, your per-Odù totals and mix-ups, and all personal
              bests on this device. Your display and accessibility settings are kept. Consider exporting
              first.
            </p>
            <div className="btn-row">
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  void onReset().then(() => {
                    setConfirmReset(false);
                    setMessage({ kind: 'success', text: 'Progress and personal bests deleted.' });
                  });
                }}
              >
                Delete my progress
              </button>
              <button type="button" className="btn" onClick={() => setConfirmReset(false)} autoFocus>
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
