import { Database } from "bun:sqlite";
import type { CalendarEvent, EventAttendee } from "../types";

export function getUpcomingEvents(
  db: Database,
  limit = 50
): CalendarEvent[] {
  const now = new Date().toISOString();
  const rows = db
    .query(
      `SELECT * FROM calendar_events
       WHERE start_time >= ? AND status != 'cancelled'
       ORDER BY start_time ASC
       LIMIT ?`
    )
    .all(now, limit) as any[];

  return rows.map((row) => ({
    ...row,
    attendees: getEventAttendees(db, row.id),
  }));
}

export function getTodayEvents(db: Database): CalendarEvent[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const rows = db
    .query(
      `SELECT * FROM calendar_events
       WHERE start_time >= ? AND start_time < ? AND status != 'cancelled'
       ORDER BY start_time ASC`
    )
    .all(today.toISOString(), tomorrow.toISOString()) as any[];

  return rows.map((row) => ({
    ...row,
    attendees: getEventAttendees(db, row.id),
  }));
}

export function getEventById(
  db: Database,
  eventId: string
): CalendarEvent | null {
  const row = db
    .query("SELECT * FROM calendar_events WHERE id = ?")
    .get(eventId) as any;

  if (!row) return null;
  return {
    ...row,
    attendees: getEventAttendees(db, row.id),
  };
}

export function getEventAttendees(
  db: Database,
  eventId: string
): EventAttendee[] {
  return db
    .query("SELECT * FROM event_attendees WHERE event_id = ?")
    .all(eventId) as EventAttendee[];
}

export function getRecentAndUpcomingEvents(
  db: Database,
  pastDays = 7,
  futureDays = 30,
  limit = 100
): CalendarEvent[] {
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - pastDays);
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + futureDays);

  const rows = db
    .query(
      `SELECT * FROM calendar_events
       WHERE start_time >= ? AND start_time <= ? AND status != 'cancelled'
       ORDER BY start_time ASC
       LIMIT ?`
    )
    .all(pastDate.toISOString(), futureDate.toISOString(), limit) as any[];

  return rows.map((row) => ({
    ...row,
    attendees: getEventAttendees(db, row.id),
  }));
}
