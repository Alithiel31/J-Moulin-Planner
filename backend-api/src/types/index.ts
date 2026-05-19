export type UserRole = 'admin' | 'teamlead' | 'teammate';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface AuthPayload {
  userId: string;
  username: string;
  role: UserRole;
}
