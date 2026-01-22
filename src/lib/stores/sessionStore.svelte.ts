import { getTodaySession, saveSession, updateSession, getSessionByDate } from '$lib/db';
import type { Session, MoodLevel } from '$lib/types';
import {
	WORD_TARGET,
	GAUGE_START,
	GAUGE_PER_CHAR,
	GAUGE_GRACE_DELAY,
	GAUGE_DECAY,
	GAUGE_DECAY_FLOW,
	GAUGE_MAX,
	GAUGE_MIN,
	FLOW_THRESHOLD_TIME
} from '$lib/types';
import { settingsStore } from './settingsStore.svelte';

type SessionStoreStatus = 'idle' | 'active' | 'completed' | 'interrupted';

function countWords(text: string): number {
	if (!text || !text.trim()) return 0;
	return text.trim().split(/\s+/).filter(Boolean).length;
}

function getTodayDate(): string {
	return new Date().toISOString().split('T')[0];
}

class SessionStore {
	// Session state (memory only until completion)
	text = $state('');
	startTime = $state<Date | null>(null);
	status = $state<SessionStoreStatus>('idle');
	gaugeLevel = $state(0);
	lastTypeTime = $state(0);

	// Flow state
	inFlowState = $state(false);
	private flowStartTime = $state<number | null>(null);

	// Persisted session (after completion)
	private savedSessionId = $state<number | null>(null);

	// Derived values
	wordCount = $derived(countWords(this.text));
	canComplete = $derived(this.wordCount >= WORD_TARGET);
	isActive = $derived(this.status === 'active');
	isCompleted = $derived(this.status === 'completed');
	isInterrupted = $derived(this.status === 'interrupted');
	progress = $derived(Math.min(100, (this.wordCount / WORD_TARGET) * 100));

	private previousCharCount = 0;
	private tickInterval: ReturnType<typeof setInterval> | null = null;

	async checkTodaySession(): Promise<boolean> {
		if (typeof window === 'undefined') return false;

		try {
			const session = await getTodaySession();
			if (session) {
				if (session.status === 'completed') {
					this.status = 'completed';
					this.text = session.text;
					this.savedSessionId = session.id ?? null;
					return true;
				}
				// Interrupted sessions don't block - user can retry unlimited times
			}
			return false;
		} catch (error) {
			console.error('Failed to check today session:', error);
			return false;
		}
	}

	startSession(initialText: string = ''): void {
		if (this.status === 'completed') return;

		this.text = initialText;
		this.startTime = new Date();
		this.status = 'active';
		this.gaugeLevel = GAUGE_START;
		this.lastTypeTime = Date.now();
		this.previousCharCount = initialText.length;
		this.inFlowState = false;
		this.flowStartTime = null;

		// Start the decay tick
		this.startTick();
	}

	updateText(newText: string): void {
		if (this.status !== 'active') return;

		const oldCharCount = this.previousCharCount;
		this.text = newText;
		const newCharCount = newText.length;

		// Only add gauge for new characters typed
		const charsAdded = Math.max(0, newCharCount - oldCharCount);
		if (charsAdded > 0) {
			this.gaugeLevel = Math.min(GAUGE_MAX, this.gaugeLevel + charsAdded * GAUGE_PER_CHAR);
			this.lastTypeTime = Date.now();
		}

		this.previousCharCount = newCharCount;
	}

	private startTick(): void {
		if (this.tickInterval) {
			clearInterval(this.tickInterval);
		}

		// Tick every 100ms for smooth decay
		this.tickInterval = setInterval(() => {
			this.tick();
		}, 100);
	}

	private stopTick(): void {
		if (this.tickInterval) {
			clearInterval(this.tickInterval);
			this.tickInterval = null;
		}
	}

	tick(): void {
		if (this.status !== 'active') {
			this.stopTick();
			return;
		}

		// Skip decay entirely in Zen mode
		if (settingsStore.writingMode === 'zen') {
			return;
		}

		const now = Date.now();
		const timeSinceLastType = (now - this.lastTypeTime) / 1000; // seconds

		// Flow state management
		if (this.gaugeLevel >= GAUGE_MAX) {
			// At 100% - check for Flow activation
			if (!this.flowStartTime) {
				this.flowStartTime = now;
			} else {
				const timeAtMax = (now - this.flowStartTime) / 1000;
				if (timeAtMax >= FLOW_THRESHOLD_TIME && !this.inFlowState) {
					this.inFlowState = true;
				}
			}
		} else {
			// Below 100% - exit Flow state
			if (this.inFlowState) {
				this.inFlowState = false;
			}
			this.flowStartTime = null;
		}

		// Only decay if no typing for more than grace delay
		if (timeSinceLastType > GAUGE_GRACE_DELAY) {
			// Linear decay - reduced in Flow state
			const decayPerSec = this.inFlowState ? GAUGE_DECAY_FLOW : GAUGE_DECAY;

			// Decay per tick (100ms = 0.1 seconds)
			const decayAmount = decayPerSec * 0.1;
			this.gaugeLevel = Math.max(GAUGE_MIN, this.gaugeLevel - decayAmount);

			// Check for session interruption
			if (this.gaugeLevel <= GAUGE_MIN && !this.canComplete) {
				this.interruptSession();
			}
		}
	}

	async completeSession(): Promise<void> {
		if (this.status !== 'active' || !this.canComplete) return;

		this.stopTick();
		this.inFlowState = false;
		this.flowStartTime = null;
		const now = new Date();

		const session: Omit<Session, 'id'> = {
			date: getTodayDate(),
			text: this.text,
			wordCount: this.wordCount,
			durationMs: this.startTime ? now.getTime() - this.startTime.getTime() : 0,
			status: 'completed',
			createdAt: this.startTime ?? now,
			completedAt: now
		};

		try {
			const id = await saveSession(session);
			if (id) {
				this.savedSessionId = id;
				this.status = 'completed';
			}
		} catch (error) {
			console.error('Failed to save session:', error);
		}
	}

	interruptSession(): void {
		this.stopTick();
		this.status = 'interrupted';
		this.gaugeLevel = 0;
		this.inFlowState = false;
		this.flowStartTime = null;

		// Save the interrupted session - text is preserved for future use
		const session: Omit<Session, 'id'> = {
			date: getTodayDate(),
			text: this.text,
			wordCount: this.wordCount,
			durationMs: this.startTime ? Date.now() - this.startTime.getTime() : 0,
			status: 'interrupted',
			createdAt: this.startTime ?? new Date()
		};

		saveSession(session).catch(console.error);
	}

	async setMood(mood: MoodLevel, note?: string): Promise<void> {
		if (!this.savedSessionId) return;

		try {
			await updateSession(this.savedSessionId, {
				mood,
				moodNote: note
			});
		} catch (error) {
			console.error('Failed to save mood:', error);
		}
	}

	reset(): void {
		this.stopTick();
		this.text = '';
		this.startTime = null;
		this.status = 'idle';
		this.gaugeLevel = 0;
		this.lastTypeTime = 0;
		this.savedSessionId = null;
		this.previousCharCount = 0;
		this.inFlowState = false;
		this.flowStartTime = null;
	}

	async getSessionForDate(date: string): Promise<Session | undefined> {
		return getSessionByDate(date);
	}
}

export const sessionStore = new SessionStore();
