import axios, { AxiosInstance, AxiosError } from 'axios';

// ============ TYPES ============

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'teamlead' | 'teammate';
  teamId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  leadId: string;
  lead?: User;
  members?: User[];
  createdAt: string;
  updatedAt: string;
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
  createdBy?: User;
  teamId?: string;
  team?: Team;
  assignees?: TaskAssignee[];
  comments?: Comment[];
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskAssignee {
  id: string;
  taskId: string;
  userId: string;
  user?: User;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  createdById: string;
  createdBy?: User;
  teamId?: string;
  team?: Team;
  attendees?: EventAttendee[];
  createdAt: string;
  updatedAt: string;
}

export interface EventAttendee {
  id: string;
  eventId: string;
  userId: string;
  user?: User;
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  author?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  fileName: string;
  mimeType: string;
  size: number;
  taskId: string;
  uploadedById: string;
  uploadedBy?: User;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  user?: User;
  taskId?: string;
  task?: Task;
  teamId?: string;
  team?: Team;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// ============ API CLIENT ============

class APIClient {
  private axiosInstance: AxiosInstance;
  private tokenKey = 'auth_token';

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Attach the stored Bearer token to every request
    this.axiosInstance.interceptors.request.use((config) => {
      const t = this.getToken();
      if (t) {
        config.headers.Authorization = `Bearer ${t}`;
      }
      return config;
    });

