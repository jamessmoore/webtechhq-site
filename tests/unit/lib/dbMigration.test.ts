import fs from "fs";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";
import Database from "better-sqlite3";
import { afterEach, describe, expect, it } from "vitest";

/**
 * Regression test for a production incident: migrate() in lib/db.ts created
 * an index on users.login_token unconditionally, before the ALTER TABLE that
 * backfills that column onto pre-existing databases. Every other test in
 * this suite uses a brand-new database file, so CREATE TABLE always creates
 * login_token from scratch and this bug never surfaced - it only breaks
 * databases that existed before that column did, which is exactly what
 * production looked like. This test seeds a database with the schema shape
 * production had immediately before that migration shipped, then confirms
 * getDb() (and therefore every API route that calls it) doesn't crash.
 */
function seedPreLoginTokenSchema(dbPath: string): void {
  const db = new Database(dbPath);
  db.exec(`
    CREATE TABLE users (
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
  `);
  db.prepare(
    `INSERT INTO users (id, first_name, last_name, email, email_verified, created_at)
     VALUES (?, ?, ?, ?, 0, ?)`,
  ).run(randomUUID(), "Ada", "Lovelace", "ada@example.com", new Date().toISOString());
  db.close();
}

let dbPath: string;

afterEach(() => {
  for (const suffix of ["", "-wal", "-shm"]) {
    fs.rmSync(dbPath + suffix, { force: true });
  }
});

describe("db migration", () => {
  it("migrates a pre-existing database that predates login_token without throwing", async () => {
    dbPath = path.join(os.tmpdir(), `webtechhq-migration-test-${randomUUID()}.db`);
    seedPreLoginTokenSchema(dbPath);
    process.env.DATABASE_PATH = dbPath;

    const { getDb } = await import("@/lib/db");
    expect(() => getDb()).not.toThrow();

    const db = getDb();
    const columns = db.prepare("PRAGMA table_info(users)").all() as {
      name: string;
      notnull: number;
    }[];
    const columnNames = new Set(columns.map((c) => c.name));

    expect(columnNames.has("login_token")).toBe(true);
    expect(columnNames.has("login_token_expires_at")).toBe(true);
    expect(columns.find((c) => c.name === "last_name")?.notnull).toBe(0);

    const indexes = db.prepare("PRAGMA index_list(users)").all() as { name: string }[];
    expect(indexes.some((i) => i.name === "idx_users_login_token")).toBe(true);

    const preservedUser = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get("ada@example.com") as { first_name: string } | undefined;
    expect(preservedUser?.first_name).toBe("Ada");
  });
});
