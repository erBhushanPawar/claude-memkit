#!/usr/bin/env node
// Reads first user message from stdin (Claude Code passes hook payload as JSON),
// runs smart injection, and writes the system-reminder block to stdout.
import { inject, formatInjection } from '../injector/smart-injector';

interface HookPayload {
  session_id?: string;
  messages?: Array<{ role: string; content: string }>;
  first_message?: string;
}

async function main() {
  let payload: HookPayload = {};

  try {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk as Buffer);
    }
    const raw = Buffer.concat(chunks).toString('utf-8').trim();
    if (raw) payload = JSON.parse(raw) as HookPayload;
  } catch {
    // No stdin payload — nothing to inject
    process.exit(0);
  }

  // Extract the first user message as the query signal
  const firstMessage =
    payload.first_message ??
    payload.messages?.find((m) => m.role === 'user')?.content ??
    '';

  if (!firstMessage) {
    process.exit(0);
  }

  try {
    const result = await inject(firstMessage);
    const formatted = formatInjection(result);
    if (formatted) {
      process.stdout.write(
        JSON.stringify({ continue: true, suppressOutput: false, context: formatted }) + '\n',
      );
    } else {
      process.stdout.write(JSON.stringify({ continue: true, suppressOutput: true }) + '\n');
    }
  } catch {
    // Injection failure must never block the session
    process.stdout.write(JSON.stringify({ continue: true, suppressOutput: true }) + '\n');
  }
}

main();
