# Frontend (UI)

React + TypeScript + Vite client for Sync.

## Scripts

```bash
npm run dev      # start local dev server
npm run lint     # run ESLint
npm run build    # production build
npm run preview  # preview production build
```

## Local Setup

From repository root:

```bash
npm --prefix ui install
npm --prefix ui run dev
```

## Environment

Copy `ui/.env.example` values into your local environment if needed.

- `VITE_API_BASE_URL`: backend API base URL

## Structure

- `src/components/`: reusable UI components
- `src/stores/`: state management
- `src/lib/`: shared utilities

Keep feature code cohesive and avoid coupling unrelated domains.
