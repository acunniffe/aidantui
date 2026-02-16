import React, { useState, useEffect, useRef, useCallback } from "react";
import { useKeyboard } from "@opentui/react";
import type { TextareaRenderable } from "@opentui/core";
import type { Router } from "../hooks/useRouter";
import type { CalendarEvent, RecordingStatus } from "../types";
import { getEventById } from "../services/calendar.service";
import {
  startRecording,
  stopRecording,
  getRecordingStatus,
  isRecording,
  saveNotes,
} from "../services/recording.service";
import { getDb } from "../db/connection";
import { formatTime, formatDuration } from "../utils/format";

interface RecordingScreenProps {
  router: Router;
  eventId?: string;
  onRecordingChange: (status: RecordingStatus | null) => void;
}

export function RecordingScreen({
  router,
  eventId,
  onRecordingChange,
}: RecordingScreenProps) {
  const db = getDb();
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [recStatus, setRecStatus] = useState<RecordingStatus | null>(null);
  const [notesFocused, setNotesFocused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const textareaRef = useRef<TextareaRenderable>(null);

  // Load event if we have an eventId
  useEffect(() => {
    if (eventId) {
      const ev = getEventById(db, eventId);
      setEvent(ev);
    }
  }, [eventId]);

  // Check if already recording
  useEffect(() => {
    const status = getRecordingStatus();
    if (status) {
      setRecStatus(status);
      onRecordingChange(status);
    }
  }, []);

  // Update elapsed time every second while recording
  useEffect(() => {
    if (!recStatus) return;

    const interval = setInterval(() => {
      const status = getRecordingStatus();
      if (status) {
        setElapsed(status.duration);
        onRecordingChange(status);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [recStatus]);

  const toggleRecording = useCallback(() => {
    if (isRecording()) {
      stopRecording(db);
      setRecStatus(null);
      setElapsed(0);
      onRecordingChange(null);
    } else {
      const status = startRecording(db, eventId);
      setRecStatus(status);
      onRecordingChange(status);
    }
  }, [eventId]);

  const handleNotesSubmit = useCallback(
    () => {
      if (recStatus && textareaRef.current) {
        saveNotes(db, recStatus.recordingId, textareaRef.current.plainText);
      }
    },
    [recStatus]
  );

  useKeyboard((key) => {
    if (notesFocused) {
      // When notes are focused, only handle escape and ctrl+s
      if (key.name === "escape") {
        setNotesFocused(false);
      }
      return;
    }

    switch (key.name) {
      case "r":
        toggleRecording();
        break;
      case "n":
        setNotesFocused(true);
        break;
      case "escape":
        if (isRecording()) {
          // Don't leave while recording without stopping
          return;
        }
        router.goBack();
        break;
    }
  });

  const statusText = recStatus
    ? `● RECORDING  ${formatDuration(elapsed)}`
    : "○ Not recording";

  const statusColor = recStatus ? "#ff4444" : "#495670";

  return (
    <box width="100%">
      {/* Event context */}
      {event && (
        <box
          width="100%"
          border={true}
          borderStyle="rounded"
          borderColor="#0f3460"
          paddingLeft={1}
          paddingRight={1}
        >
          <text content={`${event.title}`} />
          <text
            content={`${formatTime(event.start_time)} - ${formatTime(event.end_time)}`}
          />
          {event.attendees.length > 0 && (
            <text
              content={`Attendees: ${event.attendees.map((a) => a.name ?? a.email).join(", ")}`}
            />
          )}
          {event.meeting_url && (
            <text content={`Link: ${event.meeting_url}`} />
          )}
        </box>
      )}

      {/* Recording status */}
      <box height={2} paddingTop={1} paddingLeft={1}>
        <text fg={statusColor} content={statusText} />
      </box>

      {/* Controls help */}
      <box height={1} paddingLeft={1}>
        <text
          fg="#8892b0"
          content={
            recStatus
              ? "[r] Stop recording  [n] Focus notes  [Esc] (stop first)"
              : "[r] Start recording  [n] Focus notes  [Esc] Back"
          }
        />
      </box>

      {/* Notes area */}
      <box
        flexGrow={1}
        width="100%"
        border={true}
        borderStyle="rounded"
        borderColor={notesFocused ? "#64ffda" : "#1a1a2e"}
        paddingLeft={1}
        paddingRight={1}
      >
        <box height={1}>
          <text fg="#8892b0" content="Notes:" />
        </box>
        <textarea
          ref={textareaRef}
          placeholder="Type your notes here... (press n to focus, Esc to unfocus)"
          focused={notesFocused}
          textColor="#ccd6f6"
          focusedTextColor="#e0e0e0"
          backgroundColor="#0a0a0a"
          focusedBackgroundColor="#111122"
          onSubmit={handleNotesSubmit}
        />
      </box>
    </box>
  );
}
