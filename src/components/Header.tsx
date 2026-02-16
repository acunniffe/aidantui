import React from "react";
import type { Screen } from "../hooks/useRouter";
import type { RecordingStatus } from "../types";

interface HeaderProps {
  screen: Screen;
  recordingStatus: RecordingStatus | null;
}

function screenTitle(screen: Screen): string {
  switch (screen.name) {
    case "calendar":
      return "Calendar";
    case "recording":
      return "Recording";
    case "pipeline":
      return "Pipeline";
    case "deal-detail":
      return "Deal";
    case "contacts":
      return "Contacts";
    case "contact-detail":
      return "Contact";
    case "settings":
      return "Settings";
  }
}

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function Header({ screen, recordingStatus }: HeaderProps) {
  const title = screenTitle(screen);
  const recText = recordingStatus
    ? ` ● REC ${formatDuration(recordingStatus.duration)}`
    : "";

  return (
    <box width="100%" height={1} backgroundColor="#1a1a2e">
      <text content={` AidanTUI  │  ${title}${recText}`} fg="#e0e0e0" />
    </box>
  );
}
