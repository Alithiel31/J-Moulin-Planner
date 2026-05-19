<script lang="ts">
	import { ArrowUp, Minus, ArrowDown } from 'lucide-svelte';
	import { t } from '$lib/i18n.js';
	import type { TaskPriority } from '$lib/types.js';

	const { priority }: { priority: TaskPriority } = $props();
</script>

{#if priority === 'high'}
	<span
		class="inline-flex items-center gap-1 text-xs font-semibold text-orange-700"
		aria-label={$t('priority.high')}
	>
		<ArrowUp size={12} aria-hidden="true" />
		{$t('priority.high')}
	</span>
{:else if priority === 'medium'}
	<span
		class="inline-flex items-center gap-1 text-xs font-semibold text-amber-600"
		aria-label={$t('priority.medium')}
	>
		<Minus size={12} aria-hidden="true" />
		{$t('priority.medium')}
	</span>
{:else if priority === 'low'}
	<span
		class="inline-flex items-center gap-1 text-xs font-semibold text-sky-600"
		aria-label={$t('priority.low')}
	>
		<ArrowDown size={12} aria-hidden="true" />
		{$t('priority.low')}
	</span>
{/if}
