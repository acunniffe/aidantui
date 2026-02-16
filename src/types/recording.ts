export interface Recording {
  id: number;
  event_id: string | null;
  file_path: string;
  format: string;
  duration_secs: number | null;
  file_size: number | null;
  started_at: string;
  ended_at: string | null;
  status: "recording" | "completed" | "failed";
  created_at: string;
}

export interface RecordingNote {
  id: number;
  recording_id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface RecordingStatus {
  recording: boolean;
  recordingId: number;
  eventId: string | null;
  duration: number;
  filePath: string;
}
