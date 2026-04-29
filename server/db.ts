import pg from 'pg';

const { Pool } = pg;

let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (!pool) {
    const raw = process.env['VECTOR_DATABASE_URL'];
    if (!raw) {
      throw new Error('VECTOR_DATABASE_URL is not set');
    }
    // Strip sslmode from the connection string so the programmatic ssl
    // config takes precedence. Newer pg versions treat sslmode=require as
    // verify-full which rejects DigitalOcean's self-signed CA chain.
    const connectionString = raw.replace(/[?&]sslmode=[^&]*/g, (m, offset) =>
      offset === raw.indexOf('?') ? '?' : '',
    ).replace(/\?$/, '');
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
  }
  return pool;
}

export async function initDatabase(): Promise<void> {
  const db = getPool();

  await db.query(`
    CREATE TABLE IF NOT EXISTS vector_profiles (
      id              SERIAL PRIMARY KEY,
      email           TEXT NOT NULL,
      country         TEXT,
      persona         TEXT NOT NULL,
      capital_band    TEXT NOT NULL,
      answers         JSONB NOT NULL,
      payload         JSONB NOT NULL,
      email_captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      email_skipped   BOOLEAN NOT NULL DEFAULT FALSE,
      follow_up_status TEXT NOT NULL DEFAULT 'queued',
      next_send_date  TIMESTAMPTZ,
      vector_integrated BOOLEAN NOT NULL DEFAULT FALSE,
      is_active       BOOLEAN NOT NULL DEFAULT TRUE,
      unsubscribe_requested BOOLEAN NOT NULL DEFAULT FALSE,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Migration: add unsubscribe_requested if table already existed without it
  await db.query(`
    ALTER TABLE vector_profiles
    ADD COLUMN IF NOT EXISTS unsubscribe_requested BOOLEAN NOT NULL DEFAULT FALSE;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS vector_profile_history (
      id              SERIAL PRIMARY KEY,
      profile_id      INTEGER NOT NULL REFERENCES vector_profiles(id),
      persona         TEXT NOT NULL,
      capital_band    TEXT NOT NULL,
      answers         JSONB NOT NULL,
      payload         JSONB NOT NULL,
      replaced_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS vector_sessions (
      id              SERIAL PRIMARY KEY,
      session_token   TEXT NOT NULL UNIQUE,
      persona         TEXT NOT NULL,
      capital_band    TEXT NOT NULL,
      payload         JSONB NOT NULL,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Index for email lookups
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_vector_profiles_email ON vector_profiles(email);
  `);

  // Index for session token lookups with TTL
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_vector_sessions_token ON vector_sessions(session_token);
  `);

  // Index for follow-up queue processing
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_vector_profiles_followup ON vector_profiles(follow_up_status, next_send_date)
    WHERE follow_up_status != 'completed' AND follow_up_status != 'unsubscribed';
  `);

  console.log('[db] Vector database tables initialised');
}

export interface VectorProfileRow {
  id: number;
  email: string;
  country: string | null;
  persona: string;
  capital_band: string;
  answers: Record<string, unknown>;
  payload: Record<string, unknown>;
  email_captured_at: Date;
  email_skipped: boolean;
  follow_up_status: string;
  next_send_date: Date | null;
  vector_integrated: boolean;
  is_active: boolean;
  unsubscribe_requested: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Find existing active profile by email
 */
export async function findProfileByEmail(email: string): Promise<VectorProfileRow | null> {
  const db = getPool();
  const result = await db.query<VectorProfileRow>(
    'SELECT * FROM vector_profiles WHERE email = $1 AND is_active = TRUE ORDER BY created_at DESC LIMIT 1',
    [email],
  );
  return result.rows[0] ?? null;
}

/**
 * Create a new profile record
 */
export async function createProfile(data: {
  email: string;
  country: string | null;
  persona: string;
  capitalBand: string;
  answers: Record<string, unknown>;
  payload: Record<string, unknown>;
}): Promise<VectorProfileRow> {
  const db = getPool();
  // Set next_send_date to 3 days from now for first follow-up
  const result = await db.query<VectorProfileRow>(
    `INSERT INTO vector_profiles (email, country, persona, capital_band, answers, payload, next_send_date)
     VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL '3 days')
     RETURNING *`,
    [data.email, data.country, data.persona, data.capitalBand, JSON.stringify(data.answers), JSON.stringify(data.payload)],
  );
  return result.rows[0]!;
}

/**
 * Move existing profile to history and create new one (Edge Case 1 — user chooses new profile)
 */
export async function replaceProfile(existingId: number, newData: {
  email: string;
  country: string | null;
  persona: string;
  capitalBand: string;
  answers: Record<string, unknown>;
  payload: Record<string, unknown>;
}): Promise<VectorProfileRow> {
  const db = getPool();
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Copy current active profile to history
    await client.query(
      `INSERT INTO vector_profile_history (profile_id, persona, capital_band, answers, payload)
       SELECT id, persona, capital_band, answers, payload FROM vector_profiles WHERE id = $1`,
      [existingId],
    );

    // Deactivate old profile
    await client.query(
      'UPDATE vector_profiles SET is_active = FALSE, updated_at = NOW() WHERE id = $1',
      [existingId],
    );

    // Create new active profile
    const result = await client.query<VectorProfileRow>(
      `INSERT INTO vector_profiles (email, country, persona, capital_band, answers, payload, next_send_date)
       VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL '3 days')
       RETURNING *`,
      [newData.email, newData.country, newData.persona, newData.capitalBand, JSON.stringify(newData.answers), JSON.stringify(newData.payload)],
    );

    await client.query('COMMIT');
    return result.rows[0]!;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Store a session for 72-hour TTL matching (Edge Case 3)
 */
export async function createSession(sessionToken: string, data: {
  persona: string;
  capitalBand: string;
  payload: Record<string, unknown>;
}): Promise<void> {
  const db = getPool();
  await db.query(
    `INSERT INTO vector_sessions (session_token, persona, capital_band, payload)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (session_token) DO UPDATE SET
       persona = EXCLUDED.persona,
       capital_band = EXCLUDED.capital_band,
       payload = EXCLUDED.payload,
       created_at = NOW()`,
    [sessionToken, data.persona, data.capitalBand, JSON.stringify(data.payload)],
  );
}

/**
 * Look up a session within 72-hour TTL
 */
export async function findSession(sessionToken: string): Promise<{
  persona: string;
  capital_band: string;
  payload: Record<string, unknown>;
} | null> {
  const db = getPool();
  const result = await db.query<{ persona: string; capital_band: string; payload: Record<string, unknown> }>(
    `SELECT persona, capital_band, payload FROM vector_sessions
     WHERE session_token = $1 AND created_at > NOW() - INTERVAL '72 hours'`,
    [sessionToken],
  );
  return result.rows[0] ?? null;
}

/**
 * Clean up expired sessions (older than 72 hours)
 */
export async function cleanExpiredSessions(): Promise<void> {
  const db = getPool();
  await db.query("DELETE FROM vector_sessions WHERE created_at < NOW() - INTERVAL '72 hours'");
}

/**
 * Get all profiles due for follow-up email processing.
 * Returns active profiles where next_send_date has passed and status is not
 * completed, unsubscribed, or already at day14_sent.
 */
export async function getFollowUpQueue(): Promise<VectorProfileRow[]> {
  const db = getPool();
  const result = await db.query<VectorProfileRow>(
    `SELECT * FROM vector_profiles
     WHERE is_active = TRUE
       AND unsubscribe_requested = FALSE
       AND follow_up_status IN ('queued', 'day3_sent', 'day7_sent')
       AND next_send_date <= NOW()
     ORDER BY next_send_date ASC`,
  );
  return result.rows;
}

/**
 * Advance follow-up status after a successful send.
 * @param daysUntilNext - number of days until the next follow-up, or null to clear
 */
export async function advanceFollowUpStatus(
  profileId: number,
  newStatus: string,
  daysUntilNext: number | null,
): Promise<void> {
  const db = getPool();
  if (daysUntilNext === null) {
    await db.query(
      `UPDATE vector_profiles
       SET follow_up_status = $1,
           next_send_date = NULL,
           updated_at = NOW()
       WHERE id = $2`,
      [newStatus, profileId],
    );
  } else {
    await db.query(
      `UPDATE vector_profiles
       SET follow_up_status = $1,
           next_send_date = NOW() + ($2 || ' days')::INTERVAL,
           updated_at = NOW()
       WHERE id = $3`,
      [newStatus, String(daysUntilNext), profileId],
    );
  }
}

/**
 * Mark a profile as unsubscribed by email.
 */
export async function unsubscribeByEmail(email: string): Promise<boolean> {
  const db = getPool();
  const result = await db.query(
    `UPDATE vector_profiles
     SET unsubscribe_requested = TRUE,
         follow_up_status = 'unsubscribed',
         updated_at = NOW()
     WHERE email = $1 AND is_active = TRUE
     RETURNING id`,
    [email],
  );
  return (result.rowCount ?? 0) > 0;
}
