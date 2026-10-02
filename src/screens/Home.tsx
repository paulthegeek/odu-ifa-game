/**
 * Home (practice): pick a mode on the stage, then Read or Build starts a round.
 * Round settings sit inline on wide screens and in an Edit sheet on phones;
 * only one copy is ever mounted, so radio names and labels stay unique.
 */
import { useId, useState } from 'react';
import { useApp } from '../app/AppContext';
import { useMediaQuery, WIDE_QUERY } from '../app/useMediaQuery';
import { Choices } from '../components/Choices';
import { Icon, type IconName } from '../components/Icon';
import { ScreenTitle } from '../components/ScreenTitle';
import { Sheet } from '../components/Sheet';
import { Sign } from '../components/Sign';
import { Switch } from '../components/Switch';
import { EXTENDED_TIME_MULTIPLIER, ROUND_LENGTHS, WEAK_SET_MIN_ANSWERS } from '../data/config';
import type { Direction, Mode } from '../logic/game';
import { getOdu } from '../logic/odu';
import type { Settings } from '../logic/storage';
import { eyebrow } from '../components/ui';
import { cn } from '../lib/cn';

const MODE_NAME: Record<Mode, string> = { opon: 'Ọpọ́n Ifá', opele: 'Opẹ̀lẹ̀' };
const MODE_CAPTION: Record<Mode, string> = {
  opon: 'Marks in ìyẹ̀rọ̀sùn on the tray',
  opele: 'The divining chain',
};
const SET_SHORT: Record<Settings['set'], string> = { meji: '16 Méjì', all: 'All 256', weak: 'My weak Odù' };
const TIMING_SHORT: Record<Settings['timing'], string> = {
  standard: 'Standard time',
  extended: `Extended time (×${EXTENDED_TIME_MULTIPLIER})`,
  untimed: 'Untimed practice',
};
const lengthText = (l: number) => (l === 60 ? '1 minute' : `${l / 60} minutes`);

/** A sample sign for the stage. */
const STAGE_SIGN = getOdu('obara_obara').marks;

function StartButton({
  primary = false,
  icon,
  title,
  sub,
  onClick,
}: {
  primary?: boolean;
  icon: IconName;
  title: string;
  sub: string;
  onClick: () => void;
}) {
  const id = useId();
  return (
    <button
      type="button"
      className="big-btn"
      data-primary={primary || undefined}
      aria-labelledby={`${id}-t`}
      aria-describedby={`${id}-d`}
      onClick={onClick}
    >
      <Icon name={icon} className="size-[1.6rem]" />
      <span className="big-btn-text">
        <span id={`${id}-t`} className="big-btn-title">
          {title}
        </span>
        <span id={`${id}-d`} className="big-btn-sub">
          {sub}
        </span>
      </span>
      <Icon name="arrow-right" className="big-btn-arrow" />
    </button>
  );
}

function RoundSettingsFields({
  set,
  weakReady,
  answerCount,
  inCard,
  onSettings,
}: {
  set: Settings['set'];
  weakReady: boolean;
  answerCount: number;
  /** In the wide-screen card rather than the phone sheet. */
  inCard: boolean;
  onSettings: () => void;
}) {
  const { settings: s, updateSettings } = useApp();
  return (
    <div className="settings-fields">
      <Choices
        legend="Odù set"
        name="set"
        value={set}
        onChange={(v) => updateSettings({ set: v })}
        options={[
          { value: 'meji', label: '16 Méjì only', detail: 'Beginner' },
          { value: 'all', label: 'All 256', detail: 'Méjì and Ọmọ Odù' },
          {
            value: 'weak',
            label: 'My weak Odù',
            detail: weakReady ? 'Weighted toward the Odù you miss' : 'Not yet available',
            disabled: !weakReady,
            describedBy: weakReady ? undefined : 'weak-hint',
          },
        ]}
        hint={
          !weakReady && (
            <p className="hint" id="weak-hint">
              “My weak Odù” opens after {WEAK_SET_MIN_ANSWERS} recorded answers, so there’s enough data to
              find your weak spots. You have {answerCount} so far.
            </p>
          )
        }
      />

      <Choices
        variant="segmented"
        legend="Round length"
        name="length"
        value={s.length}
        onChange={(length) => updateSettings({ length })}
        options={ROUND_LENGTHS.map((l) => ({ value: l, label: lengthText(l) }))}
        hint={
          <p className="hint">
            Timing: {TIMING_SHORT[s.timing]}.{' '}
            <button type="button" className="btn-link" onClick={onSettings}>
              Change in Settings
            </button>
          </p>
        }
      />

      <fieldset className="min-w-0">
        <legend className={cn(eyebrow, inCard ? 'mb-0' : 'mb-2')}>Display</legend>
        <Switch checked={s.showDiacritics} onChange={(v) => updateSettings({ showDiacritics: v })}>
          Show tone marks and underdots (e.g. <span lang="yo">Ọ̀sẹ́</span>)
        </Switch>
        {s.mode === 'opele' && (
          <Switch checked={s.showMarks} onChange={(v) => updateSettings({ showMarks: v })}>
            Show marks (I / II) beside each seed — a helper for beginners
          </Switch>
        )}
        {set === 'meji' && s.mode === 'opon' && (
          <Switch checked={s.mirrorLegs} onChange={(v) => updateSettings({ mirrorLegs: v })}>
            Mirror legs in Build — build one leg and it’s copied to the other
          </Switch>
        )}
      </fieldset>
    </div>
  );
}

