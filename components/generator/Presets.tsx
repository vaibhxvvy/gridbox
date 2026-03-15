'use client';

import { PRESETS } from '@/lib/patterns/presets';
import type { PatternState } from '@/types/pattern';
import styles from './Presets.module.css';

interface Props {
  onSelect: (state: PatternState) => void;
}

export function Presets({ onSelect }: Props) {
  return (
    <div className={styles.wrap}>
      <select
        className={styles.select}
        value=""
        onChange={e => {
          const preset = PRESETS.find(p => p.name === e.target.value);
          if (preset) onSelect(preset.state);
        }}
      >
        <option value="" disabled>choose a preset…</option>
        {PRESETS.map(p => (
          <option key={p.name} value={p.name}>
            {p.name}
          </option>
        ))}
      </select>
      {/* Visual swatch grid — click to apply */}
      <div className={styles.swatches}>
        {PRESETS.map(p => (
          <button
            key={p.name}
            className={styles.swatch}
            onClick={() => onSelect(p.state)}
            title={p.name}
            style={{ background: p.state.bgColor }}
          >
            <span
              className={styles.swatchDot}
              style={{ background: p.accent }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
