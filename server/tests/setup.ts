import { beforeAll, beforeEach, afterAll } from 'vitest';
import { db } from '../src/config/db.js';

beforeAll(async () => {
  // Use in-memory PostgreSQL for fast isolated integration testing
  db.enableInMemoryMode();
  await db.initDb();
});

beforeEach(async () => {
  await db.query('DELETE FROM tasks');
});

afterAll(async () => {
  await db.close();
});
