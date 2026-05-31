'use client';

import React from 'react';
import {
  MessageSquare,
  FolderOpen,
  Gamepad2,
  Brain,
  BarChart3,
  Plus,
  User,
  X,
} from 'lucide-react';
import { useApp, View } from '@/context/AppContext';

interface NavItem {
  id: View;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'chat', label: 'Chat', icon: <MessageSquare size={18} /> },
  { id: 'projects', label: 'Progetti', icon: <FolderOpen size={18} /> },
  { id: 'play', label: 'Play', icon: <Gamepad2 size={18} /> },
  { id: 'memory', label: 'Memoria', icon: <Brain size={18} /> },
  { id: 'progress', label: 'Progressi', icon: <BarChart3 size={18} /> },
];

export default function Sidebar({ onSettingsOpen }: { onSettingsOpen?: () => void }) {
  const { currentView, setCurrentView, sessions, sidebarOpen, setSidebarOpen, startNewSession, loadSession } =
    useApp();

  const recentSessions = sessions.slice(0, 8);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Oggi';
    if (diffDays === 1) return 'Ieri';
    if (diffDays < 7) return `${diffDays} giorni fa`;
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-[260px] bg-white border-r border-[#e2e8f0] z-30
          flex flex-col
          sidebar-transition
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
          <button
            onClick={() => setCurrentView('home')}
            className="flex flex-col leading-tight text-left"
          >
            <span className="text-sm font-semibold tracking-widest text-[#2e86ab] uppercase">
              FEYMAN
            </span>
            <span className="text-[10px] tracking-[0.2em] text-[#64748b] uppercase">AG01</span>
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={onSettingsOpen}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f8fafc] text-[#64748b] transition-colors"
              title="Impostazioni API"
            >
              <User size={16} />
            </button>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f8fafc] text-[#64748b] transition-colors lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 pt-4 pb-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'chat') {
                  startNewSession();
                } else {
                  setCurrentView(item.id);
                }
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors mb-0.5
                ${
                  currentView === item.id
                    ? 'bg-[#f0f8ff] text-[#2e86ab] font-medium'
                    : 'text-[#0d1b2a] hover:bg-[#f8fafc]'
                }
              `}
            >
              <span className={currentView === item.id ? 'text-[#2e86ab]' : 'text-[#64748b]'}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Recenti */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {recentSessions.length > 0 && (
            <>
              <p className="px-3 pb-1.5 text-[11px] font-medium text-[#64748b] uppercase tracking-wider">
                Recenti
              </p>
              <div className="space-y-0.5">
                {recentSessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => loadSession(session.id)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#f8fafc] transition-colors group"
                  >
                    <p className="text-sm text-[#0d1b2a] truncate group-hover:text-[#2e86ab] transition-colors">
                      {session.title || 'Sessione senza titolo'}
                    </p>
                    <p className="text-[11px] text-[#64748b] mt-0.5">{formatDate(session.date)}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* New session button */}
        <div className="px-3 pb-4 pt-2 border-t border-[#e2e8f0]">
          <button
            onClick={startNewSession}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#52b788] hover:bg-[#3da674] text-white text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Nuova sessione
          </button>
        </div>
      </aside>
    </>
  );
}
