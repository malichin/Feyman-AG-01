'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  Plus,
  Trash2,
  BookOpen,
  CreditCard,
  HelpCircle,
  Brain,
  ClipboardCheck,
  TrendingUp,
} from 'lucide-react';
import { Subject, getSubjects, saveSubjects, generateId } from '@/lib/storage';

const FILE_TYPES = [
  { id: 'spiegazione', label: 'Spiegazione', icon: <BookOpen size={14} /> },
  { id: 'flashcard', label: 'Flashcard', icon: <CreditCard size={14} /> },
  { id: 'quiz', label: 'Quiz', icon: <HelpCircle size={14} /> },
  { id: 'tecniche', label: 'Tecniche', icon: <Brain size={14} /> },
  { id: 'verifiche', label: 'Verifiche', icon: <ClipboardCheck size={14} /> },
  { id: 'rapporti', label: 'Rapporti', icon: <TrendingUp size={14} /> },
];

function FileNode({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#f8fafc] cursor-pointer group">
      <span className="text-[#64748b] group-hover:text-[#2e86ab] transition-colors">
        {icon || <FileText size={14} />}
      </span>
      <span className="text-xs text-[#64748b] group-hover:text-[#0d1b2a] transition-colors">{label}</span>
    </div>
  );
}

function TopicNode({
  label,
  subjectId,
  onDelete,
}: {
  label: string;
  subjectId: string;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center group">
        <button
          onClick={() => setOpen(!open)}
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#f8fafc] transition-colors text-left"
        >
          {open ? (
            <ChevronDown size={14} className="text-[#64748b] flex-shrink-0" />
          ) : (
            <ChevronRight size={14} className="text-[#64748b] flex-shrink-0" />
          )}
          <span className="text-sm text-[#0d1b2a]">{label}</span>
        </button>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-[#fee2e2] text-[#94a3b8] hover:text-[#ef4444] transition-all mr-1"
        >
          <Trash2 size={13} />
        </button>
      </div>
      {open && (
        <div className="ml-6 mt-0.5 space-y-0.5">
          {FILE_TYPES.map((ft) => (
            <FileNode key={`${subjectId}-${label}-${ft.id}`} label={ft.label} icon={ft.icon} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubjectNode({
  subject,
  onUpdateTopics,
  onDelete,
}: {
  subject: Subject;
  onUpdateTopics: (topics: string[]) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [newTopic, setNewTopic] = useState('');

  const handleAddTopic = () => {
    const name = newTopic.trim();
    if (!name) return;
    onUpdateTopics([...subject.topics, name]);
    setNewTopic('');
    setShowAddTopic(false);
  };

  const handleDeleteTopic = (index: number) => {
    onUpdateTopics(subject.topics.filter((_, i) => i !== index));
  };

  return (
    <div className="mb-1">
      <div className="flex items-center group">
        <button
          onClick={() => setOpen(!open)}
          className="flex-1 flex items-center gap-2.5 px-4 py-2.5 rounded-xl hover:bg-[#f8fafc] transition-colors text-left"
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
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-[#fee2e2] text-[#94a3b8] hover:text-[#ef4444] transition-all mr-1"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {open && (
        <div className="ml-4 mt-0.5 border-l border-[#e2e8f0] pl-2 space-y-0.5">
          {subject.topics.length === 0 && !showAddTopic && (
            <p className="text-xs text-[#94a3b8] px-3 py-2">Nessun argomento — aggiungine uno</p>
          )}

          {subject.topics.map((topic, i) => (
            <TopicNode
              key={`${subject.id}-${i}`}
              label={topic}
              subjectId={subject.id}
              onDelete={() => handleDeleteTopic(i)}
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
              <button
                onClick={() => setShowAddTopic(false)}
                className="text-xs text-[#64748b] hover:text-[#0d1b2a]"
              >
                ✕
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
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState('');

  useEffect(() => {
    setSubjects(getSubjects());
  }, []);

  const persist = (updated: Subject[]) => {
    setSubjects(updated);
    saveSubjects(updated);
  };

  const handleAddSubject = () => {
    const name = newSubject.trim();
    if (!name) return;
    persist([...subjects, { id: generateId(), label: name, topics: [] }]);
    setNewSubject('');
    setShowAddSubject(false);
  };

  const handleDeleteSubject = (id: string) => {
    persist(subjects.filter((s) => s.id !== id));
  };

  const handleUpdateTopics = (id: string, topics: string[]) => {
    persist(subjects.map((s) => (s.id === id ? { ...s, topics } : s)));
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

        {subjects.length === 0 && !showAddSubject && (
          <div className="text-center py-16">
            <Folder size={32} className="text-[#e2e8f0] mx-auto mb-3" />
            <p className="text-sm text-[#64748b]">Nessuna materia ancora.</p>
            <p className="text-xs text-[#94a3b8] mt-1">Crea la tua prima materia qui sotto.</p>
          </div>
        )}

        <div className="space-y-0.5">
          {subjects.map((subject) => (
            <SubjectNode
              key={subject.id}
              subject={subject}
              onUpdateTopics={(topics) => handleUpdateTopics(subject.id, topics)}
              onDelete={() => handleDeleteSubject(subject.id)}
            />
          ))}

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
                className="text-sm text-[#64748b] hover:text-[#0d1b2a]"
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
