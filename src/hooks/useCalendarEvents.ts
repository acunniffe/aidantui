import { useState, useEffect } from "react";
import type { CalendarEvent } from "../types";
import { getRecentAndUpcomingEvents } from "../services/calendar.service";
import { getDb } from "../db/connection";

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const db = getDb();
    const rows = getRecentAndUpcomingEvents(db);
    setEvents(rows);
  }, []);

  const refresh = () => {
    const db = getDb();
    const rows = getRecentAndUpcomingEvents(db);
    setEvents(rows);
  };

  return { events, refresh };
}
