import { useState, useEffect, useCallback } from "react";
import type { Deal, PipelineStage } from "../types";
import {
  getAllStages,
  getDealsByStage,
} from "../services/deal.service";
import { getDb } from "../db/connection";

export interface StageWithDeals {
  stage: PipelineStage;
  deals: Deal[];
}

export function useDeals() {
  const [pipeline, setPipeline] = useState<StageWithDeals[]>([]);

  const refresh = useCallback(() => {
    const db = getDb();
    const stages = getAllStages(db);
    const stagesWithDeals = stages.map((stage) => ({
      stage,
      deals: getDealsByStage(db, stage.id),
    }));
    setPipeline(stagesWithDeals);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { pipeline, refresh };
}
