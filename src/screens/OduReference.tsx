import { useState } from 'react';
import { useApp } from '../app/AppContext';
import { Choices } from '../components/Choices';
import { OduName, Yo } from '../components/OduName';
import { PageHead } from '../components/PageHead';
import { Sign } from '../components/Sign';
import { PRINCIPAL_ODU } from '../data/odu';
import type { Mode } from '../logic/game';
import { ALL_ODU, MEJI_ODU, searchOdu, type Odu } from '../logic/odu';
import { filterLabel, filters, oduButton, oduList, page } from '../components/ui';

function OduGrid({ items, mode }: { items: readonly Odu[]; mode: Mode }) {
  const { openStudy } = useApp();
  if (items.length === 0) return <p className="text-muted">No Odù match.</p>;
  return (
    <ul className={oduList}>
      {items.map((o) => (
        <li key={o.id}>
          <button type="button" className={oduButton()} onClick={() => openStudy(o.id, { mode })}>
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
    <div className={page}>
      <PageHead title="Odù reference">Choose an Odù to open its study card.</PageHead>

      <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
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
          <div className={filters}>
            <label className={filterLabel}>
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
            <label className={filterLabel}>
              Search
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
          </div>
          <p className="text-muted" aria-live="polite">
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
