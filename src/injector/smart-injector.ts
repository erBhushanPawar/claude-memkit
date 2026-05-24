import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { loadConfig } from '../config';
import { scoreObservation, ScoredObservation } from '../scorer/quality-scorer';
import { compressObservation } from '../compressor/observation-compressor';
import { canFit, spend } from './budget';
import { upsertScore } from '../db/sidecar';

interface RawObservation {
  id: string;
  title: string;
  body: string;
  created_at: string;
  relevance_score?: number;
}

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

async function queryClaudeMem(query: string, limit: number): Promise<RawObservation[]> {
  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['claude-mem', 'mcp'],
  });

  const client = new Client({ name: 'memkit', version: '0.1.0' }, { capabilities: {} });

  try {
    await client.connect(transport);
    const result = await client.callTool({
      name: 'observation_context',
      arguments: { query, limit },
    });

    const content = result.content as Array<{ type: string; text?: string }>;
    const text = content.find((c) => c.type === 'text')?.text ?? '[]';
    return JSON.parse(text) as RawObservation[];
  } finally {
    await client.close();
  }
}

export async function inject(query: string, budgetOverride?: number): Promise<InjectionResult> {
  const config = loadConfig();
  const budget = budgetOverride ?? config.injector.budget_tokens;
  const maxObs = config.injector.max_observations;
  const minScore = config.injector.min_relevance_score;

  let raw: RawObservation[] = [];
  try {
    raw = await queryClaudeMem(query, maxObs * 3);
  } catch {
    // claude-mem unavailable — return empty rather than crash
    return { injected: [], totalConsidered: 0, tokensUsed: 0, naiveTokens: 0 };
  }

  // Score all candidates
  const scored = raw
    .map((obs) =>
      scoreObservation(
        obs.id,
        obs.title,
        obs.body,
        new Date(obs.created_at),
        obs.relevance_score ?? 0.5,
      ),
    )
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

    upsertScore(obs.id, obs.finalScore);
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
