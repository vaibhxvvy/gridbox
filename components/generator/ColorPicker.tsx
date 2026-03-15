'use client';

import { useState, useEffect, useRef } from 'react';
import { validHex } from '@/lib/patterns/engine';
import styles from './ColorPicker.module.css';

// Preset shade palettes
const DARK_SHADES  = ['#0a0a0a','#111111','#1a1a1a','#0d1a0d','#050a10','#0d0d1a','#1a0d0d','#0a0a12'];
const BRIGHT_SHADES = ['#c8ff00','#00ff41','#00ccff','#ff4d00','#ffffff','#ff00cc','#ffcc00','#00ffcc'];
const MID_SHADES   = ['#2a2a2a','#1a2a1a','#0a1a2a','#2a1a0a','#1a0a2a','#2a2a1a','#1a2a2a','#2a1a1a'];

interface Props {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

export function ColorPicker({ label, value, onChange }: Props) {
  const [raw,      setRaw]      = useState(value);
  const [open,     setOpen]     = useState(false);
  const [tab,      setTab]      = useState<'dark'|'mid'|'bright'>('dark');
  const wrapRef = useRef<HTMLDivElement>(null);

  // Sync when external value changes (preset/reset)
  useEffect(() => { setRaw(value); }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [open]);

  const commit = (hex: string) => {
    setRaw(hex);
    onChange(hex);
  };

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value;
    setRaw(v);
    if (!v.startsWith('#')) v = '#' + v;
    if (validHex(v)) onChange(v);
  };

  const handleBlur = () => {
    let v = raw;
    if (!v.startsWith('#')) v = '#' + v;
    if (!validHex(v)) setRaw(value);
    else { setRaw(v); onChange(v); }
  };

  const shades = tab === 'dark' ? DARK_SHADES : tab === 'bright' ? BRIGHT_SHADES : MID_SHADES;

  return (
    <div className={styles.block} ref={wrapRef}>
      <label className={styles.label}>{label}</label>
      <div className={styles.row}>
        {/* Color swatch — opens popup */}
        <button
          className={styles.swatch}
          style={{ background: value }}
          onClick={() => setOpen(o => !o)}
          type="button"
          title="Pick colour"
        />
        {/* Native picker hidden behind swatch */}
        <input
          id={`native-${label}`}
          type="color"
          value={value}
          className={styles.nativePicker}
          onChange={e => commit(e.target.value)}
        />
        {/* Hex input */}
        <input
          className={styles.hexInput}
          type="text"
          value={raw}
          onChange={handleHexInput}
          onBlur={handleBlur}
          maxLength={7}
          spellCheck={false}
          placeholder="#000000"
        />
        {/* Native picker trigger */}
        <button
          className={styles.eyedrop}
          onClick={() => document.getElementById(`native-${label}`)?.click()}
          type="button"
          title="Custom colour"
        >
          ⊕
        </button>
      </div>

      {/* Shade popup */}
      {open && (
        <div className={styles.popup}>
          <div className={styles.popupTabs}>
            {(['dark','mid','bright'] as const).map(t => (
              <button
                key={t}
                className={`${styles.popupTab} ${tab === t ? styles.popupTabActive : ''}`}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className={styles.swatchGrid}>
            {shades.map(hex => (
              <button
                key={hex}
                className={`${styles.swatchCell} ${value === hex ? styles.swatchCellActive : ''}`}
                style={{ background: hex }}
                onClick={() => { commit(hex); setOpen(false); }}
                title={hex}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
