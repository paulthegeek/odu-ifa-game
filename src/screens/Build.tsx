/** Build the sign: see a name, build its sign on an empty opẹ̀lẹ̀ or ọpọ́n. */
import { useRef, useState, type KeyboardEvent } from 'react';
import { useApp } from '../app/AppContext';
import { useRound, type RoundConfig } from '../app/useRound';
import { FeedbackBanner } from '../components/FeedbackBanner';
import { LegCaptions } from '../components/LegCaptions';
import { OduName } from '../components/OduName';
import { RoundBar } from '../components/RoundBar';
import { ScreenTitle } from '../components/ScreenTitle';
import { Sign } from '../components/Sign';
import {
  canCheck,
  cellWord,
  checkBuild,
  cycleAt,
  emptyCells,
  positionLabel,
  setCell,
  type Cell,
} from '../logic/build';
import { mirrorActive, type RoundState } from '../logic/game';
import { getOdu } from '../logic/odu';

export function Build({ config, onFinish }: { config: RoundConfig; onFinish: (s: RoundState) => void }) {
  const { settings, announce } = useApp();
  const { state, feedback, remainingMs, untimed, answer, finish } = useRound(config, onFinish);
  const mode = config.settings.mode;
  const mirror = mirrorActive(config.settings);
  const [cells, setCells] = useState<Cell[]>(emptyCells);
  const [active, setActive] = useState(0);
  const [cellsFor, setCellsFor] = useState(state.shownAt);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const target = getOdu(state.currentId);

  // Each new name starts from an empty sign.
  if (cellsFor !== state.shownAt) {
    setCellsFor(state.shownAt);
    setCells(emptyCells());
  }

  const update = (next: Cell[], index: number) => {
    setCells(next);
    const extra = mirror ? ' Mirrored on the other leg.' : '';
    announce(`${positionLabel(index, next[index]!, mode)}.${extra}`);
  };

  const focusAt = (i: number) => {
    setActive(i);
    buttonRefs.current[i]?.focus();
  };

  const check = () => {
    if (feedback || !canCheck(cells)) return;
    const result = checkBuild(cells, target);
    answer(result.built.id, [...(cells as readonly (1 | 2)[])]);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const row = i % 4;
    const isRight = i < 4;
    switch (e.key) {
      case 'ArrowUp':
        focusAt(isRight ? Math.max(0, row - 1) : 4 + Math.max(0, row - 1));
        break;
      case 'ArrowDown':
        focusAt(isRight ? Math.min(3, row + 1) : 4 + Math.min(3, row + 1));
        break;
      case 'ArrowLeft':
        // Left leg is on the player's left.
        focusAt(4 + row);
        break;
      case 'ArrowRight':
        focusAt(row);
        break;
      case '1':
        update(setCell(cells, i, 1, mirror), i);
        break;
      case '2':
        update(setCell(cells, i, 2, mirror), i);
        break;
      case 'Backspace':
      case 'Delete':
        update(setCell(cells, i, 0, mirror), i);
        break;
      case 'Enter':
        check();
        break;
      default:
        return; // Space falls through to the button's click (cycle).
    }
    e.preventDefault();
  };

  const filled = cells.filter((c) => c !== 0).length;
  const ready = canCheck(cells);

  return (
    <div>
      <ScreenTitle>
        Build the sign{config.practice ? ': practise my misses' : ''}
        {untimed && !config.practice ? ' (untimed practice)' : ''}
      </ScreenTitle>
      <RoundBar state={state} remainingMs={remainingMs} untimed={untimed} onEnd={finish} />
      <div className="play-layout">
        <div className="sign-stage">
          <p className="target-name">
            <span className="visually-hidden">Build: </span>
            <OduName id={state.currentId} />
          </p>
          <Sign
            mode={mode}
            cells={cells}
            size="large"
            showMarks={settings.showMarks}
            editable={{
              labels: cells.map((c, i) => positionLabel(i, c, mode)),
              activeIndex: active,
              onActivate: (i) => {
                if (!feedback) update(cycleAt(cells, i, mirror), i);
              },
              onKeyDown: (e, i) => {
                if (!feedback) onKeyDown(e, i);
              },
              onFocusIndex: setActive,
              buttonRefs,
            }}
          />
          <LegCaptions mode={mode} />
        </div>
        <div className="stack">
          <div className="btn-row">
            <button type="button" className="btn btn-primary" disabled={!ready || !!feedback} onClick={check}>
              Check
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setCells(emptyCells());
                announce('Cleared. All positions empty.');
              }}
              disabled={filled === 0 || !!feedback}
            >
              Clear
            </button>
          </div>
          <p className="hint" aria-live="off">
            {ready ? 'All 8 positions filled.' : `${filled} of 8 positions filled.`}
            {mirror && ' Mirror legs is on: each mark is copied to the other leg.'}
          </p>
          <FeedbackBanner feedback={feedback} />
          <details>
            <summary>Keyboard and touch help</summary>
            <ul className="hint">
              <li>
                Tap a position to cycle:{' '}
                {['empty', cellWord(1, mode), cellWord(2, mode), 'empty'].join(' → ')}.
              </li>
              <li>Arrow keys move between positions. Space cycles the focused position.</li>
              <li>1 sets single, 2 sets double, Backspace clears the position, Enter checks.</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
}
