import { liveQuery } from 'dexie';
import { readable, type Readable } from 'svelte/store';

/** Adapts a Dexie liveQuery into a Svelte store so components can use `$store` reactively. */
export function liveQueryStore<T>(querier: () => Promise<T> | T, initial: T): Readable<T> {
	return readable<T>(initial, (set) => {
		const subscription = liveQuery(querier).subscribe({
			next: (value) => set(value),
			error: (err) => console.error('liveQuery error', err)
		});
		return () => subscription.unsubscribe();
	});
}
