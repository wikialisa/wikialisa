/**
 * services/api-gateway/src/lib/db.ts
 * PostgreSQL client (pg Pool) singleton
 */
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max:              20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on("error", (err) => {
  console.error("[DB] Unexpected pool error:", err.message);
});

pool.connect().then(client => {
  console.log("[DB] PostgreSQL connected →", process.env.DATABASE_URL?.split("@")[1]);
  client.release();
}).catch(err => {
  console.error("[DB] Failed to connect:", err.message);
});

export default pool;

/** Thin query helper — returns rows */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const res = await pool.query(sql, params);
  return res.rows as T[];
}

/** Returns first row or null */
export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}
