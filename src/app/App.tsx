/**
 * App shell. Screens are switched with state (no router), which keeps
 * GitHub Pages happy: there is only ever one URL.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StudyDialog } from '../components/StudyCard';
import { WEAK_SET_MIN_ANSWERS } from '../data/config';
import type { OduSet } from '../logic/distractors';
import {
  personalBestKey,
  type Direction,
  roundDuration,
  type Mode,
  type RoundSettings,
  type RoundState,
} from '../logic/game';
import { ALL_ODU, MEJI_ODU } from '../logic/odu';
import {
  emptyProgress,
  oduStats,
  recordRound,
  totalAnswers,
  weakPool,
  weakWeights,
  type AnswerRecord,
  type ProgressData,
} from '../logic/progress';
import { memoryStore, openProgressStore, type ProgressStore } from '../logic/progressStore';
import { clearBests, loadSettings, recordBest, saveSettings, type Settings } from '../logic/storage';
import { Build } from '../screens/Build';
import { Help } from '../screens/Help';
import { Home } from '../screens/Home';
import { OduReference } from '../screens/OduReference';
import { Play } from '../screens/Play';
import { Progress } from '../screens/Progress';
import { Results, type RoundOutcome } from '../screens/Results';
import { Settings as SettingsScreen } from '../screens/Settings';
import { cn } from '../lib/cn';
import { AppBar, type Tab } from './AppBar';
import { AppContext, type AppContextValue, type StudyOptions } from './AppContext';
import type { RoundConfig } from './useRound';

type Screen = 'home' | 'round' | 'results' | 'progress' | 'reference' | 'help' | 'settings';

const HELP_BACK: Partial<Record<Screen, string>> = {
  results: 'Back to results',
  reference: 'Back to Odù reference',
  progress: 'Back to progress',
  settings: 'Back to settings',
};

const THEME_COLORS: Record<string, string> = { light: '#ffffff', dark: '#121711', night: '#0d0e09' };

function resolveTheme(choice: Settings['theme']): 'light' | 'dark' | 'night' {
  if (choice !== 'system') return choice;
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function useDocumentSettings(settings: Settings) {
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const theme = resolveTheme(settings.theme);
      root.dataset.theme = theme;
      root.dataset.contrast = settings.highContrast ? 'high' : 'normal';
      root.dataset.large = String(settings.largeText);
      root.dataset.spacing = String(settings.dyslexiaSpacing);
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', settings.highContrast ? '#ffffff' : THEME_COLORS[theme]!);
    };
    apply();
    if (settings.theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [settings.theme, settings.highContrast, settings.largeText, settings.dyslexiaSpacing]);
}

let answerCounter = 0;

export function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [screen, setScreen] = useState<Screen>('home');
  // Help is the only screen with a Back button; the others are reached from the tabs.
  const [helpReturn, setHelpReturn] = useState<Screen>('home');
  const [round, setRound] = useState<{ config: RoundConfig; key: number } | null>(null);
  const [outcome, setOutcome] = useState<RoundOutcome | null>(null);
  const [study, setStudy] = useState<{ id: string; mode?: Mode } | null>(null);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState<ProgressData>(emptyProgress);
  const storeRef = useRef<ProgressStore>(memoryStore());
  const [persistent, setPersistent] = useState(true);
  const progressRef = useRef(progress);

  useDocumentSettings(settings);

  useEffect(() => {
    let canceled = false;
    void openProgressStore().then(async (store) => {
      const data = await store.load();
      if (canceled) return;
      storeRef.current = store;
      progressRef.current = data;
      setProgress(data);
      setPersistent(store.persistent);
    });
    return () => {
      canceled = true;
    };
  }, []);

  const saveProgress = useCallback(async (data: ProgressData) => {
    progressRef.current = data;
    setProgress(data);
    await storeRef.current.save(data);
    setPersistent(storeRef.current.persistent);
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => {
      const next = { ...s, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const announceTimer = useRef<number | undefined>(undefined);
  const announce = useCallback((text: string) => {
    // Clear first so repeated messages are still spoken.
    setMessage('');
    window.clearTimeout(announceTimer.current);
    announceTimer.current = window.setTimeout(() => setMessage(text), 50);
  }, []);

  const openStudy = useCallback(
    (id: string, options?: StudyOptions) => setStudy({ id, mode: options?.mode }),
    [],
  );

  const ctx: AppContextValue = useMemo(
    () => ({ settings, updateSettings, announce, openStudy }),
    [settings, updateSettings, announce, openStudy],
  );

  const go = (next: Screen) => {
    if (next === 'help' && screen !== 'help') setHelpReturn(screen);
    setScreen(next);
    window.scrollTo(0, 0);
  };

  const answerCount = totalAnswers(progress);

  const startRound = ({
    direction: chosen,
    practiceIds,
    base,
  }: { direction?: Direction; practiceIds?: readonly string[]; base?: RoundSettings } = {}) => {
    const set: OduSet = settings.set === 'weak' && answerCount < WEAK_SET_MIN_ANSWERS ? 'meji' : settings.set;
    const direction = chosen ?? settings.direction;
    // Remember the last direction so Results, Progress filters and defaults follow it.
    if (chosen && chosen !== settings.direction) updateSettings({ direction: chosen });
    const roundSettings: RoundSettings = base ?? {
      mode: settings.mode,
      direction,
      set,
      length: settings.length,
      timing: settings.timing,
      mirrorLegs: settings.mirrorLegs,
    };
    let pool: string[];
    let weights: number[] | null = null;
    if (practiceIds) {
      pool = [...practiceIds];
    } else if (roundSettings.set === 'weak') {
      const stats = oduStats(progressRef.current, { direction: roundSettings.direction });
      pool = weakPool(stats);
      if (pool.length < 4) pool = [...new Set([...pool, ...MEJI_ODU.map((o) => o.id)])];
      weights = weakWeights(pool, stats);
    } else {
      pool = (roundSettings.set === 'meji' ? MEJI_ODU : ALL_ODU).map((o) => o.id);
    }
    setRound((r) => ({
      config: { settings: roundSettings, pool, weights, practice: !!practiceIds },
      key: (r?.key ?? 0) + 1,
    }));
    setScreen('round');
    window.scrollTo(0, 0);
  };

  const finishRound = useCallback(
    (state: RoundState) => {
      const s = state.settings;
      const timed = roundDuration(s, state.practice) !== null;
      const bestKey = personalBestKey(s, state.practice);
      const best = bestKey ? recordBest(bestKey, state.score) : { isNewBest: false, previous: null };
      if (state.attempted > 0) {
        const answers: AnswerRecord[] = state.answers.map((a) => {
          answerCounter += 1;
          return {
            id: `${state.id}-${answerCounter}`,
            roundId: state.id,
            oduId: a.oduId,
            givenId: a.givenId,
            correct: a.correct,
            mode: s.mode,
            direction: s.direction,
            responseMs: a.responseMs,
            ts: a.ts,
            timed,
          };
        });
        void saveProgress(
          recordRound(
            progressRef.current,
            {
              id: state.id,
              mode: s.mode,
              direction: s.direction,
              set: s.set,
              length: s.length,
              timing: s.timing,
              practice: state.practice,
              score: state.score,
              attempted: state.attempted,
              ts: Date.now(),
            },
            answers,
          ),
        );
      }
      setOutcome({ state, isNewBest: best.isNewBest, previousBest: best.previous });
      setScreen('results');
      announce(`Round over. ${state.score} correct of ${state.attempted}.`);
    },
    [saveProgress, announce],
  );

  const inRound = screen === 'round';
  const activeTab: Tab | null =
    screen === 'results' || screen === 'home'
      ? 'home'
      : screen === 'reference' || screen === 'progress' || screen === 'settings'
        ? screen
        : null;

  return (
    <AppContext.Provider value={ctx}>
      <a
        className="absolute -top-12 left-2 z-50 rounded-full bg-accent px-4 py-2 text-on-accent focus:top-2"
        href="#main"
      >
        Skip to content
      </a>
      {/* Phones: top bar + fixed bottom tab bar. Wide screens: left sidebar. */}
      <div
        className={cn('min-h-dvh md:grid md:grid-cols-[15.5rem_minmax(0,1fr)]', inRound && 'md:grid-cols-1')}
      >
        {!inRound && <AppBar active={activeTab} onNavigate={go} onHelp={() => go('help')} />}

        <main
          id="main"
          tabIndex={-1}
          className={cn(
            '@container/app mx-auto w-full max-w-6xl px-4 pt-2 pb-[calc(5.5rem+env(safe-area-inset-bottom))] focus:outline-none md:px-11 md:pt-9 md:pb-12',
            inRound && 'max-w-none p-0 md:p-0',
          )}
        >
          {screen === 'home' && (
            <Home answerCount={answerCount} onStart={(direction) => startRound({ direction })} />
          )}
          {screen === 'round' &&
            round &&
            (round.config.settings.direction === 'read' ? (
              <Play key={round.key} config={round.config} onFinish={finishRound} />
            ) : (
              <Build key={round.key} config={round.config} onFinish={finishRound} />
            ))}
          {screen === 'results' && outcome && (
            <Results
              outcome={outcome}
              onPlayAgain={() =>
                startRound({ base: outcome.state.practice ? undefined : outcome.state.settings })
              }
              onPracticeMisses={() =>
                startRound({
                  practiceIds: [...new Set(outcome.state.misses.map((m) => m.oduId))],
                  base: outcome.state.settings,
                })
              }
              onProgress={() => go('progress')}
              onSettings={() => go('home')}
              onHelp={() => go('help')}
            />
          )}
          {screen === 'progress' && (
            <Progress
              data={progress}
              persistent={persistent}
              onReplace={saveProgress}
              onReset={async () => {
                await storeRef.current.clear();
                clearBests();
                progressRef.current = emptyProgress();
                setProgress(progressRef.current);
              }}
            />
          )}
          {screen === 'reference' && <OduReference />}
          {screen === 'help' && (
            <Help onBack={() => go(helpReturn)} backLabel={HELP_BACK[helpReturn] ?? 'Back to practice'} />
          )}
          {screen === 'settings' && <SettingsScreen />}
        </main>
      </div>

      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {message}
      </div>
      <StudyDialog oduId={study?.id ?? null} mode={study?.mode} onClose={() => setStudy(null)} />
    </AppContext.Provider>
  );
}
