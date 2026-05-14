import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error('Missing DATABASE_URL environment variable');
  return url;
}

const globalForDb = global as typeof globalThis & {
  _neonSql?: ReturnType<typeof neon>;
  _drizzleDb?: ReturnType<typeof drizzle>;
};

function getSql() {
  if (!globalForDb._neonSql) {
    globalForDb._neonSql = neon(getDatabaseUrl());
  }
  return globalForDb._neonSql;
}

export function getDb() {
  if (!globalForDb._drizzleDb) {
    globalForDb._drizzleDb = drizzle(getSql(), { schema });
  }
  return globalForDb._drizzleDb;
}

export { schema };
