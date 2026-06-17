import { useEffect, useState } from 'react';
import type { TeamMember } from '../types';
import { getTeam, createTeamMember, updateTeamMember, deleteTeamMember } from '../api/client';

interface EditState {
  id: number;
  name: string;
  role: string;
}

export default function SettingsPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editState, setEditState] = useState<EditState | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [adding, setAdding] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getTeam();
      setTeam(data);
    } catch (err) {
      setError('Errore durante il caricamento dei membri del team.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const member = await createTeamMember({
        name: newName.trim(),
        role: newRole.trim() || undefined,
      });
      setTeam((prev) => [...prev, member]);
      setNewName('');
      setNewRole('');
      setShowAddForm(false);
    } catch (err) {
      alert('Errore durante l\'aggiunta del membro.');
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (member: TeamMember) => {
    setEditState({
      id: member.id,
      name: member.name,
      role: member.role ?? '',
    });
  };

  const cancelEdit = () => {
    setEditState(null);
  };

  const saveEdit = async (id: number) => {
    if (!editState || !editState.name.trim()) return;
    setSavingId(id);
    try {
      const updated = await updateTeamMember(id, {
        name: editState.name.trim(),
        role: editState.role.trim() || undefined,
      });
      setTeam((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setEditState(null);
    } catch (err) {
      alert('Errore durante il salvataggio.');
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Eliminare il membro "${name}"?`)) return;
    try {
      await deleteTeamMember(id);
      setTeam((prev) => prev.filter((m) => m.id !== id));
      if (editState?.id === id) setEditState(null);
    } catch (err) {
      alert('Errore durante l\'eliminazione del membro.');
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Impostazioni</h1>
          <p className="text-gray-500 text-sm mt-0.5">Gestisci i membri del team</p>
        </div>
        <button
          onClick={() => { setShowAddForm(true); setNewName(''); setNewRole(''); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Aggiungi Membro
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-gray-500">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Caricamento in corso...
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 text-sm mb-4">
          {error}
          <button onClick={loadTeam} className="ml-2 underline hover:no-underline">Riprova</button>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white border border-indigo-200 rounded-xl shadow-sm p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Nuovo Membro</h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nome e cognome"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Ruolo</label>
                <input
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="es. Project Manager"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={adding || !newName.trim()}
                className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {adding ? 'Aggiunta...' : 'Aggiungi'}
              </button>
            </div>
          </form>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-2">
          {team.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <svg className="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="font-medium">Nessun membro del team</p>
              <p className="text-sm mt-1">Aggiungi il primo membro per assegnare attività</p>
            </div>
          )}

          {team.map((member) => (
            <div key={member.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
              {editState?.id === member.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Nome</label>
                      <input
                        type="text"
                        value={editState.name}
                        onChange={(e) => setEditState((prev) => prev ? { ...prev, name: e.target.value } : null)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Ruolo</label>
                      <input
                        type="text"
                        value={editState.role}
                        onChange={(e) => setEditState((prev) => prev ? { ...prev, role: e.target.value } : null)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Ruolo opzionale"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annulla
                    </button>
                    <button
                      onClick={() => saveEdit(member.id)}
                      disabled={savingId === member.id || !editState.name.trim()}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      {savingId === member.id ? 'Salvataggio...' : 'Salva'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{member.name}</p>
                    {member.role ? (
                      <p className="text-sm text-gray-500">{member.role}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Nessun ruolo</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(member)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Modifica"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(member.id, member.name)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Elimina"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
