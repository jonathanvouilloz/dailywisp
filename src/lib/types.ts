// Types globaux pour Wisp

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface MoodInfo {
	level: MoodLevel;
	emoji: string;
	labelEN: string;
	labelFR: string;
	color: string;
}

export const MOODS: Record<MoodLevel, MoodInfo> = {
	1: { level: 1, emoji: '😫', labelEN: 'Struggled', labelFR: 'Difficile', color: '#9B95A5' },
	2: { level: 2, emoji: '😕', labelEN: 'Tough', labelFR: 'Laborieux', color: '#8AACC8' },
	3: { level: 3, emoji: '😐', labelEN: 'Steady', labelFR: 'Régulier', color: '#9CB8A0' },
	4: { level: 4, emoji: '🙂', labelEN: 'Smooth', labelFR: 'Fluide', color: '#E8B89D' },
	5: { level: 5, emoji: '🌊', labelEN: 'Flow', labelFR: 'Flow', color: '#E8C87D' }
};

export type SessionStatus = 'active' | 'completed' | 'interrupted';

export interface Session {
	id?: number;
	date: string; // YYYY-MM-DD
	text: string;
	wordCount: number;
	durationMs: number;
	status: SessionStatus;
	mood?: MoodLevel;
	moodNote?: string;
	createdAt: Date;
	completedAt?: Date;
}

export interface User {
	id?: number;
	name: string;
	timezone: string;
	createdAt: Date;
	onboardingCompleted: boolean;
	totalSessions: number;        // Total completed sessions count
	lastBackupReminder: number;   // Session count at last backup reminder
}

export type WritingMode = 'normal' | 'zen';

export interface Settings {
	id?: number;
	theme: 'light' | 'dark' | 'auto';
	language: 'en' | 'fr';
	writingMode: WritingMode;
}

// Wisp moods for the mascot images
export type WispMood = 'neutral' | 'happy' | 'thinking' | 'stressed' | 'zen' | 'pointing' | 'sharing';

// Constantes de gameplay - Objectif
export const WORD_TARGET = 300;

// Moteur de jauge
export const GAUGE_START = 50;
export const GAUGE_PER_CHAR = 0.8;        // +0.8% par caractère
export const GAUGE_GRACE_DELAY = 1.5;     // secondes avant decay
export const GAUGE_DECAY = 12;            // %/seconde (normal)
export const GAUGE_DECAY_FLOW = 6;        // %/seconde (en Flow)
export const GAUGE_MAX = 100;
export const GAUGE_MIN = 0;

// État de Flow
export const FLOW_THRESHOLD_TIME = 5;     // secondes à 100% pour activer
