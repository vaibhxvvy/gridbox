'use client';

import { useEffect, useRef } from 'react';
import type { PatternState } from '@/types/pattern';
import styles from './GeneratorCanvas.module.css';

const CANVAS_W = 1280;
const CANVAS_H = 720;

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
      if (window.innerWidth <= 768) {
        const w = wrap.clientWidth;
        setSize(w, Math.round(w * 9 / 16));
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

  const isAnimating = state.animation !== 'none';

  return (
    <div className={styles.area} ref={wrapRef}>
      <div className={`${styles.box} ${isAnimating ? styles.animBorder : ''}`}>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className={styles.canvas}
        />
        {badgeText && !isAnimating && <div className={styles.badge}>{badgeText}</div>}
        {isAnimating && (
          <div className={styles.animLabel}>{state.animation} ⟳</div>
        )}
      </div>
    </div>
  );
}
