<script lang="ts">
	import { goto } from '$app/navigation';
	import { liveQueryStore } from '$lib/live';
	import { listCategories, addExercise } from '$lib/queries';
	import type { ExerciseType } from '$lib/types';
	import { base } from '$app/paths';

	const categories = liveQueryStore(() => listCategories(), []);

	let name = $state('');
	let category = $state('');
	let type = $state<ExerciseType>('strength');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!name.trim() || !category.trim()) return;
		const id = await addExercise({ name: name.trim(), category: category.trim(), type });
		goto(`${base}/log/${id}`);
	}
</script>

<div class="page">
	<a class="back muted" href="{base}/log">← Back</a>
	<h1>New exercise</h1>

	<form onsubmit={handleSubmit}>
		<div class="field">
			<label for="name">Name</label>
			<input id="name" bind:value={name} placeholder="e.g. Bench Press" required />
		</div>

		<div class="field">
			<label for="category">Category</label>
			<input
				id="category"
				list="categories"
				bind:value={category}
				placeholder="e.g. Chest"
				required
			/>
			<datalist id="categories">
				{#each $categories as c (c)}<option value={c}></option>{/each}
			</datalist>
		</div>

		<div class="field">
			<span>Type</span>
			<div class="toggle">
				<button
					type="button"
					class="btn"
					class:primary={type === 'strength'}
					onclick={() => (type = 'strength')}>Strength</button
				>
				<button
					type="button"
					class="btn"
					class:primary={type === 'cardio'}
					onclick={() => (type = 'cardio')}>Cardio</button
				>
			</div>
		</div>

		<button type="submit" class="btn primary full">Add exercise</button>
	</form>
</div>

<style>
	.back {
		display: inline-block;
		margin-bottom: 8px;
	}

	.toggle {
		display: flex;
		gap: 8px;
	}

	.toggle .btn {
		flex: 1;
	}
</style>
