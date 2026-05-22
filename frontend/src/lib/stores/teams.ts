import { writable, derived } from 'svelte/store';
import { api, type Team } from '../api';

interface TeamsStore {
  items: Team[];
  activeTeamId: string | null;
  isLoading: boolean;
  error: string | null;
}

function createTeamsStore() {
  const { subscribe, set, update } = writable<TeamsStore>({
    items: [],
    activeTeamId: null,
    isLoading: false,
    error: null,
  });

  return {
    subscribe,

    async load() {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        const items = await api.getTeams();
        update((state) => ({
          ...state,
          items,
          isLoading: false,
          // Set first team as active if none selected
          activeTeamId: state.activeTeamId || items[0]?.id || null,
        }));
        return items;
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to load teams';
        update((state) => ({
          ...state,
          error: errorMsg,
          isLoading: false,
        }));
        throw error;
      }
    },

    async create(name: string) {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        const team = await api.createTeam({ name });
        update((state) => ({
          ...state,
          items: [...state.items, team],
          isLoading: false,
        }));
        return team;
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to create team';
        update((state) => ({
          ...state,
          error: errorMsg,
          isLoading: false,
        }));
        throw error;
      }
    },

    async update(id: string, data: Partial<Team>) {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        const team = await api.updateTeam(id, data);
        update((state) => ({
          ...state,
          items: state.items.map((t) => (t.id === id ? team : t)),
          isLoading: false,
        }));
        return team;
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to update team';
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
        await api.deleteTeam(id);
        update((state) => {
          const newItems = state.items.filter((t) => t.id !== id);
          return {
            ...state,
            items: newItems,
            activeTeamId:
              state.activeTeamId === id ? (newItems[0]?.id || null) : state.activeTeamId,
            isLoading: false,
          };
        });
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to delete team';
        update((state) => ({
          ...state,
          error: errorMsg,
          isLoading: false,
        }));
        throw error;
      }
    },

    setActiveTeam(teamId: string | null) {
      update((state) => ({
        ...state,
        activeTeamId: teamId,
      }));
    },

    clearError() {
      update((state) => ({ ...state, error: null }));
    },
  };
}

export const teams = createTeamsStore();

// Derived stores
export const teamItems = derived(teams, ($teams) => $teams.items);
export const teamsIsLoading = derived(teams, ($teams) => $teams.isLoading);
export const teamsError = derived(teams, ($teams) => $teams.error);
export const activeTeamId = derived(teams, ($teams) => $teams.activeTeamId);

export const activeTeam = derived(teams, ($teams) => {
  if (!$teams.activeTeamId) return null;
  return $teams.items.find((t) => t.id === $teams.activeTeamId) || null;
});
