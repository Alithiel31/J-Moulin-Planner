<script lang="ts">
	import { onMount } from 'svelte';
	import { Plus, Pencil, Trash2, CalendarDays, Loader2, AlertTriangle, X } from 'lucide-svelte';
	import { t } from '$lib/i18n.js';
	import api from '$lib/api.js';
	import { auth } from '$lib/auth.svelte.js';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import type { Event } from '$lib/types.js';

	let events = $state<Event[]>([]);
	let loading = $state(true);
	let error = $state('');
	let deleteEvent = $state<Event | null>(null);

	let formOpen = $state(false);
	let editingEvent = $state<Event | null>(null);
	let formTitle = $state('');
	let formDescription = $state('');
	let formStart = $state('');
	let formEnd = $state('');
	let formLoading = $state(false);
	let formError = $state('');

	const now = new Date();
	const upcoming = $derived(
		events
			.filter((e) => new Date(e.startDate) >= now)
			.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
	);
	const past = $derived(
		events
			.filter((e) => new Date(e.startDate) < now)
			.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
	);

	function formatDate(iso: string): string {
		const locale = $t('common.all') === 'All' ? 'en-GB' : 'fr-FR';
		return new Date(iso).toLocaleDateString(locale, {
			weekday: 'short',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

	function openCreate() {
		editingEvent = null;
		formTitle = '';
		formDescription = '';
		formStart = '';
		formEnd = '';
		formError = '';
		formOpen = true;
	}

	function openEdit(event: Event) {
		editingEvent = event;
		formTitle = event.title;
		formDescription = event.description ?? '';
		formStart = event.startDate.slice(0, 16);
		formEnd = event.endDate?.slice(0, 16) ?? '';
		formError = '';
		formOpen = true;
	}

	async function submitForm() {
		if (!formTitle.trim() || !formStart) {
			formError = $t('common.required');
			return;
		}
		formLoading = true;
		formError = '';
		try {
			const payload = {
				title: formTitle.trim(),
				description: formDescription || undefined,
				startDate: new Date(formStart).toISOString(),
				endDate: formEnd ? new Date(formEnd).toISOString() : undefined
			};
			if (editingEvent) {
				await api.patch(`/events/${editingEvent.id}`, payload);
			} else {
				await api.post('/events', payload);
			}
			formOpen = false;
			await loadData();
		} catch (e: unknown) {
			const err = e as { response?: { data?: { message?: string } } };
			formError = err.response?.data?.message ?? $t('common.error');
		} finally {
			formLoading = false;
		}
	}

	async function confirmDelete() {
		if (!deleteEvent) return;
		try {
			await api.delete(`/events/${deleteEvent.id}`);
			events = events.filter((e) => e.id !== deleteEvent!.id);
		} catch {
			error = $t('common.error');
		} finally {
			deleteEvent = null;
		}
	}

	async function loadData() {
		const res = await api.get('/events');
		events = res.data.data;
	}

	onMount(async () => {
		try {
			await loadData();
		} catch {
			error = $t('common.error');
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>J-Moulin Planner – {$t('events.title')}</title>
</svelte:head>

<div class="p-6 max-w-4xl mx-auto">
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-bold text-slate-900">{$t('events.title')}</h1>
		{#if auth.isAdmin}
			<button class="btn-primary" onclick={openCreate}>
				<Plus size={16} aria-hidden="true" />
				{$t('events.new')}
			</button>
		{/if}
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
	{:else if events.length === 0}
		<div class="text-center py-16">
			<CalendarDays size={40} class="mx-auto text-slate-300 mb-3" aria-hidden="true" />
			<p class="text-slate-400">{$t('events.no_events')}</p>
		</div>
	{:else}
		{#if upcoming.length > 0}
			<section aria-labelledby="upcoming-heading" class="mb-8">
				<h2 id="upcoming-heading" class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
					{$t('dashboard.upcoming_events')}
				</h2>
				<div class="space-y-2">
					{#each upcoming as event}
						<article class="card p-4 border-l-4 border-l-blue-400 flex items-start gap-4">
							<div class="flex-shrink-0 text-center w-12">
								<div class="text-xl font-bold text-blue-700 leading-none">
									{new Date(event.startDate).getDate()}
								</div>
								<div class="text-xs text-slate-500 uppercase">
									{new Date(event.startDate).toLocaleDateString($t('common.all') === 'All' ? 'en-GB' : 'fr-FR', { month: 'short' })}
								</div>
							</div>

							<div class="flex-1 min-w-0">
								<h3 class="font-semibold text-slate-900">{event.title}</h3>
								<p class="text-xs text-slate-500 mt-0.5">{formatDate(event.startDate)}</p>
								{#if event.description}
									<p class="text-sm text-slate-600 mt-1">{event.description}</p>
								{/if}
							</div>

							{#if auth.isAdmin}
								<div class="flex items-center gap-1 shrink-0">
									<button
										class="btn-ghost p-1.5 rounded"
										onclick={() => openEdit(event)}
										aria-label="{$t('events.edit')} {event.title}"
									>
										<Pencil size={15} />
									</button>
									<button
										class="btn-ghost p-1.5 rounded hover:text-rose-600"
										onclick={() => (deleteEvent = event)}
										aria-label="{$t('events.delete')} {event.title}"
									>
										<Trash2 size={15} />
									</button>
								</div>
							{/if}
						</article>
					{/each}
				</div>
			</section>
		{/if}

		{#if past.length > 0}
			<section aria-labelledby="past-heading">
				<h2 id="past-heading" class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
					Passés
				</h2>
				<div class="space-y-2 opacity-70">
					{#each past as event}
						<article class="card p-4 flex items-start gap-4">
							<div class="flex-shrink-0 text-center w-12">
								<div class="text-xl font-bold text-slate-400 leading-none">
									{new Date(event.startDate).getDate()}
								</div>
								<div class="text-xs text-slate-400 uppercase">
									{new Date(event.startDate).toLocaleDateString($t('common.all') === 'All' ? 'en-GB' : 'fr-FR', { month: 'short' })}
								</div>
							</div>

							<div class="flex-1 min-w-0">
								<h3 class="font-semibold text-slate-600">{event.title}</h3>
								<p class="text-xs text-slate-400 mt-0.5">{formatDate(event.startDate)}</p>
								{#if event.description}
									<p class="text-sm text-slate-500 mt-1">{event.description}</p>
								{/if}
							</div>

							{#if auth.isAdmin}
								<div class="flex items-center gap-1 shrink-0">
									<button
										class="btn-ghost p-1.5 rounded"
										onclick={() => openEdit(event)}
										aria-label="{$t('events.edit')} {event.title}"
									>
										<Pencil size={15} />
									</button>
									<button
										class="btn-ghost p-1.5 rounded hover:text-rose-600"
										onclick={() => (deleteEvent = event)}
										aria-label="{$t('events.delete')} {event.title}"
									>
										<Trash2 size={15} />
									</button>
								</div>
							{/if}
						</article>
					{/each}
				</div>
			</section>
		{/if}
	{/if}
</div>

<!-- Event form modal -->
{#if formOpen}
	<div
		class="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby="event-modal-title"
	>
		<div class="card w-full max-w-md p-6">
			<div class="flex items-center justify-between mb-5">
				<h2 id="event-modal-title" class="text-base font-semibold text-slate-900">
					{editingEvent ? $t('events.edit') : $t('events.new')}
				</h2>
				<button class="btn-ghost p-1 rounded" onclick={() => (formOpen = false)} aria-label={$t('common.cancel')}>
					<X size={18} />
				</button>
			</div>

			{#if formError}
				<div class="mb-4 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm" role="alert">
					{formError}
				</div>
			{/if}

			<form onsubmit={(e) => { e.preventDefault(); submitForm(); }} class="space-y-4">
				<div>
					<label class="label" for="event-title">
						{$t('common.title_field')} <span class="text-rose-500" aria-hidden="true">*</span>
					</label>
					<input id="event-title" class="input" type="text" bind:value={formTitle} required />
				</div>

				<div>
					<label class="label" for="event-desc">
						{$t('events.description')}
						<span class="text-slate-400 font-normal">({$t('common.optional')})</span>
					</label>
					<textarea id="event-desc" class="input resize-none" rows="2" bind:value={formDescription}></textarea>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="label" for="event-start">
							{$t('events.start')} <span class="text-rose-500" aria-hidden="true">*</span>
						</label>
						<input id="event-start" class="input" type="datetime-local" bind:value={formStart} required />
					</div>
					<div>
						<label class="label" for="event-end">
							{$t('events.end')}
							<span class="text-slate-400 font-normal">({$t('common.optional')})</span>
						</label>
						<input id="event-end" class="input" type="datetime-local" bind:value={formEnd} />
					</div>
				</div>

				<div class="flex justify-end gap-2 pt-2">
					<button type="button" class="btn-secondary" onclick={() => (formOpen = false)}>
						{$t('common.cancel')}
					</button>
					<button type="submit" class="btn-primary" disabled={formLoading}>
						{#if formLoading}
							<Loader2 size={16} class="animate-spin" aria-hidden="true" />
						{/if}
						{$t('common.save')}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<ConfirmModal
	open={!!deleteEvent}
	onconfirm={confirmDelete}
	oncancel={() => (deleteEvent = null)}
/>
