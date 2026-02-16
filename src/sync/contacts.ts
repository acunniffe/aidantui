import { Database } from "bun:sqlite";

export function reconcileContacts(db: Database): number {
  // Find all attendee emails that don't have a contact yet
  const orphanedAttendees = db
    .query(
      `SELECT DISTINCT ea.email, ea.name
       FROM event_attendees ea
       LEFT JOIN contacts c ON c.email = ea.email
       WHERE ea.email != '' AND c.id IS NULL`
    )
    .all() as { email: string; name: string | null }[];

  if (orphanedAttendees.length === 0) return 0;

  const insertContact = db.prepare(`
    INSERT INTO contacts (email, name, created_at, updated_at)
    VALUES (?, ?, datetime('now'), datetime('now'))
  `);

  const insertSource = db.prepare(`
    INSERT INTO contact_sources (contact_id, source, source_id)
    VALUES (?, 'calendar', ?)
  `);

  const linkAttendee = db.prepare(`
    UPDATE event_attendees SET contact_id = ? WHERE email = ? AND contact_id IS NULL
  `);

  let created = 0;

  db.run("BEGIN");
  try {
    for (const att of orphanedAttendees) {
      const result = insertContact.run(att.email, att.name ?? att.email);
      const contactId = Number(result.lastInsertRowid);

      insertSource.run(contactId, att.email);
      linkAttendee.run(contactId, att.email);
      created++;
    }
    db.run("COMMIT");
  } catch (err) {
    db.run("ROLLBACK");
    throw err;
  }

  // Also link any existing contacts to attendee rows that have matching emails
  db.run(`
    UPDATE event_attendees
    SET contact_id = (SELECT id FROM contacts WHERE contacts.email = event_attendees.email)
    WHERE contact_id IS NULL AND email IN (SELECT email FROM contacts WHERE email IS NOT NULL)
  `);

  return created;
}
