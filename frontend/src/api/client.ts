import type { Project, Activity, Note, Attachment, TeamMember } from '../types';

const BASE_URL = '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  if (res.status === 204) {
    return undefined as unknown as T;
  }
  return res.json();
}

// Projects
export function getProjects(): Promise<Project[]> {
  return request<Project[]>('/api/projects');
}

export function createProject(data: { name: string; description?: string }): Promise<Project> {
  return request<Project>('/api/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateProject(id: number, data: { name: string; description?: string }): Promise<Project> {
  return request<Project>(`/api/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteProject(id: number): Promise<void> {
  return request<void>(`/api/projects/${id}`, { method: 'DELETE' });
}

// Activities
export function getActivities(projectId: number): Promise<Activity[]> {
  return request<Activity[]>(`/api/projects/${projectId}/activities`);
}

export function createActivity(
  projectId: number,
  data: {
    code: string;
    title: string;
    assigneeId?: number;
    deadline?: string;
    status?: string;
  }
): Promise<Activity> {
  return request<Activity>(`/api/projects/${projectId}/activities`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateActivity(
  id: number,
  data: {
    code?: string;
    title?: string;
    assigneeId?: number | null;
    deadline?: string | null;
    status?: string;
  }
): Promise<Activity> {
  return request<Activity>(`/api/activities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteActivity(id: number): Promise<void> {
  return request<void>(`/api/activities/${id}`, { method: 'DELETE' });
}

// Notes
export function getNotes(activityId: number): Promise<Note[]> {
  return request<Note[]>(`/api/activities/${activityId}/notes`);
}

export function createNote(activityId: number, content: string): Promise<Note> {
  return request<Note>(`/api/activities/${activityId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export function deleteNote(id: number): Promise<void> {
  return request<void>(`/api/notes/${id}`, { method: 'DELETE' });
}

// Attachments
export function getActivityAttachments(activityId: number): Promise<Attachment[]> {
  return request<Attachment[]>(`/api/activities/${activityId}/attachments`);
}

export async function uploadActivityAttachment(activityId: number, file: File): Promise<Attachment> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${BASE_URL}/api/upload/activity/${activityId}`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

export async function uploadNoteAttachment(noteId: number, file: File): Promise<Attachment> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${BASE_URL}/api/upload/note/${noteId}`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

export function downloadAttachmentUrl(id: number): string {
  return `${BASE_URL}/api/attachments/${id}/download`;
}

export function deleteAttachment(id: number): Promise<void> {
  return request<void>(`/api/attachments/${id}`, { method: 'DELETE' });
}

// Team
export function getTeam(): Promise<TeamMember[]> {
  return request<TeamMember[]>('/api/team');
}

export function createTeamMember(data: { name: string; role?: string }): Promise<TeamMember> {
  return request<TeamMember>('/api/team', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateTeamMember(id: number, data: { name: string; role?: string }): Promise<TeamMember> {
  return request<TeamMember>(`/api/team/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteTeamMember(id: number): Promise<void> {
  return request<void>(`/api/team/${id}`, { method: 'DELETE' });
}
