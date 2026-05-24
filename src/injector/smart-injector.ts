import { loadConfig } from '../config';
import { scoreObservation, ScoredObservation } from '../scorer/quality-scorer';
import { compressObservation } from '../compressor/observation-compressor';
import { canFit, spend } from './budget';
import { searchObservations, getAllObservations, Observation } from '../db/sidecar';

export interface InjectionResult {
  injected: ScoredObservation[];
  totalConsidered: number;
  tokensUsed: number;
  naiveTokens: number;
}

// Rough token estimate: 1 token ≈ 4 chars
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function queryObservations(query: string, limit: number): Observation[] {
  try {
    // Try FTS search first; fall back to recency if query is empty or too short
    const q = query.trim();
    if (q.length < 3) return getAllObservations(limit);
    // Sanitize query for FTS5 — wrap in quotes to avoid syntax errors on special chars
    const safe = q.replace(/"/g, '""');
    const results = searchObservations(`"${safe}"`, limit);
    return results.length > 0 ? results : getAllObservations(limit);
  } catch {
    return getAllObservations(limit);
  }
}

export async function inject(query: string, budgetOverride?: number): Promise<InjectionResult> {
  const config = loadConfig();
  const budget = budgetOverride ?? config.injector.budget_tokens;
  const maxObs = config.injector.max_observations;
  const minScore = config.injector.min_relevance_score;

  const raw = queryObservations(query, maxObs * 3);

  // Score all candidates — relevance_score approximated by FTS rank position
  const scored = raw
    .map((obs, i) => {
      const relevance = Math.max(0.1, 1 - i * (1 / (raw.length || 1)));
      return scoreObservation(
        obs.id,
        obs.title,
        obs.body,
        new Date(obs.created_at),
        relevance,
      );
    })
    .filter((s) => s.finalScore >= minScore)
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, maxObs);

  // Naive token count (unfiltered, uncompressed)
  const naiveTokens = raw.reduce((sum, obs) => sum + estimateTokens(`${obs.title} ${obs.body}`), 0);

  // Greedy-fill budget with compressed observations
  const injected: ScoredObservation[] = [];
  let tokensUsed = 0;

  for (const obs of scored) {
    const compressed = compressObservation(obs.body);
    const tokens = estimateTokens(`${obs.title} ${compressed}`);

    if (tokensUsed + tokens > budget) continue;
    if (!canFit(tokens)) break;

    injected.push({ ...obs, body: compressed });
    tokensUsed += tokens;
  }

  spend(tokensUsed, naiveTokens);

  return { injected, totalConsidered: raw.length, tokensUsed, naiveTokens };
}

export function formatInjection(result: InjectionResult): string {
  if (result.injected.length === 0) return '';

  const lines = ['[MemKit] Relevant context from past sessions:\n'];
  for (const obs of result.injected) {
    lines.push(`• ${obs.title}`);
    if (obs.body.trim()) lines.push(`  ${obs.body}`);
  }
  lines.push(
    `\n[MemKit] ${result.injected.length}/${result.totalConsidered} observations injected (${result.tokensUsed} tokens)`,
  );
  return lines.join('\n');
}
