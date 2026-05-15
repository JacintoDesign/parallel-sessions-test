'use strict';

const express = require('express');
const store = require('./store');

const app = express();

app.use(express.json());
app.use(express.static('public'));

// GET /tasks — return all tasks
app.get('/tasks', (req, res) => {
  res.status(200).json(store.getAll());
});

// POST /tasks — create a new task
app.post('/tasks', (req, res) => {
  const { title, priority } = req.body;
  const VALID_PRIORITIES = ['low', 'medium', 'high'];
  if (!title?.trim() || !VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: 'title and priority (low, medium, high) are required' });
  }
  const newTask = store.add(title, priority);
  res.status(201).json(newTask);
});

// DELETE /tasks/:id — remove a task
app.delete('/tasks/:id', (req, res) => {
  const found = store.remove(req.params.id);
  if (!found) {
    return res.status(404).json({ error: `Task with id "${req.params.id}" not found` });
  }
  res.status(204).send();
});

// Error handler for server failures
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(3000, () => {
  console.log('Rappel running on http://localhost:3000');
});
