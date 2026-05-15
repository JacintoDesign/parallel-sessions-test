# Rappel — Design Spec

**Date:** 2026-05-15
**Status:** Approved

## Overview

Rappel is a minimal to-do app: an Express server with three REST endpoints and a vanilla JS single-page frontend. Tasks persist to a local JSON file. No frameworks, no build step.

---

## File Structure

```
parallel-sessions-test/
├── server.js          # Express app: static middleware + 3 routes
├── store.js           # JSON read/write: getAll, add, remove
├── tasks.json         # Persisted tasks (auto-created with sample data on first run)
├── public/
│   └── index.html     # Single-file frontend: HTML + vanilla JS + inline styles
└── package.json       # Existing; Express 5.2.1 already installed
```

`server.js` and `store.js` communicate only through three exported functions — no shared state, no circular dependencies.

---

## Data Layer (`store.js`)

### Task shape

```json
{ "id": "uuid", "title": "Buy groceries", "priority": "high" }
```

- `id` — generated via Node's built-in `crypto.randomUUID()`, no extra dependency
- `priority` — one of `"low"`, `"medium"`, `"high"`

### Bootstrap

On first `getAll()` call, if `tasks.json` does not exist, the store seeds it with 3 sample tasks (one of each priority) and writes to disk. Subsequent calls read/write the file directly.

### Exported functions

| Function | Behaviour |
|---|---|
| `getAll()` | Reads `tasks.json`, returns array |
| `add(title, priority)` | Generates ID, appends to array, writes file, returns new task |
| `remove(id)` | Filters out matching task, writes file, returns `true` if found / `false` if not |

All file I/O is synchronous (`fs.readFileSync` / `fs.writeFileSync`) — appropriate for a small local dataset.

---

## API (`server.js`)

Server listens on **port 3000**. `express.json()` parses POST bodies. `express.static("public")` serves the frontend at `/`.

### Endpoints

| Method | Path | Request body | Response |
|---|---|---|---|
| `GET` | `/tasks` | — | `200` + `[{id, title, priority}, …]` |
| `POST` | `/tasks` | `{title, priority}` | `201` + new task object |
| `DELETE` | `/tasks/:id` | — | `204` no body |

### Edge cases

- `POST` with missing `title` or `priority` → `400 Bad Request`
- `DELETE` with an ID not found in the store → `404 Not Found`
- All JSON responses include `Content-Type: application/json`

### `package.json` scripts

A `"start": "node server.js"` script will be added.

---

## Frontend (`public/index.html`)

Single file: HTML structure, inline `<style>`, and a `<script>` block at the bottom.

### Behaviour

- **On load** — `fetch('/tasks')` populates the task list
- **Task list** — each task renders as a row with:
  - Title
  - Priority badge, colour-coded: green = low, orange = medium, red = high
  - × delete button → calls `DELETE /tasks/:id`, then re-renders
- **Add form** — title text input (required) + priority `<select>` (Low / Medium / High) + submit button → calls `POST /tasks`, clears inputs, re-renders
- **Re-render strategy** — after any mutation, re-fetch `GET /tasks` and replace the list; no client-side state mirroring

### Constraints

- Vanilla JavaScript only — no frameworks, no imports, no build step
- All logic in a single `<script>` tag within `index.html`
