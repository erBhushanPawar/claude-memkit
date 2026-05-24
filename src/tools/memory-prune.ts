import { getStaleByScore, archiveObservations, deleteObservation } from '../db/sidecar';
import { loadConfig } from '../config';

export function memoryPrune(days?: number): string {
  const config = loadConfig();
  const cutoffDays = days ?? config.prune.auto_prune_days;
  const threshold = config.scorer.stale_threshold;
  const cutoffMs = Date.now() - cutoffDays * 24 * 60 * 60 * 1000;

  const stale = getStaleByScore(threshold, cutoffMs);

  if (stale.length === 0) {
    return `[MemKit] No observations to prune (score < ${threshold}, older than ${cutoffDays} days).`;
  }

  // Dense summary: collect unique titles
  const titles = [...new Set(stale.map((o) => o.title.trim()))];
  const preview = titles.slice(0, 3).join('; ') + (titles.length > 3 ? ` (and ${titles.length - 3} more)` : '');
  archiveObservations(`Pruned ${stale.length} low-score observations: ${preview}`, stale.length);

  for (const obs of stale) {
    deleteObservation(obs.id);
  }

  return [
    `[MemKit] Pruned ${stale.length} stale observations`,
    `  Score threshold: < ${threshold}`,
    `  Older than:      ${cutoffDays} days`,
    `  Archived to:     sidecar.db → archived_observations`,
  ].join('\n');
}
