import React from "react";
import type { CalendarEvent } from "../types";
import { EventItem } from "./EventItem";
import { formatRelativeDate } from "../utils/format";

interface EventListProps {
  events: CalendarEvent[];
  selectedIndex: number;
  width: number;
}

export function EventList({ events, selectedIndex, width }: EventListProps) {
  if (events.length === 0) {
    return (
      <box paddingTop={2}>
        <text content="  No calendar events found." fg="#495670" />
        <text content="  Set up Google Calendar auth: bun run setup-auth" fg="#495670" />
      </box>
    );
  }

  // Group events by date
  let lastDate = "";

  return (
    <box width="100%">
      {events.map((event, i) => {
        const eventDate = new Date(event.start_time).toDateString();
        const showDateHeader = eventDate !== lastDate;
        lastDate = eventDate;

        return (
          <box key={event.id} width="100%">
            {showDateHeader && (
              <box height={1} width="100%">
                <text
                  content={`  ─── ${formatRelativeDate(event.start_time)} ───`}
                  fg="#64ffda"
                />
              </box>
            )}
            <EventItem
              event={event}
              selected={i === selectedIndex}
              width={width}
            />
          </box>
        );
      })}
    </box>
  );
}
