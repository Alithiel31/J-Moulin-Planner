<script lang="ts">
	import { onMount } from 'svelte';
	import {
		CheckCircle2,
		Clock,
		Circle,
		Users,
		CalendarDays,
		AlertTriangle,
		Loader2,
	} from 'lucide-svelte';
	import { t } from '$lib/i18n.js';
	import api from '$lib/api.js';
	import { auth } from '$lib/auth.svelte.js';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import PriorityBadge from '$lib/components/PriorityBadge.svelte';
	import type { Task, Event, Team } from '$lib/types.js';

	let tasks = $state<Task[]>([]);
	let events = $state<Event[]>([]);
	let teams = $state<Team[]>([]);
	let loading = $state(true);
	let error = $state('');

	const todo = $derived(tasks.filter((t) => t.status === 'todo').length);
	const inProgress = $derived(tasks.filter((t) => t.status === 'in_progress').length);
	const done = $derived(tasks.filter((t) => t.status === 'done').length);
	const overdue = $derived(
		tasks.filter((t) => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done')
			.length
	);

	const recentTasks = $derived(
		[...tasks]
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
			.slice(0, 5)
	);

	const now = new Date();
	const upcomingEvents = $derived(
		events
			.filter((e) => new Date(e.startDate) >= now)
			.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
			.slice(0, 4)
	);

	function formatDate(iso: string): string {
		const locale = $t('common.all') === 'All' ? 'en-GB' : 'fr-FR';
		return new Date(iso).toLocaleDateString(locale, {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
		});
	}

	onMount(async () => {
		try {
			const [tasksRes, eventsRes, teamsRes] = await Promise.all([
				api.get('/tasks'),
				api.get('/events'),
				api.get('/teams'),
			]);
			tasks = tasksRes.data.data.tasks;
			events = eventsRes.data.data.events;
			teams = teamsRes.data.data.teams;
		} catch {
			error = $t('common.error');
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>J-Moulin Planner – {$t('dashboard.title')}</title>
</svelte:head>

<div class="p-6 max-w-7xl mx-auto">
	<h1 class="text-2xl font-bold text-slate-900 mb-1">{$t('dashboard.title')}</h1>
	<p class="text-slate-500 text-sm mb-6">
		{$t('auth.welcome')}, <strong>{auth.user?.username}</strong>
	</p>

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
	{:else}
		<!-- Stat cards -->
		<div
			class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
			role="list"
			aria-label="Statistiques"
		>
			<div class="stat-card" role="listitem">
				<span class="text-xs font-medium text-slate-500 uppercase tracking-wide"
					>{$t('dashboard.total_tasks')}</span
				>
				<span class="text-3xl font-bold text-slate-900">{tasks.length}</span>
			</div>

			<div class="stat-card border-l-4 border-l-slate-400" role="listitem">
				<span
					class="flex items-center gap-1 text-xs font-medium text-slate-500 uppercase tracking-wide"
				>
					<Circle size={12} aria-hidden="true" />
					{$t('status.todo')}
				</span>
				<span class="text-3xl font-bold text-slate-700">{todo}</span>
			</div>

			<div class="stat-card border-l-4 border-l-amber-400" role="listitem">
				<span
					class="flex items-center gap-1 text-xs font-medium text-amber-700 uppercase tracking-wide"
				>
					<Clock size={12} aria-hidden="true" />
					{$t('status.in_progress')}
				</span>
				<span class="text-3xl font-bold text-amber-800">{inProgress}</span>
			</div>

			<div class="stat-card border-l-4 border-l-teal-400" role="listitem">
				<span
					class="flex items-center gap-1 text-xs font-medium text-teal-700 uppercase tracking-wide"
				>
					<CheckCircle2 size={12} aria-hidden="true" />
					{$t('status.done')}
				</span>
				<span class="text-3xl font-bold text-teal-800">{done}</span>
			</div>

			<div class="stat-card border-l-4 border-l-orange-400" role="listitem">
				<span
					class="flex items-center gap-1 text-xs font-medium text-orange-700 uppercase tracking-wide"
				>
					<AlertTriangle size={12} aria-hidden="true" />
					{$t('dashboard.overdue')}
				</span>
				<span class="text-3xl font-bold text-orange-800">{overdue}</span>
			</div>

			<div class="stat-card border-l-4 border-l-blue-400" role="listitem">
				<span
					class="flex items-center gap-1 text-xs font-medium text-blue-700 uppercase tracking-wide"
				>
					<Users size={12} aria-hidden="true" />
					{$t('dashboard.total_teams')}
				</span>
				<span class="text-3xl font-bold text-blue-800">{teams.length}</span>
			</div>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Recent tasks -->
			<section class="lg:col-span-2 card p-5" aria-labelledby="recent-tasks-heading">
				<h2 id="recent-tasks-heading" class="font-semibold text-slate-900 mb-4">
					{$t('dashboard.recent_tasks')}
				</h2>
				{#if recentTasks.length === 0}
					<p class="text-slate-400 text-sm">{$t('dashboard.no_recent_tasks')}</p>
				{:else}
					<ul class="space-y-1">
						{#each recentTasks as task}
							<li>
								<a
									href="/tasks"
									class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
								>
									<StatusBadge status={task.status} />
									<span
										class="flex-1 text-sm font-medium text-slate-800 truncate group-hover:text-blue-700"
									>
										{task.title}
									</span>
									<PriorityBadge priority={task.priority} />
									{#if task.deadline}
										<span class="text-xs text-slate-400 shrink-0 hidden sm:block">
											{formatDate(task.deadline)}
										</span>
									{/if}
								</a>
							</li>
						{/each}
					</ul>
					<a href="/tasks" class="mt-3 text-sm text-blue-600 hover:underline block">
						{$t('nav.tasks')} →
					</a>
				{/if}
			</section>

			<div class="space-y-4">
				<!-- Upcoming events -->
				<section class="card p-5" aria-labelledby="events-heading">
					<div class="flex items-center gap-2 mb-4">
						<CalendarDays size={16} class="text-slate-500" aria-hidden="true" />
						<h2 id="events-heading" class="font-semibold text-slate-900">
							{$t('dashboard.upcoming_events')}
						</h2>
					</div>
					{#if upcomingEvents.length === 0}
						<p class="text-slate-400 text-sm">{$t('dashboard.no_upcoming_events')}</p>
					{:else}
						<ul class="space-y-0">
							{#each upcomingEvents as event}
								<li class="flex flex-col gap-0.5 py-2 border-b border-slate-100 last:border-0">
									<span class="text-sm font-medium text-slate-800">{event.title}</span>
									<span class="text-xs text-slate-500">{formatDate(event.startDate)}</span>
								</li>
							{/each}
						</ul>
						<a href="/events" class="mt-3 text-sm text-blue-600 hover:underline block">
							{$t('nav.events')} →
						</a>
					{/if}
				</section>

				<!-- Teams -->
				{#if teams.length > 0}
					<section class="card p-5" aria-labelledby="teams-heading">
						<div class="flex items-center gap-2 mb-4">
							<Users size={16} class="text-slate-500" aria-hidden="true" />
							<h2 id="teams-heading" class="font-semibold text-slate-900">
								{$t('dashboard.my_teams')}
							</h2>
						</div>
						<ul class="space-y-1">
							{#each teams.slice(0, 4) as team}
								<li class="flex items-center justify-between py-1">
									<span class="text-sm font-medium text-slate-800">{team.name}</span>
									<span class="text-xs text-slate-500">
										{team._count?.members ?? team.members?.length ?? 0}
										{$t('teams.members')}
									</span>
								</li>
							{/each}
						</ul>
						{#if auth.isTeamLead}
							<a href="/teams" class="mt-3 text-sm text-blue-600 hover:underline block">
								{$t('nav.teams')} →
							</a>
						{/if}
					</section>
				{/if}
			</div>
		</div>
	{/if}
</div>
