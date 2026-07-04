import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Must match the repo name's exact casing: GitHub Pages project site URLs are case-sensitive.
const base = process.env.NODE_ENV === 'production' ? '/FitnessTracker' : '';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({
				pages: 'build',
				assets: 'build',
				fallback: 'index.html',
				precompress: false,
				strict: true
			}),
			paths: {
				base
			}
		}),
		VitePWA({
			registerType: 'autoUpdate',
			// SvelteKit doesn't run Vite's index.html transform, so vite-plugin-pwa's auto-injection of
			// the manifest link/register script never reaches the output. Both are added by hand instead
			// (app.html for the manifest link, +layout.svelte for registration via virtual:pwa-register).
			injectRegister: false,
			manifestFilename: 'manifest.webmanifest',
			base: `${base}/`,
			scope: `${base}/`,
			manifest: {
				name: 'Fitness Tracker',
				short_name: 'Fitness',
				description: 'Log lifts and runs with minimal taps',
				start_url: `${base}/`,
				scope: `${base}/`,
				display: 'standalone',
				background_color: '#0f172a',
				theme_color: '#0f172a',
				icons: [
					{ src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
					{ src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
					{
						src: 'icons/icon-512-maskable.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}']
			}
		})
	]
});
