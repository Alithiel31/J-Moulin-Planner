<script lang="ts">
	import { Loader2 } from 'lucide-svelte';
	import { t, locale, type Locale } from '$lib/i18n.js';
	import api from '$lib/api.js';
	import { auth } from '$lib/auth.svelte.js';
	import { goto } from '$app/navigation';

	let username = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');

	function toggleLang() {
		locale.update((l: Locale) => (l === 'fr' ? 'en' : 'fr'));
	}

	async function login() {
		if (!username.trim() || !password) return;
		loading = true;
		error = '';
		try {
			const res = await api.post('/auth/login', { username: username.trim(), password });
			auth.user = res.data.data.user;
			goto('/');
		} catch {
			error = $t('auth.login_error');
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>J-Moulin Planner – {$t('auth.login')}</title>
</svelte:head>

<div
	class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4"
>
	<!-- Language toggle -->
	<button
		onclick={toggleLang}
		class="absolute top-4 right-4 px-3 py-1.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
		aria-label="Changer la langue / Change language"
	>
		{$locale === 'fr' ? 'EN' : 'FR'}
	</button>

	<div class="w-full max-w-sm">
		<!-- Logo area -->
		<div class="text-center mb-8">
			<div
				class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4"
				aria-hidden="true"
			>
				<span class="text-2xl font-bold text-white">JM</span>
			</div>
			<h1 class="text-2xl font-bold text-white">J-Moulin Planner</h1>
			<p class="text-slate-400 text-sm mt-1">{$t('auth.subtitle')}</p>
		</div>

		<!-- Card -->
		<div class="card p-6">
			<h2 class="text-lg font-semibold text-slate-900 mb-5">{$t('auth.login')}</h2>

			{#if error}
				<div
					class="mb-4 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm"
					role="alert"
				>
					{error}
				</div>
			{/if}

			<form
				onsubmit={(e) => {
					e.preventDefault();
					login();
				}}
				class="space-y-4"
			>
				<div>
					<label class="label" for="username">{$t('auth.username')}</label>
					<input
						id="username"
						class="input"
						type="text"
						bind:value={username}
						autocomplete="username"
						required
					/>
				</div>

				<div>
					<label class="label" for="password">{$t('auth.password')}</label>
					<input
						id="password"
						class="input"
						type="password"
						bind:value={password}
						autocomplete="current-password"
						required
					/>
				</div>

				<button type="submit" class="btn-primary w-full justify-center mt-2" disabled={loading}>
					{#if loading}
						<Loader2 size={16} class="animate-spin" aria-hidden="true" />
					{/if}
					{$t('auth.login_button')}
				</button>
			</form>
		</div>
	</div>
</div>
