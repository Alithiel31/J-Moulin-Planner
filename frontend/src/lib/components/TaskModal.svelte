<script lang="ts">
	import { X, Loader2 } from 'lucide-svelte';
	import { t } from '$lib/i18n.js';
	import { auth } from '$lib/auth.svelte.js';
	import api from '$lib/api.js';
	import StatusBadge from './StatusBadge.svelte';
	import PriorityBadge from './PriorityBadge.svelte';
	import type { Task, Team, User } from '$lib/types.js';

	const {
		open = false,
		task = null,
		teams = [],
		onclose,
		onsaved
	}: {
		open?: boolean;
		task?: Task | null;
		teams?: Team[];
		onclose: () => void;
		onsaved: () => void;
	} = $props();

	let loading = $state(false);
	let error = $state('');
	let teamMembers = $state<User[]>([]);

	let form = $state({
		title: '',
		description: '',
		category: '',
		status: 'todo' as Task['status'],
		priority: 'medium' as Task['priority'],
		deadline: '',
		startDate: '',
		teamId: '',
		assignees: [] as string[]
	});

	$effect(() => {
		if (open) {
			if (task) {
				form = {
					title: task.title,
					description: task.description ?? '',
					category: task.category ?? '',
					status: task.status,
					priority: task.priority,
					deadline: task.deadline ? task.deadline.slice(0, 10) : '',
					startDate: task.startDate ? task.startDate.slice(0, 10) : '',
					teamId: task.teamId,
					assignees: task.assignees?.map((a) => a.user.id) ?? []
				};
			} else {
				const today = new Date().toISOString().slice(0, 10);
				const inTwoDays = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
				form = {
					title: '',
					description: '',
					category: '',
					status: 'todo',
					priority: 'medium',
					deadline: inTwoDays,
					startDate: today,
					teamId: teams[0]?.id ?? '',
					assignees: []
				};
			}
			error = '';
		}
	});

	$effect(() => {
		if (form.teamId) {
			loadTeamMembers(form.teamId);
		} else {
			teamMembers = [];
		}
	});

	async function loadTeamMembers(teamId: string) {
		try {
			const res = await api.get(`/teams/${teamId}`);
			teamMembers = res.data.data.team?.members ?? [];
		} catch {
			teamMembers = [];
		}
	}

	function toggleAssignee(userId: string) {
		if (form.assignees.includes(userId)) {
			form.assignees = form.assignees.filter((id) => id !== userId);
		} else {
			form.assignees = [...form.assignees, userId];
		}
	}

	async function submit() {
		if (!form.title.trim()) {
			error = $t('common.required');
			return;
		}
		loading = true;
		error = '';
		try {
			const payload = {
				title: form.title.trim(),
				description: form.description || undefined,
				category: form.category || undefined,
				status: form.status,
				priority: form.priority,
				deadline: form.deadline || undefined,
				startDate: form.startDate || undefined,
				teamId: form.teamId,
				assignees: form.assignees
			};

			if (task) {
				await api.patch(`/tasks/${task.id}`, payload);
			} else {
				await api.post('/tasks', payload);
			}
			onsaved();
		} catch (e: unknown) {
			const err = e as { response?: { data?: { message?: string } } };
			error = err.response?.data?.message ?? $t('common.error');
		} finally {
			loading = false;
		}
	}
</script>

