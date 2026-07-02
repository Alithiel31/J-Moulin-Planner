<script lang="ts">
	import { onMount } from 'svelte';
	import { Plus, Search, Loader2, AlertTriangle, Pencil, Trash2, ArrowRight } from 'lucide-svelte';
	import { t } from '$lib/i18n.js';
	import api from '$lib/api.js';
	import { auth } from '$lib/auth.svelte.js';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import PriorityBadge from '$lib/components/PriorityBadge.svelte';
	import TaskModal from '$lib/components/TaskModal.svelte';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import type { Task, Team, TaskStatus, TaskPriority } from '$lib/types.js';

	let tasks = $state<Task[]>([]);
	let teams = $state<Team[]>([]);
	let loading = $state(true);
	let error = $state('');

	let search = $state('');
	let filterStatus = $state<TaskStatus | ''>('');
	let filterPriority = $state<TaskPriority | ''>('');

	let modalOpen = $state(false);
	let editingTask = $state<Task | null>(null);
	let deleteTask = $state<Task | null>(null);

	const statuses: TaskStatus[] = ['todo', 'in_progress', 'done'];

	const filtered = $derived(
		tasks.filter((task) => {
			const matchSearch = !search || task.title.toLowerCase().includes(search.toLowerCase());
			const matchStatus = !filterStatus || task.status === filterStatus;
			const matchPriority = !filterPriority || task.priority === filterPriority;
			return matchSearch && matchStatus && matchPriority;
		})
	);

	const columns = $derived(
		statuses.map((s) => ({
			status: s,
			tasks: filtered.filter((t) => t.status === s),
		}))
	);

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString($t('common.all') === 'All' ? 'en-GB' : 'fr-FR', {
			day: 'numeric',
			month: 'short',
		});
	}

	function isOverdue(task: Task): boolean {
		return !!(task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done');
	}

	async function moveTask(task: Task, newStatus: TaskStatus) {
		try {
			await api.patch(`/tasks/${task.id}`, { status: newStatus });
			task.status = newStatus;
			tasks = [...tasks];
		} catch {
			error = $t('common.error');
		}
	}

	async function confirmDelete() {
		if (!deleteTask) return;
		try {
			await api.delete(`/tasks/${deleteTask.id}`);
			tasks = tasks.filter((t) => t.id !== deleteTask!.id);
		} catch {
			error = $t('common.error');
		} finally {
			deleteTask = null;
		}
	}

	function openCreate() {
		editingTask = null;
		modalOpen = true;
	}

	function openEdit(task: Task) {
		editingTask = task;
		modalOpen = true;
	}

	async function onSaved() {
		modalOpen = false;
		await loadData();
	}

	async function loadData() {
		try {
			const [tasksRes, teamsRes] = await Promise.all([api.get('/tasks'), api.get('/teams')]);
			tasks = tasksRes.data.data.tasks;
			teams = teamsRes.data.data.teams;
		} catch {
			error = $t('common.error');
		}
	}

	onMount(async () => {
		await loadData();
		loading = false;
	});
</script>

<svelte:head>
	<title>J-Moulin Planner – {$t('tasks.title')}</title>
</svelte:head>

<div class="p-6 max-w-7xl mx-auto">
	<!-- Header -->
	<div class="flex flex-wrap items-center justify-between gap-3 mb-6">
		<h1 class="text-2xl font-bold text-slate-900">{$t('tasks.title')}</h1>
		{#if auth.isTeamLead}
			<button class="btn-primary" onclick={openCreate}>
				<Plus size={16} aria-hidden="true" />
				{$t('tasks.new')}
			</button>
		{/if}
	</div>

	<!-- Filters -->
	<div class="flex flex-wrap gap-3 mb-6">
		<div class="relative">
			<Search
				size={16}
				class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
				aria-hidden="true"
			/>
			<input
				class="input pl-9 w-56"
				type="search"
				placeholder={$t('tasks.search')}
				bind:value={search}
				aria-label={$t('tasks.search')}
			/>
		</div>

		<select class="input w-auto" bind:value={filterStatus} aria-label={$t('tasks.filter_status')}>
			<option value="">{$t('tasks.filter_status')} — {$t('common.all')}</option>
			<option value="todo">{$t('status.todo')}</option>
			<option value="in_progress">{$t('status.in_progress')}</option>
			<option value="done">{$t('status.done')}</option>
		</select>

		<select
			class="input w-auto"
			bind:value={filterPriority}
			aria-label={$t('tasks.filter_priority')}
		>
			<option value="">{$t('tasks.filter_priority')} — {$t('common.all')}</option>
			<option value="low">{$t('priority.low')}</option>
			<option value="medium">{$t('priority.medium')}</option>
			<option value="high">{$t('priority.high')}</option>
		</select>
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
	{:else}
		<!-- Kanban columns -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			{#each columns as col}
				<section aria-labelledby="col-{col.status}">
					<!-- Column header -->
					<div class="flex items-center gap-2 mb-3 px-1">
						<StatusBadge status={col.status} />
						<span
							class="ml-auto text-xs font-semibold text-slate-400 bg-slate-100 rounded-full px-2 py-0.5"
						>
							{col.tasks.length}
						</span>
					</div>

					<!-- Task cards -->
					<div class="space-y-2 min-h-[4rem]">
						{#if col.tasks.length === 0}
							<div
								class="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center text-sm text-slate-400"
							>
								{$t('tasks.no_tasks')}
							</div>
						{:else}
							{#each col.tasks as task}
								<article
									class="card p-4 hover:shadow-md transition-shadow
										{isOverdue(task) ? 'border-l-4 border-l-orange-400' : ''}"
									aria-label={task.title}
								>
									<div class="flex items-start justify-between gap-2 mb-2">
										<h3 class="text-sm font-semibold text-slate-900 leading-snug">{task.title}</h3>
										{#if auth.isTeamLead}
											<div class="flex items-center gap-1 shrink-0">
												<button
													onclick={() => openEdit(task)}
													class="btn-ghost p-1 rounded"
													aria-label="{$t('tasks.edit')} {task.title}"
												>
													<Pencil size={14} />
												</button>
												<button
													onclick={() => (deleteTask = task)}
													class="btn-ghost p-1 rounded hover:text-rose-600"
													aria-label="{$t('tasks.delete')} {task.title}"
												>
													<Trash2 size={14} />
												</button>
											</div>
										{/if}
									</div>

									{#if task.description}
										<p class="text-xs text-slate-500 mb-2 line-clamp-2">{task.description}</p>
									{/if}

									<div class="flex flex-wrap items-center gap-1.5 mb-2">
										<PriorityBadge priority={task.priority} />
										{#if task.category}
											<span class="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
												{task.category}
											</span>
										{/if}
									</div>

									{#if task.deadline}
										<p
											class="text-xs {isOverdue(task)
												? 'text-orange-600 font-semibold'
												: 'text-slate-400'} mb-2"
										>
											{$t('tasks.deadline')}: {formatDate(task.deadline)}
											{#if isOverdue(task)}
												<AlertTriangle
													size={12}
													class="inline ml-1"
													aria-label={$t('dashboard.overdue')}
												/>
											{/if}
										</p>
									{/if}

									<!-- Assignees -->
									{#if task.assignees && task.assignees.length > 0}
										<div class="flex items-center gap-1 mt-1" aria-label={$t('tasks.assignees')}>
											{#each task.assignees.slice(0, 3) as a}
												<span
													class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold"
													title={a.user.username}
													aria-label={a.user.username}
												>
													{a.user.username.charAt(0).toUpperCase()}
												</span>
											{/each}
											{#if task.assignees.length > 3}
												<span class="text-xs text-slate-400">+{task.assignees.length - 3}</span>
											{/if}
										</div>
									{/if}

									<!-- Move buttons (teamlead+) -->
									{#if auth.isTeamLead}
										<div class="flex gap-1 mt-3 flex-wrap">
											{#each statuses.filter((s) => s !== task.status) as nextStatus}
												<button
													onclick={() => moveTask(task, nextStatus)}
													class="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
													aria-label="{$t('tasks.move_to')} {$t('status.' + nextStatus)}"
												>
													<ArrowRight size={10} aria-hidden="true" />
													{$t('status.' + nextStatus)}
												</button>
											{/each}
										</div>
									{/if}
								</article>
							{/each}
						{/if}
					</div>
				</section>
			{/each}
		</div>
	{/if}
</div>

<TaskModal
	open={modalOpen}
	task={editingTask}
	{teams}
	onclose={() => (modalOpen = false)}
	onsaved={onSaved}
/>

<ConfirmModal open={!!deleteTask} onconfirm={confirmDelete} oncancel={() => (deleteTask = null)} />
