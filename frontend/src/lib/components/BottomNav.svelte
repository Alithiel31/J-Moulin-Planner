<script lang="ts">
	import {
		LayoutDashboard,
		CheckSquare,
		CalendarDays,
		CalendarRange,
		Menu,
		X,
		Users,
		UserCog,
		Activity,
		LogOut,
		Globe,
	} from 'lucide-svelte';
	import { page } from '$app/stores';
	import { t, locale, type Locale } from '$lib/i18n.js';
	import { auth } from '$lib/auth.svelte.js';

	let moreOpen = $state(false);

	function isActive(href: string): boolean {
		if (href === '/') return $page.url.pathname === '/';
		return $page.url.pathname.startsWith(href);
	}

	function toggleLang() {
		locale.update((l: Locale) => (l === 'fr' ? 'en' : 'fr'));
	}

	function closeMore() {
		moreOpen = false;
	}

	const mainItems = [
		{ href: '/', label: 'nav.dashboard', Icon: LayoutDashboard },
		{ href: '/tasks', label: 'nav.tasks', Icon: CheckSquare },
		{ href: '/timeline', label: 'nav.timeline', Icon: CalendarRange },
		{ href: '/events', label: 'nav.events', Icon: CalendarDays },
	];

	const moreItems = $derived([
		...(auth.isTeamLead ? [{ href: '/teams', label: 'nav.teams', Icon: Users }] : []),
		...(auth.isAdmin
			? [
					{ href: '/users', label: 'nav.users', Icon: UserCog },
					{ href: '/activity', label: 'nav.activity', Icon: Activity },
				]
			: []),
	]);
</script>

<!-- Bottom tab bar (mobile only) -->
<nav
	class="md:hidden fixed bottom-0 inset-x-0 z-40 flex items-stretch bg-slate-900 border-t border-slate-700 pb-[env(safe-area-inset-bottom)]"
	aria-label="Navigation principale"
>
	{#each mainItems as item (item.href)}
		<a
			href={item.href}
			onclick={closeMore}
			class="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors
				{isActive(item.href) ? 'text-blue-400' : 'text-slate-300'}"
			aria-current={isActive(item.href) ? 'page' : undefined}
		>
			<item.Icon size={20} aria-hidden="true" />
			{$t(item.label)}
		</a>
	{/each}

	<button
		onclick={() => (moreOpen = true)}
		class="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors
			{moreOpen ? 'text-blue-400' : 'text-slate-300'}"
		aria-haspopup="dialog"
		aria-expanded={moreOpen}
	>
		<Menu size={20} aria-hidden="true" />
		{$t('nav.more')}
	</button>
</nav>

<!-- "More" bottom sheet (mobile only) -->
{#if moreOpen}
	<div
		class="md:hidden fixed inset-0 bg-black/40 z-50 flex items-end"
		role="dialog"
		aria-modal="true"
		aria-label={$t('nav.more')}
	>
		<div
			class="w-full bg-slate-900 text-slate-100 rounded-t-2xl pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-2 max-h-[80vh] overflow-y-auto"
		>
			<div class="flex items-center justify-between px-4 py-2">
				<span class="text-sm font-semibold text-white">{$t('nav.more')}</span>
				<button
					onclick={closeMore}
					class="btn-ghost p-1 rounded text-slate-300 hover:text-white"
					aria-label={$t('common.cancel')}
				>
					<X size={18} />
				</button>
			</div>

			{#if moreItems.length > 0}
				<div class="px-3 py-1 space-y-1">
					{#each moreItems as item (item.href)}
						<a
							href={item.href}
							onclick={closeMore}
							class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
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

			<div class="px-3 py-1 space-y-1 border-t border-slate-700 mt-1 pt-2">
				<button
					onclick={toggleLang}
					class="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
				>
					<Globe size={18} aria-hidden="true" />
					{$locale === 'fr' ? 'Français' : 'English'}
				</button>

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

				<button
					onclick={() => auth.logout()}
					class="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-300 hover:bg-rose-700 hover:text-white transition-colors"
				>
					<LogOut size={18} aria-hidden="true" />
					{$t('nav.logout')}
				</button>
			</div>
		</div>
	</div>
{/if}
