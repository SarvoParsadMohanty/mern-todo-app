import pg from 'pg';
import { newDb, IMemoryDb } from 'pg-mem';

const { Pool } = pg;

export interface QueryResult<T = Record<string, unknown>> {
  rows: T[];
  rowCount: number | null;
}

export interface IDatabaseClient {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
  initDb(): Promise<void>;
  close(): Promise<void>;
  isInMemory(): boolean;
}

// Module-level state
let pool: pg.Pool | null = null;
let memDb: IMemoryDb | null = null;
let memAdapter: { query: (text: string, params?: unknown[]) => Promise<QueryResult> } | null = null;
let useInMemory = false;

const getPool = (): pg.Pool => {
  if (!pool) {
    const connectionString =
      process.env.POSTGRES_URI ||
      process.env.DATABASE_URL ||
      'postgresql://postgres:admin@localhost:5432/task_tracker';
    pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 3000,
    });
  }
  return pool;
};

const setupInMemoryDb = (): void => {
  if (memDb) return;
  memDb = newDb();

  const dbAdapter = memDb.adapters.createPg();
  const pgPool = new dbAdapter.Pool();

  memAdapter = {
    query: async (text: string, params?: unknown[]): Promise<QueryResult> => {
      const res = await pgPool.query(text, params);
      return {
        rows: res.rows,
        rowCount: res.rowCount,
      };
    },
  };
};

/**
 * Set explicitly to in-memory mode (useful for testing)
 */
export const enableInMemoryMode = (): void => {
  useInMemory = true;
  setupInMemoryDb();
};

/**
 * Initialize table schemas
 */
export const initDb = async (): Promise<void> => {
  const activePool = getPool();
  if (!useInMemory && activePool) {
    try {
      // Test connection to live PostgreSQL
      const client = await activePool.connect();
      client.release();
      console.log('Connected successfully to PostgreSQL database.');
    } catch (error) {
      console.warn(
        'Could not connect to live PostgreSQL server. Falling back to pg-mem in-memory database:',
        (error as Error).message
      );
      enableInMemoryMode();
    }
  }

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS tasks (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(100) NOT NULL,
      description TEXT DEFAULT '',
      status VARCHAR(20) NOT NULL DEFAULT 'To Do',
      priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await query(createTableQuery);
};

export const query = async <T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> => {
  if (useInMemory && memAdapter) {
    return memAdapter.query(text, params) as Promise<QueryResult<T>>;
  }

  const activePool = getPool();
  if (activePool) {
    try {
      const res = await activePool.query(text, params);
      return {
        rows: res.rows as T[],
        rowCount: res.rowCount,
      };
    } catch (err) {
      // Fallback if live db connection fails during execution
      if (!useInMemory) {
        console.warn('Database query failed. Switching to in-memory mode.');
        enableInMemoryMode();
        await initDb();
        return query<T>(text, params);
      }
      throw err;
    }
  }

  throw new Error('Database connection is not initialized');
};

export const close = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};

export const isInMemory = (): boolean => {
  return useInMemory;
};

// Export db object for backward compatibility
export const db: IDatabaseClient & { enableInMemoryMode: () => void } = {
  query,
  initDb,
  close,
  isInMemory,
  enableInMemoryMode,
};
