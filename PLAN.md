# MemKit — Implementation Plan

Intelligent memory middleware for Claude Code. Wraps claude-mem with relevance-filtered injection, token-aware compression, and cross-plugin context orchestration.

---

## Problem Statement

claude-mem injects all recent observations into every session regardless of relevance (~4k tokens). There is no token budget, no quality filtering, no compression, and auth failures are silent. MemKit fixes the injection layer — it does not replace claude-mem's storage.

---

## Architecture

```
Claude Code
    │
    ▼
[MemKit MCP Server]          ← this plugin
    │  - SessionStart hook intercepts first message
    │  - Queries claude-mem semantically
    │  - Scores, compresses, budget-gates
    │  - Injects only what's relevant
    │
    ▼
claude-mem MCP               ← unchanged, still owns storage
    │
    ▼
~/.claude-mem/claude-mem.db  ← unchanged
    +
~/.config/memkit/sidecar.db  ← new: scores, budgets, analytics
```

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Runtime | TypeScript (Node.js) | Matches claude-mem stack, easiest MCP composition |
| MCP SDK | `@modelcontextprotocol/sdk` | Official TypeScript MCP SDK |
| Database | `better-sqlite3` | Sidecar SQLite, zero deps, sync API |
| Token counting | `@anthropic-ai/tokenizer` | Accurate Claude token counts |
| Config | TOML via `@iarna/toml` | Human-friendly config file |
| Compression | Rule-based (no ML) | Zero cost, deterministic, fast |

---

## Directory Structure

```
memkit/
├── PLAN.md
├── package.json
├── tsconfig.json
├── plugin.json                    # Claude Code plugin manifest
├── .gitignore
├── .prettierrc
├── src/
│   ├── index.ts                   # MCP server entry point, tool registration
│   ├── config.ts                  # Config loader (~/.config/memkit/config.toml)
│   ├── db/
│   │   └── sidecar.ts             # Sidecar SQLite: scores, budget, analytics
│   ├── injector/
│   │   ├── smart-injector.ts      # Feature 1: relevance-gated session injection
│   │   └── budget.ts              # Feature 4: per-session token budget tracking
│   ├── compressor/
│   │   └── observation-compressor.ts  # Feature 2: rule-based body compression
│   ├── scorer/
│   │   └── quality-scorer.ts      # Feature 3: specificity + actionability + decay
│   └── tools/
│       ├── memory-gain.ts         # Feature 5: token savings analytics
│       ├── memory-health.ts       # Feature 6: health dashboard
│       ├── memory-prune.ts        # Feature 7: decay + archive old observations
│       ├── mid-session-inject.ts  # Feature 10: mid-conversation context refresh
│       └── observation-add.ts     # Feature 9: enhanced add with scoring + dedup
```

---

## Features

### v1 — Injection + Visibility (ship first)

#### Feature 1: Smart Context Injector
- **File:** `src/injector/smart-injector.ts`
- **Trigger:** `SessionStart` hook captures first user message
- **Logic:**
  1. Call `claude-mem observation_context(query=firstMessage, limit=20)`
  2. Score each result: `relevance_score × recency_decay`
  3. `recency_decay = e^(-0.03 × days_old)` (~23 day half-life)
  4. Greedy-fill token budget (default 2000 tokens)
  5. Return compressed subset as injection string
- **Config:**
  ```toml
  [injector]
  budget_tokens = 2000
  max_observations = 10
  min_relevance_score = 0.4
  ```

#### Feature 4: Token Budget Manager
- **File:** `src/injector/budget.ts`
- **Tracks:** tokens injected at session start + mid-session calls
- **Exposes:** `getBudgetStatus()` → `{ used, remaining, total }`
- **Storage:** in-memory per session (no persistence needed)

#### Feature 5: `memory_gain` Tool
- **File:** `src/tools/memory-gain.ts`
- **MCP tool name:** `memkit_gain`
- **Output:**
  ```
  Session memory injection:
    Naive (all observations): 4,283 tokens
    Injected (filtered):      1,847 tokens
    Savings:                  57% — 2,436 tokens saved
    Observations:             6 of 15 (ranked by relevance + recency)
  ```

#### Feature 6: `memory_health` Tool
- **File:** `src/tools/memory-health.ts`
- **MCP tool name:** `memkit_health`
- **Checks:** OAuth validity, db size, observation count, stale count, budget usage
- **Output:**
  ```
  [MemKit] Health
    Auth:     ✓ valid (expires in 4 days)
    Database: 14.2MB / 847 observations
    Stale:    23 observations (score < 0.2) → run memkit_prune
    Budget:   847/2000 tokens used this session
  ```

