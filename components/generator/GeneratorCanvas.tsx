'use client';

import { useEffect, useRef } from 'react';
import styles from './GeneratorCanvas.module.css';

const CANVAS_W = 830;
const CANVAS_H = 467;

interface Props {
  canvasRef:  React.RefObject<HTMLCanvasElement | null>;
  onResize:   (w: number, h: number) => void;
  badgeText?: string;
}

export function GeneratorCanvas({ canvasRef, onResize, badgeText }: Props) {
  const wrapRef  = useRef<HTMLDivElement>(null);
  const didInit  = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setSize = (w: number, h: number) => {
      if (canvas.width === w && canvas.height === h) return;
      canvas.width  = w;
      canvas.height = h;
      onResize(w, h);
    };

    // On mobile: fill container width at 16:9
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

    // Initial
    if (window.innerWidth <= 768) {
      const w = wrap?.clientWidth ?? CANVAS_W;
      setSize(w, Math.round(w * 9 / 16));
    } else {
      didInit.current = true;
      setSize(CANVAS_W, CANVAS_H);
    }

    return () => ro.disconnect();
  }, [canvasRef, onResize]);

  return (
    <div className={styles.area} ref={wrapRef}>
      <div className={styles.box}>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className={styles.canvas}
        />
        {badgeText && <div className={styles.badge}>{badgeText}</div>}
      </div>
    </div>
  );
}
