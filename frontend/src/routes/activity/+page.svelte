<script lang="ts">
	import { onMount } from 'svelte';
	import { Activity, Loader2, AlertTriangle } from 'lucide-svelte';
	import { t } from '$lib/i18n.js';
	import api from '$lib/api.js';
	import { auth } from '$lib/auth.svelte.js';
	import { goto } from '$app/navigation';
	import type { ActivityLog } from '$lib/types.js';

	let logs = $state<ActivityLog[]>([]);
	let loading = $state(true);
	let error = $state('');

	function formatDate(iso: string): string {
		const locale = $t('common.all') === 'All' ? 'en-GB' : 'fr-FR';
		return new Date(iso).toLocaleString(locale, {
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function actionColor(action: string): string {
		if (action.includes('creat') || action.includes('add')) return 'bg-teal-100 text-teal-800 border-teal-200';
		if (action.includes('delet') || action.includes('remov')) return 'bg-rose-100 text-rose-800 border-rose-200';
		if (action.includes('updat') || action.includes('edit') || action.includes('modif')) return 'bg-amber-100 text-amber-800 border-amber-200';
		return 'bg-slate-100 text-slate-700 border-slate-200';
	}

	onMount(async () => {
		if (!auth.isAdmin) {
			goto('/');
			return;
		}
		try {
			const res = await api.get('/activity-logs');
			logs = res.data.data.logs;
		} catch {
			error = $t('common.error');
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>J-Moulin Planner – {$t('nav.activity')}</title>
</svelte:head>

<div class="p-6 max-w-4xl mx-auto">
	<div class="flex items-center gap-3 mb-6">
		<Activity size={24} class="text-slate-600" aria-hidden="true" />
		<h1 class="text-2xl font-bold text-slate-900">{$t('nav.activity')}</h1>
	</div>

	{#if loading}
		<div class="flex items-center gap-2 text-slate-500">
			<Loader2 size={20} class="animate-spin" aria-hidden="true" />
			{$t('common.loading')}
		</div>
	{:else if error}
		<div class="flex items-center gap-2 text-rose-600" role="alert">
			<AlertTriangle size={18} aria-hidden="true" />
			{error}
		</div>
	{:else if logs.length === 0}
		<p class="text-slate-400">{$t('common.no_data')}</p>
	{:else}
		<div class="card overflow-hidden">
			<ul aria-label={$t('nav.activity')}>
				{#each logs as log, i}
					<li class="flex items-start gap-4 px-4 py-3 {i !== logs.length - 1 ? 'border-b border-slate-100' : ''}">
						<!-- Timeline dot -->
						<div class="flex flex-col items-center shrink-0 mt-1">
							<div class="w-2 h-2 rounded-full bg-blue-400" aria-hidden="true"></div>
						</div>

						<div class="flex-1 min-w-0">
							<div class="flex flex-wrap items-center gap-2">
								<!-- Action badge (color + text, never color alone) -->
								<span class="badge {actionColor(log.action)}">{log.action}</span>
								<span class="text-xs text-slate-500 capitalize">{log.entityType}</span>
								{#if log.user}
									<span class="text-xs font-medium text-slate-700">par {log.user.username}</span>
								{/if}
							</div>
							{#if log.details}
								<p class="text-xs text-slate-500 mt-1 truncate">{log.details}</p>
							{/if}
						</div>

						<time class="text-xs text-slate-400 shrink-0" datetime={log.createdAt}>
							{formatDate(log.createdAt)}
						</time>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
