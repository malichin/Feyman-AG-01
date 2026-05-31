'use client';

import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  Plus,
  BookOpen,
  CreditCard,
  HelpCircle,
  Brain,
  ClipboardCheck,
  TrendingUp,
} from 'lucide-react';

interface TreeItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: TreeItem[];
}

const fileTypes = [
  { id: 'spiegazione', label: 'Spiegazione', icon: <BookOpen size={14} /> },
  { id: 'flashcard', label: 'Flashcard', icon: <CreditCard size={14} /> },
  { id: 'quiz', label: 'Quiz', icon: <HelpCircle size={14} /> },
  { id: 'tecniche', label: 'Tecniche', icon: <Brain size={14} /> },
  { id: 'verifiche', label: 'Verifiche', icon: <ClipboardCheck size={14} /> },
  { id: 'rapporti', label: 'Rapporti', icon: <TrendingUp size={14} /> },
];

const SUBJECTS: { id: string; label: string; topics: string[] }[] = [
  {
    id: 'matematica',
    label: 'Matematica',
    topics: ['Algebra', 'Geometria', 'Calcolo', 'Statistica'],
  },
  {
    id: 'storia',
    label: 'Storia',
    topics: ['Storia antica', 'Medioevo', 'Età moderna', 'Storia contemporanea'],
  },
  {
    id: 'scienze',
    label: 'Scienze',
    topics: ['Fisica', 'Chimica', 'Biologia', 'Astronomia'],
  },
  {
    id: 'lingue',
    label: 'Lingue',
    topics: ['Grammatica', 'Vocabolario', 'Conversazione', 'Letteratura'],
  },
  {
    id: 'arte',
    label: 'Arte',
    topics: ['Storia dell\'arte', 'Tecniche pittoriche', 'Scultura', 'Arte moderna'],
  },
  {
    id: 'altro',
    label: 'Altro',
    topics: [],
  },
];

function FileNode({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#f8fafc] cursor-pointer group">
      <span className="text-[#64748b] group-hover:text-[#2e86ab] transition-colors">{icon || <FileText size={14} />}</span>
      <span className="text-xs text-[#64748b] group-hover:text-[#0d1b2a] transition-colors">{label}</span>
    </div>
  );
}

function TopicNode({ topicId, label }: { topicId: string; label: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#f8fafc] transition-colors text-left"
      >
        {open ? (
          <ChevronDown size={14} className="text-[#64748b] flex-shrink-0" />
        ) : (
          <ChevronRight size={14} className="text-[#64748b] flex-shrink-0" />
        )}
        <span className="text-sm text-[#0d1b2a]">{label}</span>
      </button>
      {open && (
        <div className="ml-6 mt-0.5 space-y-0.5">
          {fileTypes.map((ft) => (
            <FileNode key={`${topicId}-${ft.id}`} label={ft.label} icon={ft.icon} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubjectNode({ subject }: { subject: typeof SUBJECTS[0] }) {
  const [open, setOpen] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [topics, setTopics] = useState(subject.topics);

  const handleAddTopic = () => {
    if (newTopic.trim()) {
      setTopics([...topics, newTopic.trim()]);
      setNewTopic('');
      setShowAddTopic(false);
    }
  };

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl hover:bg-[#f8fafc] transition-colors text-left group"
      >
        {open ? (
          <FolderOpen size={16} className="text-[#2e86ab] flex-shrink-0" />
        ) : (
          <Folder size={16} className="text-[#64748b] flex-shrink-0" />
        )}
        <span className="text-sm font-medium text-[#0d1b2a] flex-1">{subject.label}</span>
        {open ? (
          <ChevronDown size={14} className="text-[#64748b]" />
        ) : (
          <ChevronRight size={14} className="text-[#64748b]" />
        )}
      </button>

      {open && (
        <div className="ml-4 mt-0.5 border-l border-[#e2e8f0] pl-2 space-y-0.5">
          {topics.map((topic) => (
            <TopicNode
              key={`${subject.id}-${topic}`}
              topicId={`${subject.id}-${topic}`}
              label={topic}
            />
          ))}

          {showAddTopic ? (
            <div className="flex items-center gap-2 px-3 py-1.5">
              <input
                autoFocus
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTopic();
                  if (e.key === 'Escape') setShowAddTopic(false);
                }}
                placeholder="Nome argomento..."
                className="flex-1 text-xs border border-[#e2e8f0] rounded-lg px-2 py-1.5 outline-none focus:border-[#2e86ab] bg-white"
              />
              <button
                onClick={handleAddTopic}
                className="text-xs text-[#2e86ab] font-medium hover:text-[#256f90] transition-colors"
              >
                OK
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddTopic(true)}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#f8fafc] transition-colors text-left"
            >
              <Plus size={13} className="text-[#64748b]" />
              <span className="text-xs text-[#64748b]">Aggiungi argomento</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProjectsView() {
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [customSubjects, setCustomSubjects] = useState<typeof SUBJECTS>([]);

  const allSubjects = [...SUBJECTS, ...customSubjects];

  const handleAddSubject = () => {
    if (newSubject.trim()) {
      setCustomSubjects([
        ...customSubjects,
        { id: `custom-${Date.now()}`, label: newSubject.trim(), topics: [] },
      ]);
      setNewSubject('');
      setShowAddSubject(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-[#0d1b2a]">Progetti</h1>
          <p className="text-sm text-[#64748b] mt-1">
            Organizza i tuoi materiali di studio per materia e argomento.
          </p>
        </div>

        <div className="space-y-0.5">
          {allSubjects.map((subject) => (
            <SubjectNode key={subject.id} subject={subject} />
          ))}

          {/* Add subject */}
          {showAddSubject ? (
            <div className="flex items-center gap-2 px-4 py-2.5">
              <input
                autoFocus
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSubject();
                  if (e.key === 'Escape') setShowAddSubject(false);
                }}
                placeholder="Nome materia..."
                className="flex-1 text-sm border border-[#e2e8f0] rounded-xl px-3 py-2 outline-none focus:border-[#2e86ab] bg-white"
              />
              <button
                onClick={handleAddSubject}
                className="text-sm text-[#2e86ab] font-medium hover:text-[#256f90] transition-colors px-2"
              >
                Aggiungi
              </button>
              <button
                onClick={() => setShowAddSubject(false)}
                className="text-sm text-[#64748b] hover:text-[#0d1b2a] transition-colors"
              >
                Annulla
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddSubject(true)}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl hover:bg-[#f8fafc] transition-colors text-left border border-dashed border-[#e2e8f0] mt-2"
            >
              <Plus size={16} className="text-[#52b788]" />
              <span className="text-sm text-[#64748b]">Crea nuova materia</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
