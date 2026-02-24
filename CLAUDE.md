# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a monorepo for UI prototypes. Currently contains one app:

- `spark/` — "The Missing Link", a trivia card-matching game built with React + Vite

## Commands

All commands run from the `spark/` directory:

```bash
npm install          # install dependencies
npm run dev          # start dev server (localhost:5173)
npm run build        # production build → spark/dist/
npm run preview      # preview production build locally
```

## Deployment

Pushes to `main` automatically deploy via GitHub Actions (`.github/workflows/deploy.yml`). The build output from `spark/dist/` is published to GitHub Pages. The Vite `base` is set to `/prototypes/` to match the Pages URL path.

## Git Workflow

- Branch off `main` for all new work
- Branch naming: `feature/*`, `fix/*`, `chore/*`
- Never commit directly to `main` — use a branch and PR
- Commit messages in imperative tense (e.g. "Add round skip logic", not "Added...")
- Squash or keep commits logical before merging

### Branch hygiene before coding

- Before starting any coding work, check the current branch with `git branch --show-current` and ensure it's up to date with main; flag any issues
- If on `main`, automatically create and switch to a new feature branch before making changes
- Branch naming convention: use descriptive kebab-case names (e.g., `add-user-profile`, `fix-login-bug`, `refactor-auth-flow`)
- If already on a non-main branch, continue working on that branch
- This ensures all work is isolated and can be reviewed via pull requests

## Architecture: The Missing Link (`spark/src/App.jsx`)

The entire app lives in a single file with three logical sections:

**Data** — Each game edition defines four constants: `*_ROUNDS` (array of `{fact1, fact2, answer}`), `*_STARTING_CARDS` (initial card pool), `*_INJECT` (cards added after each correct answer), and `*_COLORS` (per-card `{bg, border, text}` style objects). All data is inlined at the top of `App.jsx`.

**`<Game>`** — The gameplay component. Manages a queue-based round system: rounds can be skipped and revisited; correct answers remove the answer card from the deck and inject a new distractor. Score starts at 100 and is penalized for wrong guesses (-5%) and hints (-4%), floored at 50%.

**`<Cover>`** — The edition-select screen. Passes edition config (rounds, card sets, colors, accent color) directly to `<Game>` as props.

**`<App>`** — Simple screen router using a single `useState("cover")`. Each edition maps to a screen ID string.

### Adding a new edition

1. Define the four data constants (`*_ROUNDS`, `*_STARTING_CARDS`, `*_INJECT`, `*_COLORS`)
2. Add an entry to the `editions` array in `<Cover>` with an `id`, `emoji`, `title`, `desc`, `accent`, and `bg`
3. Add a screen branch in `<App>` mapping the `id` to a `<Game>` with the new constants
