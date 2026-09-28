/**
 * App shell. Screens are switched with state (no router), which keeps
 * GitHub Pages happy: there is only ever one URL.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StudyDialog } from '../components/StudyCard';
import { WEAK_SET_MIN_ANSWERS } from '../data/config';
import { ThemeToggle } from '../components/ThemeToggle';
import type { OduSet } from '../logic/distractors';
import { personalBestKey, roundDuration, type RoundSettings, type RoundState } from '../logic/game';
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
import { AccessibilitySettings } from '../screens/AccessibilitySettings';
import { Build } from '../screens/Build';
import { Help } from '../screens/Help';
import { OduReference } from '../screens/OduReference';
import { Play } from '../screens/Play';
import { Progress } from '../screens/Progress';
import { Results, type RoundOutcome } from '../screens/Results';
import { Setup } from '../screens/Setup';
import { AppContext, type AppContextValue } from './AppContext';
import type { RoundConfig } from './useRound';

type Screen = 'setup' | 'round' | 'results' | 'progress' | 'reference' | 'help' | 'a11y';

const THEME_COLORS: Record<string, string> = { light: '#f4f2e4', dark: '#161915', night: '#0c0e08' };

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
  const [screen, setScreen] = useState<Screen>('setup');
  const [returnTo, setReturnTo] = useState<Screen>('setup');
  const [round, setRound] = useState<{ config: RoundConfig; key: number } | null>(null);
  const [outcome, setOutcome] = useState<RoundOutcome | null>(null);
  const [studyId, setStudyId] = useState<string | null>(null);
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

  const ctx: AppContextValue = useMemo(
    () => ({ settings, updateSettings, announce, openStudy: setStudyId }),
    [settings, updateSettings, announce],
  );

  const go = (next: Screen) => {
    setReturnTo(screen === 'help' || screen === 'a11y' ? returnTo : screen);
    setScreen(next);
    window.scrollTo(0, 0);
  };

  const answerCount = totalAnswers(progress);

  const startRound = (practiceIds?: readonly string[], base?: RoundSettings) => {
    const set: OduSet = settings.set === 'weak' && answerCount < WEAK_SET_MIN_ANSWERS ? 'meji' : settings.set;
    const roundSettings: RoundSettings = base ?? {
      mode: settings.mode,
      direction: settings.direction,
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

  return (
    <AppContext.Provider value={ctx}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="app-header">
        <p className="app-title">
          {inRound ? (
            <span lang="en">Odù Practice</span>
          ) : (
            <button type="button" onClick={() => go('setup')}>
              Odù Practice
            </button>
          )}
        </p>
        <div className="header-tools">
          {!inRound && (
            <nav aria-label="Main" className="btn-row">
              <button type="button" className="btn btn-link" onClick={() => go('reference')}>
                Odù reference
              </button>
              <button type="button" className="btn btn-link" onClick={() => go('progress')}>
                Progress
              </button>
              <button type="button" className="btn btn-link" onClick={() => go('a11y')}>
                Accessibility
              </button>
            </nav>
          )}
          <ThemeToggle />
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        {screen === 'setup' && (
          <Setup
            answerCount={answerCount}
            onStart={() => startRound()}
            onHelp={() => go('help')}
            onAccessibility={() => go('a11y')}
          />
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
              startRound(undefined, outcome.state.practice ? undefined : outcome.state.settings)
            }
            onPracticeMisses={() =>
              startRound([...new Set(outcome.state.misses.map((m) => m.oduId))], outcome.state.settings)
            }
            onProgress={() => go('progress')}
            onSettings={() => go('setup')}
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
            onBack={() => setScreen(returnTo === 'progress' ? 'setup' : returnTo)}
          />
        )}
        {screen === 'reference' && (
          <OduReference onBack={() => setScreen(returnTo === 'reference' ? 'setup' : returnTo)} />
        )}
        {screen === 'help' && (
          <Help
            onBack={() => setScreen(returnTo)}
            backLabel={returnTo === 'results' ? 'Back to results' : 'Back to setup'}
          />
        )}
        {screen === 'a11y' && <AccessibilitySettings onBack={() => setScreen(returnTo)} />}
      </main>

      <div className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
        {message}
      </div>
      <StudyDialog oduId={studyId} onClose={() => setStudyId(null)} />
    </AppContext.Provider>
  );
}
