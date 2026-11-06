import { ensureSchema,pool } from '../lib/db.mjs';
await ensureSchema();
console.log('Retired Millionaire analytics schema is ready.');
await pool.end();
