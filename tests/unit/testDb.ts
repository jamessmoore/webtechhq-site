import fs from "fs";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";

/**
 * lib/db.ts reads DATABASE_PATH once at module-evaluation time and caches a
 * singleton connection, so each test file must set the env var and only
 * *then* dynamically import the modules that transitively pull in lib/db.
 * A static top-level import would already have run before any beforeAll hook.
 */
export function useTestDatabase(): { cleanup: () => void } {
  const dbPath = path.join(os.tmpdir(), `webtechhq-test-${randomUUID()}.db`);
  process.env.DATABASE_PATH = dbPath;

  return {
    cleanup: () => {
      for (const suffix of ["", "-wal", "-shm"]) {
        fs.rmSync(dbPath + suffix, { force: true });
      }
    },
  };
}
