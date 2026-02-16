import React, { useState, useEffect } from "react";
import { useKeyboard } from "@opentui/react";
import type { Router } from "../hooks/useRouter";
import type { Contact, CalendarEvent, Recording, Deal } from "../types";
import { getDb } from "../db/connection";
import { formatDateTime, formatDuration } from "../utils/format";

interface ContactDetailScreenProps {
  router: Router;
  contactId: number;
  inputFocused: boolean;
}

export function ContactDetailScreen({
  router,
  contactId,
  inputFocused,
}: ContactDetailScreenProps) {
  const db = getDb();
  const [contact, setContact] = useState<Contact | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    const c = db
      .query("SELECT * FROM contacts WHERE id = ?")
      .get(contactId) as Contact | null;
    setContact(c);

    if (c) {
      // Get events this contact attended
      const evts = db
        .query(
          `SELECT ce.* FROM calendar_events ce
           JOIN event_attendees ea ON ea.event_id = ce.id
           WHERE ea.contact_id = ?
           ORDER BY ce.start_time DESC
           LIMIT 20`
        )
        .all(contactId) as CalendarEvent[];
      setEvents(evts);

      // Get recordings linked to events with this contact
      const recs = db
        .query(
          `SELECT DISTINCT r.* FROM recordings r
           JOIN event_attendees ea ON ea.event_id = r.event_id
           WHERE ea.contact_id = ? AND r.status = 'completed'
           ORDER BY r.started_at DESC
           LIMIT 10`
        )
        .all(contactId) as Recording[];
      setRecordings(recs);

      // Get deals linked to this contact
      const dls = db
        .query("SELECT * FROM deals WHERE contact_id = ? ORDER BY updated_at DESC")
        .all(contactId) as Deal[];
      setDeals(dls);
    }
  }, [contactId]);

  useKeyboard((key) => {
    if (inputFocused) return;
    if (key.name === "escape") {
      router.goBack();
    }
  });

  if (!contact) {
    return (
      <box>
        <text fg="#495670" content="Contact not found." />
      </box>
    );
  }

  return (
    <box width="100%">
      {/* Name / email header */}
      <box height={1}>
        <text fg="#64ffda" content={`  ${contact.name}`} />
      </box>
      <box paddingLeft={2}>
        {contact.email && <text fg="#8892b0" content={contact.email} />}
        {contact.company && <text fg="#8892b0" content={contact.company} />}
        {contact.phone && <text fg="#8892b0" content={contact.phone} />}
      </box>

      {/* Events */}
      <box
        border={true}
        borderStyle="rounded"
        borderColor="#0f3460"
        paddingLeft={1}
        paddingRight={1}
        width="100%"
      >
        <box height={1}>
          <text fg="#64ffda" content={`Calendar Events (${events.length}):`} />
        </box>
        {events.length === 0 ? (
          <box>
            <text fg="#495670" content="  No events." />
          </box>
        ) : (
          events.slice(0, 5).map((evt: any) => (
            <box key={evt.id} height={1}>
              <text fg="#ccd6f6" content={`  ${formatDateTime(evt.start_time)}  ${evt.title}`} />
            </box>
          ))
        )}
      </box>

      {/* Recordings */}
      {recordings.length > 0 && (
        <box
          border={true}
          borderStyle="rounded"
          borderColor="#0f3460"
          paddingLeft={1}
          paddingRight={1}
          width="100%"
        >
          <box height={1}>
            <text fg="#64ffda" content={`Recordings (${recordings.length}):`} />
          </box>
          {recordings.map((rec) => (
            <box key={rec.id} height={1}>
              <text
                fg="#ccd6f6"
                content={`  ${formatDateTime(rec.started_at)}  ${rec.duration_secs ? formatDuration(rec.duration_secs) : "?"}`}
              />
            </box>
          ))}
        </box>
      )}

      {/* Deals */}
      {deals.length > 0 && (
        <box
          border={true}
          borderStyle="rounded"
          borderColor="#0f3460"
          paddingLeft={1}
          paddingRight={1}
          width="100%"
        >
          <box height={1}>
            <text fg="#64ffda" content={`Deals (${deals.length}):`} />
          </box>
          {deals.map((deal) => (
            <box key={deal.id} height={1}>
              <text
                fg="#ccd6f6"
                content={`  ${deal.title}${deal.value ? ` - $${deal.value.toLocaleString()}` : ""}`}
              />
            </box>
          ))}
        </box>
      )}

      <box height={1} paddingTop={1}>
        <text fg="#8892b0" content="  [Esc] Back" />
      </box>
    </box>
  );
}
