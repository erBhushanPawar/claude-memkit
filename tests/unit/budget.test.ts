import { describe, it, expect, beforeEach } from 'vitest';
import { _resetDbForTesting } from '../../src/db/sidecar';

// Reset the budget session singleton between tests by reimporting with a fresh module
// We do this by resetting DB (which budget reads from) and the in-memory session var.
// Budget module caches _sessionId — we expose resetSession() for tests.
import { getBudgetStatus, canFit, spend, resetSession } from '../../src/injector/budget';

beforeEach(() => {
  _resetDbForTesting();
  resetSession();
});

describe('getBudgetStatus (fresh session)', () => {
  it('starts with 0 used and full remaining', () => {
    const s = getBudgetStatus();
    expect(s.used).toBe(0);
    expect(s.remaining).toBe(s.total);
    expect(s.naiveTotal).toBe(0);
  });

  it('total matches configured budget_tokens (default 2000)', () => {
    expect(getBudgetStatus().total).toBe(2000);
  });
});

describe('canFit', () => {
  it('returns true when budget is untouched', () => {
    expect(canFit(500)).toBe(true);
  });

  it('returns true for exactly the remaining budget', () => {
    expect(canFit(2000)).toBe(true);
  });

  it('returns false for one token over budget', () => {
    expect(canFit(2001)).toBe(false);
  });
});

describe('spend', () => {
  it('reduces remaining after spending', () => {
    spend(300, 1000);
    const s = getBudgetStatus();
    expect(s.used).toBe(300);
    expect(s.remaining).toBe(1700);
    expect(s.naiveTotal).toBe(1000);
  });

  it('accumulates across multiple spend calls', () => {
    spend(200, 500);
    spend(400, 800);
    const s = getBudgetStatus();
    expect(s.used).toBe(600);
    expect(s.naiveTotal).toBe(1300);
  });

  it('canFit returns false after budget is exhausted', () => {
    spend(2000, 2000);
    expect(canFit(1)).toBe(false);
  });

  it('calculates savings percentage correctly', () => {
    spend(400, 2000); // saved 1600 of 2000 = 80%
    expect(getBudgetStatus().savingsPct).toBe(80);
  });

  it('savingsPct is 0 when naiveTotal is 0', () => {
    expect(getBudgetStatus().savingsPct).toBe(0);
  });
});
