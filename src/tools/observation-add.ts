import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { scoreObservation } from '../scorer/quality-scorer';
import { upsertScore, getDb } from '../db/sidecar';

function titleSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/));
  const wordsB = new Set(b.toLowerCase().split(/\s+/));
  const intersection = [...wordsA].filter((w) => wordsB.has(w)).length;
  const union = new Set([...wordsA, ...wordsB]).size;
  return union === 0 ? 0 : intersection / union;
}

function findNearDuplicate(title: string): string | null {
  const db = getDb();
  // We only have obs_ids in sidecar — near-dup check is best-effort on cached titles
  // In a full implementation this would query claude-mem for recent titles
  const recent = db
    .prepare(
      'SELECT obs_id FROM observation_scores ORDER BY scored_at DESC LIMIT 50',
    )
    .all() as { obs_id: string }[];

  for (const row of recent) {
    if (titleSimilarity(title, row.obs_id) > 0.85) {
      return row.obs_id;
    }
  }
  return null;
}

export async function observationAdd(
  title: string,
  body: string,
  projectId: string,
  source = 'manual',
): Promise<string> {
  const scored = scoreObservation('pending', title, body, new Date());

  const dupId = findNearDuplicate(title);
  if (dupId) {
    return `[MemKit] Near-duplicate detected (similarity > 0.85) with observation ${dupId}. Skipped save. Score would have been: ${scored.finalScore.toFixed(3)}`;
  }

  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['claude-mem', 'mcp'],
  });
  const client = new Client({ name: 'memkit', version: '0.1.0' }, { capabilities: {} });

  let obsId: string;
  try {
    await client.connect(transport);
    const result = await client.callTool({
      name: 'observation_add',
      arguments: { title, body, project_id: projectId },
    });

    const content = result.content as Array<{ type: string; text?: string }>;
    const text = content.find((c) => c.type === 'text')?.text ?? '{}';
    const parsed = JSON.parse(text) as { id?: string };
    obsId = parsed.id ?? `unknown_${Date.now()}`;
  } finally {
    await client.close();
  }

  upsertScore(obsId, scored.finalScore, source);

  return `[MemKit] Observation saved: ${obsId} (score: ${scored.finalScore.toFixed(3)}, source: ${source})`;
}
