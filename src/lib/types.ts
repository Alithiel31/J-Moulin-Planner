// src/lib/types.ts

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'teamlead' | 'teammate';
  teamId?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: string;
  startDate?: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  createdById: string;
  createdBy: { id: string; username: string };
  teamId?: string;
  team?: { id: string; name: string };
  assignees: { userId: string; user: { id: string; username: string } }[];
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  leadId: string;
  lead: User;
  members: User[];
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}
