'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PatternState } from '@/types/pattern';
import { PATTERNS, drawPattern } from '@/lib/patterns/engine';
import { DEFAULT_STATE, encodeState } from '@/lib/url-state';

const THUMB_SIZE = 58;

// Per-pattern defaults — loaded when switching TO that pattern
const PATTERN_DEFAULTS: Record<string, Partial<PatternState>> = {
  noise:    { size: 20, opacity: 20, thickness: 1, rotation: 0, animation: 'none', animSpeed: 40 },
  dots:     { size: 18, opacity: 25, thickness: 2, rotation: 0, animation: 'none', animSpeed: 40 },
  grid:     { size: 24, opacity: 25, thickness: 1, rotation: 0, animation: 'none', animSpeed: 40 },
  rect:     { size: 24, opacity: 25, thickness: 1, rotation: 0, animation: 'none', animSpeed: 40 },
  diagonal: { size: 14, opacity: 20, thickness: 1, rotation: 0, animation: 'none', animSpeed: 40 },
  hatch:    { size: 16, opacity: 20, thickness: 1, rotation: 0, animation: 'none', animSpeed: 40 },
  carbon:   { size: 8,  opacity: 80, thickness: 1, rotation: 0, animation: 'none', animSpeed: 40 },
  halftone: { size: 16, opacity: 60, thickness: 4, rotation: 0, animation: 'none', animSpeed: 40 },
  plus:     { size: 20, opacity: 30, thickness: 1, rotation: 0, animation: 'none', animSpeed: 40 },
  hex:      { size: 22, opacity: 35, thickness: 1, rotation: 0, animation: 'none', animSpeed: 40 },
  waves:    { size: 20, opacity: 35, thickness: 1, rotation: 0, animation: 'none', animSpeed: 40 },
  circuit:  { size: 24, opacity: 50, thickness: 1, rotation: 0, animation: 'none', animSpeed: 40 },
};

// Per-pattern saved state — remembers user's settings for each pattern
// so switching away and back restores what they had
type PerPatternState = Partial<Omit<PatternState, 'pattern'>>;
const perPatternMemory = new Map<string, PerPatternState>();

interface UsePatternRendererReturn {
  state:      PatternState;
  setState:   (patch: Partial<PatternState>, activeOnly?: boolean) => void;
  canvasRef:  React.RefObject<HTMLCanvasElement | null>;
  thumbRefs:  React.MutableRefObject<Record<string, HTMLCanvasElement | null>>;
  resetState: () => void;
  redraw:     () => void;
}

