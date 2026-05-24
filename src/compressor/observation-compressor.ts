// Sentence-level rule-based compressor — no LLM calls, deterministic
const SENTENCE_RE = /[^.!?]+[.!?]+/g;
const INTRA_WORD_DOT = /(\w)\.(\w)/g; // dots inside file.ext, e.g. sidecar.ts

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

function normalize(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(Boolean);
}

function similarity(a: string, b: string): number {
  const wordsA = new Set(normalize(a));
  const wordsB = new Set(normalize(b));
  const intersection = [...wordsA].filter((w) => wordsB.has(w)).length;
  const union = new Set([...wordsA, ...wordsB]).size;
  return union === 0 ? 0 : intersection / union;
}

export function compressObservation(body: string): string {
  // Protect intra-word dots (file.ext, path/file.ts) so SENTENCE_RE doesn't split them
  const PLACEHOLDER = '\x00';
  const protected_ = body.replace(INTRA_WORD_DOT, `$1${PLACEHOLDER}$2`);
  const rawSentences = (protected_.match(SENTENCE_RE) ?? [protected_]).map((s) =>
    s.replace(new RegExp(PLACEHOLDER, 'g'), '.'),
  );

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
