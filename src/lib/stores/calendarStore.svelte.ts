import { getAllSessions, getSessionByDate, calculateStreak } from '$lib/db';
import type { Session } from '$lib/types';
import { isSessionLocked } from '$lib/utils/premium';

class CalendarStore {
	sessions = $state<Session[]>([]);
	loading = $state(true);
	currentStreak = $state(0);
	longestStreak = $state(0);

	// Map sessions by date for quick lookup
	sessionsByDate = $derived.by<Map<string, Session>>(() => {
		const map = new Map<string, Session>();
		for (const session of this.sessions) {
			map.set(session.date, session);
		}
		return map;
	});

	// Set of completed dates for calendar highlighting
	completedDates = $derived.by<Set<string>>(() => {
		const set = new Set<string>();
		for (const session of this.sessions) {
			if (session.status === 'completed') {
				set.add(session.date);
			}
		}
		return set;
	});

	// Interrupted sessions (drafts) - sorted by date descending
	interruptedSessions = $derived.by<Session[]>(() => {
		return this.sessions
			.filter((s) => s.status === 'interrupted')
			.sort((a, b) => b.date.localeCompare(a.date));
	});

	// Count of interrupted sessions for badge
	interruptedCount = $derived(this.interruptedSessions.length);

	// Set of locked session dates (beyond 90 days for free tier)
	lockedDates = $derived.by<Set<string>>(() => {
		const set = new Set<string>();
		for (const session of this.sessions) {
			if (session.status === 'completed' && isSessionLocked(session.date)) {
				set.add(session.date);
			}
		}
		return set;
	});

	// Count of locked sessions
	lockedCount = $derived(this.lockedDates.size);

	// Total stats
	totalSessions = $derived(this.sessions.filter((s) => s.status === 'completed').length);
	totalWords = $derived(
		this.sessions
			.filter((s) => s.status === 'completed')
			.reduce((sum, s) => sum + s.wordCount, 0)
	);

	async init(): Promise<void> {
		if (typeof window === 'undefined') return;

		try {
			const [allSessions, streak] = await Promise.all([getAllSessions(), calculateStreak()]);

			this.sessions = allSessions;
			this.currentStreak = streak;
			this.longestStreak = this.calculateLongestStreak(allSessions);
		} catch (error) {
			console.error('Failed to load calendar data:', error);
		} finally {
			this.loading = false;
		}
	}

	private calculateLongestStreak(sessions: Session[]): number {
		const completedSessions = sessions
			.filter((s) => s.status === 'completed')
			.sort((a, b) => a.date.localeCompare(b.date));

		if (completedSessions.length === 0) return 0;

		let longest = 1;
		let current = 1;

		for (let i = 1; i < completedSessions.length; i++) {
			const prevDate = new Date(completedSessions[i - 1].date);
			const currDate = new Date(completedSessions[i].date);

			// Check if consecutive days
			const diffDays = Math.floor(
				(currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
			);

			if (diffDays === 1) {
				current++;
				longest = Math.max(longest, current);
			} else if (diffDays > 1) {
				current = 1;
			}
			// diffDays === 0 means same day (shouldn't happen with unique dates)
		}

		return longest;
	}

	getSessionForDate(date: string): Session | undefined {
		return this.sessionsByDate.get(date);
	}

	hasCompletedSession(date: string): boolean {
		return this.completedDates.has(date);
	}

	isLocked(date: string): boolean {
		return this.lockedDates.has(date);
	}

	async onSessionCompleted(): Promise<void> {
		// Refresh data after a new session is completed
		await this.init();
	}

	async refresh(): Promise<void> {
		this.loading = true;
		await this.init();
	}
}

export const calendarStore = new CalendarStore();
