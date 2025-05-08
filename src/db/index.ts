import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

import * as schema from './schema';

const sqlite = new Database('sqlite.db');
export const db = drizzle(sqlite, { schema });

// Initialize database
export function initDatabase(): void {
  // Run migrations
  migrate(db, { migrationsFolder: './drizzle' });
  console.log('Database connection initialized');
}
