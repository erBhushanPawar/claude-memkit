import { useState } from 'react';
import type { Mode } from '../../types';

interface InjectionLogProps {
  mode: Mode;
}

export default function InjectionLog({ mode: _mode }: InjectionLogProps) {
  const [session1Open, setSession1Open] = useState(true);
  const [session2Open, setSession2Open] = useState(false);

  return (
    <div>
      <div className="sh">
        <div className="sh-left">
          <div className="sh-title">Injection Log</div>
          <div className="sh-sub">What was injected per session, what was filtered, and why</div>
        </div>
      </div>

      <div className="g4" style={{ marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-label">Avg savings</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>57%</div>
          <div className="stat-sub">last 30 sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tokens injected</div>
          <div className="stat-value">18.4k</div>
          <div className="stat-sub">of 42.8k naive total</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg obs / session</div>
          <div className="stat-value">5.2</div>
          <div className="stat-sub">of 15 considered</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Top context hit</div>
          <div className="stat-value" style={{ fontSize: 16 }}>FTS5 search</div>
          <div className="stat-sub">14 sessions</div>
        </div>
      </div>

      {/* Session 1 */}
      <div className="card" style={{ marginBottom: 12, padding: 0, overflow: 'hidden' }}>
        <div
          style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', cursor: 'pointer', gap: 12 }}
          onClick={() => setSession1Open(o => !o)}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>MCP protocol tests · Today 11:26</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>6 injected · 15 considered · 2,983 naive tokens</div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)' }}>1,136 saved · 38%</span>
          <span style={{ color: 'var(--text-3)', fontSize: 11 }}>{session1Open ? '▼' : '▶'}</span>
        </div>
        {session1Open && (
          <div style={{ borderTop: '1px solid var(--border)', padding: '14px 18px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10, fontFamily: 'var(--font-mono)' }}>
              Query: "lets build the vitest tests and MCP protocol coverage"
            </div>
            <div className="feed">
              <div className="feed-item" style={{ padding: '8px 0' }}>
                <div className="feed-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', width: 18 }}>#1</span>
                    <span style={{ fontSize: 13, flex: 1 }}>budget_override=0 is falsy — use !== undefined</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)' }}>0.91</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>84 tok</span>
                    <span className="tag green">injected</span>
                  </div>
                </div>
              </div>
              <div className="feed-item" style={{ padding: '8px 0' }}>
                <div className="feed-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', width: 18 }}>#2</span>
                    <span style={{ fontSize: 13, flex: 1 }}>Avoid mocking the database — use :memory: SQLite</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)' }}>0.88</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>112 tok</span>
                    <span className="tag green">injected</span>
                  </div>
                </div>
              </div>
              <div className="feed-item" style={{ padding: '8px 0', opacity: .5 }}>
                <div className="feed-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', width: 18 }}>#7</span>
                    <span style={{ fontSize: 13, flex: 1 }}>Job postings require approved_by field</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)' }}>0.18</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>—</span>
                    <span className="tag amber">below threshold</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Session 2 */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', cursor: 'pointer', gap: 12 }}
          onClick={() => setSession2Open(o => !o)}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Remove claude-mem dependency · Today 10:48</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>4 injected · 12 considered · 2,100 naive tokens</div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)' }}>900 saved · 43%</span>
          <span style={{ color: 'var(--text-3)', fontSize: 11 }}>{session2Open ? '▼' : '▶'}</span>
        </div>
        {session2Open && (
          <div style={{ borderTop: '1px solid var(--border)', padding: '14px 18px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10, fontFamily: 'var(--font-mono)' }}>
              Query: "we should not use claude-mem as we're going to compete with them"
            </div>
            <div className="feed">
              <div className="feed-item" style={{ padding: '8px 0' }}>
                <div className="feed-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', width: 18 }}>#1</span>
                    <span style={{ fontSize: 13, flex: 1 }}>Use FTS5 for full-text search in SQLite</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)' }}>0.72</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>96 tok</span>
                    <span className="tag green">injected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
