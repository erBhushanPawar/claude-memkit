import { inject, formatInjection } from '../injector/smart-injector';
import { getBudgetStatus } from '../injector/budget';

export async function midSessionInject(
  context: string,
  budgetOverride?: number,
): Promise<string> {
  const status = getBudgetStatus();

  if (status.remaining <= 0) {
    return `[MemKit] Session budget exhausted (${status.used}/${status.total} tokens used). No additional context injected.`;
  }

  const effectiveBudget = budgetOverride !== undefined
    ? Math.min(budgetOverride, status.remaining)
    : status.remaining;

  const result = await inject(context, effectiveBudget);

  if (result.injected.length === 0) {
    return '[MemKit] No relevant observations found for this context.';
  }

  return formatInjection(result);
}
