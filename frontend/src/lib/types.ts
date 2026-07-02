export type Role = 'admin' | 'teamlead' | 'teammate';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface User {
	id: string;
	username: string;
	email: string;
	role: Role;
	teamId: string | null;
	createdAt: string;
}

export interface Team {
	id: string;
	name: string;
	leadId: string;
	lead?: User;
	members?: User[];
	tasks?: Task[];
	_count?: { members: number; tasks: number };
	createdAt: string;
}

export interface Task {
	id: string;
	title: string;
	description?: string;
	category?: string;
	status: TaskStatus;
	priority: TaskPriority;
	startDate?: string;
	deadline?: string;
	teamId: string;
	team?: Team;
	assignees?: { user: User }[];
	createdAt: string;
}

export interface Event {
	id: string;
	title: string;
	description?: string;
	startDate: string;
	endDate: string;
	location?: string;
	teamId?: string | null;
	team?: Team;
	createdAt: string;
}

export interface Comment {
	id: string;
	content: string;
	taskId: string;
	userId: string;
	user?: User;
	createdAt: string;
}

export interface ActivityLog {
	id: string;
	action: string;
	entityType: string;
	entityId: string;
	userId: string;
	user?: User;
	details?: string;
	createdAt: string;
}

export interface ApiResponse<T> {
	data: T;
	message?: string;
}
