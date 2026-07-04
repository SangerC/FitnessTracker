<script lang="ts">
	import { page } from '$app/state';
	import History from './History.svelte';
</script>

{#key page.params.id}
	<History id={Number(page.params.id)} />
{/key}
