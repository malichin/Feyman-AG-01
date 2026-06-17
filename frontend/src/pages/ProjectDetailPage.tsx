import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Activity, Project, TeamMember } from '../types';
import {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  getTeam,
  getProjects,
} from '../api/client';
import ActivityTable from '../components/ActivityTable';
import ActivityPanel from '../components/ActivityPanel';

interface ActivityFormState {
  open: boolean;
  editing: Activity | null;
  code: string;
  title: string;
  assigneeId: string;
  deadline: string;
  status: string;
}

const STATUS_OPTIONS = [
  { value: 'todo', label: 'Da fare' },
  { value: 'in_progress', label: 'In corso' },
  { value: 'done', label: 'Completata' },
];

function toInputDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = parseInt(id ?? '', 10);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const [form, setForm] = useState<ActivityFormState>({
    open: false,
    editing: null,
    code: '',
    title: '',
    assigneeId: '',
    deadline: '',
    status: 'todo',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isNaN(projectId)) {
      navigate('/');
      return;
    }
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [acts, members, projects] = await Promise.all([
        getActivities(projectId),
        getTeam(),
        getProjects(),
      ]);
      setActivities(acts);
      setTeam(members);
      const found = projects.find((p) => p.id === projectId);
      setProject(found ?? null);
    } catch (err) {
      setError('Errore durante il caricamento delle attività.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm({
      open: true,
      editing: null,
      code: '',
      title: '',
      assigneeId: '',
      deadline: '',
      status: 'todo',
    });
    setFormError('');
  };

  const openEdit = (activity: Activity) => {
    setForm({
      open: true,
      editing: activity,
      code: activity.code,
      title: activity.title,
      assigneeId: activity.assigneeId ? String(activity.assigneeId) : '',
      deadline: toInputDate(activity.deadline),
      status: activity.status,
    });
    setFormError('');
  };

  const closeForm = () => {
    setForm((prev) => ({ ...prev, open: false, editing: null }));
    setFormError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) { setFormError('Il codice è obbligatorio.'); return; }
    if (!form.title.trim()) { setFormError('Il titolo è obbligatorio.'); return; }

    setSaving(true);
    setFormError('');
    try {
      const payload = {
        code: form.code.trim(),
        title: form.title.trim(),
        assigneeId: form.assigneeId ? parseInt(form.assigneeId, 10) : undefined,
        deadline: form.deadline || undefined,
        status: form.status,
      };

      if (form.editing) {
        const updated = await updateActivity(form.editing.id, {
          ...payload,
          assigneeId: form.assigneeId ? parseInt(form.assigneeId, 10) : null,
          deadline: form.deadline || null,
        });
        setActivities((prev) =>
          prev.map((a) => (a.id === updated.id ? updated : a))
        );
        // Update selected activity if it's the one being edited
        if (selectedActivity?.id === updated.id) {
          setSelectedActivity(updated);
        }
      } else {
        const created = await createActivity(projectId, payload);
        setActivities((prev) => [...prev, created]);
      }
      closeForm();
    } catch (err) {
      setFormError('Errore durante il salvataggio. Riprova.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteActivity(id);
      setActivities((prev) => prev.filter((a) => a.id !== id));
      if (selectedActivity?.id === id) setSelectedActivity(null);
    } catch (err) {
      alert('Errore durante l\'eliminazione dell\'attività.');
      console.error(err);
    }
  };

  const handleOpenNotes = (activity: Activity) => {
    setSelectedActivity(activity);
  };

  const handleActivityUpdated = async () => {
    // Refresh activities to get updated note/attachment counts
    try {
      const acts = await getActivities(projectId);
      setActivities(acts);
      // Update selected activity with latest data
      if (selectedActivity) {
        const updated = acts.find((a) => a.id === selectedActivity.id);
        if (updated) setSelectedActivity(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const projectName = project?.name ?? `Progetto #${projectId}`;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/')}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Torna ai progetti"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 truncate">{projectName}</h1>
          {project?.description && (
            <p className="text-sm text-gray-500 mt-0.5 truncate">{project.description}</p>
          )}
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuova Attività
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
          <button onClick={loadData} className="ml-2 underline hover:no-underline">Riprova</button>
        </div>
      )}

      {!loading && !error && (
        <ActivityTable
          activities={activities}
          onEdit={openEdit}
          onDelete={handleDelete}
          onOpenNotes={handleOpenNotes}
        />
      )}

      {/* Activity Form Modal */}
      {form.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeForm}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {form.editing ? 'Modifica Attività' : 'Nuova Attività'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Codice <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    placeholder="es. 1.1.2"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stato</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titolo Attività <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Descrizione dell'attività"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Responsabile</label>
                  <select
                    value={form.assigneeId}
                    onChange={(e) => setForm((prev) => ({ ...prev, assigneeId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">— Nessuno —</option>
                    {team.map((member) => (
                      <option key={member.id} value={String(member.id)}>
                        {member.name}{member.role ? ` (${member.role})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scadenza</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {formError && <p className="text-sm text-red-600">{formError}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Salvataggio...' : 'Salva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity Panel */}
      {selectedActivity && (
        <ActivityPanel
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onActivityUpdated={handleActivityUpdated}
        />
      )}
    </div>
  );
}
