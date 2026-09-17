# CHRONO

CHRONO is a mobile world clock, timer, and stopwatch prototype built with React, TypeScript, and Vite. The interface follows a neobrutalist direction with flat saturated colors, heavy outlines, hard shadows, monospaced typography, and a cut-paper composition.

On desktop and tablet, CHRONO is presented inside an iPhone canvas with zoom controls. On real phones, the interface fills the screen directly, respects device safe areas, and preserves its vertical composition when the phone rotates.

**[Open the interactive demo](https://r3neer.github.io/crono-neobrutal/)**

## Demos

### Time, physics, and interaction
![Ten-second timer, physical sand, and the centered CHRONO stopwatch wordmark](./public/demos/01-time-and-physics.gif)

### World clocks and palettes
![World-clock selection, deletion, search, and palettes](./public/demos/02-world-palettes.gif)

## Run locally

```powershell
npm install
npm run dev -- --port 5173
```

Open `http://127.0.0.1:5173/`. To verify the production build:

```powershell
npm run build
npm run preview
```

## Regenerate the GIFs

With the local server running on port `5173`, run `npm run capture:demos`. The script captures the flows in Microsoft Edge and writes the final GIFs to `public/demos/`. Intermediate frames are stored under `artifacts/demo-frames/` and excluded from the repository.

## Structure

- `src/main.tsx`: digital clocks, timer, sand physics, stopwatch, and city management.
- `src/style.css`: iPhone canvas, collage composition, cutouts, shadows, palettes, and animations.
- `public/demos/`: animated demos used by this README.
- `scripts/capture-demos.cjs`: reproducible Playwright demo flows.
- `scripts/build-gifs.py`: shared palette generation and frame packaging.
- `DESIGN.md`: original brief and subsequent design decisions.

## Scope

Selected cities and the main clock are stored in `localStorage`. Active timers survive internal navigation, but not a browser reload. World clocks use real IANA time zones. There is no backend, background alarm, or sound.

JetBrains Mono is bundled locally under its OFL license. Impact uses the system font with a condensed fallback.
