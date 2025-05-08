import 'reflect-metadata';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import express, { Express } from 'express';

import * as schema from '../db/schema';
import { setupRoutes } from '../routes';
import { errorHandler } from '../utils/middleware/error-handler.middleware';

// Use the same database as the application
const testDb = new Database('sqlite.db');
export const db = drizzle(testDb, { schema });

beforeAll(() => {
  // Run migrations on the database
  migrate(db, { migrationsFolder: './drizzle' });
});

beforeEach(async () => {
  // Clear all tables before each test
  for (const table of Object.values(schema)) {
    if ('name' in table) {
      await db.delete(table);
    }
  }
});

afterAll(() => {
  // Close the database connection
  testDb.close();
});

export function setupTestApp(): Express {
  const app = express();
  app.use(express.json());
  setupRoutes(app);
  app.use(errorHandler);
  return app;
}
