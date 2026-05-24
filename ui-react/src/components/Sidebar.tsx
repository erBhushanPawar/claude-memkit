import { useState, useEffect, useRef } from 'react';
import type { Project, SectionId } from '../types';

interface SidebarProps {
  projects: Project[];
  activeProject: Project;
  onProjectChange: (p: Project) => void;
  activeSection: SectionId;
  onSectionChange: (s: SectionId) => void;
}

interface NavItemDef {
  id: SectionId;
  icon: string;
  label: string;
  badge?: string;
}

const PROJECT_NAV: NavItemDef[] = [
  { id: 'events',      icon: '📋', label: 'Events & Prompts', badge: '38' },
  { id: 'understanding', icon: '💡', label: 'Understanding' },
  { id: 'code',        icon: '🔗', label: 'Code Insights', badge: '12' },
  { id: 'business',    icon: '📈', label: 'Business' },
  { id: 'infra',       icon: '🏗', label: 'Infra' },
];

const MEMORY_NAV: NavItemDef[] = [
  { id: 'membank',     icon: '🗃', label: 'Memory Bank', badge: '124' },
  { id: 'injections',  icon: '⚡', label: 'Injection Log' },
  { id: 'rtk',         icon: '📊', label: 'RTK Analytics' },
  { id: 'memusage',    icon: '💾', label: 'Memory Usage' },
];

const CONFIG_NAV: NavItemDef[] = [
  { id: 'settings',    icon: '⚙️', label: 'Settings' },
];

export default function Sidebar({ projects, activeProject, onProjectChange, activeSection, onSectionChange }: SidebarProps) {
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <a className="logo">
          <div className="logo-mark">🧠</div>
          MemKit
        </a>

        <div style={{ position: 'relative' }} ref={dropRef}>
          <div className="project-pill" onClick={() => setDropOpen(o => !o)}>
            <div className="project-dot" style={{ background: activeProject.color }} />
            <span className="project-name">{activeProject.name}</span>
            <span className="project-chevron">▾</span>
          </div>
          <div className={`project-dropdown${dropOpen ? ' open' : ''}`}>
            {projects.map(p => (
              <div
                key={p.id}
                className={`proj-opt${p.id === activeProject.id ? ' active' : ''}`}
                onClick={() => { onProjectChange(p); setDropOpen(false); }}
              >
                <div className="dot" style={{ background: p.color }} />
                <span className="name">{p.name}</span>
                <span className="last">{p.lastSession}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-label">Project</div>
        {PROJECT_NAV.map(item => (
          <div
            key={item.id}
            className={`nav-item${activeSection === item.id ? ' active' : ''}`}
            onClick={() => onSectionChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </div>
        ))}

        <div className="nav-label" style={{ marginTop: 8 }}>Memory</div>
        {MEMORY_NAV.map(item => (
          <div
            key={item.id}
            className={`nav-item${activeSection === item.id ? ' active' : ''}`}
            onClick={() => onSectionChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </div>
        ))}

        <div className="nav-label" style={{ marginTop: 8 }}>Config</div>
        {CONFIG_NAV.map(item => (
          <div
            key={item.id}
            className={`nav-item${activeSection === item.id ? ' active' : ''}`}
            onClick={() => onSectionChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="status-row">
          <div className="status-dot" />
          MCP server running
        </div>
        <div className="status-row" style={{ fontSize: 11 }}>
          <span style={{ color: 'var(--text-3)' }}>Budget</span>
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>847 / 2000 tkn</span>
        </div>
        <div className="prog">
          <div className="prog-fill" style={{ width: '42%', background: 'var(--proj)' }} />
        </div>
      </div>
    </aside>
  );
}
