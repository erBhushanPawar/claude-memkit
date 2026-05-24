import { useState } from 'react';
import type { Observation } from '../../types';

interface MemoryBankProps {
  observations: Observation[];
  onDelete: (id: number) => void;
}

function scoreClass(score: number): string {
  if (score >= 0.65) return 'score hi';
  if (score >= 0.4) return 'score mid';
  return 'score lo';
}

type Filter = 'all' | 'flagged' | 'stale' | 'high';

export default function MemoryBank({ observations, onDelete }: MemoryBankProps) {
  const [aiReviewOpen, setAiReviewOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [dying, setDying] = useState<Set<number>>(new Set());

  function handleDelete(id: number) {
    setDying(prev => new Set(prev).add(id));
    setTimeout(() => {
      onDelete(id);
      setDying(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 220);
  }

  const filtered = observations.filter(obs => {
    if (filter === 'flagged') return obs.flag != null;
    if (filter === 'stale') return obs.score < 0.2;
    if (filter === 'high') return obs.score >= 0.65;
    return true;
  });

  return (
    <div>
      <div className="sh">
        <div className="sh-left">
          <div className="sh-title">Memory Bank</div>
          <div className="sh-sub">All observations · lookup, edit, delete, AI-correct</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn"
            onClick={() => setAiReviewOpen(o => !o)}
          >
            🤖 AI Review
          </button>
          <button className="btn primary">+ Add</button>
        </div>
      </div>

      {aiReviewOpen && (
        <div style={{ marginBottom: 20 }}>
          <div className="card" style={{ borderColor: 'var(--amber-brd)', background: 'var(--amber-bg)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--amber)', marginBottom: 4 }}>🤖 AI Memory Reviewer</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginBottom: 14, lineHeight: 1.7 }}>
              Scanning for contradictions, stale file paths, and outdated facts that could silently mislead Claude's context.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
              <div className="ai-alert">
                <div className="ai-alert-title">⚠ Stale file path — obs #003</div>
                <div className="ai-alert-body">"src/config/order-state.ts" was renamed to "src/state/order.config.ts" in a recent commit. Claude will look for the wrong file.</div>
                <div className="ai-alert-actions">
                  <button className="btn" style={{ fontSize: 11, padding: '4px 10px', color: 'var(--green)', borderColor: 'var(--green-brd)', background: 'var(--green-bg)' }}>✓ Auto-fix path</button>
                  <button className="btn ghost" style={{ fontSize: 11, padding: '4px 10px' }}>Ignore</button>
                </div>
              </div>
              <div className="ai-alert error">
                <div className="ai-alert-title">✕ Contradiction — obs #005</div>
                <div className="ai-alert-body">"approved_by always required" contradicts src/validators/job.validator.ts which was updated to make it optional for draft posts.</div>
                <div className="ai-alert-actions">
                  <button className="btn" style={{ fontSize: 11, padding: '4px 10px', color: 'var(--green)', borderColor: 'var(--green-brd)', background: 'var(--green-bg)' }}>✓ Update</button>
                  <button className="btn" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => handleDelete(5)}>✕ Delete</button>
                  <button className="btn ghost" style={{ fontSize: 11, padding: '4px 10px' }}>Ignore</button>
                </div>
              </div>
            </div>
            <div className="chat-input-row" style={{ border: 'none', padding: 0, gap: 8 }}>
              <input className="chat-input" style={{ background: 'var(--bg-1)' }} placeholder="Ask: 'Is obs #002 still accurate?'" />
              <button className="btn primary" style={{ padding: '6px 10px' }}>Ask</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        <button
          className="btn"
          style={filter === 'all' ? { fontSize: 11, padding: '4px 10px', background: 'var(--proj-bg)', color: 'var(--proj)', borderColor: 'var(--proj-brd)' } : { fontSize: 11, padding: '4px 10px' }}
          onClick={() => setFilter('all')}
        >
          All ({observations.length})
        </button>
        <button
          className="btn"
          style={filter === 'flagged' ? { fontSize: 11, padding: '4px 10px', color: 'var(--red)', borderColor: 'var(--red-brd)', background: 'var(--red-bg)' } : { fontSize: 11, padding: '4px 10px', color: 'var(--red)', borderColor: 'var(--red-brd)', background: 'var(--red-bg)' }}
          onClick={() => setFilter('flagged')}
        >
          ⚠ Flagged ({observations.filter(o => o.flag).length})
        </button>
        <button
          className={`btn${filter === 'stale' ? '' : ' ghost'}`}
          style={{ fontSize: 11, padding: '4px 10px' }}
          onClick={() => setFilter('stale')}
        >
          Stale ({observations.filter(o => o.score < 0.2).length})
        </button>
        <button
          className={`btn${filter === 'high' ? '' : ' ghost'}`}
          style={{ fontSize: 11, padding: '4px 10px' }}
          onClick={() => setFilter('high')}
        >
          High score
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '4px 20px' }}>
          {filtered.map(obs => {
            const isDying = dying.has(obs.id);
            const isStale = obs.score < 0.2;
            const isStaleFlag = obs.flag === 'stale-path';
            return (
              <div
                key={obs.id}
                className={`obs-row${isStale ? ' stale' : ''}${obs.flag === 'contradiction' ? ' flagged' : ''}`}
                style={isDying ? { opacity: 0, transform: 'translateX(40px)' } : undefined}
              >
                <div className="obs-score">
                  <span className={scoreClass(obs.score)}>{obs.score.toFixed(2)}</span>
                </div>
                <div className="obs-body">
                  <div className="obs-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    {obs.title}
                    {isStaleFlag && <span className="tag amber">⚠ stale path</span>}
                    {obs.flag === 'contradiction' && <span className="tag red">✕ contradiction</span>}
                  </div>
                  <div className="obs-preview">{obs.body}</div>
                  <div className="obs-meta">
                    <span className={`tag ${obs.source === 'feedback' ? 'green' : obs.source === 'test-discovery' ? 'purple' : 'neutral'}`}>{obs.source}</span>
                    <span className="tag neutral">{obs.project}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{obs.age}</span>
                  </div>
                </div>
                <div className="obs-actions">
                  <button className="icon-btn" title="Edit">✏</button>
                  <button className="icon-btn" title="Ask AI" style={obs.flag === 'contradiction' ? { color: 'var(--red)' } : obs.flag === 'stale-path' ? { color: 'var(--amber)' } : undefined}>🤖</button>
                  <button className="icon-btn del" title="Delete" onClick={() => handleDelete(obs.id)}>✕</button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="empty">
              <div className="empty-icon">🗃</div>
              <div className="empty-title">No observations match this filter</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
