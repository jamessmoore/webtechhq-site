import path from 'path'
import Database from 'better-sqlite3'

// The e2e webServer (npm run start) and this test process share the same
// working directory and DATABASE_PATH, so we can read tokens straight out of
// the real sqlite file instead of needing a test email inbox.
const DB_PATH = path.resolve(process.cwd(), process.env.DATABASE_PATH ?? './data/submissions.db')

export function getVerificationTokenByEmail(email: string): string | null {
  const db = new Database(DB_PATH, { readonly: true })
  try {
    const row = db
      .prepare('SELECT verification_token FROM users WHERE email = ?')
      .get(email.toLowerCase()) as { verification_token: string | null } | undefined
    return row?.verification_token ?? null
  } finally {
    db.close()
  }
}

export function getResetTokenByEmail(email: string): string | null {
  const db = new Database(DB_PATH, { readonly: true })
  try {
    const row = db
      .prepare('SELECT reset_token FROM users WHERE email = ?')
      .get(email.toLowerCase()) as { reset_token: string | null } | undefined
    return row?.reset_token ?? null
  } finally {
    db.close()
  }
}
