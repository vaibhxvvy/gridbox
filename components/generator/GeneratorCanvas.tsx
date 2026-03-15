'use client';

import { useEffect, useRef } from 'react';
import type { PatternState, AnimationDir } from '@/types/pattern';
import { getCSS } from '@/lib/patterns/engine';
import styles from './GeneratorCanvas.module.css';

const CANVAS_W = 830;
const CANVAS_H = 467;

// Returns the CSS animation style for background-position
function getAnimStyle(dir: AnimationDir, size: number): React.CSSProperties {
  if (dir === 'none') return {};
  const s = `${size}px`;
  const s2 = `${size * 2}px`;
  const dur = '3s';

  const map: Record<AnimationDir, React.CSSProperties> = {
    none:       {},
    left:       { backgroundPosition: '0 0', animation: `gm-left ${dur} linear infinite` },
    right:      { backgroundPosition: '0 0', animation: `gm-right ${dur} linear infinite` },
    up:         { backgroundPosition: '0 0', animation: `gm-up ${dur} linear infinite` },
    down:       { backgroundPosition: '0 0', animation: `gm-down ${dur} linear infinite` },
    'diag-left':  { backgroundPosition: '0 0', animation: `gm-diag-left ${dur} linear infinite` },
    'diag-right': { backgroundPosition: '0 0', animation: `gm-diag-right ${dur} linear infinite` },
  };
  return map[dir];
}

interface Props {
  canvasRef:   React.RefObject<HTMLCanvasElement | null>;
  onResize:    (w: number, h: number) => void;
  badgeText?:  string;
  state:       PatternState;
}

export function GeneratorCanvas({ canvasRef, onResize, badgeText, state }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const didInit = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setSize = (w: number, h: number) => {
      if (canvas.width === w && canvas.height === h) return;
      canvas.width  = w;
      canvas.height = h;
      onResize(w, h);
    };

    const ro = new ResizeObserver(() => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        const w = wrap.clientWidth;
        const h = Math.round(w * 9 / 16);
        setSize(w, h);
      } else if (!didInit.current) {
        didInit.current = true;
        setSize(CANVAS_W, CANVAS_H);
      }
    });

    const wrap = wrapRef.current;
    if (wrap) ro.observe(wrap);

    if (window.innerWidth <= 768) {
      const w = wrap?.clientWidth ?? CANVAS_W;
      setSize(w, Math.round(w * 9 / 16));
    } else {
      didInit.current = true;
      setSize(CANVAS_W, CANVAS_H);
    }

    return () => ro.disconnect();
  }, [canvasRef, onResize]);

  // Build animation overlay CSS from state
  const hasAnim = state.animation !== 'none';
  const cssLines = getCSS(state).split('\n');
  const bgOverlay: React.CSSProperties = {};
  cssLines.forEach(line => {
    const idx = line.indexOf(':');
    if (idx === -1) return;
    const key   = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/;$/, '');
    if (!key || !value || key.startsWith('/*')) return;
    const camel = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    (bgOverlay as any)[camel] = value;
  });

  return (
    <div className={styles.area} ref={wrapRef}>
      <div className={`${styles.box} ${hasAnim ? styles.animBox : ''}`}>
        {/* Static canvas — always drawn */}
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className={`${styles.canvas} ${hasAnim ? styles.canvasHidden : ''}`}
        />
        {/* Animation overlay — CSS background-position loop */}
        {hasAnim && (
          <div
            className={styles.animOverlay}
            style={{
              ...bgOverlay,
              ...getAnimStyle(state.animation, state.size),
            }}
          />
        )}
        {badgeText && <div className={styles.badge}>{badgeText}</div>}
      </div>
    </div>
  );
}
