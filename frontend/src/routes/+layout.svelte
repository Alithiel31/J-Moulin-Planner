<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Loader2 } from 'lucide-svelte';
	import { auth } from '$lib/auth.svelte.js';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import { pwaInfo } from 'virtual:pwa-info';

	let { children } = $props();

	const isLoginPage = $derived($page.url.pathname === '/login');
	const webManifestLink = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');

	onMount(async () => {
		auth.init();
		if (pwaInfo) {
			const { registerSW } = await import('virtual:pwa-register');
			registerSW({ immediate: true });
		}
	});

	$effect(() => {
		if (!auth.loading && !auth.isAuthenticated && !isLoginPage) {
			goto('/login');
		}
	});
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html webManifestLink}
</svelte:head>

{#if auth.loading}
	<div class="min-h-screen flex items-center justify-center bg-slate-50">
		<Loader2 class="animate-spin text-slate-400" size={32} />
	</div>
{:else if isLoginPage}
	{@render children()}
{:else if auth.isAuthenticated}
	<div class="flex min-h-screen bg-slate-50">
		<Sidebar />
		<main class="flex-1 px-4 py-6 pb-24 md:px-6 md:py-8 md:pb-8">
			{@render children()}
		</main>
	</div>
	<BottomNav />
{/if}
