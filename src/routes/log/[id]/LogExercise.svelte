<script lang="ts">
	import { onMount } from 'svelte';
	import { liveQueryStore } from '$lib/live';
	import {
		getExercise,
		getLastSetSession,
		getTodaySets,
		addSet,
		deleteSet,
		getLastCardioEntry,
		getTodayCardioEntries,
		addCardioEntry,
		deleteCardioEntry,
		type StrengthSession
	} from '$lib/queries';
	import type { CardioEntry, Exercise, SetEntry } from '$lib/types';
	import NumberStepper from '$lib/components/NumberStepper.svelte';
	import SetRow from '$lib/components/SetRow.svelte';
	import { formatRelativeDay } from '$lib/date';
	import { base } from '$app/paths';

	let { id }: { id: number } = $props();

	let loading = $state(true);
	let exercise = $state<Exercise | null>(null);
	let lastSession = $state<StrengthSession | null>(null);
	let lastCardio = $state<CardioEntry | null>(null);

	let weight = $state(0);
	let reps = $state(8);
	let distance = $state(0);
	let duration = $state(30);

	const todaySets = liveQueryStore<SetEntry[]>(() => getTodaySets(id), []);
	const todayCardio = liveQueryStore<CardioEntry[]>(() => getTodayCardioEntries(id), []);

	onMount(async () => {
		const ex = await getExercise(id);
		exercise = ex ?? null;

		if (ex?.type === 'strength') {
			const session = await getLastSetSession(id);
			lastSession = session;
			const latest = session?.sets[session.sets.length - 1];
			weight = latest?.weight ?? 0;
			reps = latest?.reps ?? 8;
		} else if (ex?.type === 'cardio') {
			const cardio = await getLastCardioEntry(id);
			lastCardio = cardio ?? null;
			distance = cardio?.distance ?? 0;
			duration = cardio?.duration ?? 30;
		}
		loading = false;
	});

	async function handleAddSet() {
		await addSet({ exerciseId: id, weight, reps });
	}

	async function handleSaveRun() {
		await addCardioEntry({ exerciseId: id, distance, duration });
	}
</script>

<div class="page">
	<a class="back muted" href="{base}/log">← Back</a>

	{#if loading}
		<p class="muted">Loading…</p>
	{:else if !exercise}
		<p>Exercise not found.</p>
	{:else}
		<h1>{exercise.name}</h1>
		<p class="muted category">
			{exercise.category} · <a class="muted" href={`${base}/history/${id}`}>full history</a>
		</p>

		{#if exercise.type === 'strength'}
			{#if lastSession}
				<div class="section-title">Last time ({formatRelativeDay(lastSession.timestamp)})</div>
				<div class="card">
					{#each lastSession.sets as s (s.id)}
						<div class="ref-row">{s.weight} lb × {s.reps}</div>
					{/each}
				</div>
			{/if}

			<div class="section-title">Add set</div>
			<div class="card input-card">
				<div class="steppers">
					<NumberStepper label="Weight (lb)" bind:value={weight} step={5} />
					<NumberStepper label="Reps" bind:value={reps} step={1} />
				</div>
				<button type="button" class="btn primary full" onclick={handleAddSet}>Add set</button>
			</div>

			{#if $todaySets.length}
				<div class="section-title">Today</div>
				<div class="card">
					{#each $todaySets as s (s.id)}
						<SetRow set={s} onDelete={deleteSet} />
					{/each}
				</div>
			{/if}
		{:else}
			{#if lastCardio}
				<div class="section-title">Last time ({formatRelativeDay(lastCardio.timestamp)})</div>
				<div class="card ref-row">{lastCardio.distance} mi · {lastCardio.duration} min</div>
			{/if}

			<div class="section-title">Log run</div>
			<div class="card input-card">
				<div class="steppers">
					<NumberStepper label="Distance (mi)" bind:value={distance} step={0.25} />
					<NumberStepper label="Duration (min)" bind:value={duration} step={1} />
				</div>
				<button type="button" class="btn primary full" onclick={handleSaveRun}>Save run</button>
			</div>

			{#if $todayCardio.length}
				<div class="section-title">Today</div>
				<div class="card">
					{#each $todayCardio as c (c.id)}
						<div class="ref-row">
							{c.duration} min · {c.distance} mi
							<button
								type="button"
								class="delete"
								onclick={() => deleteCardioEntry(c.id!)}
								aria-label="Delete run">×</button
							>
						</div>
					{/each}
				</div>
			{/if}
		{/if}

		<a class="btn full done" href="{base}/">Done</a>
	{/if}
</div>

<style>
	.back {
		display: inline-block;
		margin-bottom: 8px;
	}

	.category {
		margin-top: 2px;
	}

	.steppers {
		display: flex;
		gap: 12px;
		margin-bottom: 14px;
	}

	.input-card {
		display: flex;
		flex-direction: column;
	}

	.ref-row {
		display: flex;
		justify-content: space-between;
		padding: 6px 0;
	}

	.done {
		margin-top: 24px;
	}

	.delete {
		background: none;
		border: none;
		color: var(--text-dim);
		font-size: 1.2rem;
		cursor: pointer;
	}
</style>