    // Handle 401 globally
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearToken();
        }
        return Promise.reject(this.formatError(error));
      }
    );
  }

  private formatError(error: AxiosError): ApiError {
    return {
      message: (error.response?.data as any)?.message || error.message,
      status: error.response?.status || 500,
      code: (error.response?.data as any)?.code,
    };
  }

  // Backend wraps every successful response as { success: true, data: { ... } }.
  // This helper unwraps that envelope.
  private unwrap<T>(response: { data: { data: T } }): T {
    return response.data.data;
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  private clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
    }
  }

  // ============ AUTH ENDPOINTS ============
  // VITE_API_URL already ends with /api, so paths here omit the /api prefix.

  async signup(username: string, password: string): Promise<AuthResponse> {
    const response = await this.axiosInstance.post('/auth/signup', { username, password });
    const data = this.unwrap<{ user: User; token: string }>(response);
    this.setToken(data.token);
    return data;
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await this.axiosInstance.post('/auth/login', { username, password });
    const data = this.unwrap<{ user: User; token: string }>(response);
    this.setToken(data.token);
    return data;
  }

  async logout(): Promise<void> {
    try {
      await this.axiosInstance.post('/auth/logout');
    } finally {
      this.clearToken();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.axiosInstance.get('/auth/me');
    return this.unwrap<{ user: User }>(response).user;
  }

  // ============ TASKS ENDPOINTS ============

  async getTasks(filters?: { teamId?: string; status?: string; assignedTo?: string }): Promise<Task[]> {
    const response = await this.axiosInstance.get('/tasks', { params: filters });
    return this.unwrap<{ tasks: Task[] }>(response).tasks;
  }

  async getTask(id: string): Promise<Task> {
    const response = await this.axiosInstance.get(`/tasks/${id}`);
    return this.unwrap<{ task: Task }>(response).task;
  }

  async createTask(data: Partial<Task>): Promise<Task> {
    const response = await this.axiosInstance.post('/tasks', data);
    return this.unwrap<{ task: Task }>(response).task;
  }

  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    const response = await this.axiosInstance.put(`/tasks/${id}`, data);
    return this.unwrap<{ task: Task }>(response).task;
  }

  async deleteTask(id: string): Promise<void> {
    await this.axiosInstance.delete(`/tasks/${id}`);
  }

  // ============ EVENTS ENDPOINTS ============

  async getEvents(filters?: { teamId?: string }): Promise<Event[]> {
    const response = await this.axiosInstance.get('/events', { params: filters });
    return this.unwrap<{ events: Event[] }>(response).events;
  }

  async getEvent(id: string): Promise<Event> {
    const response = await this.axiosInstance.get(`/events/${id}`);
    return this.unwrap<{ event: Event }>(response).event;
  }

  async createEvent(data: Partial<Event>): Promise<Event> {
    const response = await this.axiosInstance.post('/events', data);
    return this.unwrap<{ event: Event }>(response).event;
  }

  async updateEvent(id: string, data: Partial<Event>): Promise<Event> {
    const response = await this.axiosInstance.put(`/events/${id}`, data);
    return this.unwrap<{ event: Event }>(response).event;
  }

  async deleteEvent(id: string): Promise<void> {
    await this.axiosInstance.delete(`/events/${id}`);
  }

  // ============ TEAMS ENDPOINTS ============

  async getTeams(): Promise<Team[]> {
    const response = await this.axiosInstance.get('/teams');
    return this.unwrap<{ teams: Team[] }>(response).teams;
  }

  async getTeam(id: string): Promise<Team> {
    const response = await this.axiosInstance.get(`/teams/${id}`);
    return this.unwrap<{ team: Team }>(response).team;
  }

  async createTeam(data: { name: string }): Promise<Team> {
    const response = await this.axiosInstance.post('/teams', data);
    return this.unwrap<{ team: Team }>(response).team;
  }

  async updateTeam(id: string, data: Partial<Team>): Promise<Team> {
    const response = await this.axiosInstance.put(`/teams/${id}`, data);
    return this.unwrap<{ team: Team }>(response).team;
  }

  async deleteTeam(id: string): Promise<void> {
    await this.axiosInstance.delete(`/teams/${id}`);
  }

  // ============ USERS ENDPOINTS ============

  async getUsers(): Promise<User[]> {
    const response = await this.axiosInstance.get('/users');
    return this.unwrap<{ users: User[] }>(response).users;
  }

  async getUser(id: string): Promise<User> {
    const response = await this.axiosInstance.get(`/users/${id}`);
    return this.unwrap<{ user: User }>(response).user;
  }

  // ============ COMMENTS ENDPOINTS ============

  async getTaskComments(taskId: string): Promise<Comment[]> {
    const response = await this.axiosInstance.get(`/tasks/${taskId}/comments`);
    return this.unwrap<{ comments: Comment[] }>(response).comments;
  }

  async addComment(taskId: string, content: string): Promise<Comment> {
    const response = await this.axiosInstance.post(`/tasks/${taskId}/comments`, { content });
    return this.unwrap<{ comment: Comment }>(response).comment;
  }

  async deleteComment(taskId: string, commentId: string): Promise<void> {
    await this.axiosInstance.delete(`/tasks/${taskId}/comments/${commentId}`);
  }

  // ============ ATTACHMENTS ENDPOINTS ============

  async getTaskAttachments(taskId: string): Promise<Attachment[]> {
    const response = await this.axiosInstance.get(`/tasks/${taskId}/attachments`);
    return this.unwrap<{ attachments: Attachment[] }>(response).attachments;
  }

  async uploadAttachment(taskId: string, file: File): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('taskId', taskId);

    const response = await this.axiosInstance.post(
      `/tasks/${taskId}/attachments`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return this.unwrap<{ attachment: Attachment }>(response).attachment;
  }

  async deleteAttachment(taskId: string, attachmentId: string): Promise<void> {
    await this.axiosInstance.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
  }

  // ============ ACTIVITY LOGS ENDPOINTS ============
  // Note: the backend field is named "logs", not "activityLogs"

  async getActivityLogs(filters?: { teamId?: string; userId?: string }): Promise<ActivityLog[]> {
    const response = await this.axiosInstance.get('/activity-logs', { params: filters });
    return this.unwrap<{ logs: ActivityLog[] }>(response).logs;
  }
}

// ============ EXPORT SINGLETON ============
// VITE_API_URL must include /api (e.g. https://api-service.up.railway.app/api).
// The fallback for local dev also includes /api so paths in this file
// never need the /api prefix themselves.
const apiBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const api = new APIClient(apiBaseURL);
