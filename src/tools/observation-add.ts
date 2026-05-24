import crypto from 'crypto';
import { scoreObservation } from '../scorer/quality-scorer';
import { addObservation, searchObservations } from '../db/sidecar';

function titleSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/));
  const wordsB = new Set(b.toLowerCase().split(/\s+/));
  const intersection = [...wordsA].filter((w) => wordsB.has(w)).length;
  const union = new Set([...wordsA, ...wordsB]).size;
  return union === 0 ? 0 : intersection / union;
}

function findNearDuplicate(title: string): string | null {
  try {
    const safe = title.replace(/"/g, '""');
    const candidates = searchObservations(`"${safe}"`, 10);
    for (const c of candidates) {
      if (titleSimilarity(title, c.title) > 0.85) return c.id;
    }
  } catch {
    // FTS error — skip dedup check
  }
  return null;
}

export function observationAdd(
  title: string,
  body: string,
  projectId: string,
  source = 'manual',
): string {
  const scored = scoreObservation('pending', title, body, new Date());

  const dupId = findNearDuplicate(title);
  if (dupId) {
    return `[MemKit] Near-duplicate detected (similarity > 0.85) with observation "${dupId}". Skipped. Score would have been: ${scored.finalScore.toFixed(3)}`;
  }

  const id = crypto.randomUUID();
  addObservation(id, title, body, projectId, source, scored.finalScore);

  return `[MemKit] Observation saved: ${id}\n  Score: ${scored.finalScore.toFixed(3)}  Source: ${source}  Project: ${projectId}`;
}
