<script lang="ts">
	import { onMount } from 'svelte';
	import { Trash2, Loader2, AlertTriangle, UserCog } from 'lucide-svelte';
	import { t } from '$lib/i18n.js';
	import api from '$lib/api.js';
	import { auth } from '$lib/auth.svelte.js';
	import { goto } from '$app/navigation';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import type { User, Role, Team } from '$lib/types.js';

	let users = $state<User[]>([]);
	let teams = $state<Team[]>([]);
	let loading = $state(true);
	let error = $state('');
	let deleteUser = $state<User | null>(null);
	let savingId = $state<string | null>(null);

	const roles: Role[] = ['admin', 'teamlead', 'teammate'];

	function teamName(teamId: string | null): string {
		if (!teamId) return '—';
		return teams.find((t) => t.id === teamId)?.name ?? '—';
	}

	async function updateRole(user: User, role: Role) {
		savingId = user.id;
		try {
			await api.patch(`/users/${user.id}`, { role });
			user.role = role;
			users = [...users];
		} catch {
			error = $t('common.error');
		} finally {
			savingId = null;
		}
	}

	async function confirmDelete() {
		if (!deleteUser) return;
		try {
			await api.delete(`/users/${deleteUser.id}`);
			users = users.filter((u) => u.id !== deleteUser!.id);
		} catch {
			error = $t('common.error');
		} finally {
			deleteUser = null;
		}
	}

	onMount(async () => {
		if (!auth.isAdmin) {
			goto('/');
			return;
		}
		try {
			const [usersRes, teamsRes] = await Promise.all([api.get('/users'), api.get('/teams')]);
			users = usersRes.data.data.users;
			teams = teamsRes.data.data.teams;
		} catch {
			error = $t('common.error');
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>J-Moulin Planner – {$t('users.title')}</title>
</svelte:head>

<div class="p-6 max-w-5xl mx-auto">
	<div class="flex items-center gap-3 mb-6">
		<UserCog size={24} class="text-slate-600" aria-hidden="true" />
		<h1 class="text-2xl font-bold text-slate-900">{$t('users.title')}</h1>
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
	{:else if users.length === 0}
		<p class="text-slate-400">{$t('users.no_users')}</p>
	{:else}
		<div class="card overflow-hidden">
			<table class="w-full text-sm" aria-label={$t('users.title')}>
				<thead>
					<tr class="border-b border-slate-200 bg-slate-50">
						<th class="text-left px-4 py-3 font-medium text-slate-600">{$t('users.username')}</th>
						<th class="text-left px-4 py-3 font-medium text-slate-600 hidden sm:table-cell"
							>{$t('users.email')}</th
						>
						<th class="text-left px-4 py-3 font-medium text-slate-600">{$t('users.role')}</th>
						<th class="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell"
							>{$t('users.team')}</th
						>
						<th class="text-right px-4 py-3 font-medium text-slate-600">{$t('common.actions')}</th>
					</tr>
				</thead>
				<tbody>
					{#each users as user (user.id)}
						<tr class="border-b border-slate-100 last:border-0 hover:bg-slate-50">
							<td class="px-4 py-3">
								<div class="flex items-center gap-2">
									<span
										class="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0"
										aria-hidden="true"
									>
										{user.username.charAt(0).toUpperCase()}
									</span>
									<span class="font-medium text-slate-900">{user.username}</span>
									{#if user.id === auth.user?.id}
										<span class="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Vous</span
										>
									{/if}
								</div>
							</td>
							<td class="px-4 py-3 text-slate-500 hidden sm:table-cell">{user.email}</td>
							<td class="px-4 py-3">
								{#if user.id !== auth.user?.id}
									<select
										class="input py-1 text-xs w-auto"
										value={user.role}
										onchange={(e) => updateRole(user, e.currentTarget.value as Role)}
										disabled={savingId === user.id}
										aria-label="{$t('users.role')} {user.username}"
									>
										{#each roles as r (r)}
											<option value={r}>{$t(`users.role.${r}`)}</option>
										{/each}
									</select>
								{:else}
									<span class="text-xs text-slate-600 capitalize"
										>{$t(`users.role.${user.role}`)}</span
									>
								{/if}
							</td>
							<td class="px-4 py-3 text-slate-500 hidden md:table-cell">{teamName(user.teamId)}</td>
							<td class="px-4 py-3 text-right">
								{#if user.id !== auth.user?.id}
									<button
										class="btn-ghost p-1.5 rounded hover:text-rose-600"
										onclick={() => (deleteUser = user)}
										aria-label="{$t('users.title')} — {$t('tasks.delete')} {user.username}"
									>
										<Trash2 size={16} />
									</button>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<ConfirmModal open={!!deleteUser} onconfirm={confirmDelete} oncancel={() => (deleteUser = null)} />
