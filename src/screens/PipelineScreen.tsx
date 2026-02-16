import React, { useState, useCallback } from "react";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import type { Router } from "../hooks/useRouter";
import { useDeals, type StageWithDeals } from "../hooks/useDeals";
import { truncate, formatDate } from "../utils/format";
import { createDeal, getAllStages } from "../services/deal.service";
import { moveDealToStage } from "../services/pipeline.service";
import { getDb } from "../db/connection";

interface PipelineScreenProps {
  router: Router;
  inputFocused: boolean;
}

type Mode = "browse" | "new-deal" | "move-deal";

export function PipelineScreen({ router, inputFocused }: PipelineScreenProps) {
  const { pipeline, refresh } = useDeals();
  const { width } = useTerminalDimensions();

  const [stageIndex, setStageIndex] = useState(0);
  const [dealIndex, setDealIndex] = useState(0);
  const [mode, setMode] = useState<Mode>("browse");
  const [newDealTitle, setNewDealTitle] = useState("");
  const [moveTargetIndex, setMoveTargetIndex] = useState(0);

  const currentStage = pipeline[stageIndex];
  const currentDeal = currentStage?.deals[dealIndex];

  // Calculate column width
  const stageCount = pipeline.length || 1;
  const colWidth = Math.max(Math.floor((width - 16) / stageCount), 15);

  const handleCreateDeal = useCallback(() => {
    if (!newDealTitle.trim() || !currentStage) return;
    const db = getDb();
    createDeal(db, newDealTitle.trim(), currentStage.stage.id);
    setNewDealTitle("");
    setMode("browse");
    refresh();
  }, [newDealTitle, currentStage, refresh]);

  const handleMoveDeal = useCallback(async () => {
    if (!currentDeal || !pipeline[moveTargetIndex]) return;
    const db = getDb();
    await moveDealToStage(
      db,
      currentDeal.id,
      pipeline[moveTargetIndex].stage.id
    );
    setMode("browse");
    refresh();
  }, [currentDeal, moveTargetIndex, pipeline, refresh]);

  useKeyboard((key) => {
    if (inputFocused) return;

    if (mode === "new-deal") {
      if (key.name === "escape") {
        setMode("browse");
        setNewDealTitle("");
      }
      return; // Input component handles the rest
    }

    if (mode === "move-deal") {
      switch (key.name) {
        case "up":
        case "k":
          setMoveTargetIndex((prev) => Math.max(0, prev - 1));
          break;
        case "down":
        case "j":
          setMoveTargetIndex((prev) =>
            Math.min(pipeline.length - 1, prev + 1)
          );
          break;
        case "return":
          handleMoveDeal();
          break;
        case "escape":
          setMode("browse");
          break;
      }
      return;
    }

    // Browse mode
    switch (key.name) {
      case "left":
      case "h":
        setStageIndex((prev) => Math.max(0, prev - 1));
        setDealIndex(0);
        break;
      case "right":
      case "l":
        setStageIndex((prev) =>
          Math.min(pipeline.length - 1, prev + 1)
        );
        setDealIndex(0);
        break;
      case "up":
      case "k":
        setDealIndex((prev) => Math.max(0, prev - 1));
        break;
      case "down":
      case "j":
        setDealIndex((prev) => {
          const maxIdx = (currentStage?.deals.length ?? 1) - 1;
          return Math.min(maxIdx, prev + 1);
        });
        break;
      case "return":
        if (currentDeal) {
          router.navigate({ name: "deal-detail", dealId: currentDeal.id });
        }
        break;
      case "n":
        if (pipeline.length > 0) {
          setMode("new-deal");
        }
        break;
      case "m":
        if (currentDeal) {
          setMoveTargetIndex(stageIndex);
          setMode("move-deal");
        }
        break;
    }
  });

  if (pipeline.length === 0) {
    return (
      <box width="100%" paddingTop={1}>
        <text fg="#495670" content="  No pipeline stages defined." />
        <text fg="#495670" content="  Create a pipeline.md file and run: bun run compile-pipeline" />
      </box>
    );
  }

  // Move deal overlay
  if (mode === "move-deal" && currentDeal) {
    return (
      <box width="100%">
        <box height={1}>
          <text
            fg="#64ffda"
            content={`  Move "${currentDeal.title}" to stage:`}
          />
        </box>
        <box paddingLeft={2} paddingTop={1}>
          {pipeline.map((s, i) => {
            const prefix = i === moveTargetIndex ? "▸ " : "  ";
            const color =
              i === moveTargetIndex ? "#64ffda" : "#ccd6f6";
            return (
              <box key={s.stage.id} height={1}>
                <text fg={color} content={`${prefix}${s.stage.name}`} />
              </box>
            );
          })}
        </box>
        <box height={1} paddingTop={1} paddingLeft={2}>
          <text fg="#8892b0" content="Enter=confirm  Esc=cancel" />
        </box>
      </box>
    );
  }

  // New deal input overlay
  if (mode === "new-deal") {
    return (
      <box width="100%">
        <box height={1} paddingLeft={1}>
          <text
            fg="#64ffda"
            content={`  New deal in "${currentStage?.stage.name}":`}
          />
        </box>
        <box paddingLeft={2} paddingTop={1}>
          <input
            placeholder="Deal title..."
            focused={true}
            value={newDealTitle}
            textColor="#ccd6f6"
            onInput={(val) => setNewDealTitle(val)}
            onSubmit={handleCreateDeal}
          />
        </box>
        <box height={1} paddingTop={1} paddingLeft={2}>
          <text fg="#8892b0" content="Enter=create  Esc=cancel" />
        </box>
      </box>
    );
  }

  // Main pipeline view: stages as columns
  return (
    <box width="100%">
      <box height={1}>
        <text fg="#8892b0" content="  ←/→ stages  ↑/↓ deals  n=new deal  m=move  Enter=details" />
      </box>
      <box width="100%">
        {pipeline.map((stageData, si) => {
          const isActiveStage = si === stageIndex;
          const borderColor = isActiveStage
            ? stageData.stage.color ?? "#64ffda"
            : "#1a1a2e";

          return (
            <box
              key={stageData.stage.id}
              width={colWidth}
              border={true}
              borderStyle="rounded"
              borderColor={borderColor}
              paddingLeft={1}
              paddingRight={1}
            >
              {/* Stage header */}
              <box
                height={1}
              >
                <text
                  fg={stageData.stage.color ?? "#ccd6f6"}
                  content={`${stageData.stage.name} (${stageData.deals.length})`}
                />
              </box>

              {/* Deals in this stage */}
              {stageData.deals.length === 0 ? (
                <box>
                  <text fg="#495670" content="  (empty)" />
                </box>
              ) : (
                stageData.deals.map((deal, di) => {
                  const isSelected =
                    isActiveStage && di === dealIndex;
                  const prefix = isSelected ? "▸ " : "  ";
                  const color = isSelected
                    ? "#64ffda"
                    : "#8892b0";
                  const valueStr = deal.value
                    ? ` $${deal.value.toLocaleString()}`
                    : "";

                  return (
                    <box key={deal.id} height={1}>
                      <text
                        fg={color}
                        content={`${prefix}${truncate(deal.title, colWidth - 6)}${valueStr}`}
                      />
                    </box>
                  );
                })
              )}
            </box>
          );
        })}
      </box>
    </box>
  );
}
