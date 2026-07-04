<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getExercise, updateExercise } from '$lib/queries';
	import { CATEGORIES, type Category, type ExerciseType } from '$lib/types';
	import { base } from '$app/paths';

	let { id }: { id: number } = $props();

	let loading = $state(true);
	let notFound = $state(false);
	let name = $state('');
	let category = $state<Category | ''>('');
	let type = $state<ExerciseType>('strength');

	onMount(async () => {
		const ex = await getExercise(id);
		if (!ex) {
			notFound = true;
		} else {
			name = ex.name;
			category = ex.category;
			type = ex.type;
		}
		loading = false;
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!name.trim() || !category) return;
		await updateExercise(id, { name: name.trim(), category, type });
		goto(`${base}/settings`);
	}
</script>

<div class="page">
	<a class="back muted" href="{base}/settings">← Back</a>
	<h1>Edit exercise</h1>

	{#if loading}
		<p class="muted">Loading…</p>
	{:else if notFound}
		<p>Exercise not found.</p>
	{:else}
		<form onsubmit={handleSubmit}>
			<div class="field">
				<label for="name">Name</label>
				<input id="name" bind:value={name} placeholder="e.g. Bench Press" required />
			</div>

			<div class="field">
				<label for="category">Category</label>
				<select id="category" bind:value={category} required>
					{#each CATEGORIES as c (c)}<option value={c}>{c}</option>{/each}
				</select>
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

			<button type="submit" class="btn primary full">Save changes</button>
		</form>
	{/if}
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
