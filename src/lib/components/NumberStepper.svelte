<script lang="ts">
	let {
		value = $bindable(0),
		step = 1,
		min = 0,
		label = ''
	}: { value: number; step?: number; min?: number; label?: string } = $props();

	function round(v: number) {
		return Math.round(v * 100) / 100;
	}

	function dec() {
		value = Math.max(min, round(value - step));
	}

	function inc() {
		value = round(value + step);
	}
</script>

<div class="stepper">
	{#if label}<span class="label">{label}</span>{/if}
	<div class="controls">
		<button type="button" class="btn round" onclick={dec} aria-label="decrease {label}">−</button>
		<input type="number" inputmode="decimal" bind:value />
		<button type="button" class="btn round" onclick={inc} aria-label="increase {label}">+</button>
	</div>
</div>

<style>
	.stepper {
		display: flex;
		flex-direction: column;
		gap: 6px;
		flex: 1;
		min-width: 0;
	}

	.label {
		font-size: 0.85rem;
		color: var(--text-dim);
	}

	.controls {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.round {
		width: 48px;
		height: 48px;
		padding: 0;
		font-size: 1.4rem;
		border-radius: 50%;
		flex-shrink: 0;
	}

	input {
		flex: 1;
		min-width: 0;
		text-align: center;
		font-size: 1.2rem;
		font-weight: 600;
		height: 48px;
	}

	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
</style>
