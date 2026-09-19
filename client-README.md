# AI Study Companion — Frontend

React app for AI Study Companion. It talks to the backend API for everything (auth, spaces/projects, materials, tutor chat, quizzes, mastery/growth, analytics, admin) — there's no client-side data storage beyond Redux state for the current session.

## Overview

Pages are organized around the same structure as the backend: Spaces contain Projects, and each Project has its own set of tabs — Dashboard, Materials, Knowledge, Tutor, Quiz, Mastery, Growth, and Analytics. There's also a top-level Home page, a global Analytics page, Settings, and an admin section gated behind the logged-in user's role.

Auth state, the toast queue, and a slot for the currently-active project live in Redux. Everything else is fetched per-page with axios and kept in local component state — there's no global cache layer.

## Tech Stack

- React 19 (Vite)
- React Router
- Redux Toolkit + React Redux (auth state, toasts, active project)
- Axios (with a shared instance in src/services/api.js that sends cookies and normalizes error messages)
- Tailwind CSS + DaisyUI
- Recharts (mastery/growth/analytics charts)
- lucide-react (icons)

## Project Structure

```
client/
  src/
    main.jsx           # entry point — mounts the app with Redux + Router providers
    App.jsx             # route tree
    pages/               # one file per route (Home, Spaces, Materials, Tutor, Quiz, etc.)
      admin/             # admin-only pages
    layouts/             # AuthLayout, AppLayout (sidebar shell), ProjectLayout (project tab bar)
    routes/              # ProtectedRoute / AdminRoute guards
    components/          # shared bits (EmptyState, ErrorState, Skeleton, Toasts)
    store/               # Redux slices (auth, activeProject, ui) + store setup
    services/            # api.js — the axios instance
    index.css            # tailwind entrypoint + a couple of global tweaks
```

## Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
```

This is the only env var the app reads (src/services/api.js). It should point at wherever the backend is running. If it's not set, it falls back to http://localhost:5000/api.

## Running Locally

npm install
npm run dev

Runs on http://localhost:5173 by default (see vite.config.js). Make sure the backend is running and CLIENT_ORIGIN on the backend matches this URL, or cookies/CORS won't work.

Other scripts:
npm run build     # production build
npm run preview   # serve the production build locally
npm run lint      # oxlint


## Auth

Login/register hit the backend and get back an httpOnly cookie — the token itself is never touched or stored in JS. ProtectedRoute checks auth status on mount (GET /auth/me) and redirects to /login if that fails; AdminRoute additionally checks user.role === 'admin' before letting a route through.

## Styling

Tailwind is configured with a custom color palette (`tailwind.config.js`) — a purple/indigo "brand" scale, a separate orange "tutor" color used specifically for AI/tutor-related UI, and red/yellow/green "mastery" colors for score indicators. DaisyUI is used for base component classes (buttons, inputs, tables) on top of that.

## Notes

- activeProject exists as a Redux slice but most pages currently fetch project data directly with axios rather than reading from it — it's there as a place to put shared project state if that becomes worth doing.
- There's no test suite on the frontend yet.
