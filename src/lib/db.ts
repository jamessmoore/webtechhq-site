import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = process.env.DATABASE_PATH ?? "./data/submissions.db";
const resolved = path.resolve(process.cwd(), DB_PATH);

// Ensure the data directory exists at startup
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
    CREATE TABLE IF NOT EXISTS submissions (
      id                       TEXT PRIMARY KEY,
      name                     TEXT NOT NULL,
      email                    TEXT NOT NULL,
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
      email_verified           INTEGER NOT NULL DEFAULT 0,
      email_verified_at        TEXT,
      idp_verified             INTEGER NOT NULL DEFAULT 0,
      verification_token       TEXT,
      verification_expires_at  TEXT,
      validation_flags         TEXT NOT NULL DEFAULT '[]',
      approval_status          TEXT NOT NULL DEFAULT 'pending_verification',
      approved_by              TEXT,
      approved_at              TEXT,
      admin_notes              TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_submissions_email
      ON submissions (email);

    CREATE INDEX IF NOT EXISTS idx_submissions_status
      ON submissions (approval_status);

    CREATE INDEX IF NOT EXISTS idx_submissions_token
      ON submissions (verification_token);
  `);
}
