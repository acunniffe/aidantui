import type { TriggerContext } from "../src/types/pipeline";

export default async function (ctx: TriggerContext): Promise<void> {
  // Example trigger: fires when a deal enters "Closed Lost"
  const now = new Date().toISOString();
  ctx.db.run("UPDATE deals SET closed_at = ? WHERE id = ?", [
    now,
    ctx.deal.id,
  ]);
}
