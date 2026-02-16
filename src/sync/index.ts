import { Database } from "bun:sqlite";
import type { Config } from "../config";
import { hasGoogleAuth } from "../config";
import { syncCalendar } from "./calendar";
import { reconcileContacts } from "./contacts";

export interface SyncResult {
  calendar: { synced: number; errors: number } | null;
  contactsCreated: number;
  duration: number;
}

export async function runStartupSync(
  db: Database,
  config: Config
): Promise<SyncResult> {
  const start = Date.now();
  const result: SyncResult = {
    calendar: null,
    contactsCreated: 0,
    duration: 0,
  };

  const tasks: Promise<void>[] = [];

  // Google Calendar sync
  if (hasGoogleAuth(config)) {
    tasks.push(
      syncCalendar(db, config).then((r) => {
        result.calendar = r;
      })
    );
  }

  // Run all integration syncs in parallel
  await Promise.allSettled(tasks);

  // Contact reconciliation runs after all syncs complete
  result.contactsCreated = reconcileContacts(db);

  result.duration = Date.now() - start;
  return result;
}
