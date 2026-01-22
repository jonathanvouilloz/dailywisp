import { getSettings, saveSettings, updateSettings } from '$lib/db';
import type { Settings, WritingMode } from '$lib/types';

class SettingsStore {
	settings = $state<Settings | null>(null);
	loading = $state(true);
	private _systemTheme: 'light' | 'dark' = 'light';
	private mediaQuery: MediaQueryList | null = null;

	get theme(): 'light' | 'dark' | 'auto' {
		return this.settings?.theme ?? 'auto';
	}

	get language(): 'en' | 'fr' {
		return this.settings?.language ?? 'en';
	}

	get writingMode(): WritingMode {
		return this.settings?.writingMode ?? 'normal';
	}

	get effectiveTheme(): 'light' | 'dark' {
		return this.theme === 'auto' ? this._systemTheme : this.theme;
	}

	private applyTheme(): void {
		if (typeof window === 'undefined') return;
		document.documentElement.setAttribute('data-theme', this.effectiveTheme);
	}

	async init(): Promise<void> {
		if (typeof window === 'undefined') return;

		// Listen to system theme changes
		this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		this._systemTheme = this.mediaQuery.matches ? 'dark' : 'light';

		const handleChange = (e: MediaQueryListEvent) => {
			this._systemTheme = e.matches ? 'dark' : 'light';
			this.applyTheme();
		};

		this.mediaQuery.addEventListener('change', handleChange);

		// Load settings from IndexedDB
		try {
			const existingSettings = await getSettings();
			if (existingSettings) {
				// Ensure writingMode has a default value for existing settings
				this.settings = {
					...existingSettings,
					writingMode: existingSettings.writingMode ?? 'normal'
				};
			} else {
				// Create default settings
				const defaultSettings: Omit<Settings, 'id'> = {
					theme: 'auto',
					language: 'en',
					writingMode: 'normal'
				};
				const id = await saveSettings(defaultSettings);
				if (id) {
					this.settings = { ...defaultSettings, id };
				}
			}
		} catch (error) {
			console.error('Failed to load settings:', error);
		} finally {
			this.loading = false;
			this.applyTheme();
		}
	}

	async setTheme(theme: 'light' | 'dark' | 'auto'): Promise<void> {
		if (!this.settings?.id) return;

		await updateSettings(this.settings.id, { theme });
		this.settings = { ...this.settings, theme };
		this.applyTheme();
	}

	async setLanguage(language: 'en' | 'fr'): Promise<void> {
		if (!this.settings?.id) return;

		await updateSettings(this.settings.id, { language });
		this.settings = { ...this.settings, language };
	}

	async setWritingMode(writingMode: WritingMode): Promise<void> {
		if (!this.settings?.id) return;

		await updateSettings(this.settings.id, { writingMode });
		this.settings = { ...this.settings, writingMode };
	}
}

export const settingsStore = new SettingsStore();
