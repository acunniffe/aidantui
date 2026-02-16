import type { Database } from "bun:sqlite";

export interface StageDef {
  name: string;
  order: number;
  color?: string;
  requiredInfo?: string[];
  enterTrigger?: string;
  leaveTrigger?: string;
}

export interface PipelineStage {
  id: number;
  name: string;
  display_order: number;
  required_info: string | null;
  enter_trigger: string | null;
  leave_trigger: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: number;
  title: string;
  stage_id: number;
  contact_id: number | null;
  value: number | null;
  currency: string;
  description: string | null;
  metadata: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DealHistory {
  id: number;
  deal_id: number;
  from_stage_id: number | null;
  to_stage_id: number;
  triggered_at: string;
}

export interface TriggerContext {
  deal: Deal;
  fromStage: PipelineStage | null;
  toStage: PipelineStage;
  db: Database;
}
