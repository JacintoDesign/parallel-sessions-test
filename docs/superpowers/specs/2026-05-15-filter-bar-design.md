# Filter Bar — Design Spec

**Date:** 2026-05-15
**Status:** Approved

## Overview

Add a client-side filter bar above the task list in `public/index.html`. Four buttons (All / High / Medium / Low) let the user narrow the visible tasks by priority. All is selected by default. No server requests on filter change — filtering operates on a cached copy of the last fetch result.

---

## Approach

Client-side data filtering (Option B). Fetched tasks are stored in a module-level `allTasks` array. On filter change, `renderTasks()` is called with a filtered slice of that array. The existing `renderTasks()` function (including its empty-state handling) is reused unchanged.

---

## Changes to `public/index.html`

### HTML

Insert a `<div class="filter-bar">` between the add form and `<ul id="taskList">`:

```html
<div class="filter-bar" id="filterBar">
  <button class="filter-btn active" data-filter="all">All</button>
  <button class="filter-btn" data-filter="high">High</button>
  <button class="filter-btn" data-filter="medium">Medium</button>
  <button class="filter-btn" data-filter="low">Low</button>
</div>
```

### CSS

```css
.filter-bar {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.filter-btn {
  padding: 0.35rem 0.85rem;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid #d0d0d8;
  border-radius: 999px;
  background: #fff;
  color: #4b5563;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.filter-btn:hover {
  background: #f3f4f6;
}

.filter-btn.active {
  background: #6366f1;
  color: #fff;
  border-color: #6366f1;
}
```

### JS

**New module-level state:**
```js
let allTasks = [];
let activeFilter = 'all';
```

**New `applyFilter()` function:**
```js
function applyFilter() {
  const filtered = activeFilter === 'all'
    ? allTasks
    : allTasks.filter(function (t) { return t.priority === activeFilter; });
  renderTasks(filtered);
}
```

**Updated `fetchAndRender()`:** stores result in `allTasks`, then calls `applyFilter()` instead of `renderTasks()` directly.

**Filter button click handler** (attached once on load):
```js
document.getElementById('filterBar').addEventListener('click', function (e) {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  activeFilter = btn.dataset.filter;
  document.querySelectorAll('.filter-btn').forEach(function (b) {
    b.classList.toggle('active', b === btn);
  });
  applyFilter();
});
```

---

## Behaviour

- Active filter persists across add/delete mutations (re-fetch re-applies current filter)
- When a filter returns zero tasks, the existing empty-state message shows naturally
- No server requests on filter change

---

## Scope

Single file: `public/index.html`. No changes to `server.js`, `store.js`, or `package.json`.
