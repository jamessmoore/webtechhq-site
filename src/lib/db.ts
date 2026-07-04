import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = process.env.DATABASE_PATH ?? "./data/submissions.db";
const resolved = path.resolve(process.cwd(), DB_PATH);

fs.mkdirSync(path.dirname(resolved), { recursive: true });

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(resolved);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    migrate(_db);
  }
  return _db;
}

function migrate(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id                      TEXT PRIMARY KEY,
      first_name              TEXT NOT NULL,
      last_name               TEXT NOT NULL,
      email                   TEXT NOT NULL UNIQUE,
      password_hash           TEXT,
      google_id               TEXT UNIQUE,
      email_verified          INTEGER NOT NULL DEFAULT 0,
      email_verified_at       TEXT,
      verification_token      TEXT,
      verification_expires_at TEXT,
      reset_token             TEXT,
      reset_expires_at        TEXT,
      created_at              TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_users_email
      ON users (email);

    CREATE INDEX IF NOT EXISTS idx_users_google_id
      ON users (google_id);

    CREATE INDEX IF NOT EXISTS idx_users_token
      ON users (verification_token);

    CREATE INDEX IF NOT EXISTS idx_users_reset_token
      ON users (reset_token);

    CREATE TABLE IF NOT EXISTS submissions (
      id                       TEXT PRIMARY KEY,
      user_id                  TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
      business_type            TEXT,
      team_size                TEXT,
      layer1_problem           TEXT,
      layer1_elimination       TEXT,
      layer2_hours             REAL,
      layer2_salary            TEXT,
      layer3_repetitive        TEXT,
      layer3_compliance        TEXT,
      layer3_compliance_detail TEXT,
      layer3_data              TEXT,
      additional_notes         TEXT,
      submitted_at             TEXT NOT NULL,
      created_at               TEXT NOT NULL,
      validation_flags         TEXT NOT NULL DEFAULT '[]',
      approval_status          TEXT NOT NULL DEFAULT 'pending_review',
      approved_by              TEXT,
      approved_at              TEXT,
      admin_notes              TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_submissions_user_id
      ON submissions (user_id);

    CREATE UNIQUE INDEX IF NOT EXISTS idx_submissions_user_unique
      ON submissions (user_id);

    CREATE INDEX IF NOT EXISTS idx_submissions_status
      ON submissions (approval_status);

    CREATE TABLE IF NOT EXISTS prompt_template (
      id                  TEXT PRIMARY KEY,
      trigger_repetitive  TEXT,
      trigger_compliance  TEXT,
      trigger_data        TEXT,
      is_fallback         INTEGER NOT NULL DEFAULT 0,
      version             INTEGER NOT NULL DEFAULT 1,
      template_text       TEXT NOT NULL,
      created_at          TEXT NOT NULL,
      updated_at          TEXT NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_prompt_template_trigger
      ON prompt_template (trigger_repetitive, trigger_compliance, trigger_data)
      WHERE is_fallback = 0;

    CREATE TABLE IF NOT EXISTS prompt_template_eval (
      id            TEXT PRIMARY KEY,
      template_id   TEXT NOT NULL REFERENCES prompt_template (id) ON DELETE CASCADE,
      model_tested  TEXT NOT NULL,
      rubric        TEXT NOT NULL,
      notes         TEXT,
      evaluated_at  TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_prompt_template_eval_template_id
      ON prompt_template_eval (template_id);

    CREATE TABLE IF NOT EXISTS purchases (
      id                 TEXT PRIMARY KEY,
      user_id            TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
      product_id         TEXT NOT NULL,
      status             TEXT NOT NULL DEFAULT 'created',
      amount_cents       INTEGER NOT NULL,
      currency           TEXT NOT NULL DEFAULT 'USD',
      paypal_order_id    TEXT UNIQUE,
      payer_email        TEXT,
      raw_capture_json   TEXT,
      created_at         TEXT NOT NULL,
      captured_at        TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_purchases_user_id
      ON purchases (user_id);

    CREATE INDEX IF NOT EXISTS idx_purchases_user_product
      ON purchases (user_id, product_id);

    CREATE INDEX IF NOT EXISTS idx_purchases_paypal_order_id
      ON purchases (paypal_order_id);
  `);

  // Backfill reset_token columns for databases created before they existed.
  const columns = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
  const columnNames = new Set(columns.map((c) => c.name));
  if (!columnNames.has("reset_token")) {
    db.exec("ALTER TABLE users ADD COLUMN reset_token TEXT");
    db.exec("CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users (reset_token)");
  }
  if (!columnNames.has("reset_expires_at")) {
    db.exec("ALTER TABLE users ADD COLUMN reset_expires_at TEXT");
  }

  // Backfill rendered_prompt for databases created before it existed.
  const submissionColumns = db.prepare("PRAGMA table_info(submissions)").all() as { name: string }[];
  const submissionColumnNames = new Set(submissionColumns.map((c) => c.name));
  if (!submissionColumnNames.has("rendered_prompt")) {
    db.exec("ALTER TABLE submissions ADD COLUMN rendered_prompt TEXT");
  }
}
