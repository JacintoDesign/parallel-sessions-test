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
  if (!title || !priority) {
    return res.status(400).json({ error: 'Missing required fields: title and priority' });
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

app.listen(3000, () => {
  console.log('Rappel running on http://localhost:3000');
});
