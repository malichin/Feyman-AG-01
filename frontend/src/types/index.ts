export interface Project {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  _count?: { activities: number };
}

export interface TeamMember {
  id: number;
  name: string;
  role?: string;
}

export interface Activity {
  id: number;
  code: string;
  title: string;
  projectId: number;
  assigneeId?: number;
  assignee?: TeamMember;
  deadline?: string;
  status: 'todo' | 'in_progress' | 'done';
  createdAt: string;
  updatedAt: string;
  _count?: { notes: number; attachments: number };
}

export interface Note {
  id: number;
  activityId: number;
  content: string;
  createdAt: string;
  attachments: Attachment[];
}

export interface Attachment {
  id: number;
  filename: string;
  size: number;
  mimeType: string;
  createdAt: string;
}
