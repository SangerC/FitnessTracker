<script lang="ts">
	import type { CategorySummary } from '$lib/queries';
	import { dayKey, formatRelativeDay } from '$lib/date';
	import { base } from '$app/paths';

	let { summary }: { summary: CategorySummary } = $props();

	const href = $derived(
		summary.lastTimestamp ? `${base}/day/${dayKey(summary.lastTimestamp)}` : null
	);
</script>

<a href={href} class="card" class:disabled={!href}>
	<div class="top">
		<span class="name">{summary.category}</span>
		<span class="last muted">
			{summary.lastTimestamp ? formatRelativeDay(summary.lastTimestamp) : 'not logged yet'}
		</span>
	</div>
	{#if summary.targetPerWeek}
		<div class="dots">
			{#each Array(summary.targetPerWeek) as _, i (i)}
				<span class="dot" class:filled={i < summary.daysThisWeek}></span>
			{/each}
			<span class="count muted">{summary.daysThisWeek}/{summary.targetPerWeek} this week</span>
		</div>
	{/if}
</a>

<style>
	.card {
		display: block;
		margin-bottom: 10px;
	}

	.card.disabled {
		pointer-events: none;
	}

	.top {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}

	.name {
		font-weight: 600;
		font-size: 1.05rem;
	}

	.last {
		font-size: 0.85rem;
	}

	.dots {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-top: 10px;
	}

	.dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--surface-2);
		border: 1px solid var(--border);
	}

	.dot.filled {
		background: var(--accent);
		border-color: var(--accent);
	}

	.count {
		margin-left: 6px;
		font-size: 0.8rem;
	}
</style>
