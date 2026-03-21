'use client';

import * as Collapsible from '@radix-ui/react-collapsible';
import * as Tooltip     from '@radix-ui/react-tooltip';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import type { PatternState, AnimationDir } from '@/types/pattern';
import Link      from 'next/link';
import { PatternGrid } from './PatternGrid';
import { Slider }      from './Slider';
import { ColorPicker } from './ColorPicker';
import { Presets }     from './Presets';
import styles from './GeneratorSidebar.module.css';

// Chevron SVG — open/close indicator for collapsible sections
const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const DirIcons: Record<string, React.ReactNode> = {
  left:        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  right:       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  up:          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
  down:        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>,
  'diag-left': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="17" x2="7" y2="7"/><polyline points="7 17 7 7 17 7"/></svg>,
  'diag-right':<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>,
};

const ANIM_DIRS: { id: AnimationDir; label: string }[] = [
  { id: 'left',       label: 'Left Side'        },
  { id: 'right',      label: 'Right Side'       },
  { id: 'up',         label: 'Upward'           },
  { id: 'down',       label: 'Downward'         },
  { id: 'diag-left',  label: 'Top Left Corner'  },
  { id: 'diag-right', label: 'Top Right Corner' },
];

interface Props {
  state:     PatternState;
  thumbRefs: React.MutableRefObject<Record<string, HTMLCanvasElement | null>>;
  onChange:  (patch: Partial<PatternState>, activeOnly?: boolean) => void;
  onReset:   () => void;
}

function Section({
  title, defaultOpen = true, future = false,
  children,
}: {
  title: string; defaultOpen?: boolean; future?: boolean; children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (future) {
    return (
      <div className={styles.sectionHead} style={{ opacity: 0.4, cursor: 'default' }}>
        <span className={styles.sectionTitle}>{title}</span>
        <span className={styles.futureBadge}>soon</span>
      </div>
    );
  }

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger asChild>
        <div className={styles.sectionHead}>
          <span className={styles.sectionTitle}>{title}</span>
          <motion.span
            className={styles.chevron}
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <ChevronIcon />
          </motion.span>
        </div>
      </Collapsible.Trigger>
      <AnimatePresence initial={false}>
        {open && (
          <Collapsible.Content forceMount asChild>
            <motion.div
              className={styles.sectionBody}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              {children}
            </motion.div>
          </Collapsible.Content>
        )}
      </AnimatePresence>
    </Collapsible.Root>
  );
}

export function GeneratorSidebar({ state, thumbRefs, onChange, onReset }: Props) {
  const animOn = state.animation !== 'none';

  return (
    <Tooltip.Provider delayDuration={400}>
      <aside className={styles.sidebar}>

        <Link href="/install" className={styles.installBanner}>
          <span className={styles.installDot} />
          <code className={styles.installCmd}>npm install gridmint</code>
          <span className={styles.installArrow}>→</span>
        </Link>

        {/* PATTERNS */}
        <Section title="PATTERNS" defaultOpen>
          <PatternGrid
            active={state.pattern}
            thumbRefs={thumbRefs}
            onSelect={id => onChange({ pattern: id }, false)}
          />
        </Section>

        {/* ADJUST — debounce heavy sliders so canvas doesn't redraw every px */}
        <Section title="ADJUST" defaultOpen>
          <div className={styles.sliders}>
            <Slider label="size"      value={state.size}      min={4}  max={state.pattern === 'rect' ? 240 : 80} unit="px" debounce={30} onChange={v => onChange({ size: v })} />
            <Slider label="opacity"   value={state.opacity}   min={1}  max={100} unit="%" onChange={v => onChange({ opacity: v })} />
            <Slider label="thickness" value={state.thickness} min={1}  max={20}  unit="px" onChange={v => onChange({ thickness: v })} />
            <Slider label="rotation"  value={state.rotation}  min={0}  max={180} unit="°" debounce={30} onChange={v => onChange({ rotation: v })} />
          </div>
        </Section>

        {/* ANIMATE */}
        <Section title="ANIMATE" defaultOpen>
          {/* Toggle */}
          <div className={styles.animToggleRow}>
            <span className={styles.animToggleLabel}>{animOn ? 'on' : 'off'}</span>
            <button
              className={`${styles.toggle} ${animOn ? styles.toggleOn : ''}`}
              onClick={() => onChange({ animation: animOn ? 'none' : 'right' })}
            >
              <motion.span
                className={styles.toggleKnob}
                animate={{ x: animOn ? 16 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          {/* Direction buttons with tooltips */}
          <div className={`${styles.dirGrid} ${!animOn ? styles.dirGridDisabled : ''}`}>
            {ANIM_DIRS.map(d => (
              <Tooltip.Root key={d.id}>
                <Tooltip.Trigger asChild>
                  <motion.button
                    className={`${styles.dirBtn} ${animOn && state.animation === d.id ? styles.dirBtnActive : ''}`}
                    onClick={() => onChange({ animation: d.id })}
                    disabled={!animOn}
                    whileHover={animOn ? { scale: 1.08 } : {}}
                    whileTap={animOn ? { scale: 0.94 } : {}}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    {DirIcons[d.id]}
                  </motion.button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className={styles.tooltip} sideOffset={5}>
                    {d.label}
                    <Tooltip.Arrow className={styles.tooltipArrow} />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            ))}
          </div>

          {/* Speed slider */}
          <AnimatePresence>
            {animOn && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                style={{ overflow: 'hidden' }}
              >
                <div className={styles.speedRow}>
                  <Slider label="speed" value={state.animSpeed ?? 40} min={5} max={200} unit="" onChange={v => onChange({ animSpeed: v })} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Section>

        {/* COLORS */}
        <Section title="COLORS" defaultOpen>
          <ColorPicker label="background" value={state.bgColor}  onChange={v => onChange({ bgColor: v })} />
          <ColorPicker label="pattern"    value={state.patColor} onChange={v => onChange({ patColor: v })} />
          <button className={styles.resetBtn} onClick={onReset}>↺ reset all</button>
        </Section>

        {/* PRESETS */}
        <Section title="PRESETS" defaultOpen={false}>
          <Presets state={state} onSelect={patch => onChange(patch)} />
        </Section>

        {/* Future sections */}
        <Section title="GRADIENTS" future />
        <Section title="TEXTURES"  future />

      </aside>
    </Tooltip.Provider>
  );
}
