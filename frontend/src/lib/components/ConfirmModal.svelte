<script lang="ts">
	import { AlertTriangle, X } from 'lucide-svelte';
	import { t } from '$lib/i18n.js';

	const {
		open = false,
		title = '',
		message = '',
		onconfirm,
		oncancel,
	}: {
		open?: boolean;
		title?: string;
		message?: string;
		onconfirm: () => void;
		oncancel: () => void;
	} = $props();
</script>

{#if open}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby="confirm-title"
	>
		<div class="card w-full max-w-sm p-6 z-50">
			<div class="flex items-start gap-3 mb-4">
				<div
					class="flex-shrink-0 w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center"
				>
					<AlertTriangle size={20} class="text-rose-600" aria-hidden="true" />
				</div>
				<div class="flex-1">
					<h2 id="confirm-title" class="font-semibold text-slate-900 text-base">
						{title || $t('common.confirm_delete')}
					</h2>
					<p class="text-sm text-slate-600 mt-1">{message || $t('common.delete_warning')}</p>
				</div>
				<button class="btn-ghost p-1 rounded" onclick={oncancel} aria-label={$t('common.cancel')}>
					<X size={16} />
				</button>
			</div>

			<div class="flex justify-end gap-2">
				<button class="btn-secondary" onclick={oncancel}>{$t('common.cancel')}</button>
				<button class="btn-danger" onclick={onconfirm}>{$t('common.confirm_delete')}</button>
			</div>
		</div>
	</div>
{/if}
