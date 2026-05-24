import type { Mode } from '../../types';

interface BusinessInsightsProps {
  mode: Mode;
}

export default function BusinessInsights({ mode }: BusinessInsightsProps) {
  return (
    <div>
      <div className="sh">
        <div className="sh-left">
          <div className="sh-title">Business Insights</div>
          <div className="sh-sub">What this product does, who it's for, and key rules</div>
        </div>
        <button className="btn" style={{ fontSize: 12 }}>↻ Re-derive</button>
      </div>

      <div className="g2">
        <div>
          <div className="card" style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>
              Product
            </div>
            <p className="summary-prose">
              Developer tool that makes AI coding assistants <span className="hl">smarter over time</span> without wasting tokens. Sits between Claude Code and its memory layer, deciding which past context is worth injecting based on relevance to the current task.
            </p>
          </div>

          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 10 }}>
              Key Business Rules
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>📐</span>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 2 }}>Budget is a hard cap</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>2000 tokens. Greedy fill stops — never exceeds budget.</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>⏱</span>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 2 }}>23-day half-life on all context</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Old knowledge fades. No manual expiry needed.</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>🎯</span>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 2 }}>Quality beats quantity</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>min_relevance_score = 0.4 gate. Vague observations never surface.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Discuss this product with AI</div>
          <div className="chat-box">
            <div className="chat-msgs">
              <div className="msg ai">
                <div className="msg-av">M</div>
                <div className="msg-text">I've analyzed memkit. It's token-optimization middleware for AI coding tools. What would you like to explore?</div>
              </div>
              <div className="msg user">
                <div className="msg-av">B</div>
                <div className="msg-text">Who are the main competitors?</div>
              </div>
              <div className="msg ai">
                <div className="msg-av">M</div>
                <div className="msg-text">The codebase was explicitly built away from claude-mem. Key differentiators: self-contained SQLite (no OAuth), rule-based compression (no LLM cost), quality scoring with decay. Competitors: claude-mem, Mem0, future native Claude memory.</div>
              </div>
            </div>
            <div className="chat-input-row">
              <input className="chat-input" placeholder="Ask about this project's business…" />
              <button className="btn primary" style={{ padding: '6px 10px' }}>→</button>
            </div>
          </div>
        </div>
      </div>

      {mode === 'detailed' && (
        <>
          <div className="divider" />
          <div className="g3">
            <div className="stat-card">
              <div className="stat-label">Target users</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>Daily Claude Code users</div>
              <div className="stat-sub">managing multi-project codebases</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Core value prop</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>57% token savings</div>
              <div className="stat-sub up">with better context quality</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Monetization</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>Open-source plugin</div>
              <div className="stat-sub">community marketplace</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
