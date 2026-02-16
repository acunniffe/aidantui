import { Database } from "bun:sqlite";
import { SCHEMA_SQL } from "./schema";

export function runMigrations(db: Database): void {
  // Split on semicolons and run each statement
  // This handles CREATE TABLE IF NOT EXISTS idempotently
  const statements = SCHEMA_SQL
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  db.run("BEGIN");
  try {
    for (const stmt of statements) {
      db.run(stmt);
    }
    db.run("COMMIT");
  } catch (err) {
    db.run("ROLLBACK");
    throw err;
  }
}
