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

Pushes to `main` build the app and publish `dist/` to the `gh-pages` branch via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

### One-time GitHub setup

1. Open **Settings → Pages**
2. **Build and deployment → Source:** Deploy from a branch
3. **Branch:** `gh-pages` / `/ (root)`
4. Save

After the first successful workflow run, the site is live at:

**https://sandeepbishtt.github.io/event-loop-execution/**

> Do **not** open `/src/main.jsx` — that is dev source only. The built app loads from the URL above.

### Troubleshooting

| Problem | Fix |
|---------|-----|
| 404 on `/src/main.jsx` | Pages is serving raw `main` branch. Switch source to `gh-pages` branch |
| Blank page | Confirm `vite.config.js` has `base: '/event-loop-execution/'` |
| Workflow failed | Check **Actions** tab → re-run after fixing Pages settings |

## Supported syntax (v1)

- `console.log`, variables, functions
- `new Promise`, `.then`, `Promise.resolve`
- `setTimeout` (relative delay ordering)
- `queueMicrotask`

No `eval` — code is parsed with Acorn and simulated safely.
