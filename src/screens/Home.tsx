/**
 * Home (practice): pick a mode, Read or Build and an Odù set, then the one Start
 * button begins the round. Every choice uses the quiet (outlined) style so only
 * Start looks like it does something.
 *
 * Wide screens also show round length here. Phones leave it to Settings (Rounds)
 * to keep Start above the tab bar; the Start button always shows the length.
 * Display options live in Settings on every screen size.
 */
import { useId } from 'react';
import { useApp } from '../app/AppContext';
import { useMediaQuery, WIDE_QUERY } from '../app/useMediaQuery';
import { Choices } from '../components/Choices';
import { Icon } from '../components/Icon';
import { ScreenTitle } from '../components/ScreenTitle';
import { Sign } from '../components/Sign';
import { ROUND_LENGTHS, WEAK_SET_MIN_ANSWERS } from '../data/config';
import { roundDuration, type Direction, type Mode } from '../logic/game';
import { getOdu } from '../logic/odu';
import type { Settings } from '../logic/storage';
import { cn } from '../lib/cn';

const MODE_NAME: Record<Mode, string> = { opon: 'Ọpọ́n Ifá', opele: 'Opẹ̀lẹ̀' };
const MODE_CAPTION: Record<Mode, string> = {
  opon: 'Marks in ìyẹ̀rọ̀sùn on the tray',
  opele: 'The divining chain',
};
const SET_SHORT: Record<Settings['set'], string> = { meji: '16 Méjì', all: 'All 256', weak: 'My weak Odù' };
const DIRECTION_NAME: Record<Direction, string> = { read: 'Read', build: 'Build' };
const minutesText = (seconds: number) => (seconds === 60 ? '1 minute' : `${seconds / 60} minutes`);

/** On short phones, labels and details stay for screen readers only, so Start fits above the tab bar. */
const SHORT_HIDDEN = '@max-wide/app:short:sr-only';

/** A sample sign for the stage. */
const STAGE_SIGN = getOdu('obara_obara').marks;

/** The one button that starts a round; its second line sums up the round. */
function StartButton({ summary, onClick }: { summary: string; onClick: () => void }) {
  const id = useId();
  return (
    <button
      type="button"
      className={cn(
        'mb-[4px] flex min-h-16 w-full cursor-pointer items-center justify-center gap-3 rounded-full border-2 border-accent bg-accent px-6 py-2 text-on-accent shadow-edge-accent',
        'motion-safe:transition-[background-color,color] motion-safe:duration-120 motion-safe:ease-[ease] motion-safe:active:translate-y-[2px] motion-safe:active:shadow-pressed-accent',
        '@wide/app:min-h-[4.75rem]',
      )}
      aria-labelledby={`${id}-t`}
      aria-describedby={`${id}-d`}
      onClick={onClick}
    >
      <span className="grid size-9 flex-none place-items-center rounded-full bg-on-accent text-accent @wide/app:size-10">
        <Icon name="play" className="size-4" />
      </span>
      <span className="text-left">
        <span id={`${id}-t`} className="block text-[1.2rem] leading-tight font-bold @wide/app:text-[1.3rem]">
          Start round
        </span>
        <span id={`${id}-d`} className="block text-[0.85rem] font-medium">
          {summary}
        </span>
      </span>
    </button>
  );
}

