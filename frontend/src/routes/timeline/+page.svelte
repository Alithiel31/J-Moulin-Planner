<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n.js';
	import api from '$lib/api.js';
	import type { Task, Event, Team } from '$lib/types.js';

	// ── State ──────────────────────────────────────────────────────────────────
	let tasks = $state<Task[]>([]);
	let teams = $state<Team[]>([]);
	let events = $state<Event[]>([]);
	let selectedTeamId = $state<string | null>(null);
	let tooltip = $state<{ task: Task; x: number; y: number } | null>(null);

	// Date range : 3 mois visibles, commençant au 1er du mois courant
	const DAYS = 91;
	let rangeStart = $state(
		(() => {
			const d = new Date();
			d.setDate(1);
			d.setHours(0, 0, 0, 0);
			return d;
		})()
	);
	let rangeEnd = $state(new Date(rangeStart.getTime() + DAYS * 86400000));

	// ── Navigation ─────────────────────────────────────────────────────────────
	const prev = () => {
		rangeStart = new Date(rangeStart.getTime() - 30 * 86400000);
		rangeEnd = new Date(rangeEnd.getTime() - 30 * 86400000);
	};
	const next = () => {
		rangeStart = new Date(rangeStart.getTime() + 30 * 86400000);
		rangeEnd = new Date(rangeEnd.getTime() + 30 * 86400000);
	};

	// ── Derived : tâches filtrées ──────────────────────────────────────────────
	const defaultCategory = $derived($t('timeline.default_category'));

	const filteredTasks = $derived(
		tasks.filter((task) => {
			if (!task.deadline) return false;
			if (selectedTeamId && task.teamId !== selectedTeamId) return false;
			return true;
		})
	);

	const categories = $derived(
		[...new Set(filteredTasks.map((task) => task.category || defaultCategory))].sort()
	);

	const tasksByCategory = $derived(
		categories.reduce(
			(acc, cat) => {
				acc[cat] = filteredTasks.filter((task) => (task.category || defaultCategory) === cat);
				return acc;
			},
			{} as Record<string, Task[]>
		)
	);

	const filteredEvents = $derived(
		selectedTeamId ? events.filter((e) => e.teamId === selectedTeamId || !e.teamId) : events
	);

	// ── Helpers de positionnement ──────────────────────────────────────────────
	const pct = (date: string | Date): number => {
		const totalMs = rangeEnd.getTime() - rangeStart.getTime();
		const t = new Date(date).getTime();
		return Math.max(0, Math.min(100, ((t - rangeStart.getTime()) / totalMs) * 100));
	};

	const widthPct = (start: string | Date, end: string | Date): number => {
		const totalMs = rangeEnd.getTime() - rangeStart.getTime();
		const s = Math.max(new Date(start).getTime(), rangeStart.getTime());
		const e = Math.min(new Date(end).getTime(), rangeEnd.getTime());
		return Math.max(0.5, ((e - s) / totalMs) * 100);
	};

	const getBarLeft = (task: Task) =>
		pct(task.startDate ?? new Date(new Date(task.deadline!).getTime() - 86400000));
	const getBarWidth = (task: Task) =>
		widthPct(
			task.startDate ?? new Date(new Date(task.deadline!).getTime() - 86400000),
			task.deadline!
		);

	// ── En-tête mois ───────────────────────────────────────────────────────────
	const monthBlocks = $derived.by(() => {
		const blocks: { label: string; left: number; width: number }[] = [];
		const totalMs = rangeEnd.getTime() - rangeStart.getTime();
		const cur = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
		while (cur < rangeEnd) {
			const blockStart = cur.getTime() < rangeStart.getTime() ? rangeStart : new Date(cur);
			const nextMonth = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
			const blockEnd = nextMonth > rangeEnd ? rangeEnd : nextMonth;
			blocks.push({
				label: cur.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
				left: ((blockStart.getTime() - rangeStart.getTime()) / totalMs) * 100,
				width: ((blockEnd.getTime() - blockStart.getTime()) / totalMs) * 100,
			});
			cur.setMonth(cur.getMonth() + 1);
		}
		return blocks;
	});

	// ── Marques de semaine ─────────────────────────────────────────────────────
	const weekMarks = $derived.by(() => {
		const marks: { left: number; label: string }[] = [];
		const totalMs = rangeEnd.getTime() - rangeStart.getTime();
		const cur = new Date(rangeStart);
		while (cur.getDay() !== 1) cur.setDate(cur.getDate() + 1);
		while (cur < rangeEnd) {
			marks.push({
				left: ((cur.getTime() - rangeStart.getTime()) / totalMs) * 100,
				label: cur.getDate().toString(),
			});
			cur.setDate(cur.getDate() + 7);
		}
		return marks;
	});

	// ── Ligne "aujourd'hui" ────────────────────────────────────────────────────
	const todayPct = $derived(pct(new Date()));
	const todayVisible = $derived(todayPct >= 0 && todayPct <= 100);

	// ── Couleurs ───────────────────────────────────────────────────────────────
	const statusBg = (s: string) =>
		s === 'done' ? '#4ade80' : s === 'in_progress' ? '#fbbf24' : '#60a5fa';

	const priorityOutline = (p: string) =>
		p === 'high' ? '2px solid #ef4444' : p === 'medium' ? '2px solid #f97316' : 'none';

	// ── Tooltip ────────────────────────────────────────────────────────────────
	const showTip = (e: MouseEvent, task: Task) => {
		tooltip = { task, x: e.clientX, y: e.clientY };
	};
	const hideTip = () => {
		tooltip = null;
	};

	const fmt = (d: string) =>
		new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

	// ── Init ───────────────────────────────────────────────────────────────────
	onMount(async () => {
		try {
			const [tasksRes, teamsRes, eventsRes] = await Promise.all([
				api.get('/tasks'),
				api.get('/teams'),
				api.get('/events'),
			]);
			tasks = tasksRes.data.data.tasks;
			teams = teamsRes.data.data.teams;
			events = eventsRes.data.data.events;
		} catch {
			tasks = [];
			teams = [];
			events = [];
		}
	});
