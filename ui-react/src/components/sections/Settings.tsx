import { useState } from 'react';
import type { Mode } from '../../types';

interface SettingsProps {
  mode: Mode;
}

export default function Settings({ mode: _mode }: SettingsProps) {
  const [budget, setBudget] = useState(2000);
  const [maxObs, setMaxObs] = useState(10);
  const [minScore, setMinScore] = useState(0.4);
  const [decayLambda, setDecayLambda] = useState(0.03);
  const [staleThreshold, setStaleThreshold] = useState(0.2);
  const [autoPruneDays, setAutoPruneDays] = useState(30);
  const [weeklyPrune, setWeeklyPrune] = useState(true);

  return (
    <div>
      <div className="sh">
        <div className="sh-left">
          <div className="sh-title">Settings</div>
          <div className="sh-sub">~/.config/memkit/config.toml</div>
        </div>
        <button className="btn primary">Save changes</button>
      </div>

      <div className="g2">
        <div>
          <div className="card">
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-3)', marginBottom: 14 }}>
              Injection
            </div>
            <div className="set-row">
              <div className="set-label">
                <div className="set-name">Budget tokens</div>
                <div className="set-desc">Max tokens injected per session</div>
              </div>
              <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} />
            </div>
            <div className="set-row">
              <div className="set-label">
                <div className="set-name">Max observations</div>
                <div className="set-desc">Candidates considered per session</div>
              </div>
              <input type="number" value={maxObs} onChange={e => setMaxObs(Number(e.target.value))} />
            </div>
            <div className="set-row">
              <div className="set-label">
                <div className="set-name">Min relevance score</div>
                <div className="set-desc">Below this, never inject</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="range"
                  min={0} max={1} step={0.05}
                  value={minScore}
                  onChange={e => setMinScore(parseFloat(e.target.value))}
                />
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', width: 28 }}>{minScore.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-3)', marginBottom: 14 }}>
              Decay &amp; Prune
            </div>
            <div className="set-row">
              <div className="set-label">
                <div className="set-name">Decay lambda (λ)</div>
                <div className="set-desc">0.03 ≈ 23-day half-life</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="range"
                  min={0.01} max={0.1} step={0.005}
                  value={decayLambda}
                  onChange={e => setDecayLambda(parseFloat(e.target.value))}
                />
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', width: 36 }}>{decayLambda.toFixed(3)}</span>
              </div>
            </div>
            <div className="set-row">
              <div className="set-label">
                <div className="set-name">Stale threshold</div>
                <div className="set-desc">Score below = stale</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="range"
                  min={0} max={0.5} step={0.05}
                  value={staleThreshold}
                  onChange={e => setStaleThreshold(parseFloat(e.target.value))}
                />
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', width: 28 }}>{staleThreshold.toFixed(2)}</span>
              </div>
            </div>
            <div className="set-row">
              <div className="set-label">
                <div className="set-name">Auto-prune after</div>
                <div className="set-desc">Days before stale obs are archived</div>
              </div>
              <input type="number" value={autoPruneDays} onChange={e => setAutoPruneDays(Number(e.target.value))} />
            </div>
            <div className="set-row">
              <div className="set-label">
                <div className="set-name">Weekly auto-prune</div>
                <div className="set-desc">Run automatically every 7 days</div>
              </div>
              <div
                className={`toggle${weeklyPrune ? ' on' : ''}`}
                onClick={() => setWeeklyPrune(v => !v)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
