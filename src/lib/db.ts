import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = process.env.DATABASE_PATH ?? "./data/submissions.db";
const resolved = path.resolve(/* turbopackIgnore: true */ process.cwd(), DB_PATH);

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
      last_name               TEXT,
      email                   TEXT NOT NULL UNIQUE,
      password_hash           TEXT,
      google_id               TEXT UNIQUE,
      email_verified          INTEGER NOT NULL DEFAULT 0,
      email_verified_at       TEXT,
      verification_token      TEXT,
      verification_expires_at TEXT,
      reset_token             TEXT,
      reset_expires_at        TEXT,
      login_token             TEXT,
      login_token_expires_at  TEXT,
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

    CREATE TABLE IF NOT EXISTS signup_attempts (
      email          TEXT PRIMARY KEY,
      attempt_count  INTEGER NOT NULL DEFAULT 0,
      updated_at     TEXT NOT NULL
    );

    -- Per-source-IP signup rate limiting (see src/lib/signupIpAttempts.ts).
    -- Distinct from signup_attempts above: that's a lifetime cap keyed by
    -- the *target* email, this is a fixed-window cap keyed by the
    -- *requesting* IP, added specifically to stop using the signup
    -- endpoint to enumerate which emails already have an account.
    CREATE TABLE IF NOT EXISTS signup_ip_attempts (
      ip_address         TEXT PRIMARY KEY,
      attempt_count      INTEGER NOT NULL DEFAULT 0,
      window_started_at  TEXT NOT NULL,
      updated_at         TEXT NOT NULL
    );

    -- user_id is nullable to support anonymous submissions: the Opportunity
    -- Finder can now be used without an account, and the row is only linked
    -- to a real user_id later if the visitor chooses to save their result
    -- (see the claim-submission flow). claim_token is the opaque, unguessable
    -- lookup key used for that later link-up; it's cleared once claimed.
    -- SQLite treats every NULL as distinct under a UNIQUE index, so the
    -- existing one-submission-per-user uniqueness on user_id keeps working
    -- unchanged: any number of NULL (anonymous) rows can coexist.
    CREATE TABLE IF NOT EXISTS submissions (
      id                       TEXT PRIMARY KEY,
      user_id                  TEXT REFERENCES users (id) ON DELETE CASCADE,
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
      admin_notes              TEXT,
      claim_token              TEXT
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

    -- Prompt Pilot: same DB-seeded-template IP-protection pattern as
    -- prompt_template above, but a separate table rather than a shared one,
    -- since the trigger vocabulary is entirely different (starting point /
    -- why / time budget vs. repetitive / compliance / data) and reusing
    -- prompt_template's trigger columns for a second, unrelated tool would
    -- make its unique index and callers ambiguous about which tool a row
    -- belongs to.
    CREATE TABLE IF NOT EXISTS prompt_pilot_template (
      id                      TEXT PRIMARY KEY,
      trigger_starting_point  TEXT,
      trigger_why             TEXT,
      trigger_time_budget     TEXT,
      is_fallback             INTEGER NOT NULL DEFAULT 0,
      version                 INTEGER NOT NULL DEFAULT 1,
      template_text           TEXT NOT NULL,
      created_at              TEXT NOT NULL,
      updated_at              TEXT NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_prompt_pilot_template_trigger
      ON prompt_pilot_template (trigger_starting_point, trigger_why, trigger_time_budget)
      WHERE is_fallback = 0;

    -- One row per user, mirroring submissions' one-submission-per-user
    -- pattern. No admin-review columns (approval_status/validation_flags/
    -- admin_notes) because Prompt Pilot's output is rendered instantly and
    -- never emailed or reviewed by an admin, unlike the Opportunity Finder
    -- pipeline that table supports.
    -- user_id nullable + claim_token: same anonymous-submission-then-claim
    -- pattern as submissions above (see the comment on that table).
    CREATE TABLE IF NOT EXISTS prompt_pilot_submissions (
      id               TEXT PRIMARY KEY,
      user_id          TEXT REFERENCES users (id) ON DELETE CASCADE,
      learning_goal    TEXT NOT NULL,
      starting_point   TEXT,
      why              TEXT,
      time_budget      TEXT,
      rendered_prompt  TEXT,
      submitted_at     TEXT NOT NULL,
      created_at       TEXT NOT NULL,
      claim_token      TEXT
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_prompt_pilot_submissions_user_unique
      ON prompt_pilot_submissions (user_id);

    CREATE TABLE IF NOT EXISTS agent_prompt_config (
      id                TEXT PRIMARY KEY,
      config_key        TEXT NOT NULL UNIQUE,
      version           INTEGER NOT NULL DEFAULT 1,
      system_prompt     TEXT NOT NULL,
      tool_schema_json  TEXT NOT NULL,
      created_at        TEXT NOT NULL,
      updated_at        TEXT NOT NULL
    );

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

    CREATE TABLE IF NOT EXISTS audit_reports (
      id             TEXT PRIMARY KEY,
      purchase_id    TEXT NOT NULL UNIQUE REFERENCES purchases (id) ON DELETE CASCADE,
      user_id        TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
      product_id     TEXT NOT NULL,
      status         TEXT NOT NULL DEFAULT 'generating',
      report_json    TEXT,
      error_message  TEXT,
      created_at     TEXT NOT NULL,
      completed_at   TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_audit_reports_user_product
      ON audit_reports (user_id, product_id);

    -- Founder-journey essay series (webtechhq.com/journal). Two categories
    -- share this table via entry_type: 'weekly' (tied to the regular
    -- flagship-video content, produced via the moore-journal HEIT pipeline)
    -- and 'monthly-recap' (a founder-progress update; format/template not
    -- yet decided as of this table's creation). Not enforced via CHECK
    -- constraint, just documented convention.
    CREATE TABLE IF NOT EXISTS journal_entries (
      id           TEXT PRIMARY KEY,
      slug         TEXT NOT NULL UNIQUE,
      title        TEXT NOT NULL,
      content      TEXT NOT NULL,
      entry_date   TEXT NOT NULL,
      entry_type   TEXT NOT NULL DEFAULT 'weekly',
      youtube_url  TEXT,
      created_at   TEXT NOT NULL,
      updated_at   TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_journal_entries_slug
      ON journal_entries (slug);

    CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_date
      ON journal_entries (entry_date);
  `);

  // Backfill reset_token columns for databases created before they existed.
  const columns = db.prepare("PRAGMA table_info(users)").all() as { name: string; notnull: number }[];
  const columnNames = new Set(columns.map((c) => c.name));

  // Relax last_name to nullable for databases created before the Opportunity
  // Finder could be requested with just a name and email. SQLite can't drop a
  // NOT NULL constraint in place, so rebuild the table.
  const lastNameCol = columns.find((c) => c.name === "last_name");
  if (lastNameCol && lastNameCol.notnull === 1) {
    db.pragma("foreign_keys = OFF");
    db.exec(`
      CREATE TABLE users_new (
        id                      TEXT PRIMARY KEY,
        first_name              TEXT NOT NULL,
        last_name               TEXT,
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

      INSERT INTO users_new SELECT
        id, first_name, last_name, email, password_hash, google_id,
        email_verified, email_verified_at, verification_token, verification_expires_at,
        reset_token, reset_expires_at, created_at
      FROM users;

      DROP TABLE users;
      ALTER TABLE users_new RENAME TO users;

      CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
      CREATE INDEX IF NOT EXISTS idx_users_google_id ON users (google_id);
      CREATE INDEX IF NOT EXISTS idx_users_token ON users (verification_token);
      CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users (reset_token);
    `);
    db.pragma("foreign_keys = ON");
  }
  if (!columnNames.has("reset_token")) {
    db.exec("ALTER TABLE users ADD COLUMN reset_token TEXT");
    db.exec("CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users (reset_token)");
  }
  if (!columnNames.has("reset_expires_at")) {
    db.exec("ALTER TABLE users ADD COLUMN reset_expires_at TEXT");
  }
  if (!columnNames.has("login_token")) {
    db.exec("ALTER TABLE users ADD COLUMN login_token TEXT");
  }
  if (!columnNames.has("login_token_expires_at")) {
    db.exec("ALTER TABLE users ADD COLUMN login_token_expires_at TEXT");
  }
  // Created here (rather than in the schema block above) so it works whether
  // login_token was just added by the ALTER above or already existed.
  db.exec("CREATE INDEX IF NOT EXISTS idx_users_login_token ON users (login_token)");

  // Backfill rendered_prompt for databases created before it existed.
  const submissionColumns = db.prepare("PRAGMA table_info(submissions)").all() as { name: string }[];
  const submissionColumnNames = new Set(submissionColumns.map((c) => c.name));
  if (!submissionColumnNames.has("rendered_prompt")) {
    db.exec("ALTER TABLE submissions ADD COLUMN rendered_prompt TEXT");
  }

  // Relax submissions.user_id to nullable for databases created before
  // anonymous (pre-account) submissions existed. SQLite can't drop a NOT
  // NULL constraint in place, so rebuild the table, same approach as the
  // users/last_name relax above. Runs *after* the rendered_prompt backfill
  // immediately above, so that column is always already present here and
  // its data is carried across by this rebuild rather than dropped -
  // rebuilding first and backfilling rendered_prompt second would silently
  // lose every existing rendered_prompt value.
  const submissionsUserIdCol = db.prepare("PRAGMA table_info(submissions)").all() as
    { name: string; notnull: number }[];
  const submissionsUserId = submissionsUserIdCol.find((c) => c.name === "user_id");
  if (submissionsUserId && submissionsUserId.notnull === 1) {
    db.pragma("foreign_keys = OFF");
    db.exec(`
      CREATE TABLE submissions_new (
        id                       TEXT PRIMARY KEY,
        user_id                  TEXT REFERENCES users (id) ON DELETE CASCADE,
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
        rendered_prompt          TEXT,
        submitted_at             TEXT NOT NULL,
        created_at               TEXT NOT NULL,
        validation_flags         TEXT NOT NULL DEFAULT '[]',
        approval_status          TEXT NOT NULL DEFAULT 'pending_review',
        approved_by              TEXT,
        approved_at              TEXT,
        admin_notes              TEXT,
        claim_token              TEXT
      );

      INSERT INTO submissions_new (
        id, user_id, business_type, team_size,
        layer1_problem, layer1_elimination,
        layer2_hours, layer2_salary,
        layer3_repetitive, layer3_compliance, layer3_compliance_detail, layer3_data,
        additional_notes, rendered_prompt, submitted_at, created_at, validation_flags,
        approval_status, approved_by, approved_at, admin_notes
      )
      SELECT
        id, user_id, business_type, team_size,
        layer1_problem, layer1_elimination,
        layer2_hours, layer2_salary,
        layer3_repetitive, layer3_compliance, layer3_compliance_detail, layer3_data,
        additional_notes, rendered_prompt, submitted_at, created_at, validation_flags,
        approval_status, approved_by, approved_at, admin_notes
      FROM submissions;

      DROP TABLE submissions;
      ALTER TABLE submissions_new RENAME TO submissions;

      CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions (user_id);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_submissions_user_unique ON submissions (user_id);
      CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions (approval_status);
      CREATE INDEX IF NOT EXISTS idx_submissions_claim_token ON submissions (claim_token);
    `);
    db.pragma("foreign_keys = ON");
  }
  // Backfill claim_token for submissions databases that skipped the rebuild
  // above (user_id was already nullable, e.g. a database created fresh after
  // this change shipped but before a later deploy added claim_token - not a
  // real-world path today, but keeps this guard independent and idempotent
  // like the rest of this function rather than assuming the rebuild branch
  // is the only way this column gets added).
  const submissionsColumnsAfter = db.prepare("PRAGMA table_info(submissions)").all() as { name: string }[];
  if (!submissionsColumnsAfter.some((c) => c.name === "claim_token")) {
    db.exec("ALTER TABLE submissions ADD COLUMN claim_token TEXT");
  }
  // Column is now guaranteed present (fresh CREATE TABLE above, the rebuild
  // block above, or the ALTER right above) - safe to create unconditionally.
  // Deliberately NOT part of the static CREATE TABLE IF NOT EXISTS block up
  // top: that CREATE INDEX would run even when the table already existed
  // without this column (CREATE TABLE IF NOT EXISTS is a no-op there) and
  // crash migrate() on every pre-existing database, same failure mode this
  // codebase has hit before with an index created ahead of its column.
  db.exec("CREATE INDEX IF NOT EXISTS idx_submissions_claim_token ON submissions (claim_token)");

  // Same user_id-nullable relax for prompt_pilot_submissions. No extra
  // columns to preserve here (rendered_prompt has been part of this table's
  // schema since it was created), so this is a simpler rebuild than
  // submissions above.
  const promptPilotCols = db.prepare("PRAGMA table_info(prompt_pilot_submissions)").all() as
    { name: string; notnull: number }[];
  const promptPilotUserId = promptPilotCols.find((c) => c.name === "user_id");
  if (promptPilotUserId && promptPilotUserId.notnull === 1) {
    db.pragma("foreign_keys = OFF");
    db.exec(`
      CREATE TABLE prompt_pilot_submissions_new (
        id               TEXT PRIMARY KEY,
        user_id          TEXT REFERENCES users (id) ON DELETE CASCADE,
        learning_goal    TEXT NOT NULL,
        starting_point   TEXT,
        why              TEXT,
        time_budget      TEXT,
        rendered_prompt  TEXT,
        submitted_at     TEXT NOT NULL,
        created_at       TEXT NOT NULL,
        claim_token      TEXT
      );

      INSERT INTO prompt_pilot_submissions_new (
        id, user_id, learning_goal, starting_point, why, time_budget,
        rendered_prompt, submitted_at, created_at
      )
      SELECT
        id, user_id, learning_goal, starting_point, why, time_budget,
        rendered_prompt, submitted_at, created_at
      FROM prompt_pilot_submissions;

      DROP TABLE prompt_pilot_submissions;
      ALTER TABLE prompt_pilot_submissions_new RENAME TO prompt_pilot_submissions;

      CREATE UNIQUE INDEX IF NOT EXISTS idx_prompt_pilot_submissions_user_unique
        ON prompt_pilot_submissions (user_id);
      CREATE INDEX IF NOT EXISTS idx_prompt_pilot_submissions_claim_token
        ON prompt_pilot_submissions (claim_token);
    `);
    db.pragma("foreign_keys = ON");
  }
  const promptPilotColsAfter = db.prepare("PRAGMA table_info(prompt_pilot_submissions)").all() as
    { name: string }[];
  if (!promptPilotColsAfter.some((c) => c.name === "claim_token")) {
    db.exec("ALTER TABLE prompt_pilot_submissions ADD COLUMN claim_token TEXT");
  }
  // Same reasoning as idx_submissions_claim_token above - unconditional and
  // safe here, but deliberately not in the static block up top.
  db.exec(
    "CREATE INDEX IF NOT EXISTS idx_prompt_pilot_submissions_claim_token ON prompt_pilot_submissions (claim_token)",
  );

  // Backfill business_name for purchases created before it existed.
  const purchaseColumns = db.prepare("PRAGMA table_info(purchases)").all() as { name: string }[];
  const purchaseColumnNames = new Set(purchaseColumns.map((c) => c.name));
  if (!purchaseColumnNames.has("business_name")) {
    db.exec("ALTER TABLE purchases ADD COLUMN business_name TEXT");
  }
}
