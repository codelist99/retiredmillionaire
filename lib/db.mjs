import pg from 'pg';
import { attachDatabasePool } from '@vercel/functions';

const { Pool }=pg;
export const pool=new Pool({connectionString:process.env.DATABASE_URL,max:8,idleTimeoutMillis:5000});
attachDatabasePool(pool);

let schemaReady;
export function ensureSchema(){
  return schemaReady??=(async()=>{
    await pool.query(`CREATE TABLE IF NOT EXISTS rm_sessions (
      id BIGSERIAL PRIMARY KEY,
      session_id VARCHAR(80) UNIQUE NOT NULL,
      visitor_id VARCHAR(80) NOT NULL,
      path VARCHAR(500) NOT NULL DEFAULT '/',
      referrer VARCHAR(1000) NOT NULL DEFAULT '',
      query_string VARCHAR(1500) NOT NULL DEFAULT '',
      device VARCHAR(20) NOT NULL DEFAULT 'desktop',
      started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      engaged_seconds INTEGER NOT NULL DEFAULT 0,
      video_started BOOLEAN NOT NULL DEFAULT FALSE,
      video_seconds INTEGER NOT NULL DEFAULT 0,
      max_video_percent INTEGER NOT NULL DEFAULT 0,
      cta_clicked BOOLEAN NOT NULL DEFAULT FALSE,
      exited BOOLEAN NOT NULL DEFAULT FALSE
    )`);
    await pool.query('CREATE INDEX IF NOT EXISTS rm_sessions_started_idx ON rm_sessions(started_at DESC)');
    await pool.query('CREATE INDEX IF NOT EXISTS rm_sessions_visitor_idx ON rm_sessions(visitor_id)');
  })().catch(error=>{schemaReady=null;throw error});
}

export async function query(text,values=[]){await ensureSchema();return pool.query(text,values)}
