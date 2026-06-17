import { useEffect, useRef, useState } from 'react';
import type { Activity, Note, Attachment } from '../types';
import {
  getNotes,
  createNote,
  getActivityAttachments,
  uploadActivityAttachment,
  deleteAttachment,
  downloadAttachmentUrl,
} from '../api/client';
import NoteItem from './NoteItem';

interface Props {
  activity: Activity;
  onClose: () => void;
  onActivityUpdated: () => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function ActivityPanel({ activity, onClose, onActivityUpdated }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activityAttachments, setActivityAttachments] = useState<Attachment[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [savingNote, setSavingNote] = useState(false);
  const [uploadingActivity, setUploadingActivity] = useState(false);
  const activityFileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    loadNotes();
    loadActivityAttachments();
  }, [activity.id]);

  const loadNotes = async () => {
    setLoadingNotes(true);
    try {
      const data = await getNotes(activity.id);
      setNotes(data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
    } catch (err) {
      console.error('Errore caricamento note:', err);
    } finally {
      setLoadingNotes(false);
    }
  };

  const loadActivityAttachments = async () => {
    try {
      const data = await getActivityAttachments(activity.id);
      setActivityAttachments(data);
    } catch (err) {
      console.error('Errore caricamento allegati attività:', err);
    }
  };

  const handleSaveNote = async () => {
    if (!newNoteContent.trim()) return;
    setSavingNote(true);
    try {
      const note = await createNote(activity.id, newNoteContent.trim());
      setNotes((prev) => [...prev, { ...note, attachments: note.attachments || [] }]);
      setNewNoteContent('');
      onActivityUpdated();
    } catch (err) {
      alert('Errore durante il salvataggio della nota.');
      console.error(err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleNoteDelete = (id: number) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    onActivityUpdated();
  };

  const handleActivityFileUpload = async (file: File) => {
    setUploadingActivity(true);
    try {
      const att = await uploadActivityAttachment(activity.id, file);
      setActivityAttachments((prev) => [...prev, att]);
      onActivityUpdated();
    } catch (err) {
      alert('Errore durante il caricamento del file.');
      console.error(err);
    } finally {
      setUploadingActivity(false);
      if (activityFileRef.current) activityFileRef.current.value = '';
    }
  };

  const handleActivityFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleActivityFileUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleActivityFileUpload(file);
  };

  const handleActivityAttachmentDelete = async (id: number) => {
    try {
      await deleteAttachment(id);
      setActivityAttachments((prev) => prev.filter((a) => a.id !== id));
      onActivityUpdated();
    } catch (err) {
      alert('Errore durante l\'eliminazione dell\'allegato.');
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Panel */}
      <div
        className="relative z-50 w-full max-w-[480px] h-full bg-white shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-indigo-700 text-white flex-shrink-0">
          <div className="min-w-0">
            <p className="text-xs text-indigo-200 font-mono">{activity.code}</p>
            <h2 className="font-semibold truncate">{activity.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="ml-2 p-1.5 rounded hover:bg-indigo-600 transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">

          {/* Activity Attachments Section */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              Allegati attività
            </h3>

            {activityAttachments.length > 0 && (
              <ul className="space-y-1 mb-3">
                {activityAttachments.map((att) => (
                  <li key={att.id} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1.5 text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="truncate text-gray-700">{att.filename}</span>
                      <span className="text-gray-400 text-xs flex-shrink-0">
                        {(att.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <a
                        href={downloadAttachmentUrl(att.id)}
                        download={att.filename}
                        className="p-1 text-indigo-600 hover:text-indigo-800 rounded"
                        title="Scarica"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                      <button
                        onClick={() => handleActivityAttachmentDelete(att.id)}
                        className="p-1 text-red-500 hover:text-red-700 rounded"
                        title="Elimina"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Drop zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => activityFileRef.current?.click()}
            >
              {uploadingActivity ? (
                <p className="text-sm text-indigo-600">Caricamento in corso...</p>
              ) : (
                <>
                  <svg className="w-6 h-6 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-xs text-gray-500">Trascina un file qui o <span className="text-indigo-600">clicca per selezionare</span></p>
                </>
              )}
              <input
                ref={activityFileRef}
                type="file"
                className="hidden"
                onChange={handleActivityFileChange}
                disabled={uploadingActivity}
              />
            </div>
          </section>

          {/* Notes Section */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Note
              {notes.length > 0 && (
                <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">
                  {notes.length}
                </span>
              )}
            </h3>

            {loadingNotes ? (
              <p className="text-sm text-gray-400 italic">Caricamento note...</p>
            ) : notes.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Nessuna nota presente.</p>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <NoteItem
                    key={note.id}
                    note={note}
                    onDelete={handleNoteDelete}
                    onAttachmentDeleted={onActivityUpdated}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Add Note Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 p-4">
          <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Aggiungi nota</h4>
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Scrivi una nota..."
            className="w-full border border-gray-300 rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSaveNote}
              disabled={savingNote || !newNoteContent.trim()}
              className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {savingNote ? 'Salvataggio...' : 'Salva nota'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
