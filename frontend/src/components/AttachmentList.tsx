import type { Attachment } from '../types';
import { downloadAttachmentUrl, deleteAttachment } from '../api/client';

interface Props {
  attachments: Attachment[];
  onDelete: (id: number) => void;
}

export default function AttachmentList({ attachments, onDelete }: Props) {
  const handleDelete = async (id: number) => {
    if (!window.confirm('Eliminare questo allegato?')) return;
    try {
      await deleteAttachment(id);
      onDelete(id);
    } catch (err) {
      alert('Errore durante l\'eliminazione dell\'allegato.');
      console.error(err);
    }
  };

  if (attachments.length === 0) {
    return <p className="text-xs text-gray-400 italic">Nessun allegato</p>;
  }

  return (
    <ul className="space-y-1">
      {attachments.map((att) => (
        <li key={att.id} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1 text-sm">
          <div className="flex items-center gap-2 min-w-0">
            {/* File icon */}
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
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
              className="p-1 text-indigo-600 hover:text-indigo-800 rounded hover:bg-indigo-50"
              title="Scarica"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>
            <button
              onClick={() => handleDelete(att.id)}
              className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
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
  );
}
