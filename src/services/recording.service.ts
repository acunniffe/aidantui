import { Database } from "bun:sqlite";
import { existsSync } from "fs";
import { getRecordingsDir } from "../utils/paths";
import type { RecordingStatus, Recording } from "../types";

interface RecordingSession {
  process: ReturnType<typeof Bun.spawn>;
  recordingId: number;
  eventId: string | null;
  startedAt: Date;
  filePath: string;
}

let activeSession: RecordingSession | null = null;

function getAudioInputArgs(): string[] {
  const platform = process.platform;

  if (platform === "darwin") {
    // macOS: use AVFoundation - ":0" captures default audio input
    return ["-f", "avfoundation", "-i", ":0"];
  }

  // Linux: use PulseAudio (works with PipeWire too)
  return ["-f", "pulse", "-i", "default"];
}

export function startRecording(
  db: Database,
  eventId?: string
): RecordingStatus {
  if (activeSession) {
    return getRecordingStatus()!;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `recording-${timestamp}.wav`;
  const filePath = `${getRecordingsDir()}/${filename}`;

  // Insert recording row
  const result = db.run(
    `INSERT INTO recordings (event_id, file_path, format, started_at, status)
     VALUES (?, ?, 'wav', ?, 'recording')`,
    [eventId ?? null, filePath, new Date().toISOString()]
  );
  const recordingId = Number(result.lastInsertRowid);

  // Spawn FFmpeg
  const audioArgs = getAudioInputArgs();
  const proc = Bun.spawn(
    [
      "ffmpeg",
      ...audioArgs,
      "-ac",
      "1", // mono
      "-ar",
      "44100", // 44.1kHz
      "-y", // overwrite
      filePath,
    ],
    {
      stdout: "ignore",
      stderr: "pipe",
    }
  );

  activeSession = {
    process: proc,
    recordingId,
    eventId: eventId ?? null,
    startedAt: new Date(),
    filePath,
  };

  return {
    recording: true,
    recordingId,
    eventId: eventId ?? null,
    duration: 0,
    filePath,
  };
}

export function stopRecording(db: Database): void {
  if (!activeSession) return;

  // Send SIGINT to FFmpeg for graceful stop (writes headers)
  activeSession.process.kill("SIGINT");

  const duration =
    (Date.now() - activeSession.startedAt.getTime()) / 1000;

  // Check if file was created
  let fileSize = 0;
  try {
    if (existsSync(activeSession.filePath)) {
      fileSize = Bun.file(activeSession.filePath).size;
    }
  } catch {
    // ignore
  }

  db.run(
    `UPDATE recordings
     SET status = 'completed', ended_at = ?, duration_secs = ?, file_size = ?
     WHERE id = ?`,
    [new Date().toISOString(), duration, fileSize, activeSession.recordingId]
  );

  activeSession = null;
}

export function getRecordingStatus(): RecordingStatus | null {
  if (!activeSession) return null;
  return {
    recording: true,
    recordingId: activeSession.recordingId,
    eventId: activeSession.eventId,
    duration:
      (Date.now() - activeSession.startedAt.getTime()) / 1000,
    filePath: activeSession.filePath,
  };
}

export function isRecording(): boolean {
  return activeSession !== null;
}

export function saveNotes(
  db: Database,
  recordingId: number,
  content: string
): void {
  // Upsert: one notes row per recording
  const existing = db
    .query("SELECT id FROM recording_notes WHERE recording_id = ?")
    .get(recordingId) as { id: number } | null;

  if (existing) {
    db.run(
      "UPDATE recording_notes SET content = ?, updated_at = datetime('now') WHERE id = ?",
      [content, existing.id]
    );
  } else {
    db.run(
      "INSERT INTO recording_notes (recording_id, content) VALUES (?, ?)",
      [recordingId, content]
    );
  }
}

export function getNotes(
  db: Database,
  recordingId: number
): string {
  const row = db
    .query("SELECT content FROM recording_notes WHERE recording_id = ?")
    .get(recordingId) as { content: string } | null;
  return row?.content ?? "";
}

export function getRecordingsByEvent(
  db: Database,
  eventId: string
): Recording[] {
  return db
    .query(
      "SELECT * FROM recordings WHERE event_id = ? ORDER BY started_at DESC"
    )
    .all(eventId) as Recording[];
}

export function getAllRecordings(
  db: Database,
  limit = 50
): Recording[] {
  return db
    .query("SELECT * FROM recordings ORDER BY started_at DESC LIMIT ?")
    .all(limit) as Recording[];
}
