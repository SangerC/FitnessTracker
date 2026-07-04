<script lang="ts">
	import type { Exercise } from '$lib/types';
	import { formatRelativeDay } from '$lib/date';

	let { exercise, lastUsed }: { exercise: Exercise; lastUsed?: number } = $props();
</script>

<a class="tile" href={`/log/${exercise.id}`}>
	<span class="name">{exercise.name}</span>
	<span class="meta muted">
		{exercise.category}{lastUsed ? ` · ${formatRelativeDay(lastUsed)}` : ''}
	</span>
</a>

<style>
	.tile {
		display: flex;
		flex-direction: column;
		gap: 4px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 14px;
		min-height: 64px;
		justify-content: center;
	}

	.tile:active {
		background: var(--surface-2);
	}

	.name {
		font-weight: 600;
		font-size: 1rem;
	}

	.meta {
		font-size: 0.78rem;
	}
</style>
