'use client';

import type { PatternState, AnimationDir } from '@/types/pattern';
import Link from 'next/link';
import { PatternGrid } from './PatternGrid';
import { Slider }      from './Slider';
import { ColorPicker } from './ColorPicker';
import { Presets }     from './Presets';
import styles from './GeneratorSidebar.module.css';

const ANIM_DIRS: { id: AnimationDir; label: string; icon: string }[] = [
  { id: 'none',       label: 'off',        icon: '○' },
  { id: 'left',       label: '←',          icon: '←' },
  { id: 'right',      label: '→',          icon: '→' },
  { id: 'up',         label: '↑',          icon: '↑' },
  { id: 'down',       label: '↓',          icon: '↓' },
  { id: 'diag-left',  label: '↙',          icon: '↙' },
  { id: 'diag-right', label: '↘',          icon: '↘' },
];

interface Props {
  state:     PatternState;
  thumbRefs: React.MutableRefObject<Record<string, HTMLCanvasElement | null>>;
  onChange:  (patch: Partial<PatternState>, activeOnly?: boolean) => void;
  onReset:   () => void;
}

export function GeneratorSidebar({ state, thumbRefs, onChange, onReset }: Props) {
  return (
    <aside className={styles.sidebar}>

      {/* Install banner */}
      <Link href="/install" className={styles.installBanner}>
        <span className={styles.installDot} />
        <code className={styles.installCmd}>npm install gridmint</code>
        <span className={styles.installArrow}>→</span>
      </Link>

      {/* Patterns */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>patterns</h3>
        <PatternGrid
          active={state.pattern}
          thumbRefs={thumbRefs}
          onSelect={id => onChange({ pattern: id }, false)}
        />
      </section>

      {/* Adjust */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>adjust</h3>
        <div className={styles.sliders}>
          <Slider label="size"      value={state.size}      min={4}  max={state.pattern === 'rect' ? 240 : 80} unit="px" onChange={v => onChange({ size: v })} />
          <Slider label="opacity"   value={state.opacity}   min={1}  max={100} unit="%" onChange={v => onChange({ opacity: v })} />
          <Slider label="thickness" value={state.thickness} min={1}  max={20}  unit="px" onChange={v => onChange({ thickness: v })} />
          <Slider label="rotation"  value={state.rotation}  min={0}  max={180} unit="°" onChange={v => onChange({ rotation: v })} />
        </div>
      </section>

      {/* Animation */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>animate</h3>
        <div className={styles.animGrid}>
          {ANIM_DIRS.map(d => (
            <button
              key={d.id}
              className={`${styles.animBtn} ${state.animation === d.id ? styles.animBtnActive : ''}`}
              onClick={() => onChange({ animation: d.id })}
              title={d.id === 'none' ? 'No animation' : `Animate ${d.id}`}
            >
              {d.icon}
            </button>
          ))}
        </div>
        {state.animation !== 'none' && (
          <div className={styles.animControls}>
            <Slider
              label="speed"
              value={state.animSpeed ?? 40}
              min={5}
              max={200}
              unit=""
              onChange={v => onChange({ animSpeed: v })}
            />
          </div>
        )}
      </section>

      {/* Colours */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>colours</h3>
        <div className={styles.colorStack}>
          <ColorPicker label="background" value={state.bgColor}  onChange={v => onChange({ bgColor: v })} />
          <ColorPicker label="pattern"    value={state.patColor} onChange={v => onChange({ patColor: v })} />
        </div>
        <button className={styles.resetBtn} onClick={onReset}>↺ reset all</button>
      </section>

      {/* Presets */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>presets</h3>
        <Presets onSelect={s => onChange(s, false)} />
      </section>

    </aside>
  );
}
