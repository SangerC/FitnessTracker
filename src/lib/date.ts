/** Local YYYY-MM-DD key for a timestamp, used to group entries by calendar day. */
export function dayKey(timestamp: number): string {
	const d = new Date(timestamp);
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

export function todayKey(): string {
	return dayKey(Date.now());
}

/** Monday 00:00:00 of the week containing `timestamp`. */
export function startOfWeek(timestamp: number = Date.now()): number {
	const d = new Date(timestamp);
	d.setHours(0, 0, 0, 0);
	const dow = d.getDay(); // 0 = Sunday
	const diffToMonday = dow === 0 ? 6 : dow - 1;
	d.setDate(d.getDate() - diffToMonday);
	return d.getTime();
}

export function daysAgo(timestamp: number): number {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const then = new Date(timestamp);
	then.setHours(0, 0, 0, 0);
	return Math.round((today.getTime() - then.getTime()) / 86_400_000);
}

export function formatRelativeDay(timestamp: number): string {
	const diff = daysAgo(timestamp);
	if (diff === 0) return 'today';
	if (diff === 1) return 'yesterday';
	if (diff < 0) return 'in the future';
	return `${diff} days ago`;
}

export function formatDayLabel(key: string): string {
	const [y, m, d] = key.split('-').map(Number);
	const date = new Date(y, m - 1, d);
	return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatTime(timestamp: number): string {
	return new Date(timestamp).toLocaleTimeString(undefined, {
		hour: 'numeric',
		minute: '2-digit'
	});
}
