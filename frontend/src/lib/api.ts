import axios from 'axios';
import type { AxiosError } from 'axios';

// VITE_API_URL doit inclure /api (ex. https://planner.mondomaine.fr/api).
// Fallback '/api' : en dev le proxy Vite route vers localhost:3000,
// en prod derrière nginx le reverse proxy route vers le backend.
const apiBaseURL = import.meta.env.VITE_API_URL || '/api';

const TOKEN_KEY = 'auth_token';

const api = axios.create({
	baseURL: apiBaseURL,
	headers: { 'Content-Type': 'application/json' }
});

// Bearer token sur chaque requête (en complément du cookie httpOnly)
api.interceptors.request.use((config) => {
	if (typeof window !== 'undefined') {
		const token = localStorage.getItem(TOKEN_KEY);
		if (token) config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// Persiste automatiquement le token renvoyé par login/signup,
// purge le token sur 401
api.interceptors.response.use(
	(response) => {
		const token = (response.data as any)?.data?.token;
		if (typeof window !== 'undefined' && typeof token === 'string' && token.length > 0) {
			localStorage.setItem(TOKEN_KEY, token);
		}
		return response;
	},
	(error: AxiosError) => {
		if (typeof window !== 'undefined' && error.response?.status === 401) {
			localStorage.removeItem(TOKEN_KEY);
		}
		return Promise.reject(error);
	}
);

export default api;
