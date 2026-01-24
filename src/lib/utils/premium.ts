// Premium/Free tier utilities for Wisp

const HISTORY_LIMIT_DAYS = 90;
const LICENSE_STORAGE_KEY = 'wisp_license_valid';

/**
 * Check if user has premium (Wisp+) access
 */
export function isPremium(): boolean {
	if (typeof window === 'undefined') return false;
	return localStorage.getItem(LICENSE_STORAGE_KEY) === 'true';
}

/**
 * Check if a session date is locked (beyond 90-day limit for free tier)
 */
export function isSessionLocked(date: string): boolean {
	if (isPremium()) return false;

	const sessionDate = new Date(date);
	const cutoff = new Date();
	cutoff.setDate(cutoff.getDate() - HISTORY_LIMIT_DAYS);
	cutoff.setHours(0, 0, 0, 0);

	return sessionDate < cutoff;
}

/**
 * Get the cutoff date for free tier history
 */
export function getHistoryCutoffDate(): Date {
	const cutoff = new Date();
	cutoff.setDate(cutoff.getDate() - HISTORY_LIMIT_DAYS);
	cutoff.setHours(0, 0, 0, 0);
	return cutoff;
}

/**
 * Set premium status (for testing/future license validation)
 */
export function setPremiumStatus(valid: boolean): void {
	if (typeof window === 'undefined') return;
	if (valid) {
		localStorage.setItem(LICENSE_STORAGE_KEY, 'true');
	} else {
		localStorage.removeItem(LICENSE_STORAGE_KEY);
	}
}

export const HISTORY_LIMIT = HISTORY_LIMIT_DAYS;
