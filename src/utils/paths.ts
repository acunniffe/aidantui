import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

export function getDataDir(): string {
  const dir = join(homedir(), ".aidantui");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

export function getDbPath(): string {
  return join(getDataDir(), "data.db");
}

export function getConfigPath(): string {
  return join(getDataDir(), "config.toml");
}

export function getRecordingsDir(): string {
  const dir = join(getDataDir(), "recordings");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

export function getTriggersDir(): string {
  return join(process.cwd(), "triggers");
}
