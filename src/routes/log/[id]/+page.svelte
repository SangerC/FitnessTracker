<script lang="ts">
	import { page } from '$app/state';
	import LogExercise from './LogExercise.svelte';
</script>

{#key page.params.id}
	<LogExercise id={Number(page.params.id)} />
{/key}
