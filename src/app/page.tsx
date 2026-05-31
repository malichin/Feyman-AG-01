'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import HomeScreen from '@/components/HomeScreen';
import ChatView from '@/components/ChatView';
import ProjectsView from '@/components/ProjectsView';
import PlayView from '@/components/PlayView';
import MemoryView from '@/components/MemoryView';
import ProgressView from '@/components/ProgressView';
import { useApp } from '@/context/AppContext';

function MainContent() {
  const { currentView } = useApp();

  switch (currentView) {
    case 'home':
      return <HomeScreen />;
    case 'chat':
      return <ChatView />;
    case 'projects':
      return <ProjectsView />;
    case 'play':
      return <PlayView />;
    case 'memory':
      return <MemoryView />;
    case 'progress':
      return <ProgressView />;
    default:
      return <HomeScreen />;
  }
}

function TopBar() {
  const { setSidebarOpen, currentView } = useApp();

  const viewTitles: Record<string, string> = {
    home: 'FEYMAN AG01',
    chat: 'Chat',
    projects: 'Progetti',
    play: 'Play',
    memory: 'Memoria',
    progress: 'Progressi',
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-[#e2e8f0] lg:hidden">
      <button
        onClick={() => setSidebarOpen(true)}
        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#f8fafc] text-[#64748b] transition-colors"
      >
        <Menu size={20} />
      </button>
      <span className="text-sm font-medium text-[#0d1b2a]">
        {viewTitles[currentView] || 'FEYMAN AG01'}
      </span>
    </div>
  );
}

export default function Page() {
  return (
    <div className="flex h-full bg-white">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <TopBar />
        <MainContent />
      </div>
    </div>
  );
}
