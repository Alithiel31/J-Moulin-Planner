<script lang="ts">
	import {
		LayoutDashboard,
		CheckSquare,
		Users,
		CalendarDays,
		CalendarRange,
		UserCog,
		Activity,
		LogOut,
		Globe
	} from 'lucide-svelte';
	import { page } from '$app/stores';
	import { t, locale, type Locale } from '$lib/i18n.js';
	import { auth } from '$lib/auth.svelte.js';

	function isActive(href: string): boolean {
		if (href === '/') return $page.url.pathname === '/';
		return $page.url.pathname.startsWith(href);
	}

	function toggleLang() {
		locale.update((l: Locale) => (l === 'fr' ? 'en' : 'fr'));
	}

	const navItems = [
		{ href: '/', label: 'nav.dashboard', Icon: LayoutDashboard, always: true },
		{ href: '/tasks', label: 'nav.tasks', Icon: CheckSquare, always: true },
		{ href: '/teams', label: 'nav.teams', Icon: Users, teamlead: true },
		{ href: '/events', label: 'nav.events', Icon: CalendarDays, always: true },
		{ href: '/timeline', label: 'nav.timeline', Icon: CalendarRange, always: true }
	];

	const adminItems = [
		{ href: '/users', label: 'nav.users', Icon: UserCog },
		{ href: '/activity', label: 'nav.activity', Icon: Activity }
	];
</script>

<aside
	class="flex flex-col w-60 shrink-0 bg-slate-900 text-slate-100 h-screen sticky top-0 overflow-y-auto"
	aria-label="Navigation principale"
>
	<!-- Logo -->
	<div class="px-5 py-5 border-b border-slate-700">
		<span class="font-bold text-lg text-white tracking-tight">J-Moulin Planner</span>
	</div>

	<!-- Main nav -->
	<nav class="flex-1 px-3 py-4 space-y-1" aria-label="Menu principal">
		{#each navItems as item}
			{#if item.always || (item.teamlead && auth.isTeamLead)}
				<a
					href={item.href}
					class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
						{isActive(item.href)
						? 'bg-blue-600 text-white'
						: 'text-slate-300 hover:bg-slate-800 hover:text-white'}"
					aria-current={isActive(item.href) ? 'page' : undefined}
				>
					<item.Icon size={18} aria-hidden="true" />
					{$t(item.label)}
				</a>
			{/if}
		{/each}

		{#if auth.isAdmin}
			<div class="pt-4">
				<p class="px-3 mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
					Admin
				</p>
				{#each adminItems as item}
					<a
						href={item.href}
						class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
							{isActive(item.href)
							? 'bg-blue-600 text-white'
							: 'text-slate-300 hover:bg-slate-800 hover:text-white'}"
						aria-current={isActive(item.href) ? 'page' : undefined}
					>
						<item.Icon size={18} aria-hidden="true" />
						{$t(item.label)}
					</a>
				{/each}
			</div>
		{/if}
	</nav>

	<!-- Footer -->
	<div class="px-3 py-3 border-t border-slate-700 space-y-1">
		<!-- Language switcher -->
		<button
			onclick={toggleLang}
			class="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
			aria-label="Changer la langue / Change language"
		>
			<Globe size={18} aria-hidden="true" />
			{$locale === 'fr' ? 'Français' : 'English'}
		</button>

		<!-- User info -->
		{#if auth.user}
			<div class="px-3 py-2 flex items-center gap-2">
				<div
					class="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white shrink-0"
					aria-hidden="true"
				>
					{auth.user.username.charAt(0).toUpperCase()}
				</div>
				<div class="min-w-0">
					<p class="text-sm font-medium text-white truncate">{auth.user.username}</p>
					<p class="text-xs text-slate-400 capitalize">{auth.user.role}</p>
				</div>
			</div>
		{/if}

		<!-- Logout -->
		<button
			onclick={() => auth.logout()}
			class="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-slate-300 hover:bg-rose-700 hover:text-white transition-colors"
		>
			<LogOut size={18} aria-hidden="true" />
			{$t('nav.logout')}
		</button>
	</div>
</aside>
