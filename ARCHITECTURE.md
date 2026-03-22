# gridmint — Architecture & Code Map
*Last updated: March 2026*

Complete reference for understanding every file, system, and rule in the codebase.
Read this before editing anything.

---

## Directory Structure

```
gridmint/
├── app/
│   ├── layout.tsx                    ← Root layout. FONTS via <link> tags ONLY. No @import in CSS ever.
│   ├── globals.css                   ← @import tailwindcss + ../styles/globals.css only. Nothing else.
│   ├── page.tsx + page.module.css    ← Landing page
│   ├── generate/
│   │   ├── page.tsx                  ← Dynamic import wrapper (ssr:false)
│   │   ├── GeneratorApp.tsx          ← Main generator: topbar, shell, state, keyboard shortcuts
│   │   ├── GeneratorApp.module.css   ← Layout: page/topbar/shell/rightCol/infoBar/codePanel
│   │   └── loading.tsx
│   └── install/
│       ├── page.tsx + page.module.css
├── components/
│   └── generator/
│       ├── GeneratorSidebar.tsx/.module.css   ← Left sidebar, all controls
│       ├── GeneratorCanvas.tsx/.module.css    ← Preview stage, CSS seamless layer, GSAP tween
│       ├── CodeOutput.tsx/.module.css         ← Language tabs + copy + export
│       ├── ExportMenu.tsx/.module.css         ← Export dropdown (PNG/JPG/SVG/CSS)
│       ├── PatternGrid.tsx/.module.css        ← 3-col pattern thumbnail grid
│       ├── Slider.tsx/.module.css             ← Radix UI range slider with debounce
│       ├── ColorPicker.tsx/.module.css        ← HSB picker, inline expand (no absolute positioning)
│       └── Presets.tsx/.module.css            ← Preset list with canvas thumbnails
├── lib/
│   ├── patterns/
│   │   ├── engine.ts     ← ALL 12 pattern draw() + css() + CSS_ANIMATABLE + getAnimatableCSS
│   │   └── presets.ts    ← 12 preset definitions
│   ├── use-pattern-renderer.ts  ← Core hook: tile cache, GSAP ticker, per-pattern memory, pausedRef
│   ├── store.ts                 ← Zustand store (UI state: layout, pause, toast)
│   ├── url-state.ts             ← Encode/decode PatternState to/from URL params
│   ├── codegen.ts               ← CSS/SCSS/Tailwind/React/Next.js/TSX code generation
│   └── use-github-stars.ts      ← Live star count from GitHub API
├── styles/
│   ├── tokens.css    ← ALL CSS variables
│   └── globals.css   ← Base resets, imports tokens.css (NO @import for fonts)
├── types/
│   └── pattern.ts    ← PatternState, Pattern, Preset, AnimationDir types
└── packages/
    └── gridmint/     ← npm package source (unpublished)
```

---

## The 12 Patterns

| ID | Name | CSS Type | Seamless CSS Anim |
|----|------|----------|-------------------|
| noise | Noise | SVG filter | ✗ canvas fallback |
| dots | Dots | radial-gradient | ✅ |
| grid | Grid | linear-gradient | ✅ |
| rect | Rectangle | linear-gradient | ✅ |
| diagonal | Diagonal | repeating-linear-gradient | ✅ |
| hatch | Hatch | repeating-linear-gradient | ✅ |
| carbon | Carbon | linear-gradient | ✅ |
| halftone | Halftone | radial-gradient | ✅ |
| plus | Plus | linear-gradient | ✅ |
| checker | Checker | linear-gradient | ✅ |
| waves | Waves | SVG cubic bezier | ✅ |
| circuit | Circuit | SVG inline | ✗ canvas fallback |

**Hex was removed** — replaced by checker (pure geometric, perfectly seamless).

---

## PatternState Type

