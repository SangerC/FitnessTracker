<script lang="ts">
	import { liveQueryStore } from '$lib/live';
	import { getCategorySummaries, getRecentExercises, listExercises } from '$lib/queries';
	import CategoryProgress from '$lib/components/CategoryProgress.svelte';
	import ExerciseTile from '$lib/components/ExerciseTile.svelte';
	import { base } from '$app/paths';

	const summaries = liveQueryStore(() => getCategorySummaries(), []);
	const recent = liveQueryStore(() => getRecentExercises(6), []);
	const exerciseCount = liveQueryStore(() => listExercises().then((e) => e.length), -1);
</script>

<div class="page">
	<h1>Fitness</h1>

	{#if $exerciseCount === 0}
		<div class="card empty">
			<p>No exercises yet.</p>
			<a class="btn primary full" href="{base}/exercises/new">+ Add your first exercise</a>
		</div>
	{:else if $exerciseCount > 0}
		{#if $summaries.length}
			<div class="section-title">This week</div>
			{#each $summaries as summary (summary.category)}
				<CategoryProgress {summary} />
			{/each}
		{/if}

		{#if $recent.length}
			<div class="section-title">Quick log</div>
			<div class="grid">
				{#each $recent as exercise (exercise.id)}
					<ExerciseTile {exercise} lastUsed={exercise.lastUsed} />
				{/each}
			</div>
		{/if}

		<a class="btn full more" href="{base}/log">+ Log an exercise</a>
	{/if}
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}

	.empty {
		margin-top: 16px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.more {
		margin-top: 28px;
	}
</style>
