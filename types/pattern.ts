export type AnimationDir = 'none' | 'left' | 'right' | 'up' | 'down' | 'diag-left' | 'diag-right';

export interface PatternState {
  pattern:   string;
  bgColor:   string;
  patColor:  string;
  size:      number;
  opacity:   number;
  thickness: number;
  rotation:  number;
  animation: AnimationDir;
}

export interface Pattern {
  id:   string;
  name: string;
  draw: (ctx: CanvasRenderingContext2D, s: PatternState, extMult?: number) => void;
  css:  (s: PatternState) => string;
}

export interface Preset {
  name:   string;
  accent: string;
  state:  PatternState;
}
