import React from "react";
import type { CalendarEvent } from "../types";
import { formatTime, truncate } from "../utils/format";

interface EventItemProps {
  event: CalendarEvent;
  selected: boolean;
  width: number;
}

export function EventItem({ event, selected, width }: EventItemProps) {
  const time = formatTime(event.start_time);
  const attendeeCount = event.attendees.length;
  const suffix = attendeeCount > 0 ? ` (${attendeeCount})` : "";
  const maxTitleLen = Math.max(width - time.length - suffix.length - 6, 10);
  const title = truncate(event.title, maxTitleLen);

  const prefix = selected ? "▸ " : "  ";
  const bg = selected ? "#1a1a2e" : undefined;
  const fgColor = selected ? "#64ffda" : "#ccd6f6";

  // Dim past events
  const now = new Date();
  const eventEnd = new Date(event.end_time);
  const isPast = eventEnd < now;
  const effectiveFg = isPast && !selected ? "#495670" : fgColor;

  const line = `${prefix}${time}  ${title}${suffix}`;

  return (
    <box height={1} width="100%" backgroundColor={bg}>
      <text content={line} fg={effectiveFg} />
    </box>
  );
}