{#if open}
	<div
		class="fixed inset-0 bg-black/40 z-40 flex items-start justify-center p-4 overflow-y-auto"
		role="dialog"
		aria-modal="true"
		aria-labelledby="task-modal-title"
	>
		<div class="card w-full max-w-lg my-8 p-6">
			<!-- Header -->
			<div class="flex items-center justify-between mb-5">
				<h2 id="task-modal-title" class="text-base font-semibold text-slate-900">
					{task ? $t('tasks.edit') : $t('tasks.new')}
				</h2>
				<button class="btn-ghost p-1 rounded" onclick={onclose} aria-label={$t('common.cancel')}>
					<X size={18} />
				</button>
			</div>

			{#if error}
				<div
					class="mb-4 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm"
					role="alert"
				>
					{error}
				</div>
			{/if}

			<form onsubmit={(e) => { e.preventDefault(); submit(); }} class="space-y-4">
				<!-- Title -->
				<div>
					<label class="label" for="task-title">
						{$t('common.title_field')} <span class="text-rose-500" aria-hidden="true">*</span>
					</label>
					<input
						id="task-title"
						class="input"
						type="text"
						bind:value={form.title}
						placeholder={$t('common.title_field')}
						required
					/>
				</div>

				<!-- Description -->
				<div>
					<label class="label" for="task-desc">
						{$t('tasks.description')}
						<span class="text-slate-400 font-normal">({$t('common.optional')})</span>
					</label>
					<textarea
						id="task-desc"
						class="input resize-none"
						rows="3"
						bind:value={form.description}
					></textarea>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<!-- Category -->
					<div>
						<label class="label" for="task-category">
							{$t('tasks.category')}
							<span class="text-slate-400 font-normal">({$t('common.optional')})</span>
						</label>
						<input id="task-category" class="input" type="text" bind:value={form.category} />
					</div>

					<!-- Team -->
					{#if auth.isTeamLead && teams.length > 0}
						<div>
							<label class="label" for="task-team">{$t('tasks.team')}</label>
							<select id="task-team" class="input" bind:value={form.teamId}>
								{#each teams as team}
									<option value={team.id}>{team.name}</option>
								{/each}
							</select>
						</div>
					{/if}
				</div>

				<div class="grid grid-cols-2 gap-4">
					<!-- Status -->
					<div>
						<label class="label" for="task-status">{$t('tasks.status')}</label>
						<select id="task-status" class="input" bind:value={form.status}>
							<option value="todo">{$t('status.todo')}</option>
							<option value="in_progress">{$t('status.in_progress')}</option>
							<option value="done">{$t('status.done')}</option>
						</select>
					</div>

					<!-- Priority -->
					<div>
						<label class="label" for="task-priority">{$t('tasks.priority')}</label>
						<select id="task-priority" class="input" bind:value={form.priority}>
							<option value="low">{$t('priority.low')}</option>
							<option value="medium">{$t('priority.medium')}</option>
							<option value="high">{$t('priority.high')}</option>
						</select>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<!-- Start date -->
					<div>
						<label class="label" for="task-start">{$t('tasks.start_date')}</label>
						<input id="task-start" class="input" type="date" bind:value={form.startDate} />
					</div>
					<!-- Deadline -->
					<div>
						<label class="label" for="task-deadline">{$t('tasks.deadline')}</label>
						<input id="task-deadline" class="input" type="date" bind:value={form.deadline} />
					</div>
				</div>

				<!-- Assignees -->
				{#if teamMembers.length > 0}
					<div>
						<p class="label">{$t('tasks.assignees')}</p>
						<div class="flex flex-wrap gap-2 mt-1">
							{#each teamMembers as member}
								<button
									type="button"
									onclick={() => toggleAssignee(member.id)}
									class="px-3 py-1 rounded-full text-sm border transition-colors
										{form.assignees.includes(member.id)
										? 'bg-blue-600 text-white border-blue-600'
										: 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'}"
									aria-pressed={form.assignees.includes(member.id)}
								>
									{member.username}
								</button>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Preview -->
				<div class="flex items-center gap-2 pt-1">
					<StatusBadge status={form.status} />
					<PriorityBadge priority={form.priority} />
				</div>

				<!-- Actions -->
				<div class="flex justify-end gap-2 pt-2">
					<button type="button" class="btn-secondary" onclick={onclose}>
						{$t('common.cancel')}
					</button>
					<button type="submit" class="btn-primary" disabled={loading}>
						{#if loading}
							<Loader2 size={16} class="animate-spin" aria-hidden="true" />
						{/if}
						{$t('common.save')}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
