import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { getConfigDir } from '../config';

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  const dir = getConfigDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  _db = new Database(path.join(dir, 'sidecar.db'));
  _db.pragma('journal_mode = WAL');
  migrate(_db);
  return _db;
}

function migrate(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS observation_scores (
      obs_id      TEXT PRIMARY KEY,
      score       REAL NOT NULL,
      scored_at   INTEGER NOT NULL,
      source      TEXT DEFAULT 'manual'
    );

    CREATE TABLE IF NOT EXISTS session_budget (
      session_id  TEXT PRIMARY KEY,
      started_at  INTEGER NOT NULL,
      budget      INTEGER NOT NULL,
      used        INTEGER DEFAULT 0,
      naive_total INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS archived_observations (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      summary     TEXT NOT NULL,
      obs_count   INTEGER NOT NULL,
      archived_at INTEGER NOT NULL,
      project_id  TEXT
    );
  `);
}

export function upsertScore(obsId: string, score: number, source = 'manual'): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO observation_scores (obs_id, score, scored_at, source)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(obs_id) DO UPDATE SET score = excluded.score, scored_at = excluded.scored_at
  `).run(obsId, score, Date.now(), source);
}

export function getScore(obsId: string): number | null {
  const db = getDb();
  const row = db.prepare('SELECT score FROM observation_scores WHERE obs_id = ?').get(obsId) as
    | { score: number }
    | undefined;
  return row ? row.score : null;
}

export function getStaleObservations(threshold: number): { obs_id: string; score: number }[] {
  const db = getDb();
  return db
    .prepare('SELECT obs_id, score FROM observation_scores WHERE score < ?')
    .all(threshold) as { obs_id: string; score: number }[];
}

export interface SessionBudget {
  session_id: string;
  started_at: number;
  budget: number;
  used: number;
  naive_total: number;
}

export function initSession(sessionId: string, budget: number): void {
  const db = getDb();
  db.prepare(`
    INSERT OR IGNORE INTO session_budget (session_id, started_at, budget, used, naive_total)
    VALUES (?, ?, ?, 0, 0)
  `).run(sessionId, Date.now(), budget);
}

export function recordUsage(sessionId: string, tokensUsed: number, naiveTotal: number): void {
  const db = getDb();
  db.prepare(`
    UPDATE session_budget
    SET used = used + ?, naive_total = naive_total + ?
    WHERE session_id = ?
  `).run(tokensUsed, naiveTotal, sessionId);
}

export function getSessionBudget(sessionId: string): SessionBudget | null {
  const db = getDb();
  return (
    (db
      .prepare('SELECT * FROM session_budget WHERE session_id = ?')
      .get(sessionId) as SessionBudget) || null
  );
}

export function archiveObservations(
  summary: string,
  obsCount: number,
  projectId?: string,
): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO archived_observations (summary, obs_count, archived_at, project_id)
    VALUES (?, ?, ?, ?)
  `).run(summary, obsCount, Date.now(), projectId ?? null);
}
