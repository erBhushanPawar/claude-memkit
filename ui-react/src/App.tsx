import { useState, useEffect } from 'react';
import './index.css';
import type { Mode, SectionId, Project } from './types';
import { PROJECTS } from './data/projects';
import { OBSERVATIONS } from './data/observations';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Events from './components/sections/Events';
import Understanding from './components/sections/Understanding';
import CodeInsights from './components/sections/CodeInsights';
import BusinessInsights from './components/sections/BusinessInsights';
import Infra from './components/sections/Infra';
import MemoryBank from './components/sections/MemoryBank';
import InjectionLog from './components/sections/InjectionLog';
import RTKAnalytics from './components/sections/RTKAnalytics';
import MemoryUsage from './components/sections/MemoryUsage';
import Settings from './components/sections/Settings';

export default function App() {
  const [activeProject, setActiveProject] = useState<Project>(PROJECTS[0]);
  const [activeSection, setActiveSection] = useState<SectionId>('events');
  const [mode, setMode] = useState<Mode>('simple');
  const [observations, setObservations] = useState(OBSERVATIONS);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--proj', activeProject.color);
    root.style.setProperty('--proj-bg', activeProject.colorBg);
    root.style.setProperty('--proj-brd', activeProject.colorBrd);
    root.style.setProperty('--proj-light', activeProject.colorLight);
  }, [activeProject]);

  function handleDeleteObservation(id: number) {
    setObservations(prev => prev.filter(o => o.id !== id));
  }

  return (
    <div className="app">
      <Sidebar
        projects={PROJECTS}
        activeProject={activeProject}
        onProjectChange={setActiveProject}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <div className="main">
        <Topbar
          project={activeProject}
          mode={mode}
          onModeChange={setMode}
        />
        <div className="content">
          {activeSection === 'events' && <Events mode={mode} />}
          {activeSection === 'understanding' && <Understanding mode={mode} />}
          {activeSection === 'code' && <CodeInsights mode={mode} />}
          {activeSection === 'business' && <BusinessInsights mode={mode} />}
          {activeSection === 'infra' && <Infra mode={mode} />}
          {activeSection === 'membank' && (
            <MemoryBank observations={observations} onDelete={handleDeleteObservation} />
          )}
          {activeSection === 'injections' && <InjectionLog mode={mode} />}
          {activeSection === 'rtk' && <RTKAnalytics mode={mode} />}
          {activeSection === 'memusage' && <MemoryUsage mode={mode} />}
          {activeSection === 'settings' && <Settings mode={mode} />}
        </div>
      </div>
    </div>
  );
}
