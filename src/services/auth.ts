import { google } from "googleapis";
import type { Config } from "../config";

export function getGoogleAuth(config: Config) {
  const oauth2 = new google.auth.OAuth2(
    config.google.client_id,
    config.google.client_secret,
    "http://localhost:3000/callback"
  );
  oauth2.setCredentials({ refresh_token: config.google.refresh_token });
  return oauth2;
}

export function getCalendarClient(config: Config) {
  const auth = getGoogleAuth(config);
  return google.calendar({ version: "v3", auth });
}

export function getGmailClient(config: Config) {
  const auth = getGoogleAuth(config);
  return google.gmail({ version: "v1", auth });
}
