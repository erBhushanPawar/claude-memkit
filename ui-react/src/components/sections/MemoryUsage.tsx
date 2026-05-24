import type { Mode } from '../../types';

interface MemoryUsageProps {
  mode: Mode;
}

export default function MemoryUsage({ mode: _mode }: MemoryUsageProps) {
  return (
    <div>
      <div className="sh">
        <div className="sh-left">
          <div className="sh-title">Memory Usage</div>
          <div className="sh-sub">Database size, observation quality, and growth</div>
        </div>
        <button className="btn danger">Run prune</button>
      </div>

      <div className="g4" style={{ marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-label">DB size</div>
          <div className="stat-value">14.2 MB</div>
          <div className="stat-sub">of 50MB warn threshold</div>
          <div className="prog"><div className="prog-fill" style={{ width: '28%', background: 'var(--green)' }} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total observations</div>
          <div className="stat-value">847</div>
          <div className="stat-sub up">↑ 23 this week</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Healthy (≥ 0.2)</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>824</div>
          <div className="stat-sub">97% of total</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Stale (&lt; 0.2)</div>
          <div className="stat-value" style={{ color: 'var(--amber)' }}>23</div>
          <div className="stat-sub warn">→ run memkit_prune</div>
        </div>
      </div>

      <div className="g2">
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>By project</div>
          <div className="card card-sm" style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {[
              { name: 'memkit',        color: '#D97757', count: 312, avg: '0.61', avgColor: 'var(--green)', width: '37%' },
              { name: 'api-gateway',   color: '#16A34A', count: 198, avg: '0.48', avgColor: 'var(--green)', width: '23%' },
              { name: 'mobile-app',    color: '#7C3AED', count: 147, avg: '0.52', avgColor: 'var(--amber)', width: '17%' },
              { name: 'infra-core',    color: '#2563EB', count: 98,  avg: '0.38', avgColor: 'var(--amber)', width: '12%' },
              { name: 'rtk',           color: '#D97706', count: 62,  avg: '0.29', avgColor: 'var(--text-3)', width: '7%' },
            ].map(proj => (
              <div key={proj.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: proj.color }} />
                    {proj.name}
                  </span>
                  <span style={{ color: 'var(--text-3)' }}>
                    {proj.count} · avg <span style={{ color: proj.avgColor }}>{proj.avg}</span>
                  </span>
                </div>
                <div className="prog"><div className="prog-fill" style={{ width: proj.width, background: proj.color }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Score distribution</div>
          <div className="card card-sm">
            <div className="bars" style={{ height: 70, marginBottom: 12 }}>
              <div className="bar-g"><div className="bar" style={{ height: '12%', background: 'var(--red)' }} /><div className="bar-l">0–0.2</div></div>
              <div className="bar-g"><div className="bar" style={{ height: '28%', background: 'var(--amber)' }} /><div className="bar-l">0.2–0.4</div></div>
              <div className="bar-g"><div className="bar" style={{ height: '85%', background: 'var(--proj)' }} /><div className="bar-l">0.4–0.6</div></div>
              <div className="bar-g"><div className="bar" style={{ height: '100%', background: 'var(--proj)' }} /><div className="bar-l">0.6–0.8</div></div>
              <div className="bar-g"><div className="bar" style={{ height: '42%', background: 'var(--proj)' }} /><div className="bar-l">0.8–1.0</div></div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="tag red">23 stale</span>
              <span className="tag amber">94 fair</span>
              <span className="tag green">730 healthy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
