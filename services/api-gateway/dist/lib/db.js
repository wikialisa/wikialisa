"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = query;
exports.queryOne = queryOne;
/**
 * services/api-gateway/src/lib/db.ts
 * PostgreSQL client (pg Pool) singleton
 */
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
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
exports.default = pool;
/** Thin query helper — returns rows */
async function query(sql, params) {
    const res = await pool.query(sql, params);
    return res.rows;
}
/** Returns first row or null */
async function queryOne(sql, params) {
    const rows = await query(sql, params);
    return rows[0] ?? null;
}
