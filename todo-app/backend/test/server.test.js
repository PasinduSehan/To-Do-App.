const request = require('supertest');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(bodyParser.json());

describe('Backend API', () => {
  let db;
  let server;

  beforeAll(async () => {
    db = await mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'securepassword',
      database: process.env.DB_NAME || 'todo'
    });

    await db.query('CREATE TABLE IF NOT EXISTS task (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, description TEXT, completed BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');

    app.post('/api/tasks', async (req, res) => {
      const { title, description } = req.body;
      if (!title) return res.status(400).json({ error: 'Title is required' });
      const [result] = await db.query('INSERT INTO task (title, description, completed) VALUES (?, ?, ?)', [title, description || null, false]);
      res.json({ message: 'Task added successfully', id: result.insertId });
    });

    app.get('/api/tasks', async (req, res) => {
      const [rows] = await db.query('SELECT * FROM task WHERE completed = FALSE ORDER BY created_at DESC LIMIT 5');
      res.json(rows);
    });

    app.post('/api/tasks/:id/done', async (req, res) => {
      const [result] = await db.query('UPDATE task SET completed = TRUE WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found' });
      res.json({ message: 'Task marked as done' });
    });

    server = app.listen(0);
  });

  afterAll(async () => {
    await db.query('DROP TABLE IF EXISTS task');
    await db.end();
    server.close();
  });

  beforeEach(async () => {
    await db.query('TRUNCATE TABLE task');
  });

  test('POST /api/tasks creates a new task', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({ title: 'Test Task', description: 'Test Description' })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toEqual({
      message: 'Task added successfully',
      id: expect.any(Number)
    });

    const [rows] = await db.query('SELECT * FROM task WHERE title = ?', ['Test Task']);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      title: 'Test Task',
      description: 'Test Description',
      completed: 0
    });
  });

  test('POST /api/tasks fails without title', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({ description: 'No Title' })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toEqual({ error: 'Title is required' });
  });

  test('GET /api/tasks returns up to 5 non-completed tasks', async () => {
    await db.query('INSERT INTO task (title, description, completed) VALUES (?, ?, ?)', ['Task 1', 'Desc 1', false]);
    await db.query('INSERT INTO task (title, description, completed) VALUES (?, ?, ?)', ['Task 2', 'Desc 2', false]);
    await db.query('INSERT INTO task (title, description, completed) VALUES (?, ?, ?)', ['Task 3', 'Desc 3', true]);

    const response = await request(app)
      .get('/api/tasks')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toMatchObject({ title: 'Task 2', description: 'Desc 2', completed: 0 });
    expect(response.body[1]).toMatchObject({ title: 'Task 1', description: 'Desc 1', completed: 0 });
  });

  test('POST /api/tasks/:id/done marks task as completed', async () => {
    const [result] = await db.query('INSERT INTO task (title, description, completed) VALUES (?, ?, ?)', ['Task 1', 'Desc 1', false]);
    const taskId = result.insertId;

    const response = await request(app)
      .post(`/api/tasks/${taskId}/done`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toEqual({ message: 'Task marked as done' });

    const [rows] = await db.query('SELECT * FROM task WHERE id = ?', [taskId]);
    expect(rows[0].completed).toBe(1);
  });

  test('POST /api/tasks/:id/done returns 404 for non-existent task', async () => {
    const response = await request(app)
      .post('/api/tasks/999/done')
      .expect('Content-Type', /json/)
      .expect(404);

    expect(response.body).toEqual({ error: 'Task not found' });
  });
});
