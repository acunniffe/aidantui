import { existsSync, readFileSync } from "fs";
import { parse } from "smol-toml";
import { getConfigPath } from "../utils/paths";

export interface Config {
  google: {
    client_id: string;
    client_secret: string;
    refresh_token: string;
  };
  gmail: {
    query: string;
    domains: string[];
  };
  slack: {
    token: string;
    channels: string[];
  };
  recording: {
    format: string;
    sample_rate: number;
    device: string;
  };
  general: {
    data_dir: string;
    sync_on_startup: boolean;
    calendar_range_days: number;
  };
}

const defaults: Config = {
  google: { client_id: "", client_secret: "", refresh_token: "" },
  gmail: { query: "newer_than:7d", domains: [] },
  slack: { token: "", channels: [] },
  recording: { format: "wav", sample_rate: 44100, device: "default" },
  general: {
    data_dir: "~/.aidantui",
    sync_on_startup: true,
    calendar_range_days: 30,
  },
};

let _config: Config | null = null;

export function loadConfig(): Config {
  if (_config) return _config;

  const configPath = getConfigPath();

  if (!existsSync(configPath)) {
    _config = defaults;
    return _config;
  }

  const text = readFileSync(configPath, "utf-8");
  const parsed = parse(text) as any;

  _config = {
    google: { ...defaults.google, ...parsed.google },
    gmail: { ...defaults.gmail, ...parsed.gmail },
    slack: { ...defaults.slack, ...parsed.slack },
    recording: { ...defaults.recording, ...parsed.recording },
    general: { ...defaults.general, ...parsed.general },
  };

  return _config;
}

export function hasGoogleAuth(config: Config): boolean {
  return !!(
    config.google.client_id &&
    config.google.client_secret &&
    config.google.refresh_token
  );
}

export function hasSlackAuth(config: Config): boolean {
  return !!config.slack.token;
}
