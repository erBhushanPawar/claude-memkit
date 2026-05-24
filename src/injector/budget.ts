import { loadConfig } from '../config';
import { initSession, recordUsage, getSessionBudget } from '../db/sidecar';

// Simple incrementing session ID per process — good enough for single-instance MCP server
let _sessionId: string | null = null;

export function getSessionId(): string {
  if (!_sessionId) {
    _sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const config = loadConfig();
    initSession(_sessionId, config.injector.budget_tokens);
  }
  return _sessionId;
}

export function resetSession(): void {
  _sessionId = null;
}

export interface BudgetStatus {
  used: number;
  remaining: number;
  total: number;
  naiveTotal: number;
  savingsPct: number;
}

export function getBudgetStatus(): BudgetStatus {
  const id = getSessionId();
  const row = getSessionBudget(id);
  const config = loadConfig();
  const total = config.injector.budget_tokens;

  if (!row) {
    return { used: 0, remaining: total, total, naiveTotal: 0, savingsPct: 0 };
  }

  const savings =
    row.naive_total > 0 ? Math.round(((row.naive_total - row.used) / row.naive_total) * 100) : 0;

  return {
    used: row.used,
    remaining: total - row.used,
    total,
    naiveTotal: row.naive_total,
    savingsPct: savings,
  };
}

export function canFit(tokens: number): boolean {
  const status = getBudgetStatus();
  return tokens <= status.remaining;
}

export function spend(tokens: number, naiveTotal: number): void {
  const id = getSessionId();
  recordUsage(id, tokens, naiveTotal);
}
