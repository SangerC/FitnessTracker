export type ExerciseType = 'strength' | 'cardio';

export const CATEGORIES = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Exercise {
	id?: number;
	name: string;
	category: Category;
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
	category: Category;
	targetPerWeek: number;
}
