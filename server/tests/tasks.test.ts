import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { db } from '../src/config/db.js';
import { v4 as uuidv4 } from 'uuid';

const app = createApp();

describe('Task Tracker API Integration Tests (PostgreSQL)', () => {
  /* =========================================================================
   * REQUIREMENT TEST 1 — Invalid Task Creation
   * ========================================================================= */
  describe('POST /tasks', () => {
    it('should reject invalid task creation with empty title (400 Bad Request)', async () => {
      const invalidPayload = {
        title: '',
        description: 'Testing empty title validation',
      };

      const response = await request(app)
        .post('/tasks')
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toMatch(/title/i);

      // Verify task was NOT created in PostgreSQL database
      const countRes = await db.query<{ count: string }>('SELECT COUNT(*) as count FROM tasks');
      expect(parseInt(countRes.rows[0].count, 10)).toBe(0);
    });

    it('should reject task creation when title exceeds 100 characters', async () => {
      const invalidPayload = {
        title: 'A'.repeat(101),
        description: 'Title is too long',
      };

      const response = await request(app)
        .post('/tasks')
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('100 characters');

      const countRes = await db.query<{ count: string }>('SELECT COUNT(*) as count FROM tasks');
      expect(parseInt(countRes.rows[0].count, 10)).toBe(0);
    });

    it('should successfully create a task with valid payload', async () => {
      const validPayload = {
        title: 'Complete interview assignment',
        description: 'Build the PERN task tracker',
        status: 'To Do',
        priority: 'High',
      };

      const response = await request(app)
        .post('/tasks')
        .send(validPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data._id).toBeDefined();
      expect(response.body.data.title).toBe(validPayload.title);
      expect(response.body.data.status).toBe('To Do');
      expect(response.body.data.priority).toBe('High');
      expect(response.body.data.createdAt).toBeDefined();

      // Verify persisted in PostgreSQL database
      const dbRes = await db.query('SELECT * FROM tasks WHERE id = $1', [response.body.data._id]);
      expect(dbRes.rows.length).toBe(1);
      expect(dbRes.rows[0].title).toBe(validPayload.title);
    });
  });

  /* =========================================================================
   * REQUIREMENT TEST 2 — Successful Status Update
   * ========================================================================= */
  describe('PATCH /tasks/:id', () => {
    it('should successfully update task status to Done (200 OK)', async () => {
      // 1. Create a task first in PostgreSQL
      const id = uuidv4();
      await db.query(
        'INSERT INTO tasks (id, title, description, status, priority) VALUES ($1, $2, $3, $4, $5)',
        [id, 'Complete interview assignment', 'Build Task Tracker', 'To Do', 'High']
      );

      // 2. Call PATCH /tasks/:id with { status: "Done" }
      const updatePayload = {
        status: 'Done',
      };

      const response = await request(app)
        .patch(`/tasks/${id}`)
        .send(updatePayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.status).toBe('Done');
      expect(response.body.data._id).toBe(id);

      // 3. Verify PostgreSQL contains updated status
      const updatedDbRes = await db.query<{ status: string }>('SELECT status FROM tasks WHERE id = $1', [id]);
      expect(updatedDbRes.rows.length).toBe(1);
      expect(updatedDbRes.rows[0].status).toBe('Done');
    });

    it('should return 400 for invalid task status payload', async () => {
      const id = uuidv4();
      await db.query('INSERT INTO tasks (id, title) VALUES ($1, $2)', [id, 'Testing status failure']);

      const response = await request(app)
        .patch(`/tasks/${id}`)
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 if task is not found', async () => {
      const nonExistentId = uuidv4();
      const response = await request(app)
        .patch(`/tasks/${nonExistentId}`)
        .send({ status: 'Done' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('TASK_NOT_FOUND');
    });
  });

  /* =========================================================================
   * GET /tasks
   * ========================================================================= */
  describe('GET /tasks', () => {
    it('should return all tasks sorted newest first', async () => {
      const id1 = uuidv4();
      const id2 = uuidv4();
      await db.query('INSERT INTO tasks (id, title, created_at) VALUES ($1, $2, $3)', [id1, 'First Task', new Date('2026-01-01')]);
      await db.query('INSERT INTO tasks (id, title, created_at) VALUES ($1, $2, $3)', [id2, 'Second Task', new Date('2026-01-02')]);

      const response = await request(app).get('/tasks');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0].title).toBe('Second Task');
      expect(response.body.data[1].title).toBe('First Task');
    });

    it('should filter tasks by status when valid status query is provided', async () => {
      const id1 = uuidv4();
      const id2 = uuidv4();
      await db.query('INSERT INTO tasks (id, title, status) VALUES ($1, $2, $3)', [id1, 'Task 1', 'To Do']);
      await db.query('INSERT INTO tasks (id, title, status) VALUES ($1, $2, $3)', [id2, 'Task 2', 'Done']);

      const response = await request(app).get('/tasks?status=Done');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].title).toBe('Task 2');
    });

    it('should return 400 Bad Request for invalid status filter', async () => {
      const response = await request(app).get('/tasks?status=InvalidStatus');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  /* =========================================================================
   * DELETE /tasks/:id
   * ========================================================================= */
  describe('DELETE /tasks/:id', () => {
    it('should successfully delete a task by ID', async () => {
      const id = uuidv4();
      await db.query('INSERT INTO tasks (id, title) VALUES ($1, $2)', [id, 'Task to Delete']);

      const response = await request(app).delete(`/tasks/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const dbRes = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
      expect(dbRes.rows.length).toBe(0);
    });

    it('should return 404 when attempting to delete non-existent task', async () => {
      const nonExistentId = uuidv4();
      const response = await request(app).delete(`/tasks/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