```ts
interface PatternState {
  pattern:   string;       // one of the 12 IDs above
  bgColor:   string;       // hex e.g. '#0a0a0a'
  patColor:  string;       // hex
  size:      number;       // tile size px (4–240 for rect, 4–80 others)
  opacity:   number;       // 1–100
  thickness: number;       // stroke width 1–20
  rotation:  number;       // degrees 0–180
  animation: AnimationDir; // 'none'|'left'|'right'|'up'|'down'|'diag-left'|'diag-right'
  animSpeed: number;       // px/sec 10–200
}
```

---

## Animation System — Two Modes

### Mode 1: CSS Seamless (10 patterns)
For patterns in `CSS_ANIMATABLE` set when `animation !== 'none'`:

1. Canvas hidden (`opacity: 0`) — still drawn for export
2. `<div ref={cssLayerRef}>` overlaid with `background-image` from `getAnimatableCSS(state)`
3. GSAP tween mutates `offsetRef.current.{x,y}` each tick
4. Offset wraps to `[0, tileW)` / `[0, tileH)` via modulo — **seamless forever**
5. `cssLayerRef.current.style.backgroundPosition = "${x}px ${y}px"` written each tick
6. Tween only **restarts** when direction/speed/tileSize changes (keyed by `tweenKey`)
7. Colour/size/opacity changes update CSS div style directly — no tween restart
8. Debounced 60ms to prevent spam on rapid slider drags

**Result**: GPU-composited, zero JS per frame for the pattern itself, mathematically perfect tiling.

### Mode 2: Canvas Tile Cache (noise, circuit)
For patterns not in `CSS_ANIMATABLE`:

1. Pattern drawn ONCE into a `2×canvas` offscreen tile
2. GSAP ticker advances `offsetRef.current.{x,y}` each tick
3. `ctx.drawImage(tile, ...)` blitted at 4 positions for seamless wrap
4. Noise redraws a 256px grain tile each frame (CRT flicker effect)

---

## CSS Seamless Animation — Key Functions

**`engine.ts`:**
```ts
CSS_ANIMATABLE: Set<string>  // which patterns support CSS animation

getAnimatableCSS(state): {
  backgroundImage: string,
  backgroundSize:  string,
  backgroundPosition: string,
  tileW: number,   // parsed px width — GSAP animates by this amount
  tileH: number,   // parsed px height
} | null
```

**`GeneratorCanvas.tsx`:**
- `buildTween(css, animation, speed)` — creates `gsap.to(proxy, { repeat: -1 })`, wraps offset
- `tweenKeyRef` — `"direction|speed|tileW|tileH"` — only rebuilds tween when this changes
- `isPaused` prop → `tween.pause()` / `tween.resume()`

---

## Per-Pattern Memory

When switching patterns `patternMemory` (Map) saves current state:
- Switch away from dots → saves dots settings
- Switch back to dots → restores them
- `pausedRef.current = false` on every pattern switch (prevents stale pause)
- `animOffset.current = { x: 0, y: 0 }` reset on pattern switch

---

## Preview Modes (GeneratorCanvas)

The `stage` div is always `height: calc(100vh - 48px - 32px)`.
The `frame` div inside it is driven by `aspectRatio` inline style.

| Layout | frameAspect | Canvas behaviour |
|--------|-------------|-----------------|
| Web 16:9 | `16/9` | fills stage width |
| Phone | `9/16` | portrait box centred |
| Custom | `W/H` | user-entered ratio |

Canvas is always 1920×1080 internally. CSS `object-fit: cover` crops to frame ratio — no squeezing.

Layout toggle is a floating pill overlay inside the stage (not a separate bar).

---

## Sidebar Sections

