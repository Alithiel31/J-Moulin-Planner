<script lang="ts">
	import { Circle, Clock, CheckCircle2 } from 'lucide-svelte';
	import { t } from '$lib/i18n.js';
	import type { TaskStatus } from '$lib/types.js';

	const { status }: { status: TaskStatus } = $props();
</script>

{#if status === 'todo'}
	<span class="badge border-slate-300 bg-slate-50 text-slate-700">
		<Circle size={12} aria-hidden="true" />
		{$t('status.todo')}
	</span>
{:else if status === 'in_progress'}
	<span class="badge border-amber-400 bg-amber-50 text-amber-800">
		<Clock size={12} aria-hidden="true" />
		{$t('status.in_progress')}
	</span>
{:else if status === 'done'}
	<span class="badge border-teal-400 bg-teal-50 text-teal-800">
		<CheckCircle2 size={12} aria-hidden="true" />
		{$t('status.done')}
	</span>
{/if}
