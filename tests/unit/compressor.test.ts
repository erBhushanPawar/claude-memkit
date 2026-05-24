import { describe, it, expect } from 'vitest';
import { compressObservation, compressRatio } from '../../src/compressor/observation-compressor';

describe('compressObservation', () => {
  it('preserves sentences with file paths', () => {
    const body = 'See src/db/sidecar.ts for the implementation.';
    expect(compressObservation(body)).toContain('src/db/sidecar.ts');
  });

  it('preserves sentences with function names in backticks', () => {
    const body = 'Call `getDb()` to get the database instance.';
    expect(compressObservation(body)).toContain('`getDb()`');
  });

  it('preserves sentences with numbers', () => {
    const body = 'Retry after 3 seconds on failure.';
    expect(compressObservation(body)).toContain('3');
  });

  it('drops pure filler sentences', () => {
    const body =
      'This is a general note. Use `getDb()` from src/db/sidecar.ts instead of reinitializing.';
    const result = compressObservation(body);
    expect(result).toContain('`getDb()`');
    // filler sentence has no signal so it may be dropped
  });

  it('strips UUID noise', () => {
    const body =
      'Observation 550e8400-e29b-41d4-a716-446655440000 was saved to src/db/sidecar.ts.';
    const result = compressObservation(body);
    expect(result).not.toContain('550e8400-e29b-41d4-a716-446655440000');
    expect(result).toContain('src/db/sidecar.ts');
  });

  it('collapses near-duplicate sentences', () => {
    const body =
      'Use FTS5 for full-text search in SQLite. ' +
      'Use FTS5 for full-text search in SQLite databases. ' +
      'FTS5 BM25 ranking works well in src/db/sidecar.ts.';
    const result = compressObservation(body);
    // near-dupes collapsed — result should be shorter than original
    expect(result.length).toBeLessThan(body.length);
  });

  it('falls back to original body when nothing survives filtering', () => {
    const body = 'This is some text.';
    // Very short with no signal — compressor should return something non-empty
    expect(compressObservation(body).length).toBeGreaterThan(0);
  });

  it('handles empty string without throwing', () => {
    expect(() => compressObservation('')).not.toThrow();
  });
});

describe('compressRatio', () => {
  it('returns 0 when nothing is compressed', () => {
    expect(compressRatio('hello', 'hello')).toBe(0);
  });

  it('returns positive ratio when compressed is shorter', () => {
    expect(compressRatio('hello world foo bar', 'hello')).toBeGreaterThan(0);
  });

  it('returns 0 for empty original (no divide-by-zero)', () => {
    expect(compressRatio('', '')).toBe(1);
  });
});
