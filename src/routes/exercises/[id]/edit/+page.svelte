<script lang="ts">
	import { page } from '$app/state';
	import EditExercise from './EditExercise.svelte';
</script>

{#key page.params.id}
	<EditExercise id={Number(page.params.id)} />
{/key}
