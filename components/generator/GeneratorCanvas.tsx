'use client';

import { useEffect } from 'react';
import type { PatternState } from '@/types/pattern';
import styles from './GeneratorCanvas.module.css';

const CANVAS_W = 1280;
const CANVAS_H = 720;

interface Props {
  canvasRef:    React.RefObject<HTMLCanvasElement | null>;
  onResize:     (w: number, h: number) => void;
  state:        PatternState;
  aspectRatio?: string; // e.g. '16/9', '9/16', '4/3'
  badgeText?:   string;
}

export function GeneratorCanvas({ canvasRef, onResize, state, aspectRatio = '16/9', badgeText }: Props) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (canvas.width !== CANVAS_W || canvas.height !== CANVAS_H) {
      canvas.width  = CANVAS_W;
      canvas.height = CANVAS_H;
      onResize(CANVAS_W, CANVAS_H);
    }
  }, [canvasRef, onResize]);

  const isAnimating = state.animation !== 'none';

  return (
    <div className={styles.area}>
      <div
        className={`${styles.box} ${isAnimating ? styles.animBorder : ''}`}
        style={{ aspectRatio }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className={styles.canvas}
        />
        {isAnimating && <div className={styles.animLabel}>{state.animation} ⟳</div>}
        {badgeText && !isAnimating && <div className={styles.badge}>{badgeText}</div>}
      </div>
    </div>
  );
}
