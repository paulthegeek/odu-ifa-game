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
import { button, card, eyebrow, hint, linkButton } from '../components/ui';
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
      className={cn(
        'mb-[4px] flex min-h-28 cursor-pointer flex-col items-start justify-between gap-3 rounded-card border-2 border-line bg-surface p-4 text-left text-fg shadow-edge-lg hover:bg-stage',
        'motion-safe:transition-[background-color,color] motion-safe:duration-120 motion-safe:ease-[ease] motion-safe:active:translate-y-[2px] motion-safe:active:shadow-pressed',
        primary &&
          'border-accent bg-accent text-on-accent shadow-edge-accent hover:bg-accent motion-safe:active:shadow-pressed-accent',
        '@wide/app:min-h-[5.75rem] @wide/app:flex-row @wide/app:items-center @wide/app:gap-4 @wide/app:px-[1.4rem] @wide/app:py-0',
      )}
      aria-labelledby={`${id}-t`}
      aria-describedby={`${id}-d`}
      onClick={onClick}
    >
      <Icon name={icon} className="size-[1.6rem]" />
      <span className="@wide/app:flex-1">
        <span id={`${id}-t`} className="block text-[1.2rem] font-bold">
          {title}
        </span>
        <span id={`${id}-d`} className={cn('block text-[0.875rem]', primary ? 'text-inherit' : 'text-muted')}>
          {sub}
        </span>
      </span>
      <Icon name="arrow-right" className="hidden @wide/app:block" />
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
    <div className="grid gap-5">
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
            <p className={hint} id="weak-hint">
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
          <p className={hint}>
            Timing: {TIMING_SHORT[s.timing]}.{' '}
            <button type="button" className={linkButton} onClick={onSettings}>
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
    <div className="grid gap-4 @wide/app:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] @wide/app:grid-rows-[auto_1fr] @wide/app:gap-x-9 @wide/app:gap-y-5 @wide/app:[grid-template-areas:'stage_intro'_'stage_actions']">
      {/* On phones the stage says it all; the intro stays for screen readers. */}
      <div className="@max-wide/app:sr-only @wide/app:pt-2 @wide/app:[grid-area:intro]">
        <ScreenTitle className="m-0">Start a round</ScreenTitle>
        <p className="mt-2 mb-0 text-muted">Pick a mode, then read a sign or build one.</p>
      </div>

      <section
        className="flex flex-col items-center gap-3 rounded-stage border border-card-border bg-stage px-2 pt-5 pb-3 @wide/app:justify-center @wide/app:gap-5 @wide/app:self-start @wide/app:p-6 @wide/app:[grid-area:stage]"
        aria-label="Mode"
      >
        <Choices
          variant="segmented"
          className="w-full @wide/app:w-[min(100%,20rem)]"
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
        <div className="flex w-full items-center justify-center">
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
        <div className="text-center">
          <p
            className="m-0 font-serif text-[1.85rem] leading-[1.3] font-semibold @wide/app:text-[2.1rem]"
            lang="yo"
          >
            {MODE_NAME[s.mode]}
          </p>
          <p className="m-0 text-[0.9rem] text-muted">{MODE_CAPTION[s.mode]}</p>
        </div>
      </section>

      <div className="grid gap-4 @wide/app:content-start @wide/app:gap-5 @wide/app:[grid-area:actions]">
        <div className="grid grid-cols-2 gap-3 @wide/app:grid-cols-1 @wide/app:gap-[0.9rem] large:grid-cols-1">
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
          <section className={card()} aria-labelledby={settingsId}>
            <h2 id={settingsId} className="sr-only">
              Round settings
            </h2>
            {fields}
          </section>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 rounded-ctl border border-card-border bg-stage py-[0.35rem] pr-[0.35rem] pl-4">
              <p className="m-0 text-[0.9rem]">
                <strong>{SET_SHORT[set]}</strong>
                <span className="text-muted">
                  {' '}
                  · {lengthText(s.length)} · {TIMING_SHORT[s.timing]}
                </span>
              </p>
              <button type="button" className={button({ size: 'small' })} onClick={() => setSheetOpen(true)}>
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
