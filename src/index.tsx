#!/usr/bin/env bun
import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import React from "react";
import { loadConfig } from "./config";
import { getDb, closeDb } from "./db/connection";
import { runMigrations } from "./db/migrations";
import { stopRecording, isRecording } from "./services/recording.service";
import { App } from "./app";

async function main() {
  // 1. Load configuration
  const config = loadConfig();

  // 2. Initialize database
  const db = getDb();
  runMigrations(db);

  // 3. Create renderer
  const renderer = await createCliRenderer();

  // 4. Create React root and render
  const root = createRoot(renderer);
  root.render(<App db={db} config={config} />);

  // 5. Handle graceful shutdown
  const cleanup = () => {
    if (isRecording()) {
      stopRecording(db);
    }
    root.unmount();
    closeDb();
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
