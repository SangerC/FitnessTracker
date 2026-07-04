<script lang="ts">
	import { liveQueryStore } from '$lib/live';
	import {
		listCategories,
		listGoals,
		setGoal,
		deleteGoal,
		listExercises,
		archiveExercise
	} from '$lib/queries';

	const categories = liveQueryStore(() => listCategories(), []);
	const goals = liveQueryStore(() => listGoals(), []);
	const exercises = liveQueryStore(() => listExercises(), []);

	function goalFor(category: string) {
		return $goals.find((g) => g.category === category)?.targetPerWeek ?? 0;
	}

	async function updateGoal(category: string, value: number) {
		if (value <= 0) {
			const g = $goals.find((g) => g.category === category);
			if (g?.id) await deleteGoal(g.id);
		} else {
			await setGoal(category, value);
		}
	}
</script>

<div class="page">
	<h1>Settings</h1>

	<div class="section-title">Weekly goals</div>
	<div class="card">
		{#each $categories as category (category)}
			<div class="row">
				<span>{category}</span>
				<input
					type="number"
					min="0"
					max="7"
					value={goalFor(category)}
					onchange={(e) => updateGoal(category, Number((e.target as HTMLInputElement).value))}
				/>
			</div>
		{/each}
	</div>

	<div class="section-title">Exercises</div>
	<div class="card">
		{#if $exercises.length === 0}
			<p class="muted">No exercises yet.</p>
		{/if}
		{#each $exercises as exercise (exercise.id)}
			<div class="row">
				<div>
					<div class="name">{exercise.name}</div>
					<div class="muted small">{exercise.category} · {exercise.type}</div>
				</div>
				<button type="button" class="btn danger" onclick={() => archiveExercise(exercise.id!)}>
					Archive
				</button>
			</div>
		{/each}
	</div>

	<a class="btn full new" href="/exercises/new">+ New exercise</a>
</div>

<style>
	.row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 0;
		border-bottom: 1px solid var(--border);
	}

	.row:last-child {
		border-bottom: none;
	}

	.row input {
		width: 56px;
		text-align: center;
		padding: 6px;
		min-height: 36px;
	}

	.small {
		font-size: 0.78rem;
	}

	.new {
		margin-top: 20px;
	}
</style>
