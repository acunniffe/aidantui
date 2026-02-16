import React, { useState, useEffect, useCallback } from "react";
import { useKeyboard } from "@opentui/react";
import type { Database } from "bun:sqlite";
import type { Config } from "./config";
import type { RecordingStatus } from "./types";
import { useRouter } from "./hooks/useRouter";
import { Layout } from "./components/Layout";
import { LoadingScreen } from "./components/LoadingScreen";
import { CalendarScreen } from "./screens/CalendarScreen";
import { RecordingScreen } from "./screens/RecordingScreen";
import { PipelineScreen } from "./screens/PipelineScreen";
import { DealDetailScreen } from "./screens/DealDetailScreen";
import { ContactsScreen } from "./screens/ContactsScreen";
import { ContactDetailScreen } from "./screens/ContactDetailScreen";
import { runStartupSync, type SyncResult } from "./sync";
import { getRecordingStatus } from "./services/recording.service";

interface AppProps {
  db: Database;
  config: Config;
}

export function App({ db, config }: AppProps) {
  const router = useRouter({ name: "calendar" });
  const [syncing, setSyncing] = useState(true);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus | null>(null);
  const [inputFocused, setInputFocused] = useState(false);

  // Run startup sync
  useEffect(() => {
    if (config.general.sync_on_startup) {
      runStartupSync(db, config)
        .then((result) => {
          setSyncResult(result);
          setSyncing(false);
        })
        .catch((err) => {
          console.error("Sync error:", err);
          setSyncing(false);
        });
    } else {
      setSyncing(false);
    }
  }, []);

  // Check for active recording on mount
  useEffect(() => {
    const status = getRecordingStatus();
    if (status) setRecordingStatus(status);
  }, []);

  const handleRecordingChange = useCallback(
    (status: RecordingStatus | null) => {
      setRecordingStatus(status);
    },
    []
  );

  // Global keyboard shortcuts
  useKeyboard((key) => {
    if (inputFocused) return;

    switch (key.name) {
      case "c":
        if (router.current.name !== "calendar") {
          router.navigate({ name: "calendar" });
        }
        break;
      case "p":
        if (router.current.name !== "pipeline") {
          router.navigate({ name: "pipeline" });
        }
        break;
      case "o":
        if (router.current.name !== "contacts") {
          router.navigate({ name: "contacts" });
        }
        break;
      case "escape":
        if (router.canGoBack) {
          router.goBack();
        }
        break;
      case "q":
        process.exit(0);
        break;
    }
  });

  if (syncing) {
    return <LoadingScreen message="Syncing calendar, email, and Slack..." />;
  }

  const syncStatus = syncResult
    ? `Synced in ${(syncResult.duration / 1000).toFixed(1)}s`
    : undefined;

  return (
    <Layout
      router={router}
      recordingStatus={recordingStatus}
      syncStatus={syncStatus}
    >
      {router.current.name === "calendar" && (
        <CalendarScreen router={router} inputFocused={inputFocused} />
      )}
      {router.current.name === "recording" && (
        <RecordingScreen
          router={router}
          eventId={router.current.name === "recording" ? router.current.eventId : undefined}
          onRecordingChange={handleRecordingChange}
        />
      )}
      {router.current.name === "pipeline" && (
        <PipelineScreen router={router} inputFocused={inputFocused} />
      )}
      {router.current.name === "deal-detail" && (
        <DealDetailScreen
          router={router}
          dealId={router.current.name === "deal-detail" ? router.current.dealId : 0}
          inputFocused={inputFocused}
        />
      )}
      {router.current.name === "contacts" && (
        <ContactsScreen router={router} inputFocused={inputFocused} />
      )}
      {router.current.name === "contact-detail" && (
        <ContactDetailScreen
          router={router}
          contactId={router.current.name === "contact-detail" ? router.current.contactId : 0}
          inputFocused={inputFocused}
        />
      )}
    </Layout>
  );
}
