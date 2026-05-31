'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Session,
  Project,
  Message,
  getSessions,
  saveSession,
  getProjects,
  generateId,
} from '@/lib/storage';

export type View = 'home' | 'chat' | 'projects' | 'play' | 'memory' | 'progress';

interface AppContextValue {
  currentView: View;
  setCurrentView: (view: View) => void;
  currentSession: Session | null;
  setCurrentSession: (session: Session | null) => void;
  sessions: Session[];
  projects: Project[];
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  startNewSession: () => void;
  loadSession: (id: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  refreshSessions: () => void;
  refreshProjects: () => void;
  // Cross-view navigation helpers
  pendingMessage: string | null;
  clearPendingMessage: () => void;
  pendingPlayTopic: string | null;
  clearPendingPlayTopic: () => void;
  startChatWithMessage: (msg: string) => void;
  startPlayWithTopic: (topic: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentView, setCurrentView] = useState<View>('home');
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [pendingPlayTopic, setPendingPlayTopic] = useState<string | null>(null);

  const refreshSessions = useCallback(() => {
    setSessions(getSessions());
  }, []);

  const refreshProjects = useCallback(() => {
    setProjects(getProjects());
  }, []);

  useEffect(() => {
    refreshSessions();
    refreshProjects();
  }, [refreshSessions, refreshProjects]);

  const startNewSession = useCallback(() => {
    const newSession: Session = {
      id: generateId(),
      title: 'Nuova sessione',
      date: new Date().toISOString(),
      subject: '',
      messages: [],
      duration: 0,
    };
    setCurrentSession(newSession);
    setCurrentView('chat');
    setSidebarOpen(false);
  }, []);

  const loadSession = useCallback(
    (id: string) => {
      const session = sessions.find((s) => s.id === id);
      if (session) {
        setCurrentSession(session);
        setCurrentView('chat');
        setSidebarOpen(false);
      }
    },
    [sessions]
  );

  const addMessage = useCallback(
    (messageData: Omit<Message, 'id' | 'timestamp'>) => {
      const message: Message = {
        ...messageData,
        id: generateId(),
        timestamp: Date.now(),
      };

      setCurrentSession((prev) => {
        if (!prev) return prev;
        const updated: Session = {
          ...prev,
          messages: [...prev.messages, message],
          title:
            prev.messages.length === 0 && messageData.role === 'user'
              ? messageData.content.slice(0, 50)
              : prev.title,
        };
        saveSession(updated);
        return updated;
      });

      setSessions(getSessions());
    },
    []
  );

  const startChatWithMessage = useCallback((msg: string) => {
    const newSession: Session = {
      id: generateId(),
      title: 'Nuova sessione',
      date: new Date().toISOString(),
      subject: '',
      messages: [],
      duration: 0,
    };
    setCurrentSession(newSession);
    setPendingMessage(msg);
    setCurrentView('chat');
    setSidebarOpen(false);
  }, []);

  const startPlayWithTopic = useCallback((topic: string) => {
    setPendingPlayTopic(topic);
    setCurrentView('play');
    setSidebarOpen(false);
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView: (view) => {
          setCurrentView(view);
          setSidebarOpen(false);
        },
        currentSession,
        setCurrentSession,
        sessions,
        projects,
        sidebarOpen,
        setSidebarOpen,
        startNewSession,
        loadSession,
        addMessage,
        refreshSessions,
        refreshProjects,
        pendingMessage,
        clearPendingMessage: () => setPendingMessage(null),
        pendingPlayTopic,
        clearPendingPlayTopic: () => setPendingPlayTopic(null),
        startChatWithMessage,
        startPlayWithTopic,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
