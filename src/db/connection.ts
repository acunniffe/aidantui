import { Database } from "bun:sqlite";
import { getDbPath } from "../utils/paths";

let _db: Database | null = null;

export function getDb(): Database {
  if (_db) return _db;

  const dbPath = getDbPath();
  _db = new Database(dbPath, { create: true });

  // Enable WAL mode for better concurrent read performance
  _db.run("PRAGMA journal_mode = WAL");
  _db.run("PRAGMA foreign_keys = ON");

  return _db;
}

export function closeDb(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
}