export function usePatternRenderer(): UsePatternRendererReturn {
  const [state, setStateRaw] = useState<PatternState>(DEFAULT_STATE);
  const stateRef   = useRef<PatternState>(DEFAULT_STATE);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const thumbRefs  = useRef<Record<string, HTMLCanvasElement | null>>({});

  // Single RAF id for one-shot renders
  const rafId      = useRef<number>(0);
  // Animation loop RAF id
  const animRafId  = useRef<number>(0);
  const animOffset = useRef({ x: 0, y: 0 });
  const lastTime   = useRef<number>(0);

  // Thumb: only redraw active thumb during slider drag
  const thumbTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── draw preview ─────────────────────────────────────────────────
  const drawPreview = useCallback((s: PatternState, ox = 0, oy = 0) => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.width || !canvas.height) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = s.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (ox !== 0 || oy !== 0) {
      // Translate before drawing so pattern slides smoothly.
      // extMult=6 draws well beyond canvas edges so no gaps appear.
      // No wrapping needed — extMult coverage handles it.
      ctx.save();
      ctx.translate(ox, oy);
      drawPattern(ctx, s, 6, 0, 0);
      ctx.restore();
    } else {
      drawPattern(ctx, s, 5, 0, 0);
    }
  }, []);

  // ── draw single thumb ────────────────────────────────────────────
  const drawThumb = useCallback((patId: string, s: PatternState) => {
    const canvas = thumbRefs.current[patId];
    if (!canvas || !canvas.width || !canvas.height) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pat = PATTERNS.find(p => p.id === patId);
    if (!pat) return;
    ctx.clearRect(0, 0, THUMB_SIZE, THUMB_SIZE);
    ctx.fillStyle = s.bgColor;
    ctx.fillRect(0, 0, THUMB_SIZE, THUMB_SIZE);
    pat.draw(ctx, {
      ...s,
      size:    Math.max(5, Math.round(s.size * 0.36)),
      opacity: Math.min(s.opacity * 1.5, 100),
    }, 2, 0, 0);
  }, []);

  // ── animation loop ────────────────────────────────────────────────
  const stopAnim = useCallback(() => {
    cancelAnimationFrame(animRafId.current);
    animRafId.current = 0;
    animOffset.current = { x: 0, y: 0 };
    lastTime.current = 0;
  }, []);

  const startAnim = useCallback((s: PatternState) => {
    stopAnim();
    if (s.animation === 'none') return;
    const tick = (now: number) => {
      if (!lastTime.current) lastTime.current = now;
      const dt = Math.min((now - lastTime.current) / 1000, 0.05);
      lastTime.current = now;
      const speed = stateRef.current.animSpeed ?? 40;
      const o = animOffset.current;
      const size = Math.max(stateRef.current.size, 8);
      switch (stateRef.current.animation) {
        case 'left':       o.x -= speed * dt; break;
        case 'right':      o.x += speed * dt; break;
        case 'up':         o.y -= speed * dt; break;
        case 'down':       o.y += speed * dt; break;
        case 'diag-left':  o.x -= speed * dt; o.y -= speed * dt; break;
        case 'diag-right': o.x += speed * dt; o.y -= speed * dt; break;
      }
      // Wrap to [-size, size] to prevent unbounded float growth
      const wrap = (v: number) => ((v % size) + size) % size;
      o.x = wrap(o.x);
      o.y = wrap(o.y);
      drawPreview(stateRef.current, o.x, o.y);
      animRafId.current = requestAnimationFrame(tick);
    };
    animRafId.current = requestAnimationFrame(tick);
  }, [drawPreview, stopAnim]);

  // ── trigger render ────────────────────────────────────────────────
  const triggerRender = useCallback((s: PatternState, redrawAllThumbs: boolean) => {
    if (s.animation !== 'none') {
      startAnim(s);
    } else {
      stopAnim();
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => drawPreview(s, 0, 0));
    }

    // Thumbs: on slider drag only redraw active thumb (fast)
    // on pattern switch redraw all thumbs (staggered so no jank)
    if (thumbTimer.current) clearTimeout(thumbTimer.current);
    if (redrawAllThumbs) {
      // Stagger all 12 thumbs, each with its OWN remembered state
      PATTERNS.forEach((pat, i) => {
        setTimeout(() => requestAnimationFrame(() => {
          // Each thumb uses that pattern's remembered state, NOT current state
          const mem = perPatternMemory.get(pat.id);
          const thumbState: PatternState = mem
            ? { ...DEFAULT_STATE, ...PATTERN_DEFAULTS[pat.id], ...mem, pattern: pat.id, bgColor: s.bgColor }
            : { ...DEFAULT_STATE, ...PATTERN_DEFAULTS[pat.id], pattern: pat.id, bgColor: s.bgColor };
          drawThumb(pat.id, thumbState);
        }), i * 16);
      });
    } else {
      // Only update active thumb after short debounce
      thumbTimer.current = setTimeout(() => {
        requestAnimationFrame(() => drawThumb(s.pattern, s));
      }, 200);
    }

    if (typeof window !== 'undefined') {
      history.replaceState(null, '', encodeState(s));
    }
  }, [drawPreview, drawThumb, startAnim, stopAnim]);

  // ── setState ─────────────────────────────────────────────────────
  const setState = useCallback((patch: Partial<PatternState>, activeOnly = true) => {
    const cur = stateRef.current;
    const isPatternSwitch = patch.pattern !== undefined && patch.pattern !== cur.pattern;

    if (isPatternSwitch) {
      // Save current pattern's settings to memory before switching
      perPatternMemory.set(cur.pattern, {
        size: cur.size, opacity: cur.opacity, thickness: cur.thickness,
        rotation: cur.rotation, bgColor: cur.bgColor, patColor: cur.patColor,
        animation: cur.animation, animSpeed: cur.animSpeed,
      });

      // Load new pattern: check memory first, fall back to defaults
      const newId = patch.pattern as string;
      const mem   = perPatternMemory.get(newId);
      const defs  = PATTERN_DEFAULTS[newId] ?? PATTERN_DEFAULTS[DEFAULT_STATE.pattern];
      const restored = mem ?? defs;

      const next: PatternState = {
        ...cur,
        ...defs,      // start from defaults
        ...restored,  // overlay with memory if it exists
        ...patch,     // always apply the pattern switch
      };
      stateRef.current = next;
      setStateRaw(next);
      triggerRender(next, true); // redraw ALL thumbs on pattern switch
    } else {
      const next: PatternState = { ...cur, ...patch };
      stateRef.current = next;
      setStateRaw(next);
      triggerRender(next, false); // only active thumb on slider drag
    }
  }, [triggerRender]);

  const resetState = useCallback(() => {
    perPatternMemory.clear();
    const next = { ...DEFAULT_STATE };
    stateRef.current = next;
    setStateRaw(next);
    triggerRender(next, true);
  }, [triggerRender]);

  const redraw = useCallback(() => {
    const s = stateRef.current;
    if (s.animation !== 'none') startAnim(s);
    else drawPreview(s, 0, 0);
  }, [drawPreview, startAnim]);

  // ── initial draw ─────────────────────────────────────────────────
  useEffect(() => {
    drawPreview(stateRef.current, 0, 0);
    PATTERNS.forEach((pat, i) =>
      setTimeout(() => requestAnimationFrame(() =>
        drawThumb(pat.id, { ...DEFAULT_STATE, ...PATTERN_DEFAULTS[pat.id], pattern: pat.id })
      ), i * 20)
    );
    return () => { stopAnim(); cancelAnimationFrame(rafId.current); };
  }, [drawPreview, drawThumb, stopAnim]);

  return { state, setState, canvasRef, thumbRefs, resetState, redraw };
}
