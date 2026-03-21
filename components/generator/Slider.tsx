'use client';

import * as RadixSlider from '@radix-ui/react-slider';
import { useDebounce } from 'use-debounce';
import { useState, useEffect } from 'react';
import styles from './Slider.module.css';

interface Props {
  label:    string;
  value:    number;
  min:      number;
  max:      number;
  unit?:    string;
  debounce?: number; // ms, default 0
  onChange: (v: number) => void;
}

export function Slider({ label, value, min, max, unit = '', debounce: debounceMs = 0, onChange }: Props) {
  // Local display value for instant feedback
  const [local, setLocal] = useState(value);
  const [debouncedLocal] = useDebounce(local, debounceMs);

  // Sync external value changes (e.g. preset apply, reset)
  useEffect(() => { setLocal(value); }, [value]);

  // Fire onChange only after debounce
  useEffect(() => {
    if (debouncedLocal !== value) onChange(debouncedLocal);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedLocal]);

  return (
    <div className={styles.ctrl}>
      <div className={styles.labelRow}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{local}{unit}</span>
      </div>
      <RadixSlider.Root
        className={styles.root}
        min={min}
        max={max}
        step={1}
        value={[local]}
        onValueChange={([v]) => setLocal(v)}
      >
        <RadixSlider.Track className={styles.track}>
          <RadixSlider.Range className={styles.range} />
        </RadixSlider.Track>
        <RadixSlider.Thumb className={styles.thumb} aria-label={label} />
      </RadixSlider.Root>
    </div>
  );
}
