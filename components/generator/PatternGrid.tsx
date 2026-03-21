'use client';

import { motion } from 'motion/react';
import { PATTERNS } from '@/lib/patterns/engine';
import styles from './PatternGrid.module.css';

interface Props {
  active:    string;
  thumbRefs: React.MutableRefObject<Record<string, HTMLCanvasElement | null>>;
  onSelect:  (id: string) => void;
}

export function PatternGrid({ active, thumbRefs, onSelect }: Props) {
  return (
    <div className={styles.grid}>
      {PATTERNS.map(p => (
        <motion.button
          key={p.id}
          className={`${styles.cell} ${p.id === active ? styles.active : ''}`}
          onClick={() => onSelect(p.id)}
          title={p.name}
          whileHover={{ scale: 1.05, borderColor: 'var(--gb-accent)' }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        >
          <canvas
            width={58}
            height={58}
            ref={el => { thumbRefs.current[p.id] = el; }}
            className={styles.canvas}
          />
          <span className={styles.label}>{p.name}</span>
          {p.id === active && (
            <motion.div
              className={styles.activePing}
              layoutId="active-pattern"
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
}
