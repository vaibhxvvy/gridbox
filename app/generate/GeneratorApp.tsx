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
    const hue = Math.floor(Math.random() * 360);
    const bgColor  = `hsl(${hue}, ${Math.floor(Math.random()*30)}%, ${Math.floor(Math.random()*15 + 3)}%)`;
    const patColor = `hsl(${(hue + 120 + Math.floor(Math.random()*120)) % 360}, ${Math.floor(Math.random()*60+40)}%, ${Math.floor(Math.random()*40+50)}%)`;
    const patIds = PATTERNS.map(p => p.id);
    const pattern  = patIds[Math.floor(Math.random() * patIds.length)];
    const anims: import('@/types/pattern').AnimationDir[] = ['none','left','right','up','down','diag-left','diag-right'];
    const animation = anims[Math.floor(Math.random() * anims.length)];
    setState({ pattern, bgColor, patColor, animation,
      size:      Math.floor(Math.random() * 40) + 8,
      opacity:   Math.floor(Math.random() * 50) + 10,
      thickness: Math.floor(Math.random() * 3) + 1,
      rotation:  Math.floor(Math.random() * 180),
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
            {stars} ★
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
            <span className={styles.infoRight}>830 × 467 · 16:9</span>
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
