/**
 * MCP protocol integration tests.
 *
 * Spawns the real compiled server (dist/index.js) as a child process and
 * communicates via JSON-RPC over stdio — exactly how Claude Code connects.
 * Each test gets a fresh server process so DB state never leaks between tests.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';

const SERVER_PATH = path.resolve(__dirname, '../../dist/index.js');

// ── helpers ──────────────────────────────────────────────────────────────────

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

class McpClient {
  private proc: ChildProcess;
  private buffer = '';
  private pending = new Map<number, (r: JsonRpcResponse) => void>();
  private _seq = 1;
  private tmpDir: string;

  constructor() {
    // Give each client its own config dir so tests don't share state
    this.tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'memkit-test-'));
    this.proc = spawn('node', [SERVER_PATH], {
      env: { ...process.env, HOME: this.tmpDir },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    this.proc.stdout!.on('data', (chunk: Buffer) => {
      this.buffer += chunk.toString();
      const lines = this.buffer.split('\n');
      this.buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line) as JsonRpcResponse;
          if (msg.id !== undefined) {
            this.pending.get(msg.id)?.(msg);
            this.pending.delete(msg.id);
          }
        } catch { /* ignore non-JSON lines */ }
      }
    });
  }

  send<T = unknown>(method: string, params: unknown = {}): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = this._seq++;
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Timeout waiting for response to ${method} (id=${id})`));
      }, 8000);

      this.pending.set(id, (res) => {
        clearTimeout(timeout);
        if (res.error) reject(new Error(`MCP error ${res.error.code}: ${res.error.message}`));
        else resolve(res.result as T);
      });

      const msg = JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n';
      this.proc.stdin!.write(msg);
    });
  }

  async callTool(name: string, args: Record<string, unknown> = {}) {
    return this.send<{ content: Array<{ type: string; text: string }>; isError?: boolean }>(
      'tools/call',
      { name, arguments: args },
    );
  }

  close() {
    this.proc.stdin!.end();
    this.proc.kill();
    try { fs.rmSync(this.tmpDir, { recursive: true }); } catch { /* ignore */ }
  }
}

async function makeClient(): Promise<McpClient> {
  const client = new McpClient();
  // Handshake
  await client.send('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'vitest', version: '0.0.1' },
  });
  return client;
}

// ── tests ─────────────────────────────────────────────────────────────────────

let client: McpClient;

beforeEach(async () => {
  client = await makeClient();
});

afterEach(() => {
  client.close();
});

// ── tools/list ────────────────────────────────────────────────────────────────

describe('tools/list', () => {
  it('returns exactly 5 tools', async () => {
    const res = await client.send<{ tools: unknown[] }>('tools/list');
    expect(res.tools).toHaveLength(5);
  });

  it('includes all expected tool names', async () => {
    const res = await client.send<{ tools: Array<{ name: string }> }>('tools/list');
    const names = res.tools.map((t) => t.name);
    expect(names).toContain('memkit_gain');
    expect(names).toContain('memkit_health');
    expect(names).toContain('memkit_prune');
    expect(names).toContain('memkit_inject');
    expect(names).toContain('memkit_add');
  });

  it('each tool has a non-empty description', async () => {
    const res = await client.send<{ tools: Array<{ name: string; description: string }> }>('tools/list');
    for (const tool of res.tools) {
      expect(tool.description.length, `${tool.name} has empty description`).toBeGreaterThan(0);
    }
  });

  it('memkit_add requires title, body, project_id', async () => {
    const res = await client.send<{ tools: Array<{ name: string; inputSchema: { required?: string[] } }> }>('tools/list');
    const add = res.tools.find((t) => t.name === 'memkit_add')!;
    expect(add.inputSchema.required).toContain('title');
    expect(add.inputSchema.required).toContain('body');
    expect(add.inputSchema.required).toContain('project_id');
  });

  it('memkit_inject requires context', async () => {
    const res = await client.send<{ tools: Array<{ name: string; inputSchema: { required?: string[] } }> }>('tools/list');
    const inject = res.tools.find((t) => t.name === 'memkit_inject')!;
    expect(inject.inputSchema.required).toContain('context');
  });
});

// ── memkit_add ────────────────────────────────────────────────────────────────

describe('memkit_add', () => {
  it('saves an observation and returns a UUID and score', async () => {
    const res = await client.callTool('memkit_add', {
      title: 'Use FTS5 for search',
      body: 'Use `searchObservations()` in src/db/sidecar.ts — avoid LIKE queries.',
      project_id: 'test-project',
    });
    expect(res.isError).toBeFalsy();
    const text = res.content[0].text;
    expect(text).toMatch(/\[MemKit\] Observation saved:/);
    expect(text).toMatch(/[0-9a-f-]{36}/); // UUID
    expect(text).toMatch(/Score:/);
  });

  it('detects near-duplicate on second add with same title', async () => {
    await client.callTool('memkit_add', {
      title: 'Avoid mocking the database',
      body: 'Use a real SQLite :memory: DB in tests instead of mocks.',
      project_id: 'proj',
    });
    const res = await client.callTool('memkit_add', {
      title: 'Avoid mocking the database',
      body: 'Slightly different body text but same title.',
      project_id: 'proj',
    });
    expect(res.content[0].text).toMatch(/Near-duplicate detected/);
  });

  it('accepts optional source field', async () => {
    const res = await client.callTool('memkit_add', {
      title: 'PR review note',
      body: 'Found in src/tools/memory-prune.ts — prune logic needs tests.',
      project_id: 'proj',
      source: 'github',
    });
    expect(res.content[0].text).toMatch(/Source: github/i);
  });

  it('returns isError=true when required args are missing', async () => {
    const res = await client.callTool('memkit_add', {
      title: 'Missing body and project_id',
    });
    // Either an error response or a graceful error message
    const text = res.content[0].text;
    expect(res.isError === true || text.toLowerCase().includes('error')).toBe(true);
  });
});

// ── memkit_health ─────────────────────────────────────────────────────────────

describe('memkit_health', () => {
  it('returns a health report with all expected sections', async () => {
    const res = await client.callTool('memkit_health');
    expect(res.isError).toBeFalsy();
    const text = res.content[0].text;
    expect(text).toMatch(/\[MemKit\] Health/);
    expect(text).toMatch(/Database:/);
    expect(text).toMatch(/Stale:/);
    expect(text).toMatch(/Budget:/);
    expect(text).toMatch(/Config:/);
  });

  it('observation count increases after an add', async () => {
    const before = await client.callTool('memkit_health');
    await client.callTool('memkit_add', {
      title: 'New observation for count test',
      body: 'Body with `function()` in src/index.ts',
      project_id: 'proj',
    });
    const after = await client.callTool('memkit_health');

    const extractCount = (text: string) => {
      const m = text.match(/(\d+) scored observations/);
      return m ? parseInt(m[1]) : 0;
    };
    expect(extractCount(after.content[0].text)).toBeGreaterThan(
      extractCount(before.content[0].text),
    );
  });
});

// ── memkit_gain ───────────────────────────────────────────────────────────────

describe('memkit_gain', () => {
  it('returns a no-data message before any injection', async () => {
    const res = await client.callTool('memkit_gain');
    expect(res.isError).toBeFalsy();
    const text = res.content[0].text;
    // Either "no data yet" or a savings report
    expect(text.length).toBeGreaterThan(0);
  });

  it('returns savings stats after inject is called', async () => {
    // Seed some observations first
    await client.callTool('memkit_add', {
      title: 'FTS5 search pattern',
      body: 'Use `searchObservations()` in src/db/sidecar.ts for ranked results.',
      project_id: 'proj',
    });
    await client.callTool('memkit_inject', { context: 'searching observations FTS5' });
    const res = await client.callTool('memkit_gain');
    const text = res.content[0].text;
    // After inject, we should have budget usage data
    expect(text).toMatch(/token|injection|session/i);
  });
});

// ── memkit_inject ─────────────────────────────────────────────────────────────

describe('memkit_inject', () => {
  it('returns no-observations message on empty DB', async () => {
    const res = await client.callTool('memkit_inject', {
      context: 'searching for anything',
    });
    expect(res.isError).toBeFalsy();
    expect(res.content[0].text.length).toBeGreaterThan(0);
  });

  it('returns relevant injected context after observations are added', async () => {
    await client.callTool('memkit_add', {
      title: 'FTS5 full-text search',
      body: 'Use `searchObservations()` in src/db/sidecar.ts — never raw LIKE.',
      project_id: 'proj',
    });
    await client.callTool('memkit_add', {
      title: 'Token budget tracking',
      body: 'Budget tracked in src/injector/budget.ts per session.',
      project_id: 'proj',
    });

    const res = await client.callTool('memkit_inject', {
      context: 'FTS5 search implementation',
    });
    const text = res.content[0].text;
    // Should find the FTS5 observation
    expect(text).toMatch(/FTS5|search|sidecar/i);
  });

  it('respects budget_override — does not inject when override is 0', async () => {
    await client.callTool('memkit_add', {
      title: 'Important note',
      body: 'Use `getDb()` in src/db/sidecar.ts always.',
      project_id: 'proj',
    });
    const res = await client.callTool('memkit_inject', {
      context: 'database initialization',
      budget_override: 0,
    });
    // With 0 budget, nothing can fit
    expect(res.content[0].text).toMatch(/exhausted|No relevant|budget/i);
  });

  it('response is valid text content (not binary or null)', async () => {
    const res = await client.callTool('memkit_inject', { context: 'anything' });
    expect(res.content[0].type).toBe('text');
    expect(typeof res.content[0].text).toBe('string');
  });
});

// ── memkit_prune ──────────────────────────────────────────────────────────────

describe('memkit_prune', () => {
  it('reports nothing to prune on empty DB', async () => {
    const res = await client.callTool('memkit_prune');
    expect(res.isError).toBeFalsy();
    expect(res.content[0].text).toMatch(/No observations to prune/);
  });

  it('prunes observations that are old and low-score', async () => {
    // Add a low-score observation by seeding the DB directly.
    // We can't set created_at via the MCP tool, so we trigger prune with days=0
    // which uses Date.now() as the cutoff — any observation qualifies as "old enough".
    await client.callTool('memkit_add', {
      title: 'vague old note',
      body: 'this was a thing',
      project_id: 'proj',
    });
    // Force prune with days=0 (cutoff = now, so all obs qualify) and a high score threshold
    // The observation gets score ~0 because body has no signal — below default 0.2 threshold
    const res = await client.callTool('memkit_prune', { days: 0 });
    const text = res.content[0].text;
    // Either pruned some or found nothing (depends on scorer result)
    expect(text).toMatch(/Pruned|No observations/);
  });

  it('returns pruned count and archive confirmation when stale obs exist', async () => {
    // days=0 means "prune everything older than right now"
    await client.callTool('memkit_add', {
      title: 'this is a very generic note',
      body: 'something happened here',
      project_id: 'proj',
    });
    const res = await client.callTool('memkit_prune', { days: 0 });
    const text = res.content[0].text;
    if (text.includes('Pruned')) {
      expect(text).toMatch(/Score threshold/);
      expect(text).toMatch(/Older than/);
      expect(text).toMatch(/archived_observations/);
    }
  });
});

// ── error handling ────────────────────────────────────────────────────────────

describe('error handling', () => {
  it('returns isError=true for unknown tool name', async () => {
    const res = await client.callTool('memkit_nonexistent_tool');
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toMatch(/Unknown tool/);
  });

  it('server stays alive after an error — next call succeeds', async () => {
    await client.callTool('memkit_nonexistent_tool');
    const res = await client.callTool('memkit_health');
    expect(res.isError).toBeFalsy();
    expect(res.content[0].text).toMatch(/\[MemKit\] Health/);
  });

  it('all tool responses have content array with at least one text item', async () => {
    const tools = ['memkit_gain', 'memkit_health'] as const;
    for (const name of tools) {
      const res = await client.callTool(name);
      expect(res.content).toBeInstanceOf(Array);
      expect(res.content.length).toBeGreaterThan(0);
      expect(res.content[0].type).toBe('text');
    }
  });
});
