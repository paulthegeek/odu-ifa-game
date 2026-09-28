/**
 * Runs a round for both Read and Build: the clock, feedback timing,
 * screen-reader announcements and sound cues. Game rules live in logic/game.ts.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { FEEDBACK_MS, TIME_ANNOUNCEMENTS } from '../data/config';
import type { Mark } from '../data/odu';
import {
  advance,
  createRound,
  finishRound,
  roundDuration,
  submitAnswer,
  type RoundSettings,
  type RoundState,
} from '../logic/game';
import { displayName, getOdu } from '../logic/odu';
import { defaultRng } from '../logic/random';
import { playCue } from '../logic/sound';
import { useApp } from './AppContext';

export interface RoundConfig {
  readonly settings: RoundSettings;
  readonly pool: readonly string[];
  readonly weights: readonly number[] | null;
  readonly practice: boolean;
}

export interface Feedback {
  readonly kind: 'correct' | 'incorrect';
  readonly correctId: string;
}

export function useRound(config: RoundConfig, onFinish: (state: RoundState) => void) {
  const { settings: appSettings, announce } = useApp();
  const [state, setState] = useState<RoundState>(() =>
    createRound({
      settings: config.settings,
      pool: config.pool,
      weights: config.weights,
      practice: config.practice,
      rng: defaultRng,
      now: Date.now(),
    }),
  );
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const duration = roundDuration(config.settings, config.practice);
  // The timer starts when the first sign appears (on mount).
  const [endAt] = useState(() => (duration === null ? null : Date.now() + duration * 1000));
  const [remainingMs, setRemainingMs] = useState<number | null>(duration === null ? null : duration * 1000);

  const stateRef = useRef(state);
  const finishedRef = useRef(false);
  const announcedRef = useRef(new Set<number>());
  const timeoutRef = useRef<number | undefined>(undefined);
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const commit = useCallback((next: RoundState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    window.clearTimeout(timeoutRef.current);
    const final = finishRound(stateRef.current);
    commit(final);
    onFinishRef.current(final);
  }, [commit]);

  // Clock
  useEffect(() => {
    if (endAt === null) return;
    const tick = () => {
      const left = endAt - Date.now();
      setRemainingMs(Math.max(0, left));
      const secs = Math.ceil(left / 1000);
      for (const t of TIME_ANNOUNCEMENTS) {
        if (secs <= t && secs > 0 && !announcedRef.current.has(t)) {
          announcedRef.current.add(t);
          if (secs > t - 2) announce(`${t} seconds left`);
        }
      }
      if (left <= 0) finish();
    };
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [endAt, announce, finish]);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const answer = useCallback(
    (givenId: string, builtMarks?: readonly Mark[]) => {
      if (feedback || finishedRef.current) return false;
      const { state: next, correct } = submitAnswer(stateRef.current, givenId, Date.now(), builtMarks);
      commit(next);
      const correctId = next.answers[next.answers.length - 1]!.oduId;
      setFeedback({ kind: correct ? 'correct' : 'incorrect', correctId });
      if (appSettings.soundCues) playCue(correct ? 'correct' : 'incorrect');
      const name = displayName(getOdu(correctId), appSettings.showDiacritics);
      announce(
        correct ? `Correct. Score ${next.score}.` : `Not correct. It was ${name}. Score ${next.score}.`,
      );
      timeoutRef.current = window.setTimeout(
        () => {
          setFeedback(null);
          if (finishedRef.current) return;
          const advanced = advance(stateRef.current, defaultRng, Date.now());
          if (advanced.status === 'finished') {
            commit(advanced);
            finish();
          } else {
            commit(advanced);
          }
        },
        correct ? FEEDBACK_MS.correct : FEEDBACK_MS.incorrect,
      );
      return correct;
    },
    [feedback, commit, finish, announce, appSettings.soundCues, appSettings.showDiacritics],
  );

  return { state, feedback, remainingMs, untimed: duration === null, answer, finish };
}
