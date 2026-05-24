import { getDb, getStaleObservations, archiveObservations } from '../db/sidecar';
import { loadConfig } from '../config';

function summarizeGroup(titles: string[]): string {
  const unique = [...new Set(titles.map((t) => t.trim()))];
  if (unique.length === 1) return unique[0];
  return `${unique.slice(0, 3).join('; ')}${unique.length > 3 ? ` (and ${unique.length - 3} more)` : ''}`;
}

export function memoryPrune(days?: number): string {
  const config = loadConfig();
  const cutoffDays = days ?? config.prune.auto_prune_days;
  const threshold = config.scorer.stale_threshold;

  const db = getDb();
  const cutoffMs = Date.now() - cutoffDays * 24 * 60 * 60 * 1000;

  // Find stale obs older than cutoff
  const stale = db
    .prepare(
      `SELECT obs_id, score FROM observation_scores
       WHERE score < ? AND scored_at < ?`,
    )
    .all(threshold, cutoffMs) as { obs_id: string; score: number }[];

  if (stale.length === 0) {
    return `[MemKit] No observations to prune (threshold: ${threshold}, older than ${cutoffDays} days).`;
  }

  // For the summary, use obs_ids as titles (real titles would require claude-mem lookup)
  const summary = summarizeGroup(stale.map((s) => s.obs_id));
  archiveObservations(`Pruned ${stale.length} low-score observations: ${summary}`, stale.length);

  // Remove from scores table
  const ids = stale.map((s) => s.obs_id);
  const placeholders = ids.map(() => '?').join(',');
  db.prepare(`DELETE FROM observation_scores WHERE obs_id IN (${placeholders})`).run(...ids);

  return [
    `[MemKit] Pruned ${stale.length} stale observations`,
    `  Score threshold: < ${threshold}`,
    `  Older than:      ${cutoffDays} days`,
    `  Archived to:     sidecar.db → archived_observations`,
  ].join('\n');
}
