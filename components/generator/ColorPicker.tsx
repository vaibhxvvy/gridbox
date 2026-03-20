'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { validHex } from '@/lib/patterns/engine';
import styles from './ColorPicker.module.css';

// Convert HSV to hex
function hsvToHex(h: number, s: number, v: number): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(f(5))}${toHex(f(3))}${toHex(f(1))}`;
}

// Convert hex to HSV
function hexToHsv(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  if (h.length !== 6) return [0, 0, 0];
  const r = parseInt(h.slice(0,2),16)/255;
  const g = parseInt(h.slice(2,4),16)/255;
  const b = parseInt(h.slice(4,6),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b), d = max - min;
  let hue = 0;
  if (d !== 0) {
    if (max === r) hue = ((g - b) / d) % 6;
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue = Math.round(hue * 60);
    if (hue < 0) hue += 360;
  }
  return [hue, max === 0 ? 0 : d / max, max];
}

interface Props {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

export function ColorPicker({ label, value, onChange }: Props) {
  const [open, setOpen]       = useState(false);
  const [hsv, setHsv]         = useState<[number,number,number]>(() => hexToHsv(value));
  const [hexInput, setHexInput] = useState(value);
  const [dragging, setDragging] = useState<'sb'|'hue'|null>(null);

  const wrapRef  = useRef<HTMLDivElement>(null);
  const sbRef    = useRef<HTMLDivElement>(null);
  const hueRef   = useRef<HTMLDivElement>(null);

  // Sync from external value changes
  useEffect(() => {
    if (document.activeElement?.tagName === 'INPUT') return;
    setHsv(hexToHsv(value));
    setHexInput(value);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [open]);

  const commit = useCallback((h: number, s: number, v: number) => {
    const hex = hsvToHex(h, s, v);
    setHexInput(hex);
    onChange(hex);
  }, [onChange]);

  // SB (saturation/brightness) drag
  const handleSbInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const el = sbRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const s = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const v = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height));
    const next: [number,number,number] = [hsv[0], s, v];
    setHsv(next);
    commit(next[0], next[1], next[2]);
  }, [hsv, commit]);

  // Hue drag
  const handleHueInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const el = hueRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const h = Math.max(0, Math.min(360, ((clientX - rect.left) / rect.width) * 360));
    const next: [number,number,number] = [h, hsv[1], hsv[2]];
    setHsv(next);
    commit(next[0], next[1], next[2]);
  }, [hsv, commit]);

  // Global mouse/touch move/up for drag
  useEffect(() => {
    if (!dragging) return;
    const move = (e: MouseEvent | TouchEvent) => {
      if (dragging === 'sb') handleSbInteraction(e as any);
      if (dragging === 'hue') handleHueInteraction(e as any);
    };
    const up = () => setDragging(null);
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchend', up);
    };
  }, [dragging, handleSbInteraction, handleHueInteraction]);

  const hexColor = hsvToHex(hsv[0], hsv[1], hsv[2]);
  const hueColor = hsvToHex(hsv[0], 1, 1);

  return (
    <div className={styles.block} ref={wrapRef}>
      <div className={styles.row}>
        <button
          className={styles.swatch}
          style={{ background: value }}
          onClick={() => setOpen(o => !o)}
          type="button"
          title={label}
        />
        <span className={styles.label}>{label}</span>
        <input
          className={styles.hexInput}
          type="text"
          value={hexInput}
          onChange={e => {
            setHexInput(e.target.value);
            const v = e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value;
            if (validHex(v)) { setHsv(hexToHsv(v)); onChange(v); }
          }}
          onBlur={() => {
            if (!validHex(hexInput)) setHexInput(value);
          }}
          maxLength={7}
          spellCheck={false}
        />
      </div>

      {open && (
        <div className={styles.picker}>
          {/* SB square */}
          <div
            ref={sbRef}
            className={styles.sbSquare}
            style={{ background: `hue-rotate(${hsv[0]}deg)` }}
            onMouseDown={e => { setDragging('sb'); handleSbInteraction(e); }}
            onTouchStart={e => { setDragging('sb'); handleSbInteraction(e); }}
          >
            <div className={styles.sbWhite} />
            <div className={styles.sbBlack} />
            <div
              className={styles.sbCursor}
              style={{
                left: `${hsv[1] * 100}%`,
                top:  `${(1 - hsv[2]) * 100}%`,
                background: hexColor,
              }}
            />
          </div>

          {/* Hue bar */}
          <div
            ref={hueRef}
            className={styles.hueBar}
            onMouseDown={e => { setDragging('hue'); handleHueInteraction(e); }}
            onTouchStart={e => { setDragging('hue'); handleHueInteraction(e); }}
          >
            <div
              className={styles.hueCursor}
              style={{ left: `${(hsv[0] / 360) * 100}%`, background: hueColor }}
            />
          </div>

          {/* Hex + preview */}
          <div className={styles.hexRow}>
            <div className={styles.previewSwatch} style={{ background: hexColor }} />
            <input
              className={styles.hexInputLarge}
              value={hexInput}
              onChange={e => {
                setHexInput(e.target.value);
                const v = e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value;
                if (validHex(v)) { setHsv(hexToHsv(v)); onChange(v); }
              }}
              spellCheck={false}
              maxLength={7}
            />
          </div>

          {/* Quick swatches */}
          <div className={styles.quickSwatches}>
            {['#0a0a0a','#111','#c8ff00','#00ff41','#00ccff','#ff4d00','#ffffff','#ff00cc','#ffcc00','#8866ff','#00ddaa','#ff5555'].map(h => (
              <button
                key={h}
                className={styles.quickSwatch}
                style={{ background: h }}
                onClick={() => { setHsv(hexToHsv(h)); setHexInput(h); onChange(h); }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
