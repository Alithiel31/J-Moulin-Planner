import type { User } from './types.js';
import api from './api.js';

class AuthStore {
	user: User | null = $state(null);
	loading: boolean = $state(true);

	async init(): Promise<void> {
		try {
			const res = await api.get('/auth/me');
			this.user = res.data.data;
		} catch {
			this.user = null;
		} finally {
			this.loading = false;
		}
	}

	async logout(): Promise<void> {
		try {
			await api.post('/auth/logout');
		} catch {
			// ignore
		}
		this.user = null;
		if (typeof window !== 'undefined') window.location.href = '/login';
	}

	get isAdmin(): boolean {
		return this.user?.role === 'admin';
	}

	get isTeamLead(): boolean {
		return this.user?.role === 'admin' || this.user?.role === 'teamlead';
	}

	get isAuthenticated(): boolean {
		return this.user !== null;
	}
}

export const auth = new AuthStore();
