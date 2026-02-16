import { Database } from "bun:sqlite";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { parsePipelineMarkdown } from "../utils/markdown-parser";
import { getTriggersDir } from "../utils/paths";
import type { StageDef, PipelineStage, Deal, TriggerContext } from "../types";

/**
 * Compile pipeline.md into the database.
 * Creates new stages, updates existing ones, removes deleted ones.
 */
export function compilePipeline(
  db: Database,
  markdownPath: string
): { created: number; updated: number; deleted: number } {
  if (!existsSync(markdownPath)) {
    throw new Error(`Pipeline file not found: ${markdownPath}`);
  }

  const content = readFileSync(markdownPath, "utf-8");
  const stageDefs = parsePipelineMarkdown(content);

  if (stageDefs.length === 0) {
    throw new Error("No stages found in pipeline markdown");
  }

  let created = 0;
  let updated = 0;
  let deleted = 0;

  const upsertStage = db.prepare(`
    INSERT INTO pipeline_stages (name, display_order, required_info, enter_trigger, leave_trigger, color, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(name) DO UPDATE SET
      display_order = excluded.display_order,
      required_info = excluded.required_info,
      enter_trigger = excluded.enter_trigger,
      leave_trigger = excluded.leave_trigger,
      color = excluded.color,
      updated_at = datetime('now')
  `);

  db.run("BEGIN");
  try {
    // Upsert all stages from markdown
    for (const def of stageDefs) {
      const existing = db
        .query("SELECT id FROM pipeline_stages WHERE name = ?")
        .get(def.name);

      upsertStage.run(
        def.name,
        def.order,
        def.requiredInfo ? JSON.stringify(def.requiredInfo) : null,
        def.enterTrigger ?? null,
        def.leaveTrigger ?? null,
        def.color ?? null
      );

      if (existing) {
        updated++;
      } else {
        created++;
      }
    }

    // Delete stages that no longer exist in markdown
    // (only if they have no deals)
    const stageNames = stageDefs.map((s) => s.name);
    const placeholders = stageNames.map(() => "?").join(",");
    const orphaned = db
      .query(
        `SELECT ps.id, ps.name FROM pipeline_stages ps
         LEFT JOIN deals d ON d.stage_id = ps.id
         WHERE ps.name NOT IN (${placeholders}) AND d.id IS NULL`
      )
      .all(...stageNames) as { id: number; name: string }[];

    for (const stage of orphaned) {
      db.run("DELETE FROM pipeline_stages WHERE id = ?", [stage.id]);
      deleted++;
    }

    db.run("COMMIT");
  } catch (err) {
    db.run("ROLLBACK");
    throw err;
  }

  return { created, updated, deleted };
}

/**
 * Fire a trigger script by name.
 * Triggers are TypeScript files in the triggers/ directory.
 * If the file doesn't exist, it's a no-op.
 */
export async function fireTrigger(
  triggerName: string | null,
  ctx: TriggerContext
): Promise<void> {
  if (!triggerName) return;

  const triggerPath = resolve(getTriggersDir(), `${triggerName}.ts`);

  if (!existsSync(triggerPath)) {
    // No-op: trigger file doesn't exist
    return;
  }

  try {
    const mod = await import(triggerPath);
    if (typeof mod.default === "function") {
      await mod.default(ctx);
    }
  } catch (err) {
    // Log error but don't prevent the stage transition
    console.error(`Trigger ${triggerName} failed:`, err);
  }
}

/**
 * Move a deal to a new stage, firing leave/enter triggers.
 */
export async function moveDealToStage(
  db: Database,
  dealId: number,
  newStageId: number
): Promise<void> {
  const deal = db
    .query("SELECT * FROM deals WHERE id = ?")
    .get(dealId) as Deal | null;
  if (!deal) throw new Error(`Deal ${dealId} not found`);

  const fromStage = db
    .query("SELECT * FROM pipeline_stages WHERE id = ?")
    .get(deal.stage_id) as PipelineStage | null;

  const toStage = db
    .query("SELECT * FROM pipeline_stages WHERE id = ?")
    .get(newStageId) as PipelineStage | null;
  if (!toStage) throw new Error(`Stage ${newStageId} not found`);

  const ctx: TriggerContext = {
    deal,
    fromStage,
    toStage,
    db,
  };

  // Fire leave trigger on old stage
  if (fromStage) {
    await fireTrigger(fromStage.leave_trigger, ctx);
  }

  // Update the deal
  db.run(
    "UPDATE deals SET stage_id = ?, updated_at = datetime('now') WHERE id = ?",
    [newStageId, dealId]
  );

  // Record history
  db.run(
    "INSERT INTO deal_history (deal_id, from_stage_id, to_stage_id) VALUES (?, ?, ?)",
    [dealId, deal.stage_id, newStageId]
  );

  // Fire enter trigger on new stage
  await fireTrigger(toStage.enter_trigger, ctx);
}
