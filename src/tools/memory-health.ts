import fs from 'fs';
import path from 'path';
import { observationCount, getStaleByScore } from '../db/sidecar';
import { getBudgetStatus } from '../injector/budget';
import { loadConfig, getConfigDir } from '../config';

function dbSizeBytes(): number {
  const dbPath = path.join(getConfigDir(), 'sidecar.db');
  try {
    return fs.statSync(dbPath).size;
  } catch {
    return 0;
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function memoryHealth(): string {
  const config = loadConfig();
  const budget = getBudgetStatus();
  const sizeBytes = dbSizeBytes();
  const sizeMb = sizeBytes / (1024 * 1024);
  const obsCount = observationCount();
  const stale = getStaleByScore(config.scorer.stale_threshold, Date.now());
  const staleCount = stale.length;

  const dbStatus =
    sizeMb > config.health.warn_db_size_mb
      ? `${formatBytes(sizeBytes)} ⚠ (>${config.health.warn_db_size_mb}MB)`
      : formatBytes(sizeBytes);

  const staleStatus =
    staleCount > config.health.warn_stale_count
      ? `${staleCount} observations (score < ${config.scorer.stale_threshold}) — run memkit_prune`
      : `${staleCount} observations`;

  const budgetLine = `${budget.used.toLocaleString()}/${budget.total.toLocaleString()} tokens used this session`;

  return [
    '[MemKit] Health',
    `  Database:   ${dbStatus} / ${obsCount} scored observations`,
    `  Stale:      ${staleStatus}`,
    `  Budget:     ${budgetLine}`,
    `  Config:     ${path.join(getConfigDir(), 'config.toml')}`,
  ].join('\n');
}
