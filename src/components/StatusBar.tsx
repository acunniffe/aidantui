import React from "react";

interface StatusBarProps {
  syncStatus?: string;
}

export function StatusBar({ syncStatus }: StatusBarProps) {
  const shortcuts = " [c]Cal  [p]Pipe  [o]People  [Esc]Back  [q]Quit";
  const status = syncStatus ? `  │  ${syncStatus}` : "";

  return (
    <box width="100%" height={1} backgroundColor="#16213e">
      <text content={shortcuts + status} fg="#8892b0" />
    </box>
  );
}
