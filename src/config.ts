import fs from 'fs';
import os from 'os';
import path from 'path';
import TOML from '@iarna/toml';

const CONFIG_DIR = path.join(os.homedir(), '.config', 'memkit');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.toml');

const DEFAULT_CONFIG = `
[injector]
budget_tokens = 2000
max_observations = 10
min_relevance_score = 0.4

[scorer]
decay_lambda = 0.03
stale_threshold = 0.2

[prune]
auto_prune_days = 30
archive_older_than_days = 60

[health]
warn_stale_count = 10
warn_db_size_mb = 50
`.trim();

export interface MemKitConfig {
  injector: {
    budget_tokens: number;
    max_observations: number;
    min_relevance_score: number;
  };
  scorer: {
    decay_lambda: number;
    stale_threshold: number;
  };
  prune: {
    auto_prune_days: number;
    archive_older_than_days: number;
  };
  health: {
    warn_stale_count: number;
    warn_db_size_mb: number;
  };
}

let _config: MemKitConfig | null = null;

export function loadConfig(): MemKitConfig {
  if (_config) return _config;

  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  if (!fs.existsSync(CONFIG_PATH)) {
    fs.writeFileSync(CONFIG_PATH, DEFAULT_CONFIG, 'utf-8');
  }

  const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
  _config = TOML.parse(raw) as unknown as MemKitConfig;
  return _config;
}

export function reloadConfig(): MemKitConfig {
  _config = null;
  return loadConfig();
}

export function getConfigDir(): string {
  return CONFIG_DIR;
}
