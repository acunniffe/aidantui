import { Database } from "bun:sqlite";
import type { Config } from "../config";
import { getCalendarClient } from "../services/auth";

function extractMeetingUrl(event: any): string | null {
  // Check hangoutLink first (Google Meet)
  if (event.hangoutLink) return event.hangoutLink;

  // Check conference data
  if (event.conferenceData?.entryPoints) {
    const videoEntry = event.conferenceData.entryPoints.find(
      (ep: any) => ep.entryPointType === "video"
    );
    if (videoEntry) return videoEntry.uri;
  }

  // Check location and description for Zoom/Teams links
  const urlPattern = /https?:\/\/[^\s<>"]+(?:zoom\.us|teams\.microsoft\.com|meet\.google\.com)[^\s<>"]*/i;
  if (event.location) {
    const match = event.location.match(urlPattern);
    if (match) return match[0];
  }
  if (event.description) {
    const match = event.description.match(urlPattern);
    if (match) return match[0];
  }

  return null;
}

export async function syncCalendar(
  db: Database,
  config: Config
): Promise<{ synced: number; errors: number }> {
  const calendar = getCalendarClient(config);
  let synced = 0;
  let errors = 0;

  // Check for existing sync token
  const syncState = db
    .query("SELECT * FROM sync_state WHERE source = 'google_calendar'")
    .get() as any;

  const rangeDays = config.general.calendar_range_days;

  const params: any = {
    calendarId: "primary",
    maxResults: 250,
    singleEvents: true,
    orderBy: "startTime",
  };

  if (syncState?.sync_token) {
    params.syncToken = syncState.sync_token;
  } else {
    // First sync: pull a window around today
    params.timeMin = new Date(
      Date.now() - rangeDays * 86400000
    ).toISOString();
    params.timeMax = new Date(
      Date.now() + rangeDays * 86400000
    ).toISOString();
  }

  try {
    let nextPageToken: string | undefined;

    do {
      if (nextPageToken) params.pageToken = nextPageToken;

      const res = await calendar.events.list(params);
      const items = res.data.items ?? [];

      const upsertEvent = db.prepare(`
        INSERT INTO calendar_events (id, calendar_id, title, description, start_time, end_time, location, meeting_url, status, all_day, raw_json, updated_at)
        VALUES (?, 'primary', ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          description = excluded.description,
          start_time = excluded.start_time,
          end_time = excluded.end_time,
          location = excluded.location,
          meeting_url = excluded.meeting_url,
          status = excluded.status,
          all_day = excluded.all_day,
          raw_json = excluded.raw_json,
          updated_at = datetime('now')
      `);

      const deleteAttendees = db.prepare(
        "DELETE FROM event_attendees WHERE event_id = ?"
      );

      const insertAttendee = db.prepare(`
        INSERT INTO event_attendees (event_id, email, name, rsvp_status, organizer)
        VALUES (?, ?, ?, ?, ?)
      `);

      db.run("BEGIN");
      try {
        for (const event of items) {
          if (!event.id) continue;

          const startTime =
            event.start?.dateTime ?? event.start?.date ?? "";
          const endTime = event.end?.dateTime ?? event.end?.date ?? "";
          const allDay = event.start?.date ? 1 : 0;
          const meetingUrl = extractMeetingUrl(event);

          upsertEvent.run(
            event.id,
            event.summary ?? "(No title)",
            event.description ?? null,
            startTime,
            endTime,
            event.location ?? null,
            meetingUrl,
            event.status ?? "confirmed",
            allDay,
            JSON.stringify(event)
          );

          // Replace attendees
          deleteAttendees.run(event.id);
          for (const att of event.attendees ?? []) {
            insertAttendee.run(
              event.id,
              att.email ?? "",
              att.displayName ?? null,
              att.responseStatus ?? null,
              att.organizer ? 1 : 0
            );
          }

          synced++;
        }
        db.run("COMMIT");
      } catch (err) {
        db.run("ROLLBACK");
        throw err;
      }

      nextPageToken = res.data.nextPageToken ?? undefined;

      // Save sync token for incremental sync next time
      if (res.data.nextSyncToken) {
        db.run(
          `INSERT INTO sync_state (source, last_sync, sync_token)
           VALUES ('google_calendar', datetime('now'), ?)
           ON CONFLICT(source) DO UPDATE SET
             last_sync = datetime('now'),
             sync_token = excluded.sync_token`,
          [res.data.nextSyncToken]
        );
      }
    } while (nextPageToken);
  } catch (err: any) {
    // If sync token is invalid, clear it and do a full re-sync
    if (err?.code === 410) {
      db.run("DELETE FROM sync_state WHERE source = 'google_calendar'");
      return syncCalendar(db, config);
    }
    errors++;
    throw err;
  }

  return { synced, errors };
}
