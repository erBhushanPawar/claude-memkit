import type { Mode } from '../../types';

interface EventsProps {
  mode: Mode;
}

export default function Events({ mode }: EventsProps) {
  return (
    <div>
      <div className="sh">
        <div className="sh-left">
          <div className="sh-title">Events &amp; Prompts</div>
          <div className="sh-sub">Recent sessions and observations</div>
        </div>
      </div>

      <div className="feed">
        <div className="feed-item">
          <div className="feed-line">
            <div className="feed-dot" style={{ background: 'var(--proj)' }} />
            <div className="feed-tail" />
          </div>
          <div className="feed-body">
            <div className="feed-title">MCP protocol test suite</div>
            <div className="feed-meta">
              <span>2 min ago</span>
              <span style={{ color: 'var(--green)' }}>62% tokens saved</span>
            </div>
            <div className="feed-prompt">lets build the vitest tests and MCP protocol coverage</div>
            <div className="feed-tags">
              <span className="tag green">6 injected</span>
              <span className="tag blue">1,847 / 2,983 tokens</span>
              <span className="tag neutral">SessionStart hook</span>
            </div>
          </div>
        </div>

        <div className="feed-item">
          <div className="feed-line">
            <div className="feed-dot" style={{ background: 'var(--green)' }} />
            <div className="feed-tail" />
          </div>
          <div className="feed-body">
            <div className="feed-title">Observation added: FTS5 search pattern</div>
            <div className="feed-meta">
              <span>Today 11:10</span>
              <span style={{ color: 'var(--proj)' }}>score: 0.72</span>
            </div>
            <div className="feed-prompt">Use `searchObservations()` in src/db/sidecar.ts — avoid raw LIKE queries.</div>
            <div className="feed-tags">
              <span className="tag neutral">manual</span>
              <span className="tag green">specificity: 0.4</span>
            </div>
          </div>
        </div>

        <div className="feed-item">
          <div className="feed-line">
            <div className="feed-dot" style={{ background: 'var(--purple)' }} />
            <div className="feed-tail" />
          </div>
          <div className="feed-body">
            <div className="feed-title">Session: Remove claude-mem dependency</div>
            <div className="feed-meta">
              <span>Today 10:48</span>
              <span style={{ color: 'var(--green)' }}>57% tokens saved</span>
            </div>
            <div className="feed-prompt">we should not use claude-mem as we're going to compete with them</div>
            <div className="feed-tags">
              <span className="tag green">4 injected</span>
              <span className="tag amber">3 filtered</span>
            </div>
          </div>
        </div>

        <div className="feed-item">
          <div className="feed-line">
            <div className="feed-dot" style={{ background: 'var(--border-hi)' }} />
          </div>
          <div className="feed-body">
            <div className="feed-title">Session: Initial scaffold</div>
            <div className="feed-meta">
              <span>Yesterday 09:15</span>
              <span style={{ color: 'var(--text-3)' }}>first session — no prior context</span>
            </div>
            <div className="feed-tags">
              <span className="tag neutral">19 files created</span>
            </div>
          </div>
        </div>
      </div>

      {mode === 'detailed' && (
        <>
          <div className="divider" />
          <div className="sh">
            <div className="sh-left">
              <div style={{ fontSize: 14, fontWeight: 600 }}>Session Stats</div>
            </div>
          </div>
          <div className="g4">
            <div className="stat-card">
              <div className="stat-label">Sessions this week</div>
              <div className="stat-value">14</div>
              <div className="stat-sub up">↑ 3 vs last week</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Avg tokens saved</div>
              <div className="stat-value">57%</div>
              <div className="stat-sub">per session injection</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Observations added</div>
              <div className="stat-value">23</div>
              <div className="stat-sub up">this week</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Top context hit</div>
              <div className="stat-value" style={{ fontSize: 16 }}>FTS5 search</div>
              <div className="stat-sub">8 sessions</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