#### Feature 10: Mid-Session Inject Tool
- **File:** `src/tools/mid-session-inject.ts`
- **MCP tool name:** `memkit_inject`
- **Args:** `{ context: string, budget_override?: number }`
- **Logic:** Same as Feature 1 but draws from remaining session budget

---

### v2 — Quality + Efficiency

#### Feature 2: Observation Compressor
- **File:** `src/compressor/observation-compressor.ts`
- **Rules (applied in order):**
  1. Split body into sentences
  2. Drop sentences with no: nouns, numbers, file paths, proper nouns, code tokens
  3. Collapse near-identical sentences → keep one + `(×N)`
  4. Strip metadata noise (UUIDs, raw timestamps, log prefixes)
- **Target:** 50–60% reduction on body text, zero LLM calls

#### Feature 3: Quality Scorer
- **File:** `src/scorer/quality-scorer.ts`
- **Score formula:** `(specificity + actionability) × recency_decay`
- **Specificity signals** (+0.1 each): file path, function name, number, error code, URL
- **Actionability signals** (+0.2 each): "use X", "avoid Y", "pattern is", "don't", "always", "never"
- **Storage:** `sidecar.db → observation_scores(obs_id, score, scored_at)`

#### Feature 7: Decay + Auto-Prune
- **File:** `src/tools/memory-prune.ts`
- **MCP tool name:** `memkit_prune`
- **Args:** `{ days?: number }` (default 30)
- **Logic:**
  1. Find observations with `score < 0.2` older than N days
  2. Summarize group into single dense paragraph (rule-based, no LLM)
  3. Archive originals to `sidecar.db → archived_observations`
  4. Return count pruned + summary saved

#### Feature 9: Enhanced Observation Add
- **File:** `src/tools/observation-add.ts`
- **MCP tool name:** `memkit_add`
- **Wraps:** claude-mem `observation_add`
- **Extras:**
  - Score observation before saving
  - Check near-duplicate (title similarity > 0.85 → merge)
  - Tag with source (`manual`, `github`, `sentry`, etc.)
  - Return `{ id, score, merged_id? }`

---

### v3 — Orchestration + Global Memory

#### Feature 8: Cross-Plugin Context Orchestrator
- Allocates token budget across multiple plugin outputs (GitHub, Sentry, Linear)
- Scores each plugin's output by relevance to current task
- Proportional allocation: most relevant gets more tokens

#### Feature 11: Cross-Project Memory Layer
- Global observation store for user-level patterns (not project facts)
- Stores preferences, reusable patterns, tool preferences
- Separate `projectId=__global__` namespace in claude-mem

---

## Sidecar Database Schema

```sql
-- observation quality scores
CREATE TABLE observation_scores (
  obs_id      TEXT PRIMARY KEY,
  score       REAL NOT NULL,
  scored_at   INTEGER NOT NULL,
  source      TEXT DEFAULT 'manual'
);

-- per-session budget tracking
CREATE TABLE session_budget (
  session_id  TEXT PRIMARY KEY,
  started_at  INTEGER NOT NULL,
  budget      INTEGER NOT NULL,
  used        INTEGER DEFAULT 0,
  naive_total INTEGER DEFAULT 0  -- what would have been injected without filtering
);

-- archived/pruned observations (summaries)
CREATE TABLE archived_observations (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  summary     TEXT NOT NULL,
  obs_count   INTEGER NOT NULL,
  archived_at INTEGER NOT NULL,
  project_id  TEXT
);
```

---

## Config File (~/.config/memkit/config.toml)

```toml
[injector]
budget_tokens = 2000
max_observations = 10
min_relevance_score = 0.4

[scorer]
decay_lambda = 0.03        # half-life ~23 days
stale_threshold = 0.2

[prune]
auto_prune_days = 30
archive_older_than_days = 60

[health]
warn_stale_count = 10
warn_db_size_mb = 50
```

---

## MCP Tool Registry

| Tool name | Feature | Args |
|---|---|---|
| `memkit_inject` | Smart injector (session start + mid) | `context, budget_override?` |
| `memkit_gain` | Token savings analytics | none |
| `memkit_health` | Health dashboard | none |
| `memkit_prune` | Decay + archive old observations | `days?` |
| `memkit_add` | Enhanced observation add | `title, body, project_id, source?` |

---

## Build Order

| Phase | Features | Deliverable |
|---|---|---|
| v1 | 1, 4, 5, 6, 10 | Injection + visibility — immediately useful |
| v2 | 2, 3, 7, 9 | Quality + efficiency — reduces accumulation |
| v3 | 8, 11 | Orchestration + global — full vision |

---

## Publishing Path

1. Local install: `/plugin marketplace add /Users/bhushan/work/memkit`
2. GitHub: push to `github.com/bhushan/memkit`
3. Community marketplace: submit at `platform.claude.com/plugins/submit`
4. Install globally: `/plugin install memkit@claude-community`
