export type Mode = 'simple' | 'detailed';
export type SectionId = 'events' | 'understanding' | 'code' | 'business' | 'infra' | 'membank' | 'injections' | 'rtk' | 'memusage' | 'settings';

export interface Project {
  id: string;
  name: string;
  color: string;
  colorBg: string;
  colorBrd: string;
  colorLight: string;
  lastSession: string;
}

export interface Observation {
  id: number;
  title: string;
  body: string;
  score: number;
  source: string;
  project: string;
  age: string;
  flag?: 'stale-path' | 'contradiction';
}
