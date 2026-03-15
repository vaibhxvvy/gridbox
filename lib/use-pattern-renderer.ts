'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PatternState } from '@/types/pattern';
import { PATTERNS, drawPattern } from '@/lib/patterns/engine';
import { DEFAULT_STATE, encodeState } from '@/lib/url-state';

const THUMB_SIZE = 58;

const PATTERN_DEFAULTS: Partial<Record<string, Partial<PatternState>>> = {
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

  const rafId       = useRef<number>(0);
  const animRafId   = useRef<number>(0);
  const animOffset  = useRef({ x: 0, y: 0 });
  const lastTime    = useRef<number>(0);

  const thumbTimer      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const thumbActiveOnly = useRef(true);

  // ── draw preview — offset shifts background-position seamlessly ───
  const drawPreview = useCallback((s: PatternState, ox = 0, oy = 0) => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.width || !canvas.height) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw background colour
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = s.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (ox === 0 && oy === 0) {
      // Static — direct draw
      drawPattern(ctx, s, 5, 0, 0);
      return;
    }

    // Animated — draw onto a large offscreen tile (at least 600px)
    // so pattern detail is preserved at full quality when tiled
    const TILE = Math.max(s.size * 8, 600);
    const off = document.createElement('canvas');
    off.width = TILE; off.height = TILE;
    const oc = off.getContext('2d')!;
    oc.fillStyle = s.bgColor;
    oc.fillRect(0, 0, TILE, TILE);
    // Use extMult=5 for full quality (same as main preview)
    drawPattern(oc, { ...s }, 5, 0, 0);

    // Create tiling pattern and offset it
    const pat = ctx.createPattern(off, 'repeat');
    if (!pat) { drawPattern(ctx, s, 5, 0, 0); return; }
    const matrix = new DOMMatrix();
    // Wrap offset to tile size for seamless loop
    const wx = ((ox % TILE) + TILE) % TILE;
    const wy = ((oy % TILE) + TILE) % TILE;
    matrix.translateSelf(wx, wy);
    pat.setTransform(matrix);
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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
      const dt = Math.min((now - lastTime.current) / 1000, 0.05); // cap dt at 50ms to prevent jumps
      lastTime.current = now;

      const speed = stateRef.current.animSpeed ?? 40;
      const o = animOffset.current;

      switch (stateRef.current.animation) {
        case 'left':       o.x -= speed * dt; break;
        case 'right':      o.x += speed * dt; break;
        case 'up':         o.y -= speed * dt; break;
        case 'down':       o.y += speed * dt; break;
        case 'diag-left':  o.x -= speed * dt; o.y -= speed * dt; break;
        case 'diag-right': o.x += speed * dt; o.y -= speed * dt; break;
      }

      drawPreview(stateRef.current, o.x, o.y);
      animRafId.current = requestAnimationFrame(tick);
    };

    animRafId.current = requestAnimationFrame(tick);
  }, [drawPreview, stopAnim]);

  // ── schedule thumb update ────────────────────────────────────────
  const scheduleThumbUpdate = useCallback((activeOnly: boolean) => {
    if (!activeOnly) thumbActiveOnly.current = false;
    if (thumbTimer.current) clearTimeout(thumbTimer.current);
    const delay = thumbActiveOnly.current ? 280 : 0;
    thumbTimer.current = setTimeout(() => {
      const s = stateRef.current;
      const wasActiveOnly = thumbActiveOnly.current;
      thumbActiveOnly.current = true;
      if (wasActiveOnly) {
        requestAnimationFrame(() => drawThumb(s.pattern, s));
      } else {
        PATTERNS.forEach((pat, i) =>
          setTimeout(() => requestAnimationFrame(() => drawThumb(pat.id, s)), i * 16)
        );
      }
    }, delay);
  }, [drawThumb]);

  // ── trigger render ────────────────────────────────────────────────
  const triggerRender = useCallback((s: PatternState, activeOnly: boolean) => {
    if (!activeOnly) thumbActiveOnly.current = false;

    if (s.animation !== 'none') {
      startAnim(s);
    } else {
      stopAnim();
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        drawPreview(s, 0, 0);
      });
    }

    scheduleThumbUpdate(activeOnly);
    if (typeof window !== 'undefined') {
      history.replaceState(null, '', encodeState(s));
    }
  }, [drawPreview, scheduleThumbUpdate, startAnim, stopAnim]);

  // ── setState ─────────────────────────────────────────────────────
  const setState = useCallback((patch: Partial<PatternState>, activeOnly = true) => {
    const isPatternSwitch = patch.pattern !== undefined && patch.pattern !== stateRef.current.pattern;
    const adjustReset = isPatternSwitch
      ? (PATTERN_DEFAULTS[patch.pattern as string] ?? PATTERN_DEFAULTS[DEFAULT_STATE.pattern]!)
      : {};

    const next: PatternState = {
      ...stateRef.current,
      ...adjustReset,
      ...patch,
    };
    stateRef.current = next;
    setStateRaw(next);
    triggerRender(next, isPatternSwitch ? false : activeOnly);
  }, [triggerRender]);

  const resetState = useCallback(() => {
    const next = { ...DEFAULT_STATE };
    stateRef.current = next;
    setStateRaw(next);
    triggerRender(next, false);
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
      setTimeout(() => requestAnimationFrame(() => drawThumb(pat.id, stateRef.current)), i * 20)
    );
    return () => {
      stopAnim();
      cancelAnimationFrame(rafId.current);
    };
  }, [drawPreview, drawThumb, stopAnim]);

  return { state, setState, canvasRef, thumbRefs, resetState, redraw };
}
