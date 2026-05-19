<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Loader2 } from 'lucide-svelte';
	import { auth } from '$lib/auth.svelte.js';
	import Sidebar from '$lib/components/Sidebar.svelte';

	const { children } = $props();

	onMount(async () => {
		await auth.init();
	});

	$effect(() => {
		if (!auth.loading) {
			const isLogin = $page.url.pathname === '/login';
			if (!auth.user && !isLogin) {
				goto('/login');
			} else if (auth.user && isLogin) {
				goto('/');
			}
		}
	});

	const isLoginPage = $derived($page.url.pathname === '/login');
</script>

{#if auth.loading}
	<div class="min-h-screen flex items-center justify-center bg-slate-50">
		<Loader2 size={32} class="animate-spin text-blue-600" aria-label="Chargement" />
	</div>
{:else if isLoginPage}
	{@render children()}
{:else if auth.user}
	<div class="flex h-screen bg-slate-50">
		<Sidebar />
		<main class="flex-1 overflow-auto focus:outline-none" tabindex="-1">
			{@render children()}
		</main>
	</div>
{:else}
	<div class="min-h-screen flex items-center justify-center bg-slate-50">
		<Loader2 size={32} class="animate-spin text-blue-600" aria-label="Redirection" />
	</div>
{/if}
