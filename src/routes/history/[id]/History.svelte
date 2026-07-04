<script lang="ts">
	import { onMount } from 'svelte';
	import { getExercise, getExerciseHistory, getCardioHistory, type StrengthSession } from '$lib/queries';
	import type { CardioEntry, Exercise } from '$lib/types';
	import { dayKey, formatDayLabel, formatRelativeDay } from '$lib/date';
	import { base } from '$app/paths';

	let { id }: { id: number } = $props();

	let loading = $state(true);
	let exercise = $state<Exercise | null>(null);
	let sessions = $state<StrengthSession[]>([]);
	let cardioEntries = $state<CardioEntry[]>([]);

	onMount(async () => {
		const ex = await getExercise(id);
		exercise = ex ?? null;
		if (ex?.type === 'strength') {
			sessions = await getExerciseHistory(id);
		} else if (ex?.type === 'cardio') {
			cardioEntries = await getCardioHistory(id);
		}
		loading = false;
	});
</script>

<div class="page">
	<a class="back muted" href="{base}/log">← Back</a>

	{#if loading}
		<p class="muted">Loading…</p>
	{:else if !exercise}
		<p>Exercise not found.</p>
	{:else}
		<h1>{exercise.name}</h1>
		<p class="muted">{exercise.category}</p>

		<a class="btn primary full log-link" href={`${base}/log/${id}`}>Log {exercise.name}</a>

		<div class="section-title">History</div>
		{#if exercise.type === 'strength'}
			{#if sessions.length === 0}
				<p class="muted">No history yet.</p>
			{/if}
			{#each sessions as session (session.dayKey)}
				<div class="card session">
					<div class="date">
						{formatDayLabel(session.dayKey)} · {formatRelativeDay(session.timestamp)}
					</div>
					{#each session.sets as s (s.id)}
						<div class="ref-row">{s.weight} lb × {s.reps}</div>
					{/each}
				</div>
			{/each}
		{:else}
			{#if cardioEntries.length === 0}
				<p class="muted">No history yet.</p>
			{/if}
			{#each cardioEntries as c (c.id)}
				<div class="card session">
					<div class="date">
						{formatDayLabel(dayKey(c.timestamp))} · {formatRelativeDay(c.timestamp)}
					</div>
					<div class="ref-row">{c.distance} mi · {c.duration} min</div>
				</div>
			{/each}
		{/if}
	{/if}
</div>

<style>
	.back {
		display: inline-block;
		margin-bottom: 8px;
	}

	.log-link {
		margin: 14px 0;
	}

	.session {
		margin-bottom: 10px;
	}

	.date {
		font-size: 0.8rem;
		color: var(--text-dim);
		margin-bottom: 6px;
	}

	.ref-row {
		display: flex;
		justify-content: space-between;
		padding: 4px 0;
	}
</style>
