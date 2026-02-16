import React from "react";
import type { Router } from "../hooks/useRouter";
import type { RecordingStatus } from "../types";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { StatusBar } from "./StatusBar";

interface LayoutProps {
  router: Router;
  recordingStatus: RecordingStatus | null;
  syncStatus?: string;
  children: React.ReactNode;
}

export function Layout({
  router,
  recordingStatus,
  syncStatus,
  children,
}: LayoutProps) {
  return (
    <box width="100%" height="100%">
      {/* Header */}
      <Header screen={router.current} recordingStatus={recordingStatus} />

      {/* Main area: sidebar + content */}
      <box flexGrow={1} width="100%">
        <Sidebar current={router.current} />
        <box
          flexGrow={1}
          paddingTop={1}
          paddingLeft={1}
          paddingRight={1}
        >
          {children}
        </box>
      </box>

      {/* Status bar */}
      <StatusBar syncStatus={syncStatus} />
    </box>
  );
}
