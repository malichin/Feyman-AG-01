export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Session {
  id: string;
  title: string;
  date: string;
  subject: string;
  messages: Message[];
  duration: number; // minutes
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  lastReviewed?: number;
  score?: number;
}

export interface Quiz {
  id: string;
  question: string;
  answer: string;
  options?: string[];
  score?: number;
  lastAttempted?: number;
}

export interface Project {
  id: string;
  subject: string;
  topic: string;
  files: string[];
  explanations: string[];
  flashcards: Flashcard[];
  quizzes: Quiz[];
  progress: Record<string, number>;
  createdAt: number;
  updatedAt: number;
}

export interface ProgressEntry {
  topicId: string;
  subject: string;
  topic: string;
  scores: number[];
  dates: number[];
  lastStudied: number;
}

function isClient(): boolean {
  return typeof window !== 'undefined';
}

// Sessions
export function getSessions(): Session[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem('feyman_sessions');
    return raw ? (JSON.parse(raw) as Session[]) : [];
  } catch {
    return [];
  }
}

export function saveSession(session: Session): void {
  if (!isClient()) return;
  try {
    const sessions = getSessions();
    const index = sessions.findIndex((s) => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.unshift(session);
    }
    localStorage.setItem('feyman_sessions', JSON.stringify(sessions));
  } catch {
    // silent fail
  }
}

export function deleteSession(id: string): void {
  if (!isClient()) return;
  try {
    const sessions = getSessions().filter((s) => s.id !== id);
    localStorage.setItem('feyman_sessions', JSON.stringify(sessions));
  } catch {
    // silent fail
  }
}

// Projects
export function getProjects(): Project[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem('feyman_projects');
    return raw ? (JSON.parse(raw) as Project[]) : [];
  } catch {
    return [];
  }
}

export function saveProject(project: Project): void {
  if (!isClient()) return;
  try {
    const projects = getProjects();
    const index = projects.findIndex((p) => p.id === project.id);
    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.unshift(project);
    }
    localStorage.setItem('feyman_projects', JSON.stringify(projects));
  } catch {
    // silent fail
  }
}

export function deleteProject(id: string): void {
  if (!isClient()) return;
  try {
    const projects = getProjects().filter((p) => p.id !== id);
    localStorage.setItem('feyman_projects', JSON.stringify(projects));
  } catch {
    // silent fail
  }
}

// Progress
export function getProgress(): ProgressEntry[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem('feyman_progress');
    return raw ? (JSON.parse(raw) as ProgressEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveProgress(entry: ProgressEntry): void {
  if (!isClient()) return;
  try {
    const progress = getProgress();
    const index = progress.findIndex((p) => p.topicId === entry.topicId);
    if (index >= 0) {
      progress[index] = entry;
    } else {
      progress.push(entry);
    }
    localStorage.setItem('feyman_progress', JSON.stringify(progress));
  } catch {
    // silent fail
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
