export type ExerciseType = 'strength' | 'cardio';

export interface Exercise {
	id?: number;
	name: string;
	category: string;
	type: ExerciseType;
	archived?: boolean;
}

export interface SetEntry {
	id?: number;
	exerciseId: number;
	timestamp: number;
	weight: number;
	reps: number;
}

export interface CardioEntry {
	id?: number;
	exerciseId: number;
	timestamp: number;
	distance: number;
	duration: number;
}

export interface Goal {
	id?: number;
	category: string;
	targetPerWeek: number;
}

export const DEFAULT_CATEGORIES = [
	'Chest',
	'Back',
	'Legs',
	'Shoulders',
	'Arms',
	'Core',
	'Cardio'
];
