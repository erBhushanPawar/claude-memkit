import type { Mode } from '../../types';

interface InfraProps {
  mode: Mode;
}

export default function Infra({ mode: _mode }: InfraProps) {
  return (
    <div>
      <div className="sh">
        <div className="sh-left">
          <div className="sh-title">Infra Insights</div>
          <div className="sh-sub">Services, dependencies, deployment model, open gaps</div>
        </div>
        <button className="btn" style={{ fontSize: 12 }}>↻ Scan</button>
      </div>

      <div className="g4" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Runtime</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6 }}>Node 20</div>
          <div className="stat-sub">stdio MCP · CJS</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Storage</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6 }}>SQLite</div>
          <div className="stat-sub">WAL · FTS5 · local</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Build</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6 }}>tsc</div>
          <div className="stat-sub">TypeScript 5.4 strict</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tests</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6, color: 'var(--green)' }}>83/83</div>
          <div className="stat-sub">Vitest · unit + MCP</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="infra-item">
          <div className="infra-icon">🗄</div>
          <div>
            <div className="infra-name">SQLite sidecar (better-sqlite3 v9)</div>
            <div className="infra-desc">~/.config/memkit/sidecar.db — WAL journal, FTS5 virtual table, auto-triggered on insert/update/delete.</div>
            <div className="infra-tags">
              <span className="tag green">healthy</span>
              <span className="tag neutral">zero-config</span>
            </div>
          </div>
        </div>

        <div className="infra-item">
          <div className="infra-icon">🔌</div>
          <div>
            <div className="infra-name">MCP stdio server</div>
            <div className="infra-desc">JSON-RPC 2.0 over stdin/stdout. Registered via enabledMcpjsonServers in ~/.claude/settings.json. No port, no auth, no network.</div>
            <div className="infra-tags">
              <span className="tag green">active</span>
              <span className="tag neutral">local only</span>
            </div>
          </div>
        </div>

        <div className="infra-item">
          <div className="infra-icon">⚠️</div>
          <div>
            <div className="infra-name">Config hot-reload — not wired</div>
            <div className="infra-desc">Changes to config.toml require server restart. PLAN.md Feature 12. Needs fs.watch + reloadConfig().</div>
            <div className="infra-tags">
              <span className="tag amber">gap</span>
              <span className="tag neutral">v3 roadmap</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
