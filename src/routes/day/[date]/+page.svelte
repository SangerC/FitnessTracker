<script lang="ts">
	import { page } from '$app/state';
	import { getDayEntries, type DayExerciseGroup } from '$lib/queries';
	import { formatDayLabel } from '$lib/date';

	const dateKey = $derived(page.params.date ?? '');
	let groups = $state<DayExerciseGroup[]>([]);
	let loading = $state(true);

	$effect(() => {
		const key = dateKey;
		loading = true;
		getDayEntries(key).then((g) => {
			groups = g;
			loading = false;
		});
	});
</script>

<div class="page">
	<a class="back muted" href="/">← Back</a>
	<h1>{formatDayLabel(dateKey)}</h1>

	{#if loading}
		<p class="muted">Loading…</p>
	{:else if groups.length === 0}
		<p class="muted">Nothing logged this day.</p>
	{:else}
		{#each groups as group (group.exercise.id)}
			<div class="section-title">{group.exercise.category}</div>
			<div class="card">
				<div class="name">{group.exercise.name}</div>
				{#each group.sets as s (s.id)}
					<div class="ref-row">{s.weight} lb × {s.reps}</div>
				{/each}
				{#each group.cardio as c (c.id)}
					<div class="ref-row">{c.distance} mi · {c.duration} min</div>
				{/each}
			</div>
		{/each}
	{/if}
</div>

<style>
	.back {
		display: inline-block;
		margin-bottom: 8px;
	}

	.name {
		font-weight: 600;
		margin-bottom: 6px;
	}

	.ref-row {
		display: flex;
		justify-content: space-between;
		padding: 4px 0;
	}
</style>
