<script lang="ts">
	import type { SetEntry } from '$lib/types';

	let { set, onDelete }: { set: SetEntry; onDelete?: (id: number) => void } = $props();
</script>

<div class="row">
	<span class="value">{set.weight} <span class="unit">lb</span> × {set.reps}</span>
	{#if onDelete}
		<button type="button" class="delete" onclick={() => onDelete(set.id!)} aria-label="Delete set">
			×
		</button>
	{/if}
</div>

<style>
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 4px;
		border-bottom: 1px solid var(--border);
	}

	.row:last-child {
		border-bottom: none;
	}

	.value {
		font-size: 1.05rem;
		font-weight: 600;
	}

	.unit {
		font-weight: 400;
		color: var(--text-dim);
		font-size: 0.85rem;
	}

	.delete {
		background: none;
		border: none;
		color: var(--text-dim);
		font-size: 1.3rem;
		line-height: 1;
		padding: 6px 10px;
		cursor: pointer;
	}
</style>
