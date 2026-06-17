import { useRef, useState } from 'react';
import type { Note } from '../types';
import { deleteNote, uploadNoteAttachment, deleteAttachment } from '../api/client';
import AttachmentList from './AttachmentList';
import { downloadAttachmentUrl } from '../api/client';

interface Props {
  note: Note;
  onDelete: (id: number) => void;
  onAttachmentDeleted: () => void;
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export default function NoteItem({ note, onDelete, onAttachmentDeleted }: Props) {
  const [attachments, setAttachments] = useState(note.attachments || []);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDelete = async () => {
    if (!window.confirm('Eliminare questa nota?')) return;
    try {
      await deleteNote(note.id);
      onDelete(note.id);
    } catch (err) {
      alert('Errore durante l\'eliminazione della nota.');
      console.error(err);
    }
  };

  const handleAttachmentDelete = async (id: number) => {
    try {
      await deleteAttachment(id);
      setAttachments((prev) => prev.filter((a) => a.id !== id));
      onAttachmentDeleted();
    } catch (err) {
      alert('Errore durante l\'eliminazione dell\'allegato.');
      console.error(err);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const att = await uploadNoteAttachment(note.id, file);
      setAttachments((prev) => [...prev, att]);
    } catch (err) {
      alert('Errore durante il caricamento del file.');
      console.error(err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-gray-400">{formatDateTime(note.createdAt)}</span>
        <button
          onClick={handleDelete}
          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          title="Elimina nota"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <p className="text-sm text-gray-800 whitespace-pre-wrap mb-3">{note.content}</p>

      {attachments.length > 0 && (
        <div className="mb-2">
          <p className="text-xs font-medium text-gray-500 mb-1">Allegati:</p>
          <ul className="space-y-1">
            {attachments.map((att) => (
              <li key={att.id} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1 text-xs">
                <div className="flex items-center gap-1 min-w-0">
                  <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="truncate text-gray-700">{att.filename}</span>
                  <span className="text-gray-400 flex-shrink-0">({(att.size / 1024).toFixed(1)} KB)</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <a
                    href={downloadAttachmentUrl(att.id)}
                    download={att.filename}
                    className="p-0.5 text-indigo-600 hover:text-indigo-800"
                    title="Scarica"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
                  <button
                    onClick={() => handleAttachmentDelete(att.id)}
                    className="p-0.5 text-red-500 hover:text-red-700"
                    title="Elimina allegato"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-2">
        <label className="cursor-pointer">
          <span className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 hover:underline">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            {uploading ? 'Caricamento...' : 'Aggiungi allegato'}
          </span>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
}
