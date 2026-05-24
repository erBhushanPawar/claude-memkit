// Sentence-level rule-based compressor — no LLM calls, deterministic
const SENTENCE_RE = /[^.!?]+[.!?]+/g;

// Patterns that indicate a sentence carries signal
const SIGNAL_RE =
  /[\w.-]+\/[\w./-]+|`[^`]+`|\b[A-Z][A-Z0-9_]{2,}\b|\d+(\.\d+)?|https?:\/\/\S+|[A-Z][a-z]+[A-Z]\w*|\b(use|avoid|don'?t|always|never|prefer|pattern|error|warning|fix|bug|issue)\b/i;

const NOISE_PREFIXES = [/^\s*(note|info|log|debug|trace|warn|error):\s*/i, /^\d{4}-\d{2}-\d{2}/];

// UUIDs and raw hex IDs
const NOISE_INLINE_RE = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;

function cleanSentence(s: string): string {
  let out = s.trim();
  for (const p of NOISE_PREFIXES) {
    out = out.replace(p, '');
  }
  out = out.replace(NOISE_INLINE_RE, '<id>');
  return out.trim();
}

function hasSignal(sentence: string): boolean {
  return SIGNAL_RE.test(sentence);
}

function similarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/));
  const wordsB = new Set(b.toLowerCase().split(/\s+/));
  const intersection = [...wordsA].filter((w) => wordsB.has(w)).length;
  const union = new Set([...wordsA, ...wordsB]).size;
  return union === 0 ? 0 : intersection / union;
}

export function compressObservation(body: string): string {
  const rawSentences = body.match(SENTENCE_RE) ?? [body];

  const kept: string[] = [];
  for (const raw of rawSentences) {
    const s = cleanSentence(raw);
    if (!s || !hasSignal(s)) continue;

    // Deduplicate near-identical sentences
    const isDupe = kept.some((k) => similarity(k, s) > 0.7);
    if (!isDupe) {
      kept.push(s);
    }
  }

  return kept.join(' ').trim() || body.trim();
}

export function compressRatio(original: string, compressed: string): number {
  if (original.length === 0) return 1;
  return 1 - compressed.length / original.length;
}
