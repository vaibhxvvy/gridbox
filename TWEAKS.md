# gridmint — Tweaks Reference

Quick reference for making changes yourself without needing help.
All paths are relative to the project root.

---

## Project structure at a glance

```
app/
  page.tsx                  ← landing page
  page.module.css           ← landing page styles
  generate/
    GeneratorApp.tsx        ← main generator component
    GeneratorApp.module.css ← generator layout styles
  install/
    page.tsx                ← install/docs page
  layout.tsx                ← root layout, metadata, fonts

components/generator/
  GeneratorSidebar.tsx      ← left panel (install banner, patterns, adjust, colours, presets)
  PatternGrid.tsx           ← 12 pattern thumbnail grid
  Slider.tsx                ← size/opacity/thickness/rotation sliders
  ColorPicker.tsx           ← colour picker with shade swatches
  GeneratorCanvas.tsx       ← 830×467 preview canvas
  CodeOutput.tsx            ← language tabs + copy + export
  ExportMenu.tsx            ← export dropdown (PNG/JPG/SVG/CSS)
  Presets.tsx               ← preset buttons

lib/
  patterns/engine.ts        ← ALL 12 pattern draw functions + CSS generators
  patterns/presets.ts       ← preset configs (name, colours, adjustments)
  use-pattern-renderer.ts   ← RAF hook, state management, thumbnail logic
  codegen.ts                ← multi-format code generator (CSS/SCSS/Tailwind/React/Next/TSX)
  url-state.ts              ← encode/decode URL params
  use-github-stars.ts       ← fetches live star count from GitHub API

styles/
  tokens.css                ← all CSS variables (colours, spacing, fonts)
  globals.css               ← global resets, scrollbars, range inputs
```

---

## Common tweaks

### Change a colour in the design system

Edit `styles/tokens.css`:

```css
--gb-accent:  #c8ff00;   /* lime green — main accent */
--gb-bg:      #0a0a0a;   /* page background */
--gb-border:  #2c2c2c;   /* borders */
--gb-text:    #f0f0f0;   /* main text */
--gb-muted:   #606060;   /* muted text */
--gb-muted2:  #999999;   /* lighter muted */
```

### Change the canvas size

Edit `components/generator/GeneratorCanvas.tsx`:

```ts
const CANVAS_W = 830;  // change this
const CANVAS_H = 467;  // and this (keep 16:9 ratio)
```

### Add a new pattern

1. Open `lib/patterns/engine.ts`
2. Add a new entry to the `PATTERNS` array following this structure:

```ts
{
  id: 'mypattern', name: 'My Pattern',
  draw(ctx, { patColor, opacity, size, thickness, rotation }, extMult = 5) {
    const W = ctx.canvas.width, H = ctx.canvas.height;
    const [r, g, b] = hexToRgb(patColor);
    drawSetup(ctx, rotation, W, H, extMult);
    // ... your canvas drawing code here ...
    ctx.restore();
  },
  css({ bgColor, patColor, opacity, size }) {
    return `background-color: ${bgColor};\nbackground-image: ...;`;
  },
},
```

3. Add default adjustments in `lib/use-pattern-renderer.ts` under `PATTERN_DEFAULTS`:

```ts
mypattern: { size: 20, opacity: 30, thickness: 1, rotation: 0 },
```

### Add a new preset

Open `lib/patterns/presets.ts` and add to the `PRESETS` array:

```ts
{
  name: 'my preset',
  accent: '#ff4488',   // dot colour shown in the preset button
  state: {
    pattern:   'dots',
    bgColor:   '#0a0a0a',
    patColor:  '#ff4488',
    size:      18,
    opacity:   35,
    thickness: 2,
    rotation:  0,
  },
},
```

### Change slider ranges

In `components/generator/GeneratorSidebar.tsx`:

```tsx
<Slider label="size"      min={4}   max={80}  ... />
<Slider label="opacity"   min={1}   max={100} ... />
<Slider label="thickness" min={1}   max={20}  ... />
<Slider label="rotation"  min={0}   max={180} ... />
```

### Change the landing page preview patterns

Open `app/page.tsx`, edit the `PREVIEW_PATTERNS` array at the top.
Each entry needs: `id`, `name`, `bg` (background hex), `bgImage` (CSS background-image value), `bgSize`, `bgPos`.

### Change the shade swatches in colour picker

Open `components/generator/ColorPicker.tsx`:

```ts
const DARK_SHADES   = ['#0a0a0a', '#111111', ...];  // 8 values
const BRIGHT_SHADES = ['#c8ff00', '#00ff41', ...];  // 8 values
const MID_SHADES    = ['#2a2a2a', '#1a2a1a', ...];  // 8 values
```

### Update page title / meta

Edit `app/layout.tsx` — change the `metadata` export.

### Change the GitHub repo link

Search the whole project for `vaibhxvvy/gridbox` and replace with your repo path.
Files that contain it: `app/page.tsx`, `app/generate/GeneratorApp.tsx`, `app/install/page.tsx`, `lib/use-github-stars.ts`.

### Update the npm package

The package source lives in `packages/gridmint/src/`.
To publish: `cd packages/gridmint && npm publish`
(Requires `npm login` first)

---

## Running locally

```bash
npm run dev       # start dev server at localhost:3000
npm run build     # production build
npm run lint      # lint check
```

---

## Deploying

```bash
git add .
git commit -m "your message"
git push          # Netlify/Vercel auto-deploys on push to main
```

---

## CSS variable quick reference

| Variable | Value | Used for |
|----------|-------|---------|
| `--gb-accent` | `#c8ff00` | Highlights, active states |
| `--gb-bg` | `#0a0a0a` | Page background |
| `--gb-surface` | `#111111` | Sidebar background |
| `--gb-s2` | `#181818` | Topbar, action areas |
| `--gb-s3` | `#202020` | Hover states |
| `--gb-border` | `#2c2c2c` | All borders |
| `--gb-text` | `#f0f0f0` | Main text |
| `--gb-muted` | `#606060` | Labels |
| `--gb-muted2` | `#999999` | Secondary text |
| `--gb-sidebar-w` | `260px` | Sidebar width |
| `--gb-topbar-h` | `44px` | Topbar height |
