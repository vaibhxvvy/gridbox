'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePatternRenderer }           from '@/lib/use-pattern-renderer';
import { PATTERNS }                     from '@/lib/patterns/engine';
import { decodeState }                  from '@/lib/url-state';
import { useGithubStars }               from '@/lib/use-github-stars';
import { GeneratorSidebar }             from '@/components/generator/GeneratorSidebar';
import { GeneratorCanvas }              from '@/components/generator/GeneratorCanvas';
import { CodeOutput }                   from '@/components/generator/CodeOutput';
import { Toast }                        from '@/components/ui/Toast';
import styles from './GeneratorApp.module.css';

export default function GeneratorApp() {
  const { state, setState, canvasRef, thumbRefs, resetState, redraw } = usePatternRenderer();
  const [badge,  setBadge]  = useState('');
  const [toast,  setToast]  = useState({ visible: false, msg: '' });
  const stars = useGithubStars('vaibhxvvy/gridbox');

  // Load URL state on mount
  useEffect(() => {
    if (window.location.search) {
      const decoded = decodeState(window.location.search);
      setState(decoded, false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast({ visible: true, msg });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2200);
  }, []);

  const handleResize = useCallback((w: number, h: number) => {
    setBadge(`${w} × ${h}  16:9`);
    // Canvas dims were just reset — redraw immediately
    requestAnimationFrame(() => redraw());
  }, [redraw]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => showToast('link copied to clipboard'));
  }, [showToast]);

  const handleRandomize = useCallback(() => {
    // Curated palette pairs — bg always dark, pat always vivid
    const palettes = [
      { bg: '#0a0a0a', pat: '#c8ff00' }, // lime
      { bg: '#080810', pat: '#00ccff' }, // cyan
      { bg: '#0d0a0a', pat: '#ff4d00' }, // orange
      { bg: '#0a0a12', pat: '#8866ff' }, // purple
      { bg: '#080f08', pat: '#00ff88' }, // green
      { bg: '#100808', pat: '#ff5566' }, // red
      { bg: '#080810', pat: '#ffcc00' }, // gold
      { bg: '#06100e', pat: '#00ddaa' }, // teal
      { bg: '#0e0810', pat: '#ff88cc' }, // pink
      { bg: '#111111', pat: '#ffffff' }, // white on dark
    ];
    const palette = palettes[Math.floor(Math.random() * palettes.length)];

    // Weighted pattern list — exclude noise from animation (looks bad)
    const animatablePatterns = ['dots','grid','rect','diagonal','hatch','plus','hex','waves','circuit'];
    const allPatterns = PATTERNS.map(p => p.id);

    // Animations with weights — none is less likely to keep it interesting
    const animChoices: Array<import('@/types/pattern').AnimationDir> =
      ['none','none','left','right','up','down','diag-left','diag-right'];
    const animation = animChoices[Math.floor(Math.random() * animChoices.length)];

    // If animating, pick only patterns that look good animated
    const patPool = animation !== 'none' ? animatablePatterns : allPatterns;
    const pattern = patPool[Math.floor(Math.random() * patPool.length)];

    // Per-pattern sensible size ranges
    const sizeMap: Record<string, [number,number]> = {
      noise: [10,30], dots: [10,28], grid: [16,40], rect: [20,60],
      diagonal: [8,20], hatch: [10,22], carbon: [4,12], halftone: [10,24],
      plus: [14,30], hex: [16,34], waves: [14,30], circuit: [16,36],
    };
    const [sMin, sMax] = sizeMap[pattern] ?? [10, 30];
    const size = Math.floor(Math.random() * (sMax - sMin)) + sMin;

    setState({
      pattern,
      bgColor:   palette.bg,
      patColor:  palette.pat,
      size,
      opacity:   Math.floor(Math.random() * 40) + 20,
      thickness: Math.floor(Math.random() * 2) + 1,
      rotation:  [0, 0, 0, 45, 90, 135][Math.floor(Math.random() * 6)],
      animation,
      animSpeed: animation !== 'none' ? Math.floor(Math.random() * 60) + 20 : 40,
    }, false);
    showToast('randomized ✦');
  }, [setState, showToast]);

  // Keyboard shortcuts
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === 's' && !e.metaKey && !e.ctrlKey) handleShare();
      if (e.key === 'r') resetState();
      if (e.key === 'x') handleRandomize();
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const ids  = PATTERNS.map(p => p.id);
        const idx  = ids.indexOf(state.pattern);
        const next = e.key === 'ArrowRight'
          ? (idx + 1) % ids.length
          : (idx - 1 + ids.length) % ids.length;
        setState({ pattern: ids[next] }, false);
      }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [state, setState, resetState, handleShare, handleRandomize]);

  return (
    <div className={styles.page}>

      {/* TOPBAR */}
      <header className={styles.topbar}>
        <Link href="/" className={styles.topbarLogo}>gridmint</Link>
        <div className={styles.topbarActions}>
          <button className={`${styles.tbBtn} ${styles.tbRandom}`} onClick={handleRandomize} title="Randomize (X)">
            ✦ random
          </button>
          <button className={`${styles.tbBtn} ${styles.tbShare}`} onClick={handleShare}>
            ⇧ share
          </button>
          <a
            className={`${styles.tbBtn} ${styles.tbGithub}`}
            href="https://github.com/vaibhxvvy/gridbox"
            target="_blank"
            rel="noopener noreferrer"
          >
            ★ {stars}
          </a>
        </div>
      </header>

      {/* SHELL */}
      <div className={styles.shell}>

        <GeneratorSidebar
          state={state}
          thumbRefs={thumbRefs}
          onChange={setState}
          onReset={resetState}
        />

        <div className={styles.rightCol}>

          <GeneratorCanvas
            canvasRef={canvasRef}
            onResize={handleResize}
            badgeText={badge}
            state={state}
          />

          {/* Info bar — sits directly below canvas, no gap */}
          <div className={styles.infoBar}>
            <span className={styles.infoPattern}>{state.pattern}</span>
            <span className={styles.infoSep}>·</span>
            <span>{state.size}px</span>
            <span className={styles.infoSep}>·</span>
            <span>{state.opacity}%</span>
            <span className={styles.infoSep}>·</span>
            <span>{state.thickness}px stroke</span>
            <span className={styles.infoSep}>·</span>
            <span className={styles.infoSwatch} style={{ background: state.bgColor }} />
            <span className={styles.infoSwatch} style={{ background: state.patColor }} />
            {state.animation !== 'none' && (
              <>
                <span className={styles.infoSep}>·</span>
                <span className={styles.infoAnim}>⟳ {state.animation}</span>
              </>
            )}
            <span className={styles.infoRight}>1280 × 720 · 16:9</span>
          </div>

          {/* Code panel — flex:1 expands to fill remaining space */}
          <div className={styles.codePanel}>
            <CodeOutput state={state} />
          </div>

        </div>
      </div>

      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  );
}
