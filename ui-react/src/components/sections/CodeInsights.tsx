import type { Mode } from '../../types';

interface CodeInsightsProps {
  mode: Mode;
}

export default function CodeInsights({ mode }: CodeInsightsProps) {
  return (
    <div>
      <div className="sh">
        <div className="sh-left">
          <div className="sh-title">Code Insights</div>
          <div className="sh-sub">Reuse patterns, hotspot files, dependency map</div>
        </div>
        <button className="btn" style={{ fontSize: 12 }}>↻ Refresh</button>
      </div>

      <div className="g2">
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Top reuse patterns</div>
          <div className="feed">
            <div className="feed-item" style={{ padding: '10px 0' }}>
              <div className="feed-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>SQLite singleton</span>
                  <span className="score hi">0.9</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>getDb() lazy-init used in 5 modules. Could be extended to serve future storage needs.</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--proj)', marginTop: 5 }}>src/db/sidecar.ts:8</div>
              </div>
            </div>
            <div className="feed-item" style={{ padding: '10px 0' }}>
              <div className="feed-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>Score × decay formula</span>
                  <span className="score hi">0.8</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>recencyDecay() reused in injector. Extract as shared util before v2 scorer changes.</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--proj)', marginTop: 5 }}>src/scorer/quality-scorer.ts:24</div>
              </div>
            </div>
            <div className="feed-item" style={{ padding: '10px 0' }}>
              <div className="feed-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>MCP error wrapper</span>
                  <span className="score mid">0.7</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>5 tools share the same try/catch → isError shape. Could be a withTool() HOF.</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--proj)', marginTop: 5 }}>src/index.ts:58–82</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Hotspot files</div>
          <div className="card card-sm" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-mono)' }}>src/db/sidecar.ts</span>
                <span style={{ color: 'var(--text-3)' }}>5 imports</span>
              </div>
              <div className="prog"><div className="prog-fill" style={{ width: '90%', background: 'var(--proj)' }} /></div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-mono)' }}>src/config.ts</span>
                <span style={{ color: 'var(--text-3)' }}>4 imports</span>
              </div>
              <div className="prog"><div className="prog-fill" style={{ width: '72%', background: 'var(--proj)' }} /></div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-mono)' }}>src/scorer/quality-scorer.ts</span>
                <span style={{ color: 'var(--text-3)' }}>3 imports</span>
              </div>
              <div className="prog"><div className="prog-fill" style={{ width: '55%', background: 'var(--proj)' }} /></div>
            </div>
          </div>
        </div>
      </div>

      {mode === 'detailed' && (
        <>
          <div className="divider" />
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Module dependency tree</div>
          <div className="card card-sm" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)', lineHeight: 2, background: 'var(--bg-2)' }}>
            <div><span style={{ color: 'var(--proj)' }}>src/index.ts</span></div>
            <div style={{ color: 'var(--text-3)' }}>{'  '}├─ tools/memory-gain.ts{'     '}→ injector/budget.ts</div>
            <div style={{ color: 'var(--text-3)' }}>{'  '}├─ tools/memory-health.ts{'   '}→ db/sidecar.ts</div>
            <div style={{ color: 'var(--text-3)' }}>{'  '}├─ tools/memory-prune.ts{'    '}→ db/sidecar.ts</div>
            <div style={{ color: 'var(--text-3)' }}>{'  '}├─ tools/mid-session-inject → injector/smart-injector.ts</div>
            <div style={{ color: 'var(--text-3)' }}>{'  '}│{'    '}├─ scorer/quality-scorer.ts</div>
            <div style={{ color: 'var(--text-3)' }}>{'  '}│{'    '}├─ compressor/observation-compressor.ts</div>
            <div style={{ color: 'var(--text-3)' }}>{'  '}│{'    '}└─ db/sidecar.ts</div>
            <div style={{ color: 'var(--text-3)' }}>{'  '}└─ tools/observation-add.ts → scorer + db/sidecar.ts</div>
          </div>
        </>
      )}
    </div>
  );
}
