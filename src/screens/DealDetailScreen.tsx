import React, { useState, useEffect } from "react";
import { useKeyboard } from "@opentui/react";
import type { Router } from "../hooks/useRouter";
import type { Deal, PipelineStage, Contact } from "../types";
import { getDealById, getStageById } from "../services/deal.service";
import { getDb } from "../db/connection";
import { formatDateTime } from "../utils/format";

interface DealDetailScreenProps {
  router: Router;
  dealId: number;
  inputFocused: boolean;
}

export function DealDetailScreen({
  router,
  dealId,
  inputFocused,
}: DealDetailScreenProps) {
  const db = getDb();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [stage, setStage] = useState<PipelineStage | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);

  useEffect(() => {
    const d = getDealById(db, dealId);
    setDeal(d);
    if (d) {
      setStage(getStageById(db, d.stage_id));
      if (d.contact_id) {
        const c = db
          .query("SELECT * FROM contacts WHERE id = ?")
          .get(d.contact_id) as Contact | null;
        setContact(c);
      }
    }
  }, [dealId]);

  useKeyboard((key) => {
    if (inputFocused) return;

    switch (key.name) {
      case "escape":
        router.goBack();
        break;
    }
  });

  if (!deal) {
    return (
      <box>
        <text fg="#495670" content="Deal not found." />
      </box>
    );
  }

  const requiredInfo = stage?.required_info
    ? JSON.parse(stage.required_info) as string[]
    : [];
  const metadata = deal.metadata ? JSON.parse(deal.metadata) : {};

  return (
    <box width="100%">
      {/* Title */}
      <box height={1}>
        <text fg="#64ffda" content={`  ${deal.title}`} />
      </box>

      {/* Details */}
      <box
        border={true}
        borderStyle="rounded"
        borderColor="#0f3460"
        paddingLeft={1}
        paddingRight={1}
        paddingTop={1}
        width="100%"
      >
        <box height={1}>
          <text fg="#ccd6f6" content={`Stage:    ${stage?.name ?? "Unknown"}`} />
        </box>
        {deal.value && (
          <box height={1}>
            <text
              fg="#ccd6f6"
              content={`Value:    $${deal.value.toLocaleString()} ${deal.currency}`}
            />
          </box>
        )}
        {contact && (
          <box height={1}>
            <text fg="#ccd6f6" content={`Contact:  ${contact.name} (${contact.email ?? "no email"})`} />
          </box>
        )}
        <box height={1}>
          <text fg="#8892b0" content={`Created:  ${formatDateTime(deal.created_at)}`} />
        </box>
        <box height={1}>
          <text fg="#8892b0" content={`Updated:  ${formatDateTime(deal.updated_at)}`} />
        </box>
        {deal.description && (
          <box paddingTop={1}>
            <text fg="#8892b0" content={deal.description} />
          </box>
        )}
      </box>

      {/* Required info */}
      {requiredInfo.length > 0 && (
        <box
          border={true}
          borderStyle="rounded"
          borderColor="#0f3460"
          paddingLeft={1}
          paddingRight={1}
          width="100%"
        >
          <box height={1}>
            <text fg="#64ffda" content="Required Info:" />
          </box>
          {requiredInfo.map((field: string) => {
            const value = metadata[field];
            const status = value ? "✓" : "○";
            const color = value ? "#2ecc71" : "#495670";
            return (
              <box key={field} height={1}>
                <text
                  fg={color}
                  content={`  ${status} ${field}: ${value ?? "(not set)"}`}
                />
              </box>
            );
          })}
        </box>
      )}

      {/* History */}
      <box
        border={true}
        borderStyle="rounded"
        borderColor="#0f3460"
        paddingLeft={1}
        paddingRight={1}
        width="100%"
      >
        <box height={1}>
          <text fg="#64ffda" content="History:" />
        </box>
        {(() => {
          const history = db
            .query(
              `SELECT dh.*,
                      ps_from.name as from_name,
                      ps_to.name as to_name
               FROM deal_history dh
               LEFT JOIN pipeline_stages ps_from ON ps_from.id = dh.from_stage_id
               JOIN pipeline_stages ps_to ON ps_to.id = dh.to_stage_id
               WHERE dh.deal_id = ?
               ORDER BY dh.triggered_at DESC`
            )
            .all(dealId) as any[];

          if (history.length === 0) {
            return (
              <box>
                <text fg="#495670" content="  No history yet." />
              </box>
            );
          }

          return history.map((h: any) => (
            <box key={h.id} height={1}>
              <text
                fg="#8892b0"
                content={`  ${formatDateTime(h.triggered_at)}: ${h.from_name ?? "New"} → ${h.to_name}`}
              />
            </box>
          ));
        })()}
      </box>

      <box height={1} paddingTop={1}>
        <text fg="#8892b0" content="  [Esc] Back" />
      </box>
    </box>
  );
}
