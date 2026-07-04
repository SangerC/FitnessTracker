import { db } from './db';
import { dayKey, startOfWeek, todayKey } from './date';
import type { CardioEntry, Category, Exercise, Goal, SetEntry } from './types';

// ---- Exercises ----

export async function listExercises(includeArchived = false): Promise<Exercise[]> {
	const all = await db.exercises.toArray();
	return all
		.filter((e) => includeArchived || !e.archived)
		.sort((a, b) => a.name.localeCompare(b.name));
}

export interface CategoryGroup {
	category: Category;
	exercises: Exercise[];
}

export async function listExercisesByCategory(): Promise<CategoryGroup[]> {
	const exercises = await listExercises();
	const map = new Map<Category, Exercise[]>();
	for (const e of exercises) {
		if (!map.has(e.category)) map.set(e.category, []);
		map.get(e.category)!.push(e);
	}
	return Array.from(map.entries())
		.map(([category, exercises]) => ({ category, exercises }))
		.sort((a, b) => a.category.localeCompare(b.category));
}

export async function getExercise(id: number): Promise<Exercise | undefined> {
	return db.exercises.get(id);
}

export async function addExercise(exercise: Omit<Exercise, 'id'>): Promise<number> {
	return db.exercises.add(exercise);
}

export async function updateExercise(
	id: number,
	updates: Pick<Exercise, 'name' | 'category' | 'type'>
): Promise<void> {
	await db.exercises.update(id, updates);
}

export async function archiveExercise(id: number, archived = true): Promise<void> {
	await db.exercises.update(id, { archived });
}

/** Exercises used most recently (across sets or cardio), for one-tap quick-log tiles. */
export async function getRecentExercises(limit = 6): Promise<Array<Exercise & { lastUsed: number }>> {
	const [sets, cardio, exercises] = await Promise.all([
		db.sets.toArray(),
		db.cardioEntries.toArray(),
		db.exercises.toArray()
	]);
	const lastUsed = new Map<number, number>();
	for (const s of sets) {
		lastUsed.set(s.exerciseId, Math.max(lastUsed.get(s.exerciseId) ?? 0, s.timestamp));
	}
	for (const c of cardio) {
		lastUsed.set(c.exerciseId, Math.max(lastUsed.get(c.exerciseId) ?? 0, c.timestamp));
	}
	const exerciseMap = new Map(exercises.map((e) => [e.id!, e]));
	return Array.from(lastUsed.entries())
		.map(([exerciseId, ts]) => {
			const ex = exerciseMap.get(exerciseId);
			return ex && !ex.archived ? { ...ex, lastUsed: ts } : null;
		})
		.filter((x): x is Exercise & { lastUsed: number } => x !== null)
		.sort((a, b) => b.lastUsed - a.lastUsed)
		.slice(0, limit);
}

// ---- Sets (strength) ----

export interface StrengthSession {
	dayKey: string;
	timestamp: number;
	sets: SetEntry[];
}

/** The most recent day this exercise was logged, with all its sets in order. */
export async function getLastSetSession(exerciseId: number): Promise<StrengthSession | null> {
	const sets = await db.sets.where('exerciseId').equals(exerciseId).sortBy('timestamp');
	if (sets.length === 0) return null;
	const key = dayKey(sets[sets.length - 1].timestamp);
	const sameDay = sets.filter((s) => dayKey(s.timestamp) === key);
	return { dayKey: key, timestamp: sameDay[0].timestamp, sets: sameDay };
}

export async function getTodaySets(exerciseId: number): Promise<SetEntry[]> {
	const key = todayKey();
	const sets = await db.sets.where('exerciseId').equals(exerciseId).sortBy('timestamp');
	return sets.filter((s) => dayKey(s.timestamp) === key);
}

export async function addSet(entry: {
	exerciseId: number;
	weight: number;
	reps: number;
	timestamp?: number;
}): Promise<number> {
	return db.sets.add({ ...entry, timestamp: entry.timestamp ?? Date.now() });
}

export async function deleteSet(id: number): Promise<void> {
	await db.sets.delete(id);
}

export async function getExerciseHistory(exerciseId: number, limit = 15): Promise<StrengthSession[]> {
	const sets = await db.sets.where('exerciseId').equals(exerciseId).sortBy('timestamp');
	const byDay = new Map<string, SetEntry[]>();
	for (const s of sets) {
		const key = dayKey(s.timestamp);
		if (!byDay.has(key)) byDay.set(key, []);
		byDay.get(key)!.push(s);
	}
	return Array.from(byDay.entries())
		.map(([key, daySets]) => ({ dayKey: key, timestamp: daySets[0].timestamp, sets: daySets }))
		.sort((a, b) => b.timestamp - a.timestamp)
		.slice(0, limit);
}

// ---- Cardio ----

export async function getLastCardioEntry(exerciseId: number): Promise<CardioEntry | undefined> {
	const entries = await db.cardioEntries.where('exerciseId').equals(exerciseId).sortBy('timestamp');
	return entries[entries.length - 1];
}

