import type { Project, Mode } from '../types';

interface TopbarProps {
  project: Project;
  mode: Mode;
  onModeChange: (m: Mode) => void;
}

export default function Topbar({ project, mode, onModeChange }: TopbarProps) {
  return (
    <div className="topbar">
      <div>
        <div className="topbar-title">{project.name}</div>
        <div className="topbar-sub">MCP plugin · TypeScript · last session {project.lastSession}</div>
      </div>
      <div className="tb-spacer" />

      <div className="mode-toggle">
        <button
          className={`mode-btn${mode === 'simple' ? ' active' : ''}`}
          onClick={() => onModeChange('simple')}
        >
          Simple
        </button>
        <button
          className={`mode-btn${mode === 'detailed' ? ' active' : ''}`}
          onClick={() => onModeChange('detailed')}
        >
          Detailed
        </button>
      </div>

      <div className="search-wrap">
        <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-3)', flexShrink: 0 }}>
          <circle cx="9" cy="9" r="6" />
          <path d="m15 15 4 4" />
        </svg>
        <input type="text" placeholder="Search memory…" />
      </div>

      <button className="btn primary">+ Add observation</button>
    </div>
  );
}
