import { getUser, saveUser, updateUser } from '$lib/db';
import type { User } from '$lib/types';

class UserStore {
	user = $state<User | null>(null);
	loading = $state(true);

	isOnboarded = $derived(this.user?.onboardingCompleted ?? false);
	userName = $derived(this.user?.name ?? '');

	async init(): Promise<void> {
		if (typeof window === 'undefined') return;

		try {
			const existingUser = await getUser();
			if (existingUser) {
				this.user = existingUser;
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
			onboardingCompleted: false
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
}

export const userStore = new UserStore();
