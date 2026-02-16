import React from "react";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({
  message = "Syncing data...",
}: LoadingScreenProps) {
  return (
    <box width="100%" height="100%" paddingTop={3} paddingLeft={3}>
      <text content="AidanTUI" fg="#64ffda" />
      <box height={1} />
      <text content={`  ${message}`} fg="#64ffda" />
    </box>
  );
}
