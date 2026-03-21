'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePatternRenderer }  from '@/lib/use-pattern-renderer';
import { PATTERNS }            from '@/lib/patterns/engine';
import { decodeState }         from '@/lib/url-state';
import { useGithubStars }      from '@/lib/use-github-stars';
import { GeneratorSidebar }    from '@/components/generator/GeneratorSidebar';
import { GeneratorCanvas }     from '@/components/generator/GeneratorCanvas';
import { CodeOutput }          from '@/components/generator/CodeOutput';
import { Toast }               from '@/components/ui/Toast';
import styles from './GeneratorApp.module.css';

type PreviewLayout = '16:9' | 'phone' | 'custom';

export default function GeneratorApp() {
  const { state, setState, canvasRef, thumbRefs, resetState, redraw } = usePatternRenderer();
  const [toast,         setToast]        = useState({ visible: false, msg: '' });
  const [previewLayout, setPreviewLayout] = useState<PreviewLayout>('16:9');
  const [customW,       setCustomW]       = useState(16);
  const [customH,       setCustomH]       = useState(9);
  const stars = useGithubStars('vaibhxvvy/gridbox');

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

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => showToast('link copied'));
  }, [showToast]);

  const handleRandomize = useCallback(() => {
    const palettes = [
      { bg: '#0a0a0a', pat: '#c8ff00' },
      { bg: '#080810', pat: '#00ccff' },
      { bg: '#0d0a0a', pat: '#ff4d00' },
      { bg: '#0a0a12', pat: '#8866ff' },
      { bg: '#080f08', pat: '#00ff88' },
      { bg: '#100808', pat: '#ff5566' },
      { bg: '#080810', pat: '#ffcc00' },
      { bg: '#06100e', pat: '#00ddaa' },
      { bg: '#111111', pat: '#ffffff' },
    ];
    const palette   = palettes[Math.floor(Math.random() * palettes.length)];
    const animatable = ['dots','grid','rect','diagonal','hatch','plus','hex','waves','circuit'];
    const all        = PATTERNS.map(p => p.id);
    const animDirs: Array<import('@/types/pattern').AnimationDir> =
      ['none','none','left','right','up','down','diag-left','diag-right'];
    const animation = animDirs[Math.floor(Math.random() * animDirs.length)];
    const pool      = animation !== 'none' ? animatable : all;
    const pattern   = pool[Math.floor(Math.random() * pool.length)];
    const sizeMap: Record<string,[number,number]> = {
      noise:[10,30],dots:[10,28],grid:[16,40],rect:[20,60],diagonal:[8,20],
      hatch:[10,22],carbon:[4,12],halftone:[10,24],plus:[14,30],hex:[16,34],
      waves:[14,30],circuit:[16,36],
    };
    const [mn,mx] = sizeMap[pattern] ?? [10,30];
    setState({
      pattern, bgColor: palette.bg, patColor: palette.pat, animation,
      size:      Math.floor(Math.random() * (mx - mn)) + mn,
      opacity:   Math.floor(Math.random() * 40) + 20,
      thickness: Math.floor(Math.random() * 2) + 1,
      rotation:  [0,0,0,45,90,135][Math.floor(Math.random() * 6)],
      animSpeed: animation !== 'none' ? Math.floor(Math.random() * 60) + 20 : 40,
    }, false);
    showToast('randomized ✦');
  }, [setState, showToast]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === 's' && !e.metaKey && !e.ctrlKey) handleShare();
      if (e.key === 'r') resetState();
      if (e.key === 'x') handleRandomize();
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const ids = PATTERNS.map(p => p.id);
        const idx = ids.indexOf(state.pattern);
        const next = e.key === 'ArrowRight'
          ? (idx + 1) % ids.length : (idx - 1 + ids.length) % ids.length;
        setState({ pattern: ids[next] }, false);
      }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [state, setState, resetState, handleShare, handleRandomize]);

  // Aspect ratio for preview
  const ratio = previewLayout === 'phone' ? '9/16'
    : previewLayout === 'custom' ? `${customW}/${customH}`
    : '16/9';

  // Info bar text
  const infoText = [
    state.pattern.charAt(0).toUpperCase() + state.pattern.slice(1),
    `${state.size}px`,
    `${state.opacity}%`,
    `${state.thickness}px stroke`,
    state.animation !== 'none' ? `⟳ ${state.animation}` : null,
    ratio.replace('/',':'),
  ].filter(Boolean).join('  ·  ');

  return (
    <div className={styles.page}>

      {/* ── TOPBAR ── */}
      <header className={styles.topbar}>
        <Link href="/" className={styles.topbarLogo}>gridmint</Link>
        <div className={styles.topbarActions}>
          <button className={`${styles.tbBtn} ${styles.tbRandom}`} onClick={handleRandomize}>
            + Random
          </button>
          <button className={`${styles.tbBtn} ${styles.tbShare}`} onClick={handleShare}>
            ↑ Share
          </button>
          <a
            className={`${styles.tbBtn} ${styles.tbGithub}`}
            href="https://github.com/vaibhxvvy/gridbox"
            target="_blank"
            rel="noopener noreferrer"
          >
            {/* GitHub SVG in accent colour */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            {stars}
          </a>
        </div>
      </header>

      {/* ── SHELL ── */}
      <div className={styles.shell}>

        <GeneratorSidebar
          state={state}
          thumbRefs={thumbRefs}
          onChange={setState}
          onReset={resetState}
        />

        {/* ── RIGHT COL — scrollable ── */}
        <div className={styles.rightCol}>

          {/* Preview layout selector */}
          <div className={styles.layoutBar}>
            <select
              className={styles.layoutSelect}
              value={previewLayout}
              onChange={e => setPreviewLayout(e.target.value as PreviewLayout)}
            >
              <option value="16:9">Web View 16:9</option>
              <option value="phone">Phone View</option>
              <option value="custom">Custom Ratio</option>
            </select>
            {previewLayout === 'custom' && (
              <div className={styles.customRatio}>
                <input
                  type="number" min={1} max={32}
                  value={customW}
                  onChange={e => setCustomW(Number(e.target.value))}
                  className={styles.ratioInput}
                />
                <span className={styles.ratioSep}>:</span>
                <input
                  type="number" min={1} max={32}
                  value={customH}
                  onChange={e => setCustomH(Number(e.target.value))}
                  className={styles.ratioInput}
                />
              </div>
            )}
          </div>

          {/* Canvas */}
          <GeneratorCanvas
            canvasRef={canvasRef}
            onResize={() => requestAnimationFrame(() => redraw())}
            state={state}
            aspectRatio={ratio}
          />

          {/* Info bar */}
          <div className={styles.infoBar}>
            <span className={styles.infoText}>{infoText}</span>
            <span className={styles.infoSwatches}>
              <span className={styles.infoSwatch} style={{ background: state.bgColor }} />
              <span className={styles.infoSwatch} style={{ background: state.patColor }} />
            </span>
          </div>

          {/* Code output */}
          <div className={styles.codePanel}>
            <CodeOutput state={state} />
          </div>

        </div>
      </div>

      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  );
}
