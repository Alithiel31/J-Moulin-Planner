import { writable } from 'svelte/store';

function createAuthStore() {
  const { subscribe, set } = writable(null);

  return {
    subscribe,
    setUser: (user) => set(user),
    clear: () => set(null)
  };
}

export const auth = createAuthStore();
