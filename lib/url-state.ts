import type { PatternState, AnimationDir } from '@/types/pattern';
import { validHex, PATTERNS } from './patterns/engine';

const ANIM_DIRS: AnimationDir[] = ['none','left','right','up','down','diag-left','diag-right'];

export const DEFAULT_STATE: PatternState = {
  pattern:   'noise',
  bgColor:   '#0a0a0a',
  patColor:  '#ffffff',
  size:      20,
  opacity:   20,
  thickness: 1,
  rotation:  0,
  animation: 'none',
};

export function encodeState(s: PatternState): string {
  const p = new URLSearchParams({
    pat: s.pattern,
    bg:  s.bgColor.replace('#', ''),
    col: s.patColor.replace('#', ''),
    sz:  String(s.size),
    op:  String(s.opacity),
    tk:  String(s.thickness),
    rot: String(s.rotation),
    an:  s.animation,
  });
  return '?' + p.toString();
}

export function decodeState(search: string): PatternState {
  const p = new URLSearchParams(search);
  const s = { ...DEFAULT_STATE };

  const pat = PATTERNS.find(x => x.id === p.get('pat'));
  if (pat) s.pattern = pat.id;

  const bg  = '#' + (p.get('bg')  ?? '');
  const col = '#' + (p.get('col') ?? '');
  if (validHex(bg))  s.bgColor  = bg;
  if (validHex(col)) s.patColor = col;

  if (p.has('sz'))  s.size      = Math.min(80,  Math.max(4,  Number(p.get('sz'))));
  if (p.has('op'))  s.opacity   = Math.min(100, Math.max(1,  Number(p.get('op'))));
  if (p.has('tk'))  s.thickness = Math.min(20,  Math.max(1,  Number(p.get('tk'))));
  if (p.has('rot')) s.rotation  = Math.min(180, Math.max(0,  Number(p.get('rot'))));
  if (p.has('an') && ANIM_DIRS.includes(p.get('an') as AnimationDir)) {
    s.animation = p.get('an') as AnimationDir;
  }

  return s;
}