</script>

<svelte:head>
	<title>J-Moulin Planner – {$t('timeline.title')}</title>
</svelte:head>

<!-- Tooltip -->
{#if tooltip}
	<div
		class="fixed z-50 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl pointer-events-none max-w-xs"
		style="left: {tooltip.x + 14}px; top: {tooltip.y - 12}px"
	>
		<p class="font-semibold mb-1">{tooltip.task.title}</p>
		<p>{$t('tasks.status')} : {$t(`status.${tooltip.task.status}`)}</p>
		<p>{$t('tasks.priority')} : {$t(`priority.${tooltip.task.priority}`)}</p>
		{#if tooltip.task.startDate}<p>{$t('tasks.start_date')} : {fmt(tooltip.task.startDate)}</p>{/if}
		{#if tooltip.task.deadline}<p>{$t('tasks.deadline')} : {fmt(tooltip.task.deadline)}</p>{/if}
		{#if tooltip.task.description}
			<p class="mt-1 text-gray-300">{tooltip.task.description}</p>
		{/if}
	</div>
{/if}

<div class="space-y-4">
	<!-- En-tête page -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">{$t('timeline.title')}</h1>
			<p class="text-gray-500 text-sm mt-0.5">{$t('timeline.subtitle')}</p>
		</div>
		<div class="flex items-center gap-2">
			<button
				onclick={prev}
				class="px-4 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
				>{$t('timeline.prev')}</button
			>
			<button
				onclick={next}
				class="px-4 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
				>{$t('timeline.next')}</button
			>
		</div>
	</div>

	<!-- Onglets équipes -->
	<div class="flex flex-wrap gap-2">
		<button
			onclick={() => (selectedTeamId = null)}
			class="px-4 py-1.5 text-sm rounded-full border transition-colors
				{selectedTeamId === null
				? 'bg-blue-600 text-white border-blue-600'
				: 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'}"
			>{$t('timeline.all_teams')}</button
		>
		{#each teams as team (team.id)}
			<button
				onclick={() => (selectedTeamId = team.id)}
				class="px-4 py-1.5 text-sm rounded-full border transition-colors
					{selectedTeamId === team.id
					? 'bg-blue-600 text-white border-blue-600'
					: 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'}">{team.name}</button
			>
		{/each}
	</div>

	<!-- Gantt -->
	<div class="bg-white rounded-lg border border-gray-200 overflow-x-auto">
		{#if categories.length === 0}
			<div class="text-center py-16 text-gray-500">
				<p class="text-2xl mb-2">📅</p>
				<p class="font-medium">{$t('timeline.empty')}</p>
				<p class="text-sm mt-1">{$t('timeline.empty_hint')}</p>
			</div>
		{:else}
			<!-- En-tête mois -->
			<div class="flex border-b border-gray-300" style="min-width: 600px">
				<div class="w-44 flex-shrink-0 bg-gray-100 border-r border-gray-300"></div>
				<div class="flex-1 relative h-8 bg-gray-100">
					{#each monthBlocks as block (block.left)}
						<div
							class="absolute top-0 h-full flex items-center justify-center border-r border-gray-300 overflow-hidden"
							style="left: {block.left}%; width: {block.width}%"
						>
							<span class="text-xs font-semibold text-gray-700 capitalize truncate px-2"
								>{block.label}</span
							>
						</div>
					{/each}
				</div>
			</div>

			<!-- En-tête semaines -->
			<div class="flex border-b border-gray-200" style="min-width: 600px">
				<div
					class="w-44 flex-shrink-0 bg-gray-50 border-r border-gray-200 px-3 py-1 text-xs text-gray-400 font-medium"
				>
					{$t('timeline.category')}
				</div>
				<div class="flex-1 relative h-6 bg-gray-50">
					{#each weekMarks as mark (mark.left)}
						<div
							class="absolute top-0 h-full border-l border-gray-200 flex items-center pl-0.5"
							style="left: {mark.left}%"
						>
							<span class="text-xs text-gray-400">{mark.label}</span>
						</div>
					{/each}
					{#if todayVisible}
						<div
							class="absolute top-0 h-full border-l-2 border-red-400 z-10"
							style="left: {todayPct}%"
						></div>
					{/if}
				</div>
			</div>

			<!-- Lignes par catégorie -->
			{#each categories as cat (cat)}
				<div
					class="flex border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
					style="min-height: 52px; min-width: 600px"
				>
					<!-- Label -->
					<div class="w-44 flex-shrink-0 border-r border-gray-200 px-3 flex items-center bg-white">
						<span class="text-sm font-medium text-gray-700 truncate">{cat}</span>
					</div>

					<!-- Zone timeline -->
					<div class="flex-1 relative" style="min-height: 52px;">
						<!-- Gridlines semaine -->
						{#each weekMarks as mark (mark.left)}
							<div
								class="absolute top-0 h-full border-l border-gray-100 pointer-events-none"
								style="left: {mark.left}%"
							></div>
						{/each}

						<!-- Ligne aujourd'hui -->
						{#if todayVisible}
							<div
								class="absolute top-0 h-full border-l-2 border-red-400 opacity-60 pointer-events-none z-10"
								style="left: {todayPct}%"
							></div>
						{/if}

						<!-- Événements (bandes roses) -->
						{#each filteredEvents as ev (ev.id)}
							{@const evLeft = pct(ev.startDate)}
							{@const evW = widthPct(ev.startDate, ev.endDate)}
							{#if evLeft + evW >= 0 && evLeft <= 100}
								<div
									class="absolute top-0 h-full pointer-events-none z-10 rounded-sm"
									style="left: {evLeft}%; width: {Math.max(evW, 0.3)}%;
										background: rgba(236,72,153,0.12);
										border-left: 2px solid rgba(236,72,153,0.6);"
									title={ev.title}
								></div>
							{/if}
						{/each}

						<!-- Barres de tâches -->
						{#each tasksByCategory[cat] as task (task.id)}
							{@const left = getBarLeft(task)}
							{@const width = getBarWidth(task)}
							{#if left + width >= 0 && left <= 100}
								<div
									role="button"
									tabindex="0"
									class="absolute flex items-center px-2 text-xs font-medium text-white rounded cursor-pointer z-20 overflow-hidden transition-opacity hover:opacity-80"
									style="
										top: 10px;
										height: 30px;
										left: {left}%;
										width: {Math.max(width, 0.5)}%;
										background-color: {statusBg(task.status)};
										outline: {priorityOutline(task.priority)};
										min-width: 6px;
									"
									onmouseenter={(e) => showTip(e, task)}
									onmouseleave={hideTip}
								>
									<span class="truncate drop-shadow-sm">{task.title}</span>
								</div>
							{/if}
						{/each}
					</div>
				</div>
			{/each}
		{/if}
	</div>

	<!-- Légende -->
	<div class="flex flex-wrap gap-5 text-xs text-gray-500">
		<span class="flex items-center gap-1.5">
			<span class="w-4 h-3 rounded inline-block" style="background:#60a5fa"></span>{$t(
				'status.todo'
			)}
		</span>
		<span class="flex items-center gap-1.5">
			<span class="w-4 h-3 rounded inline-block" style="background:#fbbf24"></span>{$t(
				'status.in_progress'
			)}
		</span>
		<span class="flex items-center gap-1.5">
			<span class="w-4 h-3 rounded inline-block" style="background:#4ade80"></span>{$t(
				'status.done'
			)}
		</span>
		<span class="flex items-center gap-1.5">
			<span
				class="w-4 h-3 rounded inline-block"
				style="background:rgba(236,72,153,0.3); border-left:2px solid #ec4899;"
			></span>{$t('timeline.event')}
		</span>
		<span class="flex items-center gap-1.5">
			<span class="w-0.5 h-4 inline-block" style="background:#f87171"></span>{$t('timeline.today')}
		</span>
		<span class="flex items-center gap-1.5">
			<span class="w-4 h-3 rounded inline-block border-2 border-red-500"></span>{$t(
				'timeline.high_priority'
			)}
		</span>
		<span class="flex items-center gap-1.5">
			<span class="w-4 h-3 rounded inline-block border-2 border-orange-400"></span>{$t(
				'timeline.medium_priority'
			)}
		</span>
	</div>
</div>
