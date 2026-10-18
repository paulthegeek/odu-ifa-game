/**
 * How to read a sign: a six-step lesson for first-time readers. The ọpọ́n Ifá
 * and the opẹ̀lẹ̀ each get a lesson with the same parts (tray first), and the
 * page ends with one practice question per tool.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { OPELE_MAPPING } from '../data/config';
import { PRINCIPAL_ODU } from '../data/odu';
import { LegGlyph, SeedSample, TrayMarkSample } from '../components/MarkSamples';
import { OduName, Yo } from '../components/OduName';
import { PageHead } from '../components/PageHead';
import { Sign } from '../components/Sign';
import { button, card, eyebrow, hint, notice, page } from '../components/ui';
import { markWord, seedWord, type Cell } from '../logic/build';
import type { Mode } from '../logic/game';
import { getOdu, legText, type Mark } from '../logic/odu';
import { cn } from '../lib/cn';

/** The worked example used throughout: Ọ̀sá on the right, Ìrẹtẹ̀ on the left. */
const EXAMPLE = getOdu('osa_irete');
const EMPTY: readonly Cell[] = Array<Cell>(8).fill(0);
const ORDER = ['1', '2', '3', '4', '5', '6', '7', '8'];
const asMarks = (marks: readonly Mark[]) => marks.map((m) => (m === 1 ? 'I' : 'II'));
const inWords = (pattern: readonly Mark[]) => pattern.map(markWord).join(', ');

const STEPS: { id: string; nav: ReactNode }[] = [
  { id: 'help-legs', nav: 'Two legs, four marks' },
  {
    id: 'help-opon',
    nav: (
      <>
        Reading the <Yo>ọpọ́n Ifá</Yo>
      </>
    ),
  },
  {
    id: 'help-opele',
    nav: (
      <>
        Reading the <Yo>opẹ̀lẹ̀</Yo>
      </>
    ),
  },
  { id: 'help-names', nav: 'The 16 leg names' },
  { id: 'help-order', nav: 'Right leg first' },
  { id: 'help-meji', nav: 'When both legs match' },
  { id: 'help-try', nav: 'Try two' },
];
const STEP_IDS = STEPS.map((s) => s.id);

/** Small text styles used in this screen. */
const SUB = 'grid gap-3 border-t border-line pt-4';
const TILE = 'rounded-ctl bg-surface';
const ROW_LABEL = 'w-12 flex-none text-[0.75rem] font-bold tracking-[0.05em] text-muted uppercase';
/**
 * Holds a tray and an opẹ̀lẹ̀ drawn side by side at the same height, so their
 * captions line up. Set the height to the opẹ̀lẹ̀'s (1.5 × its width).
 */
const DRAWING_BOX = 'flex w-full items-center justify-center';

/** Which step is in view, for the step list on wide screens. */
function useCurrentStep(ids: readonly string[]): string {
  const [current, setCurrent] = useState(ids[0]!);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(e.target.id);
      },
      { rootMargin: '-30% 0px -60% 0px' },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [ids]);
  return current;
}