export function Home({
  answerCount,
  onStart,
  onSettings,
}: {
  answerCount: number;
  onStart: (direction: Direction) => void;
  onSettings: () => void;
}) {
  const { settings: s, updateSettings } = useApp();
  const wide = useMediaQuery(WIDE_QUERY);
  const [sheetOpen, setSheetOpen] = useState(false);
  const weakReady = answerCount >= WEAK_SET_MIN_ANSWERS;
  const set = s.set === 'weak' && !weakReady ? 'meji' : s.set;
  const settingsId = useId();

  const fields = (
    <RoundSettingsFields
      set={set}
      weakReady={weakReady}
      answerCount={answerCount}
      inCard={wide}
      onSettings={() => {
        setSheetOpen(false);
        onSettings();
      }}
    />
  );

  return (
    <div className="home">
      <div className="home-intro">
        <ScreenTitle className="home-title">Start a round</ScreenTitle>
        <p className="muted home-lede">Pick a mode, then read a sign or build one.</p>
      </div>

      <section className="stage-card" aria-label="Mode">
        <Choices
          variant="segmented"
          className="mode-switch"
          legend="Mode"
          legendHidden
          name="mode"
          value={s.mode}
          onChange={(mode) => updateSettings({ mode })}
          options={[
            { value: 'opon', label: <span lang="yo">Ọpọ́n Ifá</span> },
            { value: 'opele', label: <span lang="yo">Opẹ̀lẹ̀</span> },
          ]}
        />
        <div className="stage-sign">
          <Sign
            mode={s.mode}
            cells={STAGE_SIGN}
            size="large"
            showMarks={s.showMarks}
            decorative
            className={
              s.mode === 'opele'
                ? '[--sign-width:10.5rem] @wide/app:[--sign-width:17rem]'
                : '@wide/app:[--sign-width:26rem]'
            }
          />
        </div>
        <div className="stage-text">
          <p className="stage-mode" lang="yo">
            {MODE_NAME[s.mode]}
          </p>
          <p className="stage-caption">{MODE_CAPTION[s.mode]}</p>
        </div>
      </section>

      <div className="home-actions">
        <div className="start-actions">
          <StartButton
            primary
            icon="eye"
            title="Read"
            sub="See a sign, name it"
            onClick={() => onStart('read')}
          />
          <StartButton icon="pen" title="Build" sub="See a name, mark it" onClick={() => onStart('build')} />
        </div>

        {wide ? (
          <section className="round-settings card" aria-labelledby={settingsId}>
            <h2 id={settingsId} className="sr-only">
              Round settings
            </h2>
            {fields}
          </section>
        ) : (
          <>
            <div className="settings-summary">
              <p>
                <strong>{SET_SHORT[set]}</strong>
                <span className="muted">
                  {' '}
                  · {lengthText(s.length)} · {TIMING_SHORT[s.timing]}
                </span>
              </p>
              <button type="button" className="btn btn-small" onClick={() => setSheetOpen(true)}>
                Edit<span className="sr-only"> round settings</span>
              </button>
            </div>
            <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Round settings">
              {fields}
            </Sheet>
          </>
        )}
      </div>
    </div>
  );
}
