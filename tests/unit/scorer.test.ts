import { describe, it, expect } from 'vitest';
import {
  scoreSpecificity,
  scoreActionability,
  recencyDecay,
  scoreObservation,
} from '../../src/scorer/quality-scorer';

describe('scoreSpecificity', () => {
  it('awards points for file paths', () => {
    expect(scoreSpecificity('see src/db/sidecar.ts for details')).toBeGreaterThan(0);
  });

  it('awards points for backtick function names', () => {
    expect(scoreSpecificity('call `getDb()` to initialize')).toBeGreaterThan(0);
  });

  it('awards points for numbers', () => {
    expect(scoreSpecificity('retry after 3 seconds')).toBeGreaterThan(0);
  });

  it('awards points for error codes', () => {
    expect(scoreSpecificity('throws ENOENT when file missing')).toBeGreaterThan(0);
  });

  it('awards points for URLs', () => {
    expect(scoreSpecificity('see https://example.com/docs')).toBeGreaterThan(0);
  });

  it('returns 0 for vague prose with no paths, numbers, or codes', () => {
    // No file paths, function names, numbers, UPPERCASE error codes, or URLs
    expect(scoreSpecificity('the weather was nice yesterday')).toBe(0);
  });

  it('caps at 0.5', () => {
    const s = scoreSpecificity(
      'src/a.ts `fn()` 42 ERRCODE https://x.com extra extra extra',
    );
    expect(s).toBeLessThanOrEqual(0.5);
  });
});

describe('scoreActionability', () => {
  it('scores "use X" pattern', () => {
    expect(scoreActionability('use FTS5 for full-text search')).toBeGreaterThan(0);
  });

  it('scores "avoid Y" pattern', () => {
    expect(scoreActionability('avoid mocking the database')).toBeGreaterThan(0);
  });

  it('scores "don\'t" pattern', () => {
    expect(scoreActionability("don't add unnecessary abstractions")).toBeGreaterThan(0);
  });

  it('scores "always" pattern', () => {
    expect(scoreActionability('always close the DB connection')).toBeGreaterThan(0);
  });

  it('scores "never" pattern', () => {
    expect(scoreActionability('never expose internal IDs')).toBeGreaterThan(0);
  });

  it('returns 0 for purely descriptive text', () => {
    expect(scoreActionability('the sky is blue')).toBe(0);
  });

  it('caps at 0.6', () => {
    const s = scoreActionability(
      'use avoid always never prefer should don\'t pattern is',
    );
    expect(s).toBeLessThanOrEqual(0.6);
  });
});

describe('recencyDecay', () => {
  it('returns ~1.0 for brand-new observations', () => {
    const decay = recencyDecay(new Date());
    expect(decay).toBeCloseTo(1.0, 2);
  });

  it('returns ~0.5 after ~23 days (half-life)', () => {
    const daysAgo = new Date(Date.now() - 23 * 24 * 60 * 60 * 1000);
    const decay = recencyDecay(daysAgo);
    expect(decay).toBeCloseTo(0.5, 1);
  });

  it('returns near 0 for very old observations', () => {
    const old = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    expect(recencyDecay(old)).toBeLessThan(0.01);
  });

  it('decays monotonically', () => {
    const d1 = recencyDecay(new Date(Date.now() - 1 * 86400000));
    const d7 = recencyDecay(new Date(Date.now() - 7 * 86400000));
    const d30 = recencyDecay(new Date(Date.now() - 30 * 86400000));
    expect(d1).toBeGreaterThan(d7);
    expect(d7).toBeGreaterThan(d30);
  });
});

describe('scoreObservation', () => {
  it('produces a finalScore between 0 and 1 for a fresh actionable observation', () => {
    const result = scoreObservation(
      'id1',
      'Use FTS5 for search',
      'Use `searchObservations()` in src/db/sidecar.ts — avoid raw LIKE queries.',
      new Date(),
      0.9,
    );
    expect(result.finalScore).toBeGreaterThan(0);
    expect(result.finalScore).toBeLessThanOrEqual(2); // quality boost can push above 1
    expect(result.relevance).toBe(0.9);
  });

  it('scores older observations lower than fresh ones with the same content', () => {
    const text = { title: 'Use FTS5', body: 'use `searchObservations()` in src/db/sidecar.ts' };
    const fresh = scoreObservation('a', text.title, text.body, new Date(), 0.8);
    const old = scoreObservation('b', text.title, text.body, new Date(Date.now() - 60 * 86400000), 0.8);
    expect(fresh.finalScore).toBeGreaterThan(old.finalScore);
  });

  it('scores high-signal observations higher than vague ones', () => {
    const high = scoreObservation('a', 'Use `getDb()` from src/db/sidecar.ts', 'avoid calling it twice', new Date(), 0.7);
    const low = scoreObservation('b', 'something about the code', 'it does a thing', new Date(), 0.7);
    expect(high.finalScore).toBeGreaterThan(low.finalScore);
  });
});
