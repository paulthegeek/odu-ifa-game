/** Draws a sign in the chosen mode. */
import type { Cell } from '../logic/build';
import type { Mode } from '../logic/game';
import { Opele } from './Opele';
import { OponIfa } from './OponIfa';
import type { EditableConfig } from './SignFrame';

export interface SignProps {
  mode: Mode;
  cells: readonly Cell[];
  size?: 'large' | 'medium' | 'small';
  showMarks?: boolean;
  wrong?: readonly number[];
  label?: string;
  editable?: EditableConfig;
  decorative?: boolean;
  className?: string;
}

export function Sign({ mode, showMarks = false, ...rest }: SignProps) {
  return mode === 'opele' ? <Opele showMarks={showMarks} {...rest} /> : <OponIfa {...rest} />;
}
