import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			manifest: {
				name: 'J-Moulin Planner',
				short_name: 'J-Moulin',
				description: 'Planificateur collaboratif J.Moulin — tâches, équipes et événements',
				lang: 'fr-FR',
				start_url: '/',
				display: 'standalone',
				background_color: '#0f172a',
				theme_color: '#2563eb',
				icons: [
					{ src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
					{ src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
					{
						src: 'icons/icon-512-maskable.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable',
					},
				],
			},
			workbox: {
				runtimeCaching: [
					{
						urlPattern: ({ url }) => url.pathname.startsWith('/api'),
						handler: 'NetworkFirst',
						options: {
							cacheName: 'api-cache',
							networkTimeoutSeconds: 5,
							expiration: { maxEntries: 50, maxAgeSeconds: 60 * 10 },
						},
					},
				],
			},
		}),
	],
	server: {
		proxy: {
			'/api': {
				target: 'http://localhost:3000',
				changeOrigin: true,
			},
		},
	},
});
