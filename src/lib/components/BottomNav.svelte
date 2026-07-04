<script lang="ts">
	import { page } from '$app/state';
	import { base } from '$app/paths';

	const items = [
		{ route: '/', label: 'Home', icon: '⌂' },
		{ route: '/log', label: 'Log', icon: '+' },
		{ route: '/settings', label: 'Settings', icon: '⚙' }
	];

	function isActive(route: string) {
		const path = page.url.pathname.slice(base.length) || '/';
		if (route === '/') return path === '/';
		return path.startsWith(route);
	}
</script>

<nav>
	{#each items as item (item.route)}
		<a href={`${base}${item.route}`} class:active={isActive(item.route)}>
			<span class="icon">{item.icon}</span>
			<span class="label">{item.label}</span>
		</a>
	{/each}
</nav>

<style>
	nav {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		background: var(--surface);
		border-top: 1px solid var(--border);
		padding-bottom: env(safe-area-inset-bottom);
		max-width: 480px;
		margin: 0 auto;
	}

	a {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding: 10px 0 8px;
		color: var(--text-dim);
	}

	a.active {
		color: var(--accent);
	}

	.icon {
		font-size: 1.4rem;
		line-height: 1;
	}

	.label {
		font-size: 0.7rem;
	}
</style>
