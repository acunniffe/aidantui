#!/usr/bin/env bun
/**
 * One-time OAuth2 setup for Google Calendar + Gmail.
 *
 * Run: bun run setup-auth
 *
 * Prerequisites:
 * 1. Create a Google Cloud project at https://console.cloud.google.com
 * 2. Enable Google Calendar API and Gmail API
 * 3. Create OAuth2 credentials (Desktop App type)
 * 4. Create ~/.aidantui/config.toml with client_id and client_secret
 */

import { google } from "googleapis";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { parse, stringify } from "smol-toml";
import { getConfigPath, getDataDir } from "../src/utils/paths";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/gmail.readonly",
];

async function main() {
  const configPath = getConfigPath();

  if (!existsSync(configPath)) {
    console.log(`\nNo config file found at ${configPath}`);
    console.log("Creating a default config...\n");

    // Ensure data dir exists
    getDataDir();

    const examplePath = resolve(import.meta.dir, "../config.example.toml");
    writeFileSync(configPath, readFileSync(examplePath, "utf-8"));
    console.log(`Created ${configPath}`);
    console.log("Please edit it with your Google OAuth2 client_id and client_secret, then run this script again.\n");
    process.exit(1);
  }

  const config = parse(readFileSync(configPath, "utf-8")) as any;

  if (!config.google?.client_id || !config.google?.client_secret) {
    console.log("\nMissing google.client_id or google.client_secret in config.toml");
    console.log("Please add them and run this script again.\n");
    process.exit(1);
  }

  const oauth2 = new google.auth.OAuth2(
    config.google.client_id,
    config.google.client_secret,
    "http://localhost:3000/callback"
  );

  const authUrl = oauth2.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  console.log("\n=== Google OAuth2 Setup ===\n");
  console.log("1. Open this URL in your browser:\n");
  console.log(`   ${authUrl}\n`);
  console.log("2. Authorize the application");
  console.log("3. You'll be redirected to localhost:3000/callback");
  console.log("   Copy the 'code' parameter from the URL\n");

  const code = prompt("Paste the authorization code here: ");

  if (!code) {
    console.log("No code provided. Exiting.");
    process.exit(1);
  }

  try {
    const { tokens } = await oauth2.getToken(code.trim());
    console.log("\nTokens obtained successfully!");

    if (!tokens.refresh_token) {
      console.log("WARNING: No refresh_token received. You may need to revoke access and try again.");
      console.log("Visit: https://myaccount.google.com/permissions");
      process.exit(1);
    }

    // Update config with refresh token
    config.google.refresh_token = tokens.refresh_token;
    writeFileSync(configPath, stringify(config));

    console.log(`\nrefresh_token saved to ${configPath}`);
    console.log("You're all set! Run 'bun dev' to start AidanTUI.\n");
  } catch (err) {
    console.error("Failed to exchange code for tokens:", err);
    process.exit(1);
  }
}

main().catch(console.error);
