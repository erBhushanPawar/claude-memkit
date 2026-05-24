import { describe, it, expect, beforeEach } from 'vitest';
import {
  _resetDbForTesting,
  addObservation,
  searchObservations,
  getAllObservations,
  observationCount,
  deleteObservation,
  getStaleByScore,
  upsertScore,
  getScore,
  archiveObservations,
  getDb,
} from '../../src/db/sidecar';

beforeEach(() => {
  _resetDbForTesting();
});

describe('addObservation', () => {
  it('inserts a new observation', () => {
    addObservation('id1', 'Use FTS5', 'FTS5 is fast', 'proj1');
    expect(observationCount()).toBe(1);
  });

  it('upserts on duplicate id', () => {
    addObservation('id1', 'Title A', 'Body A', 'proj1');
    addObservation('id1', 'Title B', 'Body B updated', 'proj1');
    expect(observationCount()).toBe(1);
    const all = getAllObservations();
    expect(all[0].title).toBe('Title B');
  });

  it('stores source and score', () => {
    addObservation('id1', 'T', 'B', 'proj1', 'github', 0.75);
    const all = getAllObservations();
    expect(all[0].source).toBe('github');
    expect(all[0].score).toBe(0.75);
  });
});

describe('searchObservations', () => {
  beforeEach(() => {
    addObservation('id1', 'SQLite FTS5 search', 'Use FTS5 BM25 for ranking observations', 'p1');
    addObservation('id2', 'Token budget manager', 'Tracks tokens per session with SQLite', 'p1');
    addObservation('id3', 'Quality scorer', 'Scores specificity and actionability of text', 'p1');
  });

  it('returns relevant results for a query', () => {
    const results = searchObservations('FTS5');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe('id1');
  });

  it('returns empty array for no matches', () => {
    const results = searchObservations('xyznonexistent');
    expect(results).toHaveLength(0);
  });

  it('respects the limit parameter', () => {
    const results = searchObservations('SQLite', 1);
    expect(results.length).toBeLessThanOrEqual(1);
  });

  it('ranks most relevant result first', () => {
    const results = searchObservations('FTS5 BM25');
    expect(results[0].id).toBe('id1');
  });
});

describe('getAllObservations', () => {
  it('returns observations ordered by updated_at desc', () => {
    addObservation('id1', 'Old', 'body', 'p1');
    addObservation('id2', 'New', 'body', 'p1');
    const all = getAllObservations();
    expect(all[0].id).toBe('id2'); // most recent first
  });

  it('respects limit', () => {
    for (let i = 0; i < 10; i++) addObservation(`id${i}`, `T${i}`, 'body', 'p1');
    expect(getAllObservations(3)).toHaveLength(3);
  });
});

describe('deleteObservation', () => {
  it('removes the observation from the table', () => {
    addObservation('id1', 'T', 'B', 'p1');
    deleteObservation('id1');
    expect(observationCount()).toBe(0);
  });

  it('does not throw when id does not exist', () => {
    expect(() => deleteObservation('nonexistent')).not.toThrow();
  });

  it('FTS index is updated after deletion', () => {
    addObservation('id1', 'UniqueTitleXYZ', 'body text', 'p1');
    deleteObservation('id1');
    const results = searchObservations('UniqueTitleXYZ');
    expect(results).toHaveLength(0);
  });
});

describe('getStaleByScore', () => {
  it('returns observations with score below threshold and older than cutoff', () => {
    const past = Date.now() - 10000;
    addObservation('id1', 'T', 'B', 'p1', 'manual', 0.1); // low score
    addObservation('id2', 'T', 'B', 'p1', 'manual', 0.9); // high score
    const stale = getStaleByScore(0.2, Date.now() + 1000);
    const ids = stale.map((s) => s.id);
    expect(ids).toContain('id1');
    expect(ids).not.toContain('id2');
  });

  it('excludes observations newer than the cutoff', () => {
    addObservation('id1', 'T', 'B', 'p1', 'manual', 0.05);
    // cutoff in the past — observation was just added so it's newer
    const stale = getStaleByScore(0.2, Date.now() - 10000);
    expect(stale).toHaveLength(0);
  });
});

describe('upsertScore / getScore', () => {
  it('stores and retrieves a score', () => {
    upsertScore('obs1', 0.77);
    expect(getScore('obs1')).toBeCloseTo(0.77);
  });

  it('updates an existing score', () => {
    upsertScore('obs1', 0.5);
    upsertScore('obs1', 0.9);
    expect(getScore('obs1')).toBeCloseTo(0.9);
  });

  it('returns null for unknown id', () => {
    expect(getScore('unknown')).toBeNull();
  });
});

describe('archiveObservations', () => {
  it('inserts a row into archived_observations', () => {
    archiveObservations('Pruned 3 old notes about tokens', 3, 'proj1');
    const db = getDb();
    const row = db
      .prepare('SELECT * FROM archived_observations')
      .get() as { obs_count: number; project_id: string };
    expect(row.obs_count).toBe(3);
    expect(row.project_id).toBe('proj1');
  });
});
