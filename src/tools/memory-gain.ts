import { getBudgetStatus } from '../injector/budget';

export function memoryGain(): string {
  const status = getBudgetStatus();

  if (status.naiveTotal === 0) {
    return '[MemKit] No injection data for this session yet.';
  }

  const saved = status.naiveTotal - status.used;
  const pct = status.savingsPct;

  return [
    'Session memory injection:',
    `  Naive (all observations): ${status.naiveTotal.toLocaleString()} tokens`,
    `  Injected (filtered):      ${status.used.toLocaleString()} tokens`,
    `  Savings:                  ${pct}% — ${saved.toLocaleString()} tokens saved`,
    `  Budget remaining:         ${status.remaining.toLocaleString()} / ${status.total.toLocaleString()} tokens`,
  ].join('\n');
}
