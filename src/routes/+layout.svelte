<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import { browser } from '$app/environment';

	let { children } = $props();

	if (browser) {
		import('virtual:pwa-register').then(({ registerSW }) => registerSW({ immediate: true }));
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<BottomNav />
