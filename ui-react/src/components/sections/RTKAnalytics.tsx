import type { Mode } from '../../types';

interface RTKAnalyticsProps {
  mode: Mode;
}

export default function RTKAnalytics({ mode: _mode }: RTKAnalyticsProps) {
  return (
    <div>
      <div className="sh">
        <div className="sh-left">
          <div className="sh-title">RTK Analytics</div>
          <div className="sh-sub">Command output filtering + MemKit injection — combined token savings</div>
        </div>
      </div>

      {/* Combined banner */}
      <div className="card" style={{ background: 'var(--proj-bg)', borderColor: 'var(--proj-brd)', marginBottom: 20, padding: '22px 24px' }}>
        <div style={{ fontSize: 12, color: 'var(--proj)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>
          Total saved today
        </div>
        <div style={{ fontSize: 40, fontWeight: 800, color: 'var(--text)', lineHeight: 1, marginBottom: 4 }}>
          68,420 <span style={{ fontSize: 18, color: 'var(--text-3)', fontWeight: 400 }}>tokens</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>across 14 sessions · ~$0.34 saved at GPT-4 pricing</div>
        <div className="g2 mt16">
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 5, fontWeight: 600 }}>RTK — bash output filter</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--proj)' }}>51,840</div>
            <div className="prog" style={{ marginTop: 6 }}><div className="prog-fill" style={{ width: '76%', background: 'var(--proj)' }} /></div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>76% · 847 commands proxied</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 5, fontWeight: 600 }}>MemKit — context injection</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--green)' }}>16,580</div>
            <div className="prog" style={{ marginTop: 6 }}><div className="prog-fill" style={{ width: '24%', background: 'var(--green)' }} /></div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>24% · 57% avg session savings</div>
          </div>
        </div>
      </div>

      <div className="g2">
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Top commands by savings</div>
          <div className="card card-sm" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { cmd: 'npm test',           raw: '18,420 raw', pct: '93%', color: 'green' },
              { cmd: 'npm install',        raw: '14,200 raw', pct: '94%', color: 'green' },
              { cmd: 'cat package-lock.json', raw: '9,100 raw', pct: '99%', color: 'green' },
              { cmd: 'git log --oneline',  raw: '4,300 raw',  pct: '35%', color: 'blue' },
            ].map(row => (
              <div key={row.cmd} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <span style={{ fontFamily: 'var(--font-mono)', flex: 1 }}>{row.cmd}</span>
                <span style={{ color: 'var(--text-3)' }}>{row.raw}</span>
                <span className={`tag ${row.color}`}>{row.pct}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>7-day trend</div>
          <div className="card card-sm">
            <div className="bars" style={{ height: 80 }}>
              {[
                { label: 'Mon', h: '65%', active: false },
                { label: 'Tue', h: '80%', active: false },
                { label: 'Wed', h: '50%', active: false },
                { label: 'Thu', h: '90%', active: true },
                { label: 'Fri', h: '75%', active: true },
                { label: 'Sat', h: '40%', active: false },
                { label: 'Sun', h: '100%', active: true },
              ].map(bar => (
                <div key={bar.label} className="bar-g">
                  <div className="bar" style={{ height: bar.h, background: bar.active ? 'var(--proj)' : 'var(--proj-brd)' }} />
                  <div className="bar-l">{bar.label}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 10, display: 'flex', justifyContent: 'space-between' }}>
              <span>Peak: 126k tokens</span>
              <span style={{ color: 'var(--green)' }}>+22% vs last week</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
