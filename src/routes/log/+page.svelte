<script lang="ts">
	import { liveQueryStore } from '$lib/live';
	import { listExercisesByCategory } from '$lib/queries';
	import { base } from '$app/paths';

	const groups = liveQueryStore(() => listExercisesByCategory(), []);
	let search = $state('');

	const filteredGroups = $derived(
		$groups
			.map((g) => ({
				category: g.category,
				exercises: g.exercises.filter((e) =>
					e.name.toLowerCase().includes(search.trim().toLowerCase())
				)
			}))
			.filter((g) => g.exercises.length > 0)
	);
</script>

<div class="page">
	<h1>Log</h1>

	<div class="field search">
		<input type="search" placeholder="Search exercises" bind:value={search} />
	</div>

	{#if $groups.length === 0}
		<p class="muted">No exercises yet.</p>
	{:else if filteredGroups.length === 0}
		<p class="muted">No matches.</p>
	{/if}

	{#each filteredGroups as group (group.category)}
		<div class="section-title">{group.category}</div>
		<div class="card list">
			{#each group.exercises as exercise (exercise.id)}
				<a class="row" href={`${base}/log/${exercise.id}`}>{exercise.name}</a>
			{/each}
		</div>
	{/each}

	<a class="btn full new" href="{base}/exercises/new">+ New exercise</a>
</div>

<style>
	.search {
		margin-top: 12px;
	}

	.list {
		padding: 4px 14px;
	}

	.row {
		display: block;
		padding: 12px 0;
		border-bottom: 1px solid var(--border);
		font-size: 1rem;
	}

	.row:last-child {
		border-bottom: none;
	}

	.new {
		margin-top: 20px;
	}
</style>
