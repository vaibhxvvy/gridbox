<div align="center">

<br />

```
██████╗  ██████╗      ██████╗ ███████╗███╗   ██╗
██╔══██╗██╔════╝     ██╔════╝ ██╔════╝████╗  ██║
██████╔╝██║  ███╗    ██║  ███╗█████╗  ██╔██╗ ██║
██╔══██╗██║   ██║    ██║   ██║██╔══╝  ██║╚██╗██║
██████╔╝╚██████╔╝    ╚██████╔╝███████╗██║ ╚████║
╚═════╝  ╚═════╝      ╚═════╝ ╚══════╝╚═╝  ╚═══╝
```

### CSS background pattern generator

**Pick a pattern. Tweak it. Copy the CSS.**

Zero dependencies · Single HTML file · Shareable URLs · Works offline

<br />

[![Live Demo](https://img.shields.io/badge/▶%20Live%20Demo-bggen.netlify.app-c8ff00?style=for-the-badge&labelColor=0a0a0a)](https://bggen.netlify.app)
&nbsp;
[![GitHub Stars](https://img.shields.io/github/stars/vaibhav/bggen?style=for-the-badge&labelColor=0a0a0a&color=c8ff00)](https://github.com/vaibhav/bggen/stargazers)
&nbsp;
[![License MIT](https://img.shields.io/badge/License-MIT-c8ff00?style=for-the-badge&labelColor=0a0a0a)](LICENSE)

<br />

![bggen screenshot](screenshot.png)

</div>

---

## What is this?

**bggen** is a zero-dependency, browser-based tool for generating CSS background patterns. Open the file, pick a pattern from 12 options, adjust size / opacity / thickness / rotation, and copy the CSS directly into your project.

No npm. No build step. No login. No backend. One `.html` file — that's the entire app.

---

## Patterns

| | Pattern | CSS Technique |
|---|---------|--------------|
| 🔲 | **Noise** | SVG `feTurbulence` fractal noise filter |
| ⚬ | **Dots** | `radial-gradient` |
| ▦ | **Grid** | `linear-gradient` (2-axis) |
| ▬ | **Rect** | `linear-gradient` (2:1 aspect ratio) |
| ╱ | **Diagonal** | `repeating-linear-gradient` |
| ╳ | **Crosshatch** | Double `repeating-linear-gradient` |
| ▪ | **Carbon** | 4-layer `linear-gradient` |
| ◉ | **Halftone** | Dual offset `radial-gradient` |
| ✛ | **Plus** | `linear-gradient` with background-position offset |
| ⬡ | **Hexagon** | Inline SVG `background-image` |
| ≋ | **Waves** | Inline SVG bezier path |
| ⬡ | **Circuit** | Canvas-rendered (export as PNG) |

---

## Controls

| Control | Range | What it does |
|---------|-------|-------------|
| **Size** | 4–80px | Tile repeat size |
| **Opacity** | 1–100% | Pattern layer transparency |
| **Thickness** | 1–8px | Line / stroke weight |
| **Rotation** | 0–180° | Pattern rotation angle |
| **Background** | hex | Canvas fill colour |
| **Pattern** | hex | Pattern element colour |

All changes update the URL in real time — bookmark or share any config.

---

## Presets

One-click starting points built in:

| Preset | Pattern | Vibe |
|--------|---------|------|
| dark noise | noise | Default dark app background |
| blueprint | grid | Engineering / technical |
| graph paper | grid | Light, paper-like |
| carbon | carbon | Dark, material texture |
| neon dots | dots | Cyberpunk / acid |
| hextech | hexagon | Sci-fi interface |
| terminal | plus | Green-on-black CRT |
| warm linen | diagonal | Editorial / print |
| halftone | halftone | Print / comic style |
| circuit | circuit | PCB / hardware |
| waves | waves | Soft / ambient |
| crosshatch | hatch | Sketch / hand-drawn |

---

## Quick Copy

Four copy modes in the bottom bar dropdown:

```css
/* copy bg — just the background colour */
background-color: #0a0a0a;

/* copy pattern — just the image layer */
background-image: radial-gradient(...);
background-size: 20px 20px;

/* copy bg + pattern — full drop-in CSS */
background-color: #0a0a0a;
background-image: radial-gradient(...);
background-size: 20px 20px;

/* copy as .bg-pattern — ready to paste class */
.bg-pattern {
  background-color: #0a0a0a;
  background-image: radial-gradient(...);
  background-size: 20px 20px;
}
```

---

## Export

| Format | Resolution | Use case |
|--------|-----------|---------|
| PNG | 512 × 512 | Tileable texture |
| PNG | 1920 × 1080 | Full HD page background |
| PNG | 3840 × 2160 | 4K / retina background |
| JPG | 1920 × 1080 | Smaller file size |
| SVG | Tile | Infinitely scalable vector |
| CSS | — | `.css` file with `.bg-pattern {}` class |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` `→` | Cycle through patterns |
| `C` | Copy full CSS |
| `S` | Copy share link |
| `R` | Reset all to defaults |

---

## Shareable URLs

Every control change silently encodes state into the URL. No server needed — the URL itself is the share format.

```
https://bggen.netlify.app/?pat=dots&bg=0d0d0d&col=c8ff00&sz=18&op=40&tk=2&rot=0
```

Hit **⇧ share link** in the top bar to copy the current URL to clipboard.

---

## Usage in your project

Paste the copied CSS into any selector:

```css
/* Minimal — dots on dark */
body {
  background-color: #0a0a0a;
  background-image: radial-gradient(circle, rgba(255,255,255,0.20) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* Section with grid */
.hero {
  background-color: #0d1b2a;
  background-image:
    linear-gradient(rgba(68,136,255,0.30) 1px, transparent 1px),
    linear-gradient(90deg, rgba(68,136,255,0.30) 1px, transparent 1px);
  background-size: 24px 24px;
}

/* With PNG export */
.section {
  background-image: url('bggen-dots-1920x1080.png');
  background-size: cover;
}
```

---

## Running Locally

No setup required:

```bash
# Option 1 — just open the file
open index.html

# Option 2 — local server (optional, for PWA features)
npx serve .
# or
python3 -m http.server 8080
```

---

## Deploy

| Platform | Steps |
|----------|-------|
| **Netlify** | Drag the `bggen` folder to [netlify.com/drop](https://netlify.com/drop) |
| **GitHub Pages** | Repo Settings → Pages → Deploy from `main` branch |
| **Vercel** | `npx vercel --prod` in the project folder |
| **Cloudflare Pages** | Connect repo · Build command: none · Publish dir: `/` |

---

## File Structure

```
bggen/
├── index.html     ← the entire application (single file)
├── README.md
└── screenshot.png ← add your own for the README preview
```

Everything lives in `index.html`. No dependencies. No `node_modules`. No config files.

---

## Performance

bggen is designed to stay smooth even on rapid slider input:

- **Dirty-flag render loop** — rapid slider drags collapse into one canvas draw per frame via `requestAnimationFrame`
- **Active-only thumb updates** — while dragging a slider, only the current pattern's thumbnail redraws. All other 11 thumbnails are untouched until you stop
- **Staggered full redraws** — on pattern switch, thumbnails redraw one at a time (20ms apart) so the main thread never spikes
- **Debounced thumb scheduling** — thumbnail redraws are debounced 280ms after the last input event

---

## Contributing

Issues and PRs are welcome. Ideas for future versions:

- [ ] More patterns — triangles, Moroccan tile, tartan, zigzag
- [ ] Gradient background support (two-colour blends beneath patterns)
- [ ] Animated pattern preview
- [ ] Random shuffle button
- [ ] Import CSS → reverse-engineer settings
- [ ] Dark/light base theme toggle for the UI itself

To contribute:
1. Fork the repo
2. Edit `index.html` directly — everything is in one file
3. Test in Chrome and Firefox
4. Open a PR with a description of what you changed and why

---

## Recommended GitHub Topics

Add these in your repo **Settings → Topics** for discoverability:

```
css  background  pattern-generator  background-texture  design-tools
vanilla-js  web-design  css-patterns  no-dependencies  single-file
```

---

## License

MIT — free for personal and commercial use. Attribution appreciated but not required.

---

<div align="center">

Made with 0 dependencies &nbsp;·&nbsp; [Live Demo](https://bggen.netlify.app) &nbsp;·&nbsp; [Report a Bug](https://github.com/vaibhav/bggen/issues)

</div>
