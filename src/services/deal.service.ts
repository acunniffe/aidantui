import { Database } from "bun:sqlite";
import type { Deal, PipelineStage } from "../types";

export function getAllStages(db: Database): PipelineStage[] {
  return db
    .query("SELECT * FROM pipeline_stages ORDER BY display_order ASC")
    .all() as PipelineStage[];
}

export function getStageById(
  db: Database,
  stageId: number
): PipelineStage | null {
  return db
    .query("SELECT * FROM pipeline_stages WHERE id = ?")
    .get(stageId) as PipelineStage | null;
}

export function getDealsByStage(db: Database, stageId: number): Deal[] {
  return db
    .query(
      "SELECT * FROM deals WHERE stage_id = ? ORDER BY updated_at DESC"
    )
    .all(stageId) as Deal[];
}

export function getAllDeals(db: Database): Deal[] {
  return db
    .query("SELECT * FROM deals ORDER BY updated_at DESC")
    .all() as Deal[];
}

export function getDealById(db: Database, dealId: number): Deal | null {
  return db
    .query("SELECT * FROM deals WHERE id = ?")
    .get(dealId) as Deal | null;
}

export function createDeal(
  db: Database,
  title: string,
  stageId: number,
  contactId?: number,
  value?: number,
  description?: string
): number {
  const result = db.run(
    `INSERT INTO deals (title, stage_id, contact_id, value, description)
     VALUES (?, ?, ?, ?, ?)`,
    [title, stageId, contactId ?? null, value ?? null, description ?? null]
  );

  const dealId = Number(result.lastInsertRowid);

  // Record initial history
  db.run(
    "INSERT INTO deal_history (deal_id, from_stage_id, to_stage_id) VALUES (?, NULL, ?)",
    [dealId, stageId]
  );

  return dealId;
}

export function updateDeal(
  db: Database,
  dealId: number,
  updates: Partial<{
    title: string;
    value: number;
    description: string;
    metadata: string;
    contact_id: number;
  }>
): void {
  const fields: string[] = [];
  const values: any[] = [];

  for (const [key, val] of Object.entries(updates)) {
    if (val !== undefined) {
      fields.push(`${key} = ?`);
      values.push(val);
    }
  }

  if (fields.length === 0) return;

  fields.push("updated_at = datetime('now')");
  values.push(dealId);

  db.run(
    `UPDATE deals SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
}

export function deleteDeal(db: Database, dealId: number): void {
  db.run("DELETE FROM deal_history WHERE deal_id = ?", [dealId]);
  db.run("DELETE FROM deal_links WHERE deal_id = ?", [dealId]);
  db.run("DELETE FROM deals WHERE id = ?", [dealId]);
}

export function getDealCount(db: Database): number {
  const row = db.query("SELECT COUNT(*) as count FROM deals").get() as {
    count: number;
  };
  return row.count;
}
