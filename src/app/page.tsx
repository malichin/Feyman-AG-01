'use client';

import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import HomeScreen from '@/components/HomeScreen';
import ChatView from '@/components/ChatView';
import ProjectsView from '@/components/ProjectsView';
import PlayView from '@/components/PlayView';
import MemoryView from '@/components/MemoryView';
import ProgressView from '@/components/ProgressView';
import SetupScreen from '@/components/SetupScreen';
import SettingsModal from '@/components/SettingsModal';
import { useApp } from '@/context/AppContext';
import { getApiKey } from '@/lib/storage';

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

function TopBar({ onSettingsOpen }: { onSettingsOpen: () => void }) {
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
      <span className="text-sm font-medium text-[#0d1b2a] flex-1">
        {viewTitles[currentView] || 'FEYMAN AG01'}
      </span>
    </div>
  );
}

export default function Page() {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setHasKey(!!getApiKey());
  }, []);

  // Still loading (SSR guard)
  if (hasKey === null) return null;

  if (!hasKey) {
    return <SetupScreen onDone={() => setHasKey(true)} />;
  }

  return (
    <div className="flex h-full bg-white">
      <Sidebar onSettingsOpen={() => setSettingsOpen(true)} />
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <TopBar onSettingsOpen={() => setSettingsOpen(true)} />
        <MainContent />
      </div>
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
