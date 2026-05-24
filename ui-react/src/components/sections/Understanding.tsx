import type { Mode } from '../../types';

interface UnderstandingProps {
  mode: Mode;
}

export default function Understanding({ mode }: UnderstandingProps) {
  return (
    <div>
      <div className="sh">
        <div className="sh-left">
          <div className="sh-title">Understanding</div>
          <div className="sh-sub">Auto-derived summary · updated 2 min ago</div>
        </div>
        <button className="btn" style={{ fontSize: 12 }}>↻ Regenerate</button>
      </div>

      <div className="card">
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 10 }}>
          What this project does
        </div>
        <p className="summary-prose">
          <span className="hl">MemKit</span> is an MCP server plugin for Claude Code that replaces naive memory injection with a{' '}
          <span className="hl">relevance-gated, token-budgeted</span> context layer. It scores every past observation by specificity, actionability, and recency decay — then greedily injects only the highest-scoring ones that fit within the session token budget. Storage is a{' '}
          <span className="hl">self-contained SQLite + FTS5</span> sidecar database with no external dependencies.
        </p>
      </div>

      <div className="g2 mt16">
        <div className="concept">
          <div className="concept-title" style={{ color: 'var(--proj)' }}>Core mechanic</div>
          <div className="concept-body">finalScore = relevance × e^(-λ × days) × (0.5 + quality). Only scores ≥ 0.4 injected. Budget: 2000 tokens / session.</div>
        </div>
        <div className="concept">
          <div className="concept-title" style={{ color: 'var(--green)' }}>Self-contained</div>
          <div className="concept-body">No OAuth, no external API. Everything in ~/.config/memkit/sidecar.db. FTS5 gives BM25 ranking for free.</div>
        </div>
        <div className="concept">
          <div className="concept-title" style={{ color: 'var(--purple)' }}>Token budget</div>
          <div className="concept-body">Hard 2000-token cap per session. Mid-session top-up via memkit_inject. Savings tracked per session.</div>
        </div>
        <div className="concept">
          <div className="concept-title" style={{ color: 'var(--amber)' }}>23-day half-life</div>
          <div className="concept-body">λ=0.03 decay. Old observations fade without manual expiry. Stale ones pruned automatically.</div>
        </div>
      </div>

      {mode === 'detailed' && (
        <>
          <div className="divider" />
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Architecture</div>
          <div className="card card-sm" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)', lineHeight: 2.1, background: 'var(--bg-2)' }}>
            <div>Claude Code  ──▶  SessionStart hook  ──▶  smart-injector.ts</div>
            <div style={{ color: 'var(--text-3)' }}>{'                                      '}├─ quality-scorer.ts (specificity + actionability + decay)</div>
            <div style={{ color: 'var(--text-3)' }}>{'                                      '}├─ observation-compressor.ts (rule-based, 50-60% reduction)</div>
            <div style={{ color: 'var(--text-3)' }}>{'                                      '}└─ budget.ts (session token cap)</div>
            <div>MCP tools  ──▶  index.ts  ──▶  db/sidecar.ts  ──▶  <span style={{ color: 'var(--proj)' }}>~/.config/memkit/sidecar.db</span></div>
          </div>
          <div className="divider" />
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Evolution</div>
          <div className="feed">
            <div className="feed-item">
              <div className="feed-line">
                <div className="feed-dot" style={{ background: 'var(--proj)' }} />
                <div className="feed-tail" />
              </div>
              <div className="feed-body">
                <div className="feed-title">Became fully self-contained (removed claude-mem)</div>
                <div className="feed-meta">Today</div>
              </div>
            </div>
            <div className="feed-item">
              <div className="feed-line">
                <div className="feed-dot" style={{ background: 'var(--green)' }} />
                <div className="feed-tail" />
              </div>
              <div className="feed-body">
                <div className="feed-title">83/83 Vitest tests — 6 real bugs found</div>
                <div className="feed-meta">Today</div>
              </div>
            </div>
            <div className="feed-item">
              <div className="feed-line">
                <div className="feed-dot" style={{ background: 'var(--border-hi)' }} />
              </div>
              <div className="feed-body">
                <div className="feed-title">Initial scaffold — 5 MCP tools, SessionStart hook</div>
                <div className="feed-meta">Yesterday</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