function StepNav() {
  const current = useCurrentStep(STEP_IDS);
  return (
    <nav aria-label="Steps" className="hidden @wide/app:sticky @wide/app:top-8 @wide/app:block">
      <p className={cn(eyebrow, 'mb-2 ml-2')}>On this page</p>
      <ol className="m-0 grid list-none gap-[0.15rem] p-0">
        {STEPS.map((s, i) => {
          const last = i === STEPS.length - 1;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={current === s.id ? 'location' : undefined}
                className="group flex min-h-10 items-center gap-[0.6rem] rounded-[12px] px-2 py-1 text-[0.92rem] font-semibold text-muted no-underline hover:bg-stage hover:text-fg aria-[current]:bg-accent-soft aria-[current]:text-accent-on-soft"
              >
                <span
                  className="grid size-6 flex-none place-items-center rounded-full border-[1.5px] border-border text-[0.75rem] group-aria-[current]:border-accent group-aria-[current]:bg-accent group-aria-[current]:text-on-accent"
                  aria-hidden="true"
                >
                  {last ? '?' : i + 1}
                </span>
                <span>{s.nav}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function Step({ n, title, children }: { n: number; title: ReactNode; children: ReactNode }) {
  const id = STEP_IDS[n - 1]!;
  return (
    <section id={id} aria-labelledby={`${id}-h`} className={cn(card(), 'grid scroll-mt-4 gap-4 [&_p]:m-0')}>
      <div className="flex items-center gap-3">
        <span
          className="grid size-8 flex-none place-items-center rounded-full bg-accent font-bold text-on-accent"
          aria-hidden="true"
        >
          {n}
        </span>
        <h2 id={`${id}-h`} className="m-0">
          <span className="sr-only">Step {n}: </span>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

/** The right and left legs of a sign as marks, e.g. "Right · II I I I". */
function LegLines({ marks }: { marks: readonly Mark[] }) {
  const legs = [
    ['Right', marks.slice(0, 4)],
    ['Left', marks.slice(4, 8)],
  ] as const;
  return (
    <ol className="m-0 grid list-none gap-2 p-0">
      {legs.map(([side, pattern]) => (
        <li key={side} className={cn(TILE, 'flex items-center gap-3 px-3 py-2')}>
          <span className={ROW_LABEL}>{side}</span>
          <LegGlyph pattern={pattern} className="w-[18px]" />
          <span className="font-mono font-bold" aria-hidden="true">
            {legText(pattern)}
          </span>
          <span className="sr-only">{inWords(pattern)}</span>
        </li>
      ))}
    </ol>
  );
}

function MarkCard({ mark, sample, children }: { mark: Mark; sample: ReactNode; children: ReactNode }) {
  return (
    <div className={cn(TILE, 'grid content-start gap-3 p-4')}>
      <div className="flex items-baseline gap-[0.6rem]">
        <span className="font-serif text-[1.9rem] leading-none font-semibold" aria-hidden="true">
          {mark === 1 ? 'I' : 'II'}
        </span>
        <h4 className="m-0 text-base">
          {mark === 1 ? 'Single' : 'Double'}
          <span className="sr-only"> ({mark === 1 ? 'I' : 'II'})</span>
        </h4>
      </div>
      {sample}
      <p className="text-[0.9rem] text-muted">{children}</p>
    </div>
  );
}

/**
 * One tool's lesson. Both tools use this, so they always teach the same parts:
 * what it is, which way up, single and double marks, a labeled sign, and a tip.
 */
function ToolLesson({
  mode,
  whatItIs,
  whichWayUp,
  topLabel,
  single,
  double,
  marksNote,
  tip,
}: {
  mode: Mode;
  whatItIs: ReactNode;
  whichWayUp: ReactNode;
  /** Text alternative for the empty drawing with its top highlighted. */
  topLabel: string;
  single: ReactNode;
  double: ReactNode;
  marksNote?: ReactNode;
  tip: ReactNode;
}) {
  const Sample = mode === 'opon' ? TrayMarkSample : SeedSample;
  const width = mode === 'opon' ? '[--sign-width:11rem]' : '[--sign-width:8.5rem]';
  return (
    <>
      <div className="grid items-center gap-4 @wide/app:grid-cols-[11rem_minmax(0,1fr)]">
        <Sign
          mode={mode}
          cells={EMPTY}
          markTop
          label={topLabel}
          className={cn(width, 'justify-self-center')}
        />
        <div className="grid gap-3">
          <div>
            <h3 className="mt-0">What it is</h3>
            <p>{whatItIs}</p>
          </div>
          <div>
            <h3 className="mt-0">Which way up</h3>
            <p>{whichWayUp}</p>
          </div>
        </div>
      </div>

      <div className={SUB}>
        <h3 className="m-0">Single and double marks</h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-3">
          <MarkCard mark={1} sample={<Sample mark={1} />}>
            {single}
          </MarkCard>
          <MarkCard mark={2} sample={<Sample mark={2} />}>
            {double}
          </MarkCard>
        </div>
        {marksNote && <p className={hint}>{marksNote}</p>}
      </div>

      <div className={SUB}>
        <h3 className="m-0">A full sign, labeled</h3>
        <p>
          Read the four marks on the right leg from top to bottom first. Then read the four marks on the left
          leg from top to bottom.
        </p>
        <div className="grid items-center gap-4 @wide/app:grid-cols-[12rem_minmax(0,1fr)]">
          <Sign
            mode={mode}
            cells={EXAMPLE.marks}
            labels={asMarks(EXAMPLE.marks)}
            className={cn(
              mode === 'opon' ? '[--sign-width:12rem]' : '[--sign-width:10rem]',
              'justify-self-center',
            )}
          />
          <LegLines marks={EXAMPLE.marks} />
        </div>
        {mode === 'opele' && <p className={hint}>This is the same sign as the tray in step 2.</p>}
      </div>

      <p className={notice}>
        <strong>Tip:</strong> {tip}
      </p>
    </>
  );
}

interface Answer {
  readonly id: string;
  /** Why this answer is right or wrong. */
  readonly why: ReactNode;
}

function Quiz({ mode, oduId, answers }: { mode: Mode; oduId: string; answers: readonly Answer[] }) {
  const [picked, setPicked] = useState<string | null>(null);
  const chosen = answers.find((a) => a.id === picked);
  const tool = mode === 'opon' ? 'tray' : 'opẹ̀lẹ̀';
  return (
    <div className="grid gap-3">
      <p className={eyebrow}>
        On the <Yo>{mode === 'opon' ? 'ọpọ́n Ifá' : 'opẹ̀lẹ̀'}</Yo>
      </p>
      <div className="grid items-center gap-4 @wide/app:grid-cols-[10rem_minmax(0,1fr)]">
        <Sign mode={mode} cells={getOdu(oduId).marks} size="medium" className="justify-self-center" />
        <div role="group" aria-label={`Name the ${tool} sign`} className="grid gap-[0.6rem]">
          <p>What is this sign called?</p>
          {answers.map((a) => {
            const state = picked === a.id ? (a.id === oduId ? 'right' : 'wrong') : null;
            return (
              <button
                key={a.id}
                type="button"
                aria-pressed={picked === a.id}
                className={cn(
                  button(),
                  'w-full justify-start rounded-ctl text-left',
                  state === 'right' &&
                    'border-correct bg-correct-bg text-correct hover:not-disabled:bg-correct-bg',
                  state === 'wrong' &&
                    'border-dashed border-incorrect bg-incorrect-bg text-incorrect hover:not-disabled:bg-incorrect-bg [&_[lang=yo]]:text-fg',
                )}
                onClick={() => setPicked(a.id)}
              >
                {state && <span aria-hidden="true">{state === 'right' ? '✓' : '✕'}</span>}
                <OduName id={a.id} />
              </button>
            );
          })}
        </div>
      </div>
      <p role="status" className={cn(TILE, 'px-4 py-3 empty:hidden')}>
        {chosen?.why}
      </p>
    </div>
  );
}

export function Help({ onBack, backLabel }: { onBack: () => void; backLabel: string }) {
  const openMeans = markWord(OPELE_MAPPING.open);
  const seedText = (m: Mark) =>
    seedWord(m) === 'open' ? (
      <>
        An <strong>open</strong> seed: the pale hollow side faces up, with a ridge down the middle.
      </>
    ) : (
      <>
        A <strong>closed</strong> seed: the dark, rounded shell faces up.
      </>
    );
  const swapped = (
    <>Close. Those are the right two legs, but in the wrong order. Start with the leg on your right.</>
  );

  return (
    <div className={page}>
      <PageHead title="How to read a sign">A beginner’s guide in six short steps.</PageHead>
      <p className="m-0 max-w-[40rem]">
        Each Ifá reading gives a sign called an <strong>Odù</strong>. There are 256 Odù and each has a name.
        These steps show you how to look at any sign and say its name.
      </p>

      <div className="grid gap-4 @wide/app:grid-cols-[12.5rem_minmax(0,1fr)] @wide/app:items-start @wide/app:gap-8">
        <StepNav />

        <div className="grid min-w-0 gap-4">
          <Step n={1} title="A sign is two legs of four marks">
            <p>
              A sign is two columns side by side. Each column is called a <strong>leg</strong>. Each leg has
              four marks. Every mark is either <strong>single</strong>, written I, or <strong>double</strong>,
              written II.
            </p>
            <p>
              To read a sign, start with the <strong>right leg</strong> and read its four marks from top to
              bottom. Then read the four marks of the <strong>left leg</strong>, also from top to bottom.
            </p>
            <p>
              You will see signs on two tools. Both show the same sign, and the next two steps teach you to
              read each one.
            </p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-3">
              {(['opon', 'opele'] as const).map((tool) => (
                <figure
                  key={tool}
                  className={cn(TILE, 'm-0 grid content-start justify-items-center gap-3 p-4 text-center')}
                >
                  <div className={cn(DRAWING_BOX, 'h-[11.25rem]')}>
                    <Sign
                      mode={tool}
                      cells={EXAMPLE.marks}
                      className={tool === 'opon' ? '[--sign-width:9.5rem]' : '[--sign-width:7.5rem]'}
                    />
                  </div>
                  <figcaption className="text-[0.9rem] text-muted">
                    <strong className="block text-base text-fg">
                      <Yo>{tool === 'opon' ? 'Ọpọ́n Ifá' : 'Opẹ̀lẹ̀'}</Yo>
                    </strong>
                    {tool === 'opon'
                      ? 'A wooden tray. Each mark is drawn in ìyẹ̀rọ̀sùn. See step 2.'
                      : 'A divining chain. Each seed is one mark. See step 3.'}
                  </figcaption>
                </figure>
              ))}
            </div>
          </Step>

          <Step
            n={2}
            title={
              <>
                Reading the <Yo>ọpọ́n Ifá</Yo>
              </>
            }
          >
            <ToolLesson
              mode="opon"
              topLabel="Ọpọ́n Ifá with its eight mark positions empty. The plain gap in the carved border, at the top, is highlighted."
              whatItIs={
                <>
                  A round wooden divination tray covered with a thin layer of <Yo>ìyẹ̀rọ̀sùn</Yo>, a yellow
                  powder. The diviner draws each mark in the powder with their fingers as the sign is cast,
                  usually with <Yo>ikin</Yo>, the sacred palm nuts.
                </>
              }
              whichWayUp={
                <>
                  The carved border has one plain gap, highlighted here. In this app that gap is always at the
                  top. Start each leg at the mark nearest it and read down. On many real trays the top is the
                  edge carved with a face, the <Yo>ojú ọpọ́n</Yo>.
                </>
              }
              single="One stroke, drawn from bottom to top."
              double="Two strokes side by side, close together."
              marksNote="Strokes are drawn from bottom to top, but the marks are always read from top to bottom."
              tip="count the strokes, not their length. The two strokes of a double mark sit close together. The gap between the two legs is much wider, so a double mark never looks like two legs."
            />
          </Step>

          <Step
            n={3}
            title={
              <>
                Reading the <Yo>opẹ̀lẹ̀</Yo>
              </>
            }
          >
            <ToolLesson
              mode="opele"
              topLabel="Opẹ̀lẹ̀ with its eight seed positions empty. The join at the top of the chain is circled."
              whatItIs="A divining chain of eight half seed pods, four on each strand. The diviner casts the chain and each seed lands one of two ways up. Each seed is one mark."
              whichWayUp="The two strands are joined by a short cord, circled here. In this app that join is always at the top. Start each leg at the seed nearest the join and read down."
              single={seedText(1)}
              double={seedText(2)}
              tip={
                <>
                  look for the pale hollow. Turn on <strong>Show marks</strong> in Settings to see I and II
                  next to each seed while you practice. Some lineages read the seeds the other way round. This
                  app reads open as {openMeans}.
                </>
              }
            />
          </Step>

          <Step n={4} title="Each leg spells one of 16 names">
            <p>
              Four marks that are each single or double make exactly 16 patterns. Each pattern has the name of
              one of the 16 principal Odù. Learning these 16 is most of the work.
            </p>
            <ol className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(4.75rem,1fr))] gap-2 p-0">
              {PRINCIPAL_ODU.map((p) => (
                <li
                  key={p.id}
                  className={cn(TILE, 'relative grid justify-items-center gap-2 px-1 pt-5 pb-2 text-center')}
                >
                  <span
                    className="absolute top-1 left-2 text-[0.7rem] text-muted tabular-nums"
                    aria-hidden="true"
                  >
                    {p.seniority}
                  </span>
                  <LegGlyph pattern={p.pattern} className="w-6" />
                  <Yo className="text-[0.82rem] leading-[1.3] font-semibold [overflow-wrap:anywhere]">
                    {p.name}
                  </Yo>
                  <span className="sr-only">: {inWords(p.pattern)}</span>
                </li>
              ))}
            </ol>
            <p className={hint}>
              Shown in order of seniority, as they look on the tray. Start with the easiest two: <Yo>Ogbè</Yo>{' '}
              is four singles and <Yo>Ọ̀yẹ̀kú</Yo> is four doubles.
            </p>
          </Step>

          <Step n={5} title="Read the right leg first">
            <p>
              Signs are drawn as the diviner sees them, so the right leg is on your right. Read the four marks
              of the right leg from top to bottom first (1 to 4). Then read the four marks of the left leg
              from top to bottom (5 to 8). Say the two leg names in that order and you have the sign’s name.
            </p>
            <div className="grid items-center gap-4 @wide/app:grid-cols-[19.5rem_minmax(0,1fr)]">
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Sign mode="opon" cells={EXAMPLE.marks} labels={ORDER} className="[--sign-width:10rem]" />
                <Sign mode="opele" cells={EXAMPLE.marks} labels={ORDER} className="[--sign-width:8.5rem]" />
              </div>
              <ol className="m-0 grid list-none gap-2 p-0">
                <li className={cn(TILE, 'flex items-center gap-3 px-3 py-2')}>
                  <span className={ROW_LABEL}>1st</span>
                  <LegGlyph pattern={EXAMPLE.right.pattern} className="w-[18px]" />
                  <span>
                    Right leg is{' '}
                    <strong>
                      <Yo>{EXAMPLE.right.name}</Yo>
                    </strong>
                  </span>
                </li>
                <li className={cn(TILE, 'flex items-center gap-3 px-3 py-2')}>
                  <span className={ROW_LABEL}>2nd</span>
                  <LegGlyph pattern={EXAMPLE.left.pattern} className="w-[18px]" />
                  <span>
                    Left leg is{' '}
                    <strong>
                      <Yo>{EXAMPLE.left.name}</Yo>
                    </strong>
                  </span>
                </li>
                <li className="flex items-center gap-3 rounded-ctl bg-accent-soft px-3 py-2 font-bold text-accent-on-soft">
                  <span className={cn(ROW_LABEL, 'text-accent-on-soft')}>Name</span>
                  <OduName id={EXAMPLE.id} />
                </li>
              </ol>
            </div>
            <p className={hint}>
              The numbers show the reading order, which is the same on both tools. If you swap the legs you
              get a different Odù: <Yo>{EXAMPLE.left.name}</Yo> on the right and <Yo>{EXAMPLE.right.name}</Yo>{' '}
              on the left is <OduName id="irete_osa" />.
            </p>
          </Step>

          <Step n={6} title="When both legs match">
            <p>
              If both legs show the same pattern, say the leg name once and add{' '}
              <strong>
                <Yo>Méjì</Yo>
              </strong>
              , meaning “two”. Ogbè is the one exception: two Ogbè legs are called{' '}
              <strong>
                <OduName id="ogbe_ogbe" />
              </strong>
              .
            </p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] gap-3">
              {(
                [
                  [
                    'otura_otura',
                    'opon',
                    <>
                      <Yo>Òtúrá</Yo> on both legs, on the tray
                    </>,
                  ],
                  [
                    'ogbe_ogbe',
                    'opele',
                    <>
                      <Yo>Ogbè</Yo> on both legs, on the <Yo>opẹ̀lẹ̀</Yo>
                    </>,
                  ],
                ] as const
              ).map(([id, tool, caption]) => (
                <figure
                  key={id}
                  className={cn(TILE, 'm-0 grid content-start justify-items-center gap-2 p-4 text-center')}
                >
                  <div className={cn(DRAWING_BOX, 'h-[8.25rem]')}>
                    <Sign
                      mode={tool}
                      cells={getOdu(id).marks}
                      className={tool === 'opon' ? '[--sign-width:7rem]' : '[--sign-width:5.5rem]'}
                    />
                  </div>
                  <figcaption className="text-[0.9rem] text-muted">
                    <strong className="block text-base text-fg">
                      <OduName id={id} />
                    </strong>
                    {caption}
                  </figcaption>
                </figure>
              ))}
            </div>
            <div className="flex items-center gap-4 border-t border-line pt-4">
              <span className="font-serif text-[1.6rem] font-semibold whitespace-nowrap tabular-nums">
                16 × 16 = 256
              </span>
              <p className={hint}>
                Any of the 16 legs can sit on the right and any on the left. That makes 256 Odù, and 16 of
                them are Méjì.
              </p>
            </div>
          </Step>

          <section
            id="help-try"
            aria-labelledby="help-try-h"
            className="grid scroll-mt-4 gap-5 rounded-card border-2 border-accent bg-surface p-5 [&_p]:m-0"
          >
            <h2 id="help-try-h" className="m-0">
              Try two
            </h2>
            <Quiz
              mode="opon"
              oduId="ogunda_iwori"
              answers={[
                { id: 'iwori_ogunda', why: swapped },
                {
                  id: 'ogunda_iwori',
                  why: (
                    <>
                      Correct. <Yo>Ògúndá</Yo> is on the right, so it comes first. <Yo>Ìwòrì</Yo> on the left
                      comes second.
                    </>
                  ),
                },
                {
                  id: 'ogunda_ogunda',
                  why: (
                    <>
                      Not quite. The two legs are different, so the name has no <Yo>Méjì</Yo>. Count the
                      strokes on the left leg again.
                    </>
                  ),
                },
              ]}
            />
            <div className="border-t border-line pt-5">
              <Quiz
                mode="opele"
                oduId="obara_odi"
                answers={[
                  {
                    id: 'okanran_odi',
                    why: 'Not quite. That reads the legs from bottom to top. Start with the seed nearest the join.',
                  },
                  { id: 'odi_obara', why: swapped },
                  {
                    id: 'obara_odi',
                    why: (
                      <>
                        Correct. <Yo>Ọ̀bàrà</Yo> is on the right: one {seedWord(1)} seed, then three{' '}
                        {seedWord(2)}. <Yo>Òdí</Yo> is on the left.
                      </>
                    ),
                  },
                ]}
              />
            </div>
          </section>
        </div>
      </div>

      <button
        type="button"
        className={cn(button({ variant: 'primary' }), 'justify-self-start')}
        onClick={onBack}
      >
        {backLabel}
      </button>
    </div>
  );
}
