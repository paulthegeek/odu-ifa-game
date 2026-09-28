import { useState } from 'react';
import { useApp } from '../app/AppContext';
import { OduName, Yo } from '../components/OduName';
import { ScreenTitle } from '../components/ScreenTitle';
import { Sign } from '../components/Sign';
import { PRINCIPAL_ODU } from '../data/odu';
import { ALL_ODU, MEJI_ODU, searchOdu, signText, type Odu } from '../logic/odu';

function OduGrid({ items }: { items: readonly Odu[] }) {
  const { settings, openStudy } = useApp();
  if (items.length === 0) return <p className="muted">No Odù match.</p>;
  return (
    <ul className="odu-list">
      {items.map((o) => (
        <li key={o.id}>
          <button type="button" onClick={() => openStudy(o.id)}>
            <Sign mode={settings.mode} cells={o.marks} size="small" decorative />
            <strong>
              <span className="visually-hidden">Study </span>
              <OduName id={o.id} />
            </strong>
            <span className="sign-text muted" aria-hidden="true">
              {signText(o.marks)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function OduReference({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<'meji' | 'all'>('meji');
  const [rightLeg, setRightLeg] = useState('');
  const [query, setQuery] = useState('');

  const filtered = searchOdu(query, rightLeg ? ALL_ODU.filter((o) => o.right.id === rightLeg) : ALL_ODU);

  return (
    <div className="stack">
      <ScreenTitle>Odù reference</ScreenTitle>
      <p className="muted">Choose an Odù to open its study card.</p>

      <fieldset>
        <legend>Show</legend>
        <div className="choice-group">
          <label className="choice">
            <input type="radio" name="refview" checked={view === 'meji'} onChange={() => setView('meji')} />
            <span className="choice-label">16 principal Odù</span>
          </label>
          <label className="choice">
            <input type="radio" name="refview" checked={view === 'all'} onChange={() => setView('all')} />
            <span className="choice-label">All 256</span>
          </label>
        </div>
      </fieldset>

      {view === 'meji' ? (
        <OduGrid items={MEJI_ODU} />
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
          <OduGrid items={filtered} />
        </>
      )}

      <button type="button" className="btn btn-primary" onClick={onBack}>
        Back
      </button>
    </div>
  );
}
