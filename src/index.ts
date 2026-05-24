#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { memoryGain } from './tools/memory-gain';
import { memoryHealth } from './tools/memory-health';
import { memoryPrune } from './tools/memory-prune';
import { midSessionInject } from './tools/mid-session-inject';
import { observationAdd } from './tools/observation-add';

const server = new Server(
  { name: 'memkit', version: '0.1.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'memkit_gain',
      description: 'Show token savings from memory injection this session',
      inputSchema: { type: 'object', properties: {}, required: [] },
    },
    {
      name: 'memkit_health',
      description: 'Show memory system health: DB size, stale observations, budget usage',
      inputSchema: { type: 'object', properties: {}, required: [] },
    },
    {
      name: 'memkit_prune',
      description: 'Archive stale low-score observations older than N days',
      inputSchema: {
        type: 'object',
        properties: {
          days: {
            type: 'number',
            description: 'Prune observations older than this many days (default: 30)',
          },
        },
        required: [],
      },
    },
    {
      name: 'memkit_inject',
      description:
        'Inject relevant memory context mid-session based on the current task description',
      inputSchema: {
        type: 'object',
        properties: {
          context: {
            type: 'string',
            description: 'Description of the current task to find relevant observations for',
          },
          budget_override: {
            type: 'number',
            description: 'Override token budget for this injection (uses remaining budget if omitted)',
          },
        },
        required: ['context'],
      },
    },
    {
      name: 'memkit_add',
      description:
        'Add an observation with quality scoring and near-duplicate detection',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Short title for the observation' },
          body: { type: 'string', description: 'Full observation body' },
          project_id: { type: 'string', description: 'Project identifier' },
          source: {
            type: 'string',
            description: 'Source of the observation (manual, github, sentry, etc.)',
          },
        },
        required: ['title', 'body', 'project_id'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const a = (args ?? {}) as Record<string, unknown>;

  try {
    let text: string;

    switch (name) {
      case 'memkit_gain':
        text = memoryGain();
        break;
      case 'memkit_health':
        text = memoryHealth();
        break;
      case 'memkit_prune':
        text = memoryPrune(a.days as number | undefined);
        break;
      case 'memkit_inject':
        text = await midSessionInject(
          a.context as string,
          a.budget_override as number | undefined,
        );
        break;
      case 'memkit_add':
        text = await observationAdd(
          a.title as string,
          a.body as string,
          a.project_id as string,
          (a.source as string) ?? 'manual',
        );
        break;
      default:
        text = `Unknown tool: ${name}`;
    }

    return { content: [{ type: 'text', text }] };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { content: [{ type: 'text', text: `[MemKit] Error: ${msg}` }], isError: true };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write(`[MemKit] Fatal: ${err}\n`);
  process.exit(1);
});
