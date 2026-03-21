'use client';

import { useEffect } from 'react';
import { motion } from 'motion/react';
import type { PatternState } from '@/types/pattern';
import styles from './GeneratorCanvas.module.css';

const CANVAS_W = 1280;
const CANVAS_H = 720;

interface Props {
  canvasRef:    React.RefObject<HTMLCanvasElement | null>;
  onResize:     (w: number, h: number) => void;
  state:        PatternState;
  aspectRatio?: string; // e.g. '16/9', '3/4'
  phoneMode?:   boolean;
}

export function GeneratorCanvas({ canvasRef, onResize, state, aspectRatio = '16/9', phoneMode }: Props) {
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
    // Outer container: always a dark 16:9 area — the "stage"
    <div className={styles.stage}>

      {phoneMode ? (
        // Phone mode: portrait box centred inside the 16:9 dark stage
        <motion.div
          className={`${styles.frame} ${styles.framePhone} ${isAnimating ? styles.animBorder : ''}`}
          layout
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className={styles.canvas} />
          {isAnimating && <div className={styles.animLabel}>⟳ {state.animation}</div>}
        </motion.div>
      ) : (
        // Web / custom: fills stage width at the given aspect ratio
        <motion.div
          className={`${styles.frame} ${isAnimating ? styles.animBorder : ''}`}
          style={{ aspectRatio }}
          layout
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className={styles.canvas} />
          {isAnimating && <div className={styles.animLabel}>⟳ {state.animation}</div>}
        </motion.div>
      )}

    </div>
  );
}
