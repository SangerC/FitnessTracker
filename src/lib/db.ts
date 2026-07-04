import Dexie, { type Table } from 'dexie';
import type { CardioEntry, Exercise, Goal, SetEntry } from './types';

class FitnessDB extends Dexie {
	exercises!: Table<Exercise, number>;
	sets!: Table<SetEntry, number>;
	cardioEntries!: Table<CardioEntry, number>;
	goals!: Table<Goal, number>;

	constructor() {
		super('fitness-tracker');
		this.version(1).stores({
			exercises: '++id, name, category, type, archived',
			sets: '++id, exerciseId, timestamp',
			cardioEntries: '++id, exerciseId, timestamp',
			goals: '++id, &category'
		});
	}
}

export const db = new FitnessDB();
