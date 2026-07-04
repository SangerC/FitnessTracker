<script lang="ts">
	import { page } from '$app/state';

	const items = [
		{ href: '/', label: 'Home', icon: '⌂' },
		{ href: '/log', label: 'Log', icon: '+' },
		{ href: '/settings', label: 'Settings', icon: '⚙' }
	];

	function isActive(href: string) {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}
</script>

<nav>
	{#each items as item (item.href)}
		<a href={item.href} class:active={isActive(item.href)}>
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