export function Home({
  answerCount,
  onStart,
}: {
  answerCount: number;
  onStart: (direction: Direction) => void;
}) {
  const { settings: s, updateSettings } = useApp();
  const wide = useMediaQuery(WIDE_QUERY);
  const weakReady = answerCount >= WEAK_SET_MIN_ANSWERS;
  const set = s.set === 'weak' && !weakReady ? 'meji' : s.set;
  // Lengths are shown as the time a round really lasts, so Extended time reads 2 or 4 minutes.
  const duration = (length: Settings['length']) => roundDuration({ ...s, set, length });
  const current = duration(s.length);

  return (
    <div className="grid gap-3 @wide/app:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] @wide/app:grid-rows-[auto_1fr] @wide/app:gap-x-9 @wide/app:gap-y-5 @wide/app:[grid-template-areas:'stage_intro'_'stage_actions']">
      {/* On phones the stage says it all; the intro stays for screen readers. */}
      <div className="@max-wide/app:sr-only @wide/app:pt-2 @wide/app:[grid-area:intro]">
        <ScreenTitle className="m-0">Start a round</ScreenTitle>
        <p className="mt-2 mb-0 text-muted">Pick a mode, choose what to practise, then press Start.</p>
      </div>

      {/* Phones get a compact stage (small sign beside its name) so Start stays above the tab bar. */}
      <section
        className="flex flex-col items-center gap-2 rounded-stage border border-card-border bg-stage px-3 pt-3 pb-2 @wide/app:justify-center @wide/app:gap-5 @wide/app:self-start @wide/app:p-6 @wide/app:[grid-area:stage] short:gap-1 short:pt-2 short:pb-1"
        aria-label="Mode"
      >
        <Choices
          variant="segmented"
          quiet
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
        <div className="flex w-full items-center gap-4 px-2 @wide/app:flex-col @wide/app:gap-5 @wide/app:px-0">
          {/* A fixed square slot, so switching modes never changes the stage height (and
              moves nothing below it). The tray fills it; the 2:3 chain at 65% width fits inside. */}
          <div className="grid size-24 flex-none place-items-center @wide/app:aspect-square @wide/app:h-auto @wide/app:w-full @wide/app:max-w-[26rem] @max-wide/app:short:size-16">
            <Sign
              mode={s.mode}
              cells={STAGE_SIGN}
              size="large"
              showMarks={s.showMarks}
              decorative
              className={
                s.mode === 'opele'
                  ? '[--sign-width:65%] large:[--sign-width:65%]'
                  : '[--sign-width:100%] large:[--sign-width:100%]'
              }
            />
          </div>
          {/* Both modes' text share one cell, the other kept invisible, so the stage is as tall
              as the taller of the two and switching modes moves nothing below it. */}
          <div className="grid min-w-0 *:[grid-area:1/1] @wide/app:text-center">
            {(['opon', 'opele'] as const).map((m) => (
              <div key={m} className={cn('self-center', m !== s.mode && 'invisible')}>
                <p
                  className="m-0 font-serif text-[1.6rem] leading-[1.3] font-semibold @wide/app:text-[2.1rem] short:text-[1.35rem]"
                  lang="yo"
                >
                  {MODE_NAME[m]}
                </p>
                <p className="m-0 text-[0.9rem] text-muted">{MODE_CAPTION[m]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-3 @wide/app:content-start @wide/app:gap-5 @wide/app:[grid-area:actions]">
        <Choices
          variant="segmented"
          quiet
          legend="Practice"
          legendClassName={cn('mb-1', SHORT_HIDDEN)}
          name="direction"
          value={s.direction}
          onChange={(direction) => updateSettings({ direction })}
          options={[
            {
              value: 'read',
              label: 'Read',
              detail: <span className={SHORT_HIDDEN}>See a sign, name it</span>,
              icon: 'eye',
            },
            {
              value: 'build',
              label: 'Build',
              detail: <span className={SHORT_HIDDEN}>See a name, mark it</span>,
              icon: 'pen',
            },
          ]}
        />
        {/* Phones set the length in Settings; untimed rounds have none. */}
        {wide && current !== null && (
          <Choices
            variant="segmented"
            quiet
            legend="Round length"
            legendClassName="mb-1"
            name="length"
            value={s.length}
            onChange={(length) => updateSettings({ length })}
            options={ROUND_LENGTHS.map((l) => ({ value: l, label: minutesText(duration(l)!) }))}
          />
        )}
        <Choices
          variant="segmented"
          quiet
          // Three options share a phone's width, so their titles are a touch smaller.
          className="@max-wide/app:[&_label]:text-[0.95rem]"
          legend="Odù set"
          legendClassName={cn('mb-1', SHORT_HIDDEN)}
          name="set"
          value={set}
          onChange={(v) => updateSettings({ set: v })}
          options={[
            {
              value: 'meji',
              label: wide ? '16 Méjì only' : '16 Méjì',
              detail: <span className={SHORT_HIDDEN}>Beginner</span>,
            },
            {
              value: 'all',
              label: 'All 256',
              detail: <span className={SHORT_HIDDEN}>Every Odù</span>,
            },
            {
              value: 'weak',
              label: wide ? 'My weak Odù' : 'Weak Odù',
              detail: (
                <span className={SHORT_HIDDEN}>
                  {weakReady ? 'Ones Missed' : `After ${WEAK_SET_MIN_ANSWERS} answers`}
                </span>
              ),
              disabled: !weakReady,
              describedBy: weakReady ? undefined : 'weak-hint',
            },
          ]}
          hint={
            !weakReady && (
              <p className="sr-only" id="weak-hint">
                “My weak Odù” opens after {WEAK_SET_MIN_ANSWERS} recorded answers, so there’s enough data to
                find your weak spots. You have {answerCount} so far.
              </p>
            )
          }
        />

        <StartButton
          summary={`${DIRECTION_NAME[s.direction]} · ${SET_SHORT[set]} · ${current === null ? 'Untimed' : minutesText(current)}`}
          onClick={() => onStart(s.direction)}
        />
      </div>
    </div>
  );
}
