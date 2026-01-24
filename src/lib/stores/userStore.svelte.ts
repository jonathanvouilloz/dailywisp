import { getUser, saveUser, updateUser } from '$lib/db';
import type { User } from '$lib/types';

const BACKUP_REMINDER_INTERVAL = 10; // Show reminder every 10 sessions

class UserStore {
	user = $state<User | null>(null);
	loading = $state(true);

	isOnboarded = $derived(this.user?.onboardingCompleted ?? false);
	userName = $derived(this.user?.name ?? '');
	totalSessions = $derived(this.user?.totalSessions ?? 0);

	async init(): Promise<void> {
		if (typeof window === 'undefined') return;

		try {
			const existingUser = await getUser();
			if (existingUser) {
				// Ensure new fields have defaults for legacy users
				this.user = {
					...existingUser,
					totalSessions: existingUser.totalSessions ?? 0,
					lastBackupReminder: existingUser.lastBackupReminder ?? 0
				};
			}
		} catch (error) {
			console.error('Failed to load user:', error);
		} finally {
			this.loading = false;
		}
	}

	async createUser(name: string): Promise<void> {
		const newUser: Omit<User, 'id'> = {
			name,
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
			createdAt: new Date(),
			onboardingCompleted: false,
			totalSessions: 0,
			lastBackupReminder: 0
		};

		const id = await saveUser(newUser);
		if (id) {
			this.user = { ...newUser, id };
		}
	}

	async completeOnboarding(): Promise<void> {
		if (!this.user?.id) return;

		await updateUser(this.user.id, { onboardingCompleted: true });
		this.user = { ...this.user, onboardingCompleted: true };
	}

	async updateName(name: string): Promise<void> {
		if (!this.user?.id) return;

		await updateUser(this.user.id, { name });
		this.user = { ...this.user, name };
	}

	/**
	 * Increment the session count after completing a session
	 * Returns true if backup reminder should be shown
	 */
	async incrementSessionCount(): Promise<boolean> {
		if (!this.user?.id) return false;

		const newTotal = (this.user.totalSessions ?? 0) + 1;
		await updateUser(this.user.id, { totalSessions: newTotal });
		this.user = { ...this.user, totalSessions: newTotal };

		return this.shouldShowBackupReminder();
	}

	/**
	 * Check if backup reminder should be shown
	 * Shows every BACKUP_REMINDER_INTERVAL sessions
	 */
	shouldShowBackupReminder(): boolean {
		if (!this.user) return false;

		const total = this.user.totalSessions ?? 0;
		const lastReminder = this.user.lastBackupReminder ?? 0;

		// Check if we've passed a reminder threshold since last reminder
		return total > 0 && total >= lastReminder + BACKUP_REMINDER_INTERVAL;
	}

	/**
	 * Mark backup reminder as shown (update lastBackupReminder to current count)
	 */
	async markBackupReminderShown(): Promise<void> {
		if (!this.user?.id) return;

		const currentTotal = this.user.totalSessions ?? 0;
		await updateUser(this.user.id, { lastBackupReminder: currentTotal });
		this.user = { ...this.user, lastBackupReminder: currentTotal };
	}
}

export const userStore = new UserStore();
