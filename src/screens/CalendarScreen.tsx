import React, { useState, useCallback } from "react";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import type { Router } from "../hooks/useRouter";
import { useCalendarEvents } from "../hooks/useCalendarEvents";
import { EventList } from "../components/EventList";

interface CalendarScreenProps {
  router: Router;
  inputFocused: boolean;
}

export function CalendarScreen({ router, inputFocused }: CalendarScreenProps) {
  const { events } = useCalendarEvents();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { width } = useTerminalDimensions();

  useKeyboard(
    (key) => {
      if (inputFocused) return;

      switch (key.name) {
        case "up":
        case "k":
          setSelectedIndex((prev) => Math.max(0, prev - 1));
          break;
        case "down":
        case "j":
          setSelectedIndex((prev) =>
            Math.min(events.length - 1, prev + 1)
          );
          break;
        case "return":
          if (events[selectedIndex]) {
            router.navigate({
              name: "recording",
              eventId: events[selectedIndex].id,
            });
          }
          break;
        case "r":
          // Start ad-hoc recording (no event context)
          router.navigate({ name: "recording" });
          break;
      }
    },
  );

  const contentWidth = Math.max(width - 16, 30); // sidebar is ~14

  return (
    <box width="100%">
      <box height={1}>
        <text fg="#8892b0" content="  ↑/↓ navigate  Enter=record call  r=quick record" />
      </box>
      <scrollbox>
        <EventList
          events={events}
          selectedIndex={selectedIndex}
          width={contentWidth}
        />
      </scrollbox>
    </box>
  );
}
