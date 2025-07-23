const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dbPromise = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

(async () => {
  const db = await dbPromise;

  app.post('/api/tasks', async (req, res) => {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    try {
      const [result] = await db.query(
        'INSERT INTO task (title, description, completed) VALUES (?, ?, ?)',
        [title, description || null, false]
      );
      res.json({ message: 'Task added successfully', id: result.insertId });
    } catch (err) {
      console.error(' Error inserting task:', err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/tasks', async (req, res) => {
    try {
      const [rows] = await db.query(
        'SELECT * FROM task WHERE completed = FALSE ORDER BY created_at DESC LIMIT 5'
      );
      res.json(rows);
    } catch (err) {
      console.error(' Error fetching tasks:', err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/tasks/:id/done', async (req, res) => {
    try {
      const [result] = await db.query('UPDATE task SET completed = TRUE WHERE id = ?', [
        req.params.id
      ]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json({ message: 'Task marked as done' });
    } catch (err) {
      console.error(' Error marking task as done:', err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})();
