<div align="center">

```
 ██████╗ ██████╗ ██╗██████╗ ███╗   ███╗██╗███╗   ██╗████████╗
██╔════╝ ██╔══██╗██║██╔══██╗████╗ ████║██║████╗  ██║╚══██╔══╝
██║  ███╗██████╔╝██║██║  ██║██╔████╔██║██║██╔██╗ ██║   ██║
██║   ██║██╔══██╗██║██║  ██║██║╚██╔╝██║██║██║╚██╗██║   ██║
╚██████╔╝██║  ██║██║██████╔╝██║ ╚═╝ ██║██║██║ ╚████║   ██║
 ╚═════╝ ╚═╝  ╚═╝╚═╝╚═════╝ ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝   ╚═╝
```

**CSS background pattern generator**

Pick a pattern. Tweak it. Copy the code in any format.

<br/>

[![Live](https://img.shields.io/badge/▶%20Live-gridmint.ink-c8ff00?style=for-the-badge&labelColor=0a0a0a)](https://gridmint.ink)
&nbsp;
[![Stars](https://img.shields.io/github/stars/vaibhxvvy/gridbox?style=for-the-badge&labelColor=0a0a0a&color=c8ff00)](https://github.com/vaibhxvvy/gridbox/stargazers)
&nbsp;
[![npm](https://img.shields.io/npm/v/gridmint?style=for-the-badge&labelColor=0a0a0a&color=c8ff00)](https://npmjs.com/package/gridmint)
&nbsp;
[![License](https://img.shields.io/badge/License-Personal_Use-c8ff00?style=for-the-badge&labelColor=0a0a0a)](LICENSE)

<br/>

![gridmint screenshot](public/screenshot.png)

</div>

---

## What is gridmint?

gridmint is an open-source background pattern generator. Select from 12 patterns, control every parameter in real time, then export in any format your project needs.

Use it at **[gridmint.ink](https://gridmint.ink)** or install the npm package.

No account. No limits. No watermarks.

---

## npm package

```bash
npm install gridmint
pnpm add gridmint
yarn add gridmint
```

### React component

```tsx
import { GridmintPattern } from 'gridmint';

export default function Hero() {
  return (
    <GridmintPattern
      state={{
        pattern: 'dots', bgColor: '#0a0a0a', patColor: '#c8ff00',
        size: 20, opacity: 30, thickness: 2, rotation: 0,
      }}
      style={{ height: '100vh' }}
    >
      <h1>Hello World</h1>
    </GridmintPattern>
  );
}
```

### Hook

```tsx
import { useGridmintPattern } from 'gridmint';

const { style } = useGridmintPattern({
  pattern: 'grid', bgColor: '#0a0a0a', patColor: '#ffffff',
  size: 24, opacity: 20, thickness: 1, rotation: 0,
});

return <div style={{ ...style, minHeight: '400px' }} />;
```

Full docs: **[gridmint.ink/install](https://gridmint.ink/install)**

---

## Patterns

| Pattern | CSS technique |
|---------|--------------|
| Noise | SVG `feTurbulence` |
| Dots | `radial-gradient` |
| Grid | `linear-gradient` 2-axis |
| Rectangle | `linear-gradient` 2:1 ratio |
| Diagonal | `repeating-linear-gradient` |
| Crosshatch | Double `repeating-linear-gradient` |
| Carbon | 4-layer `linear-gradient` |
| Halftone | Dual offset `radial-gradient` |
| Plus | `linear-gradient` with offset |
| Hexagon | Inline SVG |
| Waves | Inline SVG bezier |
| Circuit | Canvas-rendered (export PNG) |

---

## Output formats

CSS · SCSS · Tailwind · React · Next.js · TSX

---

## Features

- **830×467 fixed preview** (16:9)
- **12 presets** — one-click starting points
- **Custom colour picker** with dark / mid / bright shade palettes
- **Randomizer** — random pattern + colours + adjustments (`X`)
- **Shareable URLs** — full config encoded in URL
- **Live GitHub star count**
- **Vercel Analytics**
- **Mobile responsive** — topbar → preview → code → scrollable controls
- **Security headers** — CSP, X-Frame-Options, no source maps

---

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `← →` | Cycle patterns |
| `S` | Copy share link |
| `R` | Reset |
| `X` | Randomize |

---

## Project structure

```
gridmint/
├── app/
│   ├── page.tsx              ← landing page
│   ├── generate/             ← generator app
│   └── install/              ← npm package docs
├── components/generator/     ← all UI components
├── lib/
│   ├── patterns/engine.ts    ← 12 pattern draw + CSS functions
│   ├── codegen.ts            ← 6-format code generator
│   ├── url-state.ts          ← encode/decode URL
│   └── use-pattern-renderer.ts ← RAF hook
├── packages/gridmint/        ← npm package source
├── TWEAKS.md                 ← quick reference for self-editing
└── styles/tokens.css         ← design tokens
```

---

## Running locally

```bash
git clone https://github.com/vaibhxvvy/gridbox
cd gridbox
npm install
npm run dev
```

---

## Contributing

PRs welcome. See `TWEAKS.md` for a full guide to the codebase.

**Good first issues:**
- New patterns (triangles, moroccan tile, zigzag)
- Gradient background support
- Animated preview mode

---

## GitHub topics

```
css  pattern-generator  background-texture  design-tools  nextjs
typescript  tailwind  react  open-source  web-design  css-patterns
```

---

## License

Personal use and open-source projects — free.
The **generated CSS/code output** is free to use in any project.
See [LICENSE](LICENSE).

---

<div align="center">

[gridmint.ink](https://gridmint.ink) &nbsp;·&nbsp;
[generator](https://gridmint.ink/generate) &nbsp;·&nbsp;
[install](https://gridmint.ink/install) &nbsp;·&nbsp;
[tweaks guide](TWEAKS.md) &nbsp;·&nbsp;
[report a bug](https://github.com/vaibhxvvy/gridbox/issues)

</div>
