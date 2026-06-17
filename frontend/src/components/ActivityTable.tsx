import { useState } from 'react';
import type { Activity } from '../types';

interface Props {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (id: number) => void;
  onOpenNotes: (activity: Activity) => void;
}

type SortDir = 'asc' | 'desc';

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function StatusBadge({ status }: { status: Activity['status'] }) {
  const map: Record<Activity['status'], { label: string; className: string }> = {
    todo: { label: 'Da fare', className: 'bg-gray-100 text-gray-600' },
    in_progress: { label: 'In corso', className: 'bg-blue-100 text-blue-700' },
    done: { label: 'Completata', className: 'bg-green-100 text-green-700' },
  };
  const { label, className } = map[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

export default function ActivityTable({ activities, onEdit, onDelete, onOpenNotes }: Props) {
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleDeleteClick = (id: number) => {
    if (window.confirm('Eliminare questa attività?')) {
      onDelete(id);
    }
  };

  const sorted = [...activities].sort((a, b) => {
    const cmp = a.code.localeCompare(b.code, 'it', { numeric: true });
    return sortDir === 'asc' ? cmp : -cmp;
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700"
              onClick={() => setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            >
              <span className="flex items-center gap-1">
                Codice
                <svg
                  className={`w-3.5 h-3.5 transition-transform ${sortDir === 'desc' ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </span>
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Attività
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Chi
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Scadenza
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Stato
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Azioni
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {sorted.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-400 italic">
                Nessuna attività presente. Crea la prima attività.
              </td>
            </tr>
          )}
          {sorted.map((activity) => (
            <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-mono text-gray-700 whitespace-nowrap">{activity.code}</td>
              <td className="px-4 py-3 text-gray-900">{activity.title}</td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                {activity.assignee?.name ?? '—'}
              </td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                {formatDate(activity.deadline)}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={activity.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  {/* Edit */}
                  <button
                    onClick={() => onEdit(activity)}
                    className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                    title="Modifica"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  {/* Notes */}
                  <button
                    onClick={() => onOpenNotes(activity)}
                    className="relative p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Note"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    {(activity._count?.notes ?? 0) > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-blue-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                        {activity._count!.notes}
                      </span>
                    )}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteClick(activity.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Elimina"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
