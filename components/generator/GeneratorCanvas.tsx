'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { gsap } from 'gsap';
import type { PatternState } from '@/types/pattern';
import { CSS_ANIMATABLE, getAnimatableCSS } from '@/lib/patterns/engine';
import styles from './GeneratorCanvas.module.css';

const CANVAS_W = 1920;
const CANVAS_H = 1080;

type PreviewLayout = '16:9' | 'phone' | 'custom';

interface Props {
  canvasRef:      React.RefObject<HTMLCanvasElement | null>;
  onResize:       (w: number, h: number) => void;
  state:          PatternState;
  layout:         PreviewLayout;
  customW:        number;
  customH:        number;
  onLayoutChange: (l: PreviewLayout) => void;
  onCustomW:      (v: string) => void;
  onCustomH:      (v: string) => void;
  customWStr:     string;
  customHStr:     string;
  isPaused:       boolean;
}

export function GeneratorCanvas({
  canvasRef, onResize, state,
  layout, customW, customH,
  onLayoutChange, onCustomW, onCustomH,
  customWStr, customHStr,
  isPaused,
}: Props) {
  const cssLayerRef = useRef<HTMLDivElement>(null);
  const tweenRef    = useRef<gsap.core.Tween | null>(null);
  const posRef      = useRef({ x: 0, y: 0 });

  // Set canvas size once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (canvas.width !== CANVAS_W || canvas.height !== CANVAS_H) {
      canvas.width  = CANVAS_W;
      canvas.height = CANVAS_H;
      onResize(CANVAS_W, CANVAS_H);
    }
  }, [canvasRef, onResize]);

  const isAnimating    = state.animation !== 'none';
  const isCSSMode      = isAnimating && CSS_ANIMATABLE.has(state.pattern);
  const animCSS        = isCSSMode ? getAnimatableCSS(state) : null;

  // ── GSAP CSS animation ─────────────────────────────────────────────
  const stopTween = useCallback(() => {
    tweenRef.current?.kill();
    tweenRef.current = null;
  }, []);

  const startTween = useCallback((s: PatternState, css: NonNullable<ReturnType<typeof getAnimatableCSS>>) => {
    stopTween();
    const el = cssLayerRef.current;
    if (!el) return;

    // Distance to move per "cycle" = one background-size tile
    // Parse first value from background-size e.g. "24px 24px" → 24
    const sizeVal = parseFloat(css.backgroundSize.split(' ')[0]) || s.size;
    const speed   = s.animSpeed ?? 40; // px/sec
    const dur     = sizeVal / speed;   // seconds per tile

    // Determine direction
    let dx = 0, dy = 0;
    switch (s.animation) {
      case 'left':       dx = -sizeVal; break;
      case 'right':      dx =  sizeVal; break;
      case 'up':         dy = -sizeVal; break;
      case 'down':       dy =  sizeVal; break;
      case 'diag-left':  dx = -sizeVal; dy = -sizeVal; break;
      case 'diag-right': dx =  sizeVal; dy = -sizeVal; break;
    }

    // Start from 0 every time — CSS background-position wraps naturally
    gsap.set(el, { backgroundPosition: css.backgroundPosition ?? '0px 0px' });
    posRef.current = { x: 0, y: 0 };

    tweenRef.current = gsap.to(posRef.current, {
      x: posRef.current.x + dx,
      y: posRef.current.y + dy,
      duration: dur,
      ease: 'none',
      repeat: -1, // infinite
      onUpdate() {
        if (!cssLayerRef.current) return;
        cssLayerRef.current.style.backgroundPosition =
          `${posRef.current.x}px ${posRef.current.y}px`;
      },
    });
  }, [stopTween]);

  // Pause / resume
  useEffect(() => {
    if (!tweenRef.current) return;
    if (isPaused) tweenRef.current.pause();
    else tweenRef.current.resume();
  }, [isPaused]);

  // Start / stop tween based on mode
  useEffect(() => {
    if (isCSSMode && animCSS) {
      startTween(state, animCSS);
    } else {
      stopTween();
      // Reset CSS layer position
      if (cssLayerRef.current) {
        cssLayerRef.current.style.backgroundPosition = '0px 0px';
      }
    }
    return stopTween;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCSSMode, state.animation, state.pattern, state.animSpeed,
      state.size, state.patColor, state.bgColor, state.opacity,
      state.thickness, state.rotation]);

  const isPhone   = layout === 'phone';
  const isCustom  = layout === 'custom';
  const frameAspect = isPhone ? '9/16' : isCustom ? `${customW}/${customH}` : '16/9';

  return (
    <div className={styles.stage}>

      {/* Layout toggle overlay */}
      <div className={styles.layoutOverlay}>
        <div className={styles.layoutPills}>
          {(['16:9', 'phone', 'custom'] as PreviewLayout[]).map(l => (
            <button
              key={l}
              className={`${styles.layoutPill} ${layout === l ? styles.layoutPillActive : ''}`}
              onClick={() => onLayoutChange(l)}
            >
              {l === '16:9' ? 'Web' : l === 'phone' ? 'Mobile' : 'Custom'}
            </button>
          ))}
        </div>
        <AnimatePresence>
          {isCustom && (
            <motion.div
              className={styles.customInputs}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{    opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
            >
              <input className={styles.ratioInput} type="text" value={customWStr}
                onChange={e => onCustomW(e.target.value)} placeholder="16" maxLength={3}/>
              <span className={styles.ratioSep}>:</span>
              <input className={styles.ratioInput} type="text" value={customHStr}
                onChange={e => onCustomH(e.target.value)} placeholder="9" maxLength={3}/>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pattern frame */}
      <motion.div
        className={`${styles.frame} ${isAnimating ? styles.animBorder : ''}`}
        style={{ aspectRatio: frameAspect }}
        layout
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      >
        {/* Canvas — always present, hidden during CSS animation */}
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className={styles.canvas}
          style={{ opacity: isCSSMode ? 0 : 1 }}
        />

        {/* CSS seamless layer — shown only for CSS-animatable patterns */}
        {isCSSMode && animCSS && (
          <div
            ref={cssLayerRef}
            className={styles.cssLayer}
            style={{
              backgroundColor:   state.bgColor,
              backgroundImage:   animCSS.backgroundImage,
              backgroundSize:    animCSS.backgroundSize,
              backgroundPosition: animCSS.backgroundPosition ?? '0px 0px',
            }}
          />
        )}

        {/* Animation label */}
        {isAnimating && (
          <div className={styles.animLabel}>
            {isCSSMode ? '✦ seamless' : '⟳ '}{!isCSSMode && state.animation}
          </div>
        )}
      </motion.div>

    </div>
  );
}
