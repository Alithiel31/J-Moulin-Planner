import { writable, derived } from 'svelte/store';
import { api, type Task } from '../api';

interface TasksStore {
  items: Task[];
  isLoading: boolean;
  error: string | null;
  filters: {
    teamId?: string;
    status?: string;
    assignedTo?: string;
  };
}

function createTasksStore() {
  const { subscribe, set, update } = writable<TasksStore>({
    items: [],
    isLoading: false,
    error: null,
    filters: {},
  });

  return {
    subscribe,

    async load(filters?: { teamId?: string; status?: string; assignedTo?: string }) {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        const items = await api.getTasks(filters || {});
        update((state) => ({
          ...state,
          items,
          isLoading: false,
          filters: filters || {},
        }));
        return items;
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to load tasks';
        update((state) => ({
          ...state,
          error: errorMsg,
          isLoading: false,
        }));
        throw error;
      }
    },

    async create(data: Partial<Task>) {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        const task = await api.createTask(data);
        update((state) => ({
          ...state,
          items: [...state.items, task],
          isLoading: false,
        }));
        return task;
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to create task';
        update((state) => ({
          ...state,
          error: errorMsg,
          isLoading: false,
        }));
        throw error;
      }
    },

    async update(id: string, data: Partial<Task>) {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        const task = await api.updateTask(id, data);
        update((state) => ({
          ...state,
          items: state.items.map((t) => (t.id === id ? task : t)),
          isLoading: false,
        }));
        return task;
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to update task';
        update((state) => ({
          ...state,
          error: errorMsg,
          isLoading: false,
        }));
        throw error;
      }
    },

    async delete(id: string) {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        await api.deleteTask(id);
        update((state) => ({
          ...state,
          items: state.items.filter((t) => t.id !== id),
          isLoading: false,
        }));
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to delete task';
        update((state) => ({
          ...state,
          error: errorMsg,
          isLoading: false,
        }));
        throw error;
      }
    },

    setFilters(filters: { teamId?: string; status?: string; assignedTo?: string }) {
      update((state) => ({
        ...state,
        filters,
      }));
    },

    clearError() {
      update((state) => ({ ...state, error: null }));
    },
  };
}

export const tasks = createTasksStore();

// Derived stores
export const taskItems = derived(tasks, ($tasks) => $tasks.items);
export const tasksIsLoading = derived(tasks, ($tasks) => $tasks.isLoading);
export const tasksError = derived(tasks, ($tasks) => $tasks.error);
export const tasksFilters = derived(tasks, ($tasks) => $tasks.filters);

// Filtered tasks by status
export const todoTasks = derived(tasks, ($tasks) =>
  $tasks.items.filter((t) => t.status === 'todo')
);
export const inProgressTasks = derived(tasks, ($tasks) =>
  $tasks.items.filter((t) => t.status === 'in_progress')
);
export const doneTasks = derived(tasks, ($tasks) =>
  $tasks.items.filter((t) => t.status === 'done')
);

// High priority tasks
export const highPriorityTasks = derived(tasks, ($tasks) =>
  $tasks.items.filter((t) => t.priority === 'high')
);

// Tasks by deadline
export const upcomingTasks = derived(tasks, ($tasks) => {
  const now = new Date();
  const upcoming = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

  return $tasks.items.filter((t) => {
    const deadline = new Date(t.deadline);
    return deadline > now && deadline <= upcoming;
  });
});