| Section | Collapsible | Libraries |
|---------|-------------|-----------|
| INSTALLATION | — | — |
| PATTERNS | ✓ Radix Collapsible + Motion | always mounted (display:none when closed, prevents thumb loss) |
| ADJUST | ✗ | Radix Slider + use-debounce (30ms for size/rotation) |
| ANIMATE | ✗ | Motion spring toggle, Radix Tooltip on direction buttons |
| COLORS | ✗ | Custom HSB picker, inline expand (no absolute) |
| PRESETS | ✓ Radix Collapsible + Motion | always mounted |
| GRADIENTS | — (future) | — |
| TEXTURES | — (future) | — |

---

## Color Picker

Fully custom HSB picker:
- SB square: `backgroundColor: hsvToHex(hue, 1, 1)` with white→transparent + black→transparent overlays
- Hue bar: CSS `linear-gradient` of rainbow
- Opens **inline** (not absolute positioned) — sidebar stretches to fit it
- Motion `height: 0 → auto` animation
- Quick swatches row at bottom

---

## Libraries in Use

| Library | Where | Purpose |
|---------|-------|---------|
| GSAP 3.14 | GeneratorCanvas, use-pattern-renderer | CSS animation tween + canvas RAF ticker |
| Motion (Framer) | Sidebar, Canvas, App, PatternGrid | UI animations, spring transitions, AnimatePresence |
| Radix UI | Slider, Collapsible, Tooltip | Accessible UI primitives |
| Zustand | store.ts | Global UI state |
| use-debounce | Slider | Prevents thrash on size/rotation drags |
| lucide-react | SVG icons throughout | Chevrons, arrows, directions |

---

## Design Tokens (styles/tokens.css)

| Variable | Value | Used for |
|----------|-------|---------|
| `--gb-bg` | `#0a0a0a` | Page background |
| `--gb-surface` | `#111111` | Sidebar |
| `--gb-s2` | `#181818` | Topbar, info bar |
| `--gb-s3` | `#202020` | Buttons, inputs |
| `--gb-border` | `#2c2c2c` | All borders |
| `--gb-accent` | `#c8ff00` | Lime green — active states, logo |
| `--gb-text` | `#f0f0f0` | Primary text |
| `--gb-muted` | `#606060` | Dimmed labels |
| `--gb-muted2` | `#999999` | Secondary text |
| `--gb-font-mono` | Space Mono | All UI text |

---

## URL State

All PatternState encoded in URL on every change via `history.replaceState`.
Params: `pat`, `bg`, `col`, `sz`, `op`, `tk`, `rot`, `an`, `spd`.
Shareable links work out of the box.

---

## Code Generation (lib/codegen.ts)

Takes `PatternState`, outputs:
- `css` — plain CSS `.bg-pattern { ... }`
- `scss` — with nested usage comment
- `tailwind` — arbitrary value classes
- `react` — inline style object + component
- `nextjs` — CSS module + component
- `tsx` — TypeScript React component

---

## Export (ExportMenu.tsx)

Renders offscreen canvas at requested size, uses `canvas.toBlob()`:
- PNG tile 512px
- PNG HD 1920×1080
- PNG 4K 3840×2160
- JPG HD 1920×1080
- SVG vector tile
- CSS file download

---

## PERMANENT RULES

1. **NO `@import` for Google Fonts in ANY CSS file** — fonts load via `<link>` in `app/layout.tsx` only
2. **Never redraw all 12 thumbnails** on slider drag — only redraw active pattern
3. **Pattern thumbnails always mounted** (display:none to hide) — prevents canvas content loss
4. **pausedRef** controls pause — never set `animation: 'none'` to pause
5. **Tween restarts only on** direction/speed/tileSize change — CSS property updates are instant
6. **Hex pattern is gone** — checker replaced it
7. **Canvas internal res is 1920×1080** — display scaling via CSS object-fit:cover

---

## What's Next

- Gradient layer (CSS overlay: radial glow, spotlight, mesh)
- Texture overlay (film grain, scanlines, vignette)
- More geometric patterns (triangles, herringbone, brick)
- npm publish for packages/gridmint
- Mobile layout polish