export async function getTodayCardioEntries(exerciseId: number): Promise<CardioEntry[]> {
	const key = todayKey();
	const entries = await db.cardioEntries.where('exerciseId').equals(exerciseId).sortBy('timestamp');
	return entries.filter((c) => dayKey(c.timestamp) === key);
}

export async function addCardioEntry(entry: {
	exerciseId: number;
	distance: number;
	duration: number;
	timestamp?: number;
}): Promise<number> {
	return db.cardioEntries.add({ ...entry, timestamp: entry.timestamp ?? Date.now() });
}

export async function deleteCardioEntry(id: number): Promise<void> {
	await db.cardioEntries.delete(id);
}

export async function getCardioHistory(exerciseId: number, limit = 15): Promise<CardioEntry[]> {
	const entries = await db.cardioEntries.where('exerciseId').equals(exerciseId).sortBy('timestamp');
	return entries.reverse().slice(0, limit);
}

// ---- Category summaries (weekly goal progress + "last done") ----

export interface CategorySummary {
	category: Category;
	lastTimestamp: number | null;
	daysThisWeek: number;
	targetPerWeek: number | null;
}

export async function getCategorySummaries(): Promise<CategorySummary[]> {
	const [goals, exercises, sets, cardio] = await Promise.all([
		db.goals.toArray(),
		db.exercises.toArray(),
		db.sets.toArray(),
		db.cardioEntries.toArray()
	]);
	const exerciseCategory = new Map(
		exercises.filter((e) => !e.archived).map((e) => [e.id!, e.category])
	);
	const goalMap = new Map(goals.map((g) => [g.category, g.targetPerWeek]));
	const weekStart = startOfWeek();

	const categories = new Set<Category>([...exerciseCategory.values(), ...goalMap.keys()]);
	const daysByCategory = new Map<Category, Set<string>>();
	const lastByCategory = new Map<Category, number>();

	const record = (exerciseId: number, timestamp: number) => {
		const category = exerciseCategory.get(exerciseId);
		if (!category) return;
		lastByCategory.set(category, Math.max(lastByCategory.get(category) ?? 0, timestamp));
		if (timestamp >= weekStart) {
			if (!daysByCategory.has(category)) daysByCategory.set(category, new Set());
			daysByCategory.get(category)!.add(dayKey(timestamp));
		}
	};
	for (const s of sets) record(s.exerciseId, s.timestamp);
	for (const c of cardio) record(c.exerciseId, c.timestamp);

	return Array.from(categories)
		.map((category) => ({
			category,
			lastTimestamp: lastByCategory.get(category) ?? null,
			daysThisWeek: daysByCategory.get(category)?.size ?? 0,
			targetPerWeek: goalMap.get(category) ?? null
		}))
		.sort((a, b) => a.category.localeCompare(b.category));
}

// ---- Goals ----

export async function listGoals(): Promise<Goal[]> {
	return db.goals.toArray();
}

export async function setGoal(category: Category, targetPerWeek: number): Promise<void> {
	const existing = await db.goals.where('category').equals(category).first();
	if (existing) {
		await db.goals.update(existing.id!, { targetPerWeek });
	} else {
		await db.goals.add({ category, targetPerWeek });
	}
}

export async function deleteGoal(id: number): Promise<void> {
	await db.goals.delete(id);
}

// ---- Day view ("chest day" summary) ----

export interface DayExerciseGroup {
	exercise: Exercise;
	sets: SetEntry[];
	cardio: CardioEntry[];
}

export async function getDayEntries(key: string): Promise<DayExerciseGroup[]> {
	const [sets, cardio, exercises] = await Promise.all([
		db.sets.toArray(),
		db.cardioEntries.toArray(),
		db.exercises.toArray()
	]);
	const exerciseMap = new Map(exercises.map((e) => [e.id!, e]));
	const groups = new Map<number, DayExerciseGroup>();

	for (const s of sets) {
		if (dayKey(s.timestamp) !== key) continue;
		const ex = exerciseMap.get(s.exerciseId);
		if (!ex) continue;
		if (!groups.has(s.exerciseId)) groups.set(s.exerciseId, { exercise: ex, sets: [], cardio: [] });
		groups.get(s.exerciseId)!.sets.push(s);
	}
	for (const c of cardio) {
		if (dayKey(c.timestamp) !== key) continue;
		const ex = exerciseMap.get(c.exerciseId);
		if (!ex) continue;
		if (!groups.has(c.exerciseId)) groups.set(c.exerciseId, { exercise: ex, sets: [], cardio: [] });
		groups.get(c.exerciseId)!.cardio.push(c);
	}

	for (const g of groups.values()) {
		g.sets.sort((a, b) => a.timestamp - b.timestamp);
		g.cardio.sort((a, b) => a.timestamp - b.timestamp);
	}

	return Array.from(groups.values()).sort((a, b) =>
		a.exercise.category.localeCompare(b.exercise.category)
	);
}
