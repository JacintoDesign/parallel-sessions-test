'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const TASKS_FILE = path.join(__dirname, 'tasks.json');

const SEED_TASKS = [
  { id: crypto.randomUUID(), title: 'Buy groceries', priority: 'low' },
  { id: crypto.randomUUID(), title: 'Schedule dentist appointment', priority: 'medium' },
  { id: crypto.randomUUID(), title: 'Submit quarterly report', priority: 'high' },
];

function getAll() {
  if (!fs.existsSync(TASKS_FILE)) {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(SEED_TASKS, null, 2), 'utf8');
    return [...SEED_TASKS];
  }
  const raw = fs.readFileSync(TASKS_FILE, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('tasks.json is corrupt, re-seeding:', e.message);
    fs.writeFileSync(TASKS_FILE, JSON.stringify(SEED_TASKS, null, 2));
    return [...SEED_TASKS];
  }
}

function add(title, priority) {
  const tasks = getAll();
  const newTask = { id: crypto.randomUUID(), title, priority };
  tasks.push(newTask);
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf8');
  return newTask;
}

function remove(id) {
  const tasks = getAll();
  const filtered = tasks.filter((t) => t.id !== id);
  const found = filtered.length < tasks.length;
  if (found) {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(filtered, null, 2), 'utf8');
  }
  return found;
}

module.exports = { getAll, add, remove };
