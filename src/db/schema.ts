export const SCHEMA_SQL = `
-- Sync state: tracks last sync per integration
CREATE TABLE IF NOT EXISTS sync_state (
  source      TEXT PRIMARY KEY,
  last_sync   TEXT NOT NULL,
  sync_token  TEXT,
  metadata    TEXT
);

-- Contacts: people discovered from any source
CREATE TABLE IF NOT EXISTS contacts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT,
  name          TEXT NOT NULL,
  company       TEXT,
  phone         TEXT,
  slack_user_id TEXT,
  avatar_url    TEXT,
  notes         TEXT,
  merged_into   INTEGER REFERENCES contacts(id),
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_slack ON contacts(slack_user_id) WHERE slack_user_id IS NOT NULL;

-- Contact sources: provenance tracking
CREATE TABLE IF NOT EXISTS contact_sources (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id  INTEGER NOT NULL REFERENCES contacts(id),
  source      TEXT NOT NULL,
  source_id   TEXT NOT NULL,
  first_seen  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_contact_sources_contact ON contact_sources(contact_id);

-- Calendar events
CREATE TABLE IF NOT EXISTS calendar_events (
  id              TEXT PRIMARY KEY,
  calendar_id     TEXT NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  start_time      TEXT NOT NULL,
  end_time        TEXT NOT NULL,
  location        TEXT,
  meeting_url     TEXT,
  status          TEXT NOT NULL DEFAULT 'confirmed',
  all_day         INTEGER NOT NULL DEFAULT 0,
  raw_json        TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_events_start ON calendar_events(start_time);

-- Event attendees
CREATE TABLE IF NOT EXISTS event_attendees (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id    TEXT NOT NULL REFERENCES calendar_events(id),
  contact_id  INTEGER REFERENCES contacts(id),
  email       TEXT NOT NULL,
  name        TEXT,
  rsvp_status TEXT,
  organizer   INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_attendees_event ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_attendees_contact ON event_attendees(contact_id) WHERE contact_id IS NOT NULL;

-- Recordings: audio file metadata
CREATE TABLE IF NOT EXISTS recordings (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id      TEXT REFERENCES calendar_events(id),
  file_path     TEXT NOT NULL,
  format        TEXT NOT NULL DEFAULT 'wav',
  duration_secs REAL,
  file_size     INTEGER,
  started_at    TEXT NOT NULL,
  ended_at      TEXT,
  status        TEXT NOT NULL DEFAULT 'recording',
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_recordings_event ON recordings(event_id) WHERE event_id IS NOT NULL;

-- Recording notes: notes taken during a recording
CREATE TABLE IF NOT EXISTS recording_notes (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  recording_id INTEGER NOT NULL REFERENCES recordings(id),
  content      TEXT NOT NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notes_recording ON recording_notes(recording_id);

-- Pipeline stages: defined by pipeline.md
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT NOT NULL UNIQUE,
  display_order   INTEGER NOT NULL,
  required_info   TEXT,
  enter_trigger   TEXT,
  leave_trigger   TEXT,
  color           TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Deals
CREATE TABLE IF NOT EXISTS deals (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  title         TEXT NOT NULL,
  stage_id      INTEGER NOT NULL REFERENCES pipeline_stages(id),
  contact_id    INTEGER REFERENCES contacts(id),
  value         REAL,
  currency      TEXT DEFAULT 'USD',
  description   TEXT,
  metadata      TEXT,
  closed_at     TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage_id);
CREATE INDEX IF NOT EXISTS idx_deals_contact ON deals(contact_id) WHERE contact_id IS NOT NULL;

-- Deal history: stage transition log
CREATE TABLE IF NOT EXISTS deal_history (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  deal_id       INTEGER NOT NULL REFERENCES deals(id),
  from_stage_id INTEGER REFERENCES pipeline_stages(id),
  to_stage_id   INTEGER NOT NULL REFERENCES pipeline_stages(id),
  triggered_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_deal_history_deal ON deal_history(deal_id);

-- Deal links: generic linking table
CREATE TABLE IF NOT EXISTS deal_links (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  deal_id     INTEGER NOT NULL REFERENCES deals(id),
  entity_type TEXT NOT NULL,
  entity_id   TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_deal_links_deal ON deal_links(deal_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_deal_links_unique ON deal_links(deal_id, entity_type, entity_id);
`;
