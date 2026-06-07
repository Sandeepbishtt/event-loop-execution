# JS Event Loop Visualizer

Interactive learning tool for JavaScript call stack, microtask queue, macrotask queue, and event loop execution — built for interview prep.

**Live demo:** [https://sandeepbishtt.github.io/event-loop-execution/](https://sandeepbishtt.github.io/event-loop-execution/)

## Features

- Paste any interview-style JavaScript snippet
- Predict `console.log` output and submit your answer
- Visualize execution step-by-step with a line pointer (▶)
- See call stack, microtask queue, macrotask queue, Web APIs, and console in sync
- **Manual** mode: step forward/back at your own pace
- **Auto** mode: play with adjustable speed
- Educational **Why?** insights for tricky behavior (Promise executor, `resolve()`, `.then`, `setTimeout`)

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:5173/event-loop-execution/](http://localhost:5173/event-loop-execution/) (Vite uses the same `base` path as production).

## Build

```bash
npm run build
npm run preview
```

## Deploy

Pushes to `main` automatically deploy to GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

1. Enable **Settings → Pages → Source: GitHub Actions** on the repo
2. Push to `main`

## Supported syntax (v1)

- `console.log`, variables, functions
- `new Promise`, `.then`, `Promise.resolve`
- `setTimeout` (relative delay ordering)
- `queueMicrotask`

No `eval` — code is parsed with Acorn and simulated safely.
