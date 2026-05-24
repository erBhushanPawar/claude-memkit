import { loadConfig } from '../config';

const FILE_PATH_RE = /[\w.-]+\/[\w./-]+|~\/[\w./-]+/;
const FUNCTION_NAME_RE = /\b[a-z][a-zA-Z0-9]{2,}\(|`[a-zA-Z_][a-zA-Z0-9_]+`/;
const NUMBER_RE = /\b\d+(\.\d+)?\b/;
const ERROR_CODE_RE = /\b[A-Z][A-Z0-9_]{2,}\b|error\s+\d+|E\d{3,}/i;
const URL_RE = /https?:\/\/\S+/;

const ACTIONABILITY_PATTERNS = [
  /\buse\s+\w/i,
  /\bavoid\s+\w/i,
  /\bpattern\s+is\b/i,
  /\bdon'?t\b/i,
  /\balways\b/i,
  /\bnever\b/i,
  /\bprefer\b/i,
  /\bshould\b/i,
];

export function scoreSpecificity(text: string): number {
  let score = 0;
  if (FILE_PATH_RE.test(text)) score += 0.1;
  if (FUNCTION_NAME_RE.test(text)) score += 0.1;
  if (NUMBER_RE.test(text)) score += 0.1;
  if (ERROR_CODE_RE.test(text)) score += 0.1;
  if (URL_RE.test(text)) score += 0.1;
  return Math.min(score, 0.5);
}

export function scoreActionability(text: string): number {
  let score = 0;
  for (const pattern of ACTIONABILITY_PATTERNS) {
    if (pattern.test(text)) score += 0.2;
  }
  return Math.min(score, 0.6);
}

export function recencyDecay(createdAt: Date): number {
  const config = loadConfig();
  const daysOld = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  return Math.exp(-config.scorer.decay_lambda * daysOld);
}

export interface ScoredObservation {
  id: string;
  title: string;
  body: string;
  relevance: number;
  quality: number;
  finalScore: number;
}

export function scoreObservation(
  id: string,
  title: string,
  body: string,
  createdAt: Date,
  relevanceScore = 0.5,
): ScoredObservation {
  const text = `${title} ${body}`;
  const specificity = scoreSpecificity(text);
  const actionability = scoreActionability(text);
  const decay = recencyDecay(createdAt);
  const quality = (specificity + actionability) * decay;
  const finalScore = relevanceScore * decay * (0.5 + quality);

  return { id, title, body, relevance: relevanceScore, quality, finalScore };
}
