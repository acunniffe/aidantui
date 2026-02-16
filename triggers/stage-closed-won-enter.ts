import type { TriggerContext } from "../src/types/pipeline";

export default async function (ctx: TriggerContext): Promise<void> {
  // Example trigger: fires when a deal enters "Closed Won"
  // You can add custom logic here, e.g.:
  // - Send a notification
  // - Update an external CRM
  // - Create a follow-up task

  const now = new Date().toISOString();
  ctx.db.run("UPDATE deals SET closed_at = ? WHERE id = ?", [
    now,
    ctx.deal.id,
  ]);
}
