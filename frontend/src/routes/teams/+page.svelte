<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Plus,
		Pencil,
		Trash2,
		Users,
		CheckSquare,
		ChevronDown,
		ChevronUp,
		Loader2,
		AlertTriangle,
		X,
	} from 'lucide-svelte';
	import { t } from '$lib/i18n.js';
	import api from '$lib/api.js';
	import { auth } from '$lib/auth.svelte.js';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import type { Team, User } from '$lib/types.js';

	let teams = $state<Team[]>([]);
	let allUsers = $state<User[]>([]);
	let loading = $state(true);
	let error = $state('');
	let expandedId = $state<string | null>(null);
	let deleteTeam = $state<Team | null>(null);

	let formOpen = $state(false);
	let editingTeam = $state<Team | null>(null);
	let formName = $state('');
	let formLeadId = $state('');
	let formMemberIds = $state<string[]>([]);
	let formLoading = $state(false);
	let formError = $state('');

	function openCreate() {
		editingTeam = null;
		formName = '';
		formLeadId = auth.user?.id ?? '';
		formMemberIds = [];
		formError = '';
		formOpen = true;
	}

	function openEdit(team: Team) {
		editingTeam = team;
		formName = team.name;
		formLeadId = team.leadId;
		formMemberIds = team.members?.map((m) => m.id) ?? [];
		formError = '';
		formOpen = true;
	}

	function toggleMember(id: string) {
		if (formMemberIds.includes(id)) {
			formMemberIds = formMemberIds.filter((m) => m !== id);
		} else {
			formMemberIds = [...formMemberIds, id];
		}
	}

	async function submitForm() {
		if (!formName.trim()) {
			formError = $t('common.required');
			return;
		}
		formLoading = true;
		formError = '';
		try {
			const payload = {
				name: formName.trim(),
				leadId: formLeadId || undefined,
				memberIds: formMemberIds,
			};
			if (editingTeam) {
				await api.patch(`/teams/${editingTeam.id}`, payload);
			} else {
				await api.post('/teams', payload);
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
		if (!deleteTeam) return;
		try {
			await api.delete(`/teams/${deleteTeam.id}`);
			teams = teams.filter((t) => t.id !== deleteTeam!.id);
		} catch {
			error = $t('common.error');
		} finally {
			deleteTeam = null;
		}
	}

	async function loadData() {
		try {
			const [teamsRes, usersRes] = await Promise.all([
				api.get('/teams'),
				auth.isAdmin ? api.get('/users') : Promise.resolve({ data: { data: { users: [] } } }),
			]);
			teams = teamsRes.data.data.teams;
			allUsers = usersRes.data.data.users;
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
	<title>J-Moulin Planner – {$t('teams.title')}</title>
</svelte:head>

<div class="p-6 max-w-5xl mx-auto">
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-bold text-slate-900">{$t('teams.title')}</h1>
		{#if auth.isAdmin}
			<button class="btn-primary" onclick={openCreate}>
				<Plus size={16} aria-hidden="true" />
				{$t('teams.new')}
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
	{:else if teams.length === 0}
		<p class="text-slate-400">{$t('teams.no_teams')}</p>
	{:else}
		<div class="space-y-3">
			{#each teams as team (team.id)}
				<div class="card overflow-hidden">
					<div class="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
						<div
							class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0"
							aria-hidden="true"
						>
							<Users size={18} class="text-blue-600" />
						</div>

						<!-- Clickable info zone -->
						<button
							class="flex-1 min-w-0 text-left"
							onclick={() => (expandedId = expandedId === team.id ? null : team.id)}
							aria-expanded={expandedId === team.id}
						>
							<h2 class="font-semibold text-slate-900">{team.name}</h2>
							<p class="text-xs text-slate-500">
								{team._count?.members ?? team.members?.length ?? 0}
								{$t('teams.members')} ·
								{team._count?.tasks ?? team.tasks?.length ?? 0}
								{$t('teams.tasks')}
								{#if team.lead}
									· {$t('teams.lead')}: {team.lead.username}
								{/if}
							</p>
						</button>

						{#if auth.isAdmin}
							<button
								class="btn-ghost p-1.5 rounded"
								onclick={() => openEdit(team)}
								aria-label="{$t('teams.edit')} {team.name}"
							>
								<Pencil size={15} />
							</button>
							<button
								class="btn-ghost p-1.5 rounded hover:text-rose-600"
								onclick={() => (deleteTeam = team)}
								aria-label="{$t('teams.delete')} {team.name}"
							>
								<Trash2 size={15} />
							</button>
						{/if}

						<button
							class="btn-ghost p-1.5 rounded"
							onclick={() => (expandedId = expandedId === team.id ? null : team.id)}
							aria-expanded={expandedId === team.id}
							aria-label={expandedId === team.id ? 'Réduire' : 'Développer'}
						>
							{#if expandedId === team.id}
								<ChevronUp size={18} class="text-slate-400" aria-hidden="true" />
							{:else}
								<ChevronDown size={18} class="text-slate-400" aria-hidden="true" />
							{/if}
						</button>
					</div>

					{#if expandedId === team.id && team.members}
						<div class="border-t border-slate-100 px-4 pb-4 pt-3">
							<h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
								{$t('teams.members')}
							</h3>
							<div class="flex flex-wrap gap-2">
								{#each team.members as member (member.id)}
									<span
										class="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-full text-sm text-slate-700"
									>
										<span
											class="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold"
											aria-hidden="true"
										>
											{member.username.charAt(0).toUpperCase()}
										</span>
										{member.username}
										<span class="text-xs text-slate-400 capitalize">({member.role})</span>
									</span>
								{/each}
							</div>

							{#if team.tasks && team.tasks.length > 0}
								<h3
									class="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-4 mb-2 flex items-center gap-1"
								>
									<CheckSquare size={12} aria-hidden="true" />
									{$t('nav.tasks')}
								</h3>
								<ul class="space-y-1">
									{#each team.tasks.slice(0, 5) as task (task.id)}
										<li class="text-sm text-slate-700 flex items-center gap-2">
											<span
												class="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"
												aria-hidden="true"
											></span>
											{task.title}
										</li>
									{/each}
								</ul>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Team form modal -->
{#if formOpen}
	<div
		class="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby="team-modal-title"
	>
		<div class="card w-full max-w-md p-6">
			<div class="flex items-center justify-between mb-5">
				<h2 id="team-modal-title" class="text-base font-semibold text-slate-900">
					{editingTeam ? $t('teams.edit') : $t('teams.new')}
				</h2>
				<button
					class="btn-ghost p-1 rounded"
					onclick={() => (formOpen = false)}
					aria-label={$t('common.cancel')}
				>
					<X size={18} />
				</button>
			</div>

			{#if formError}
				<div
					class="mb-4 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm"
					role="alert"
				>
					{formError}
				</div>
			{/if}

			<form
				onsubmit={(e) => {
					e.preventDefault();
					submitForm();
				}}
				class="space-y-4"
			>
				<div>
					<label class="label" for="team-name">{$t('teams.name')}</label>
					<input id="team-name" class="input" type="text" bind:value={formName} required />
				</div>

				{#if allUsers.length > 0}
					<div>
						<label class="label" for="team-lead">{$t('teams.lead')}</label>
						<select id="team-lead" class="input" bind:value={formLeadId}>
							{#each allUsers as user (user.id)}
								<option value={user.id}>{user.username} ({user.role})</option>
							{/each}
						</select>
					</div>

					<div>
						<p class="label">{$t('teams.members')}</p>
						<div class="flex flex-wrap gap-2 mt-1">
							{#each allUsers as user (user.id)}
								<button
									type="button"
									onclick={() => toggleMember(user.id)}
									class="px-3 py-1 rounded-full text-sm border transition-colors
										{formMemberIds.includes(user.id)
										? 'bg-blue-600 text-white border-blue-600'
										: 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'}"
									aria-pressed={formMemberIds.includes(user.id)}
								>
									{user.username}
								</button>
							{/each}
						</div>
					</div>
				{/if}

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

<ConfirmModal open={!!deleteTeam} onconfirm={confirmDelete} oncancel={() => (deleteTeam = null)} />
