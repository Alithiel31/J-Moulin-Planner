import { writable, derived } from 'svelte/store';
import { api, type User, type AuthResponse } from '../api';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthStore>({
    user: null,
    isLoading: false,
    error: null,
  });

  return {
    subscribe,

    async init() {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        const user = await api.getCurrentUser();
        update((state) => ({ ...state, user, isLoading: false }));
        return user;
      } catch (error: any) {
        // No user logged in - this is expected on first load
        update((state) => ({ ...state, isLoading: false }));
        return null;
      }
    },

    async login(username: string, password: string) {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        const response = await api.login(username, password);
        update((state) => ({
          ...state,
          user: response.user,
          isLoading: false,
        }));
        return response.user;
      } catch (error: any) {
        const errorMsg = error.message || 'Login failed';
        update((state) => ({
          ...state,
          error: errorMsg,
          isLoading: false,
        }));
        throw error;
      }
    },

    async signup(username: string, password: string) {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        const response = await api.signup(username, password);
        update((state) => ({
          ...state,
          user: response.user,
          isLoading: false,
        }));
        return response.user;
      } catch (error: any) {
        const errorMsg = error.message || 'Signup failed';
        update((state) => ({
          ...state,
          error: errorMsg,
          isLoading: false,
        }));
        throw error;
      }
    },

    async logout() {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        await api.logout();
        set({
          user: null,
          isLoading: false,
          error: null,
        });
      } catch (error: any) {
        const errorMsg = error.message || 'Logout failed';
        update((state) => ({
          ...state,
          error: errorMsg,
          isLoading: false,
        }));
        throw error;
      }
    },

    clearError() {
      update((state) => ({ ...state, error: null }));
    },
  };
}

export const auth = createAuthStore();

// Derived stores
export const isAuthenticated = derived(auth, ($auth) => $auth.user !== null);
export const currentUser = derived(auth, ($auth) => $auth.user);
export const authError = derived(auth, ($auth) => $auth.error);
export const authIsLoading = derived(auth, ($auth) => $auth.isLoading);
