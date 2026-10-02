import { useState } from 'react';
import { useApp } from '../app/AppContext';
import { Choices } from '../components/Choices';
import { OduName, Yo } from '../components/OduName';
import { ScreenTitle } from '../components/ScreenTitle';
import { Sign } from '../components/Sign';
import { PRINCIPAL_ODU } from '../data/odu';
import type { Mode } from '../logic/game';
import { ALL_ODU, MEJI_ODU, searchOdu, type Odu } from '../logic/odu';

function OduGrid({ items, mode }: { items: readonly Odu[]; mode: Mode }) {
  const { openStudy } = useApp();
  if (items.length === 0) return <p className="muted">No Odù match.</p>;
  return (
    <ul className="odu-list">
      {items.map((o) => (
        <li key={o.id}>
          <button type="button" onClick={() => openStudy(o.id, { mode })}>
            <Sign mode={mode} cells={o.marks} size="small" decorative />
            <strong>
              <span className="sr-only">Study </span>
              <OduName id={o.id} />
            </strong>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function OduReference() {
  const { settings } = useApp();
  // Starts from the Home mode choice each time the screen opens; never written back to settings.
  const [mode, setMode] = useState<Mode>(settings.mode);
  const [view, setView] = useState<'meji' | 'all'>('meji');
  const [rightLeg, setRightLeg] = useState('');
  const [query, setQuery] = useState('');

  const filtered = searchOdu(query, rightLeg ? ALL_ODU.filter((o) => o.right.id === rightLeg) : ALL_ODU);

  return (
    <div className="page">
      <header className="page-head">
        <ScreenTitle>Odù reference</ScreenTitle>
        <p className="muted">Choose an Odù to open its study card.</p>
      </header>

      <div className="toolbar">
        <Choices
          variant="segmented"
          legend="Draw signs as"
          name="refmode"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'opele', label: <span lang="yo">Opẹ̀lẹ̀</span> },
            { value: 'opon', label: <span lang="yo">Ọpọ́n Ifá</span> },
          ]}
        />
        <Choices
          variant="segmented"
          legend="Show"
          name="refview"
          value={view}
          onChange={setView}
          options={[
            { value: 'meji', label: '16 principal Odù' },
            { value: 'all', label: 'All 256' },
          ]}
        />
      </div>

      {view === 'meji' ? (
        <OduGrid items={MEJI_ODU} mode={mode} />
      ) : (
        <>
          <div className="filters">
            <label>
              Right leg
              <select value={rightLeg} onChange={(e) => setRightLeg(e.target.value)}>
                <option value="">All</option>
                {PRINCIPAL_ODU.map((p) => (
                  <option key={p.id} value={p.id} lang="yo">
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Search
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
          </div>
          <p className="muted" aria-live="polite">
            {filtered.length} of 256 Odù
            {rightLeg && (
              <>
                {' '}
                with right leg <Yo>{PRINCIPAL_ODU.find((p) => p.id === rightLeg)!.name}</Yo>
              </>
            )}
          </p>
          <OduGrid items={filtered} mode={mode} />
        </>
      )}
    </div>
  );
}
