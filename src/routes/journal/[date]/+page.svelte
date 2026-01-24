<script lang="ts">
	import { page } from '$app/stores';
	import { goto, onNavigate } from '$app/navigation';
	import { calendarStore, settingsStore, sessionStore } from '$lib/stores';
	import { getSessionByDate, exportAllData } from '$lib/db';
	import { MOODS, type Session, type MoodLevel } from '$lib/types';
	import Wisp from '$lib/components/Wisp.svelte';
	import MoodIcon from '$lib/components/MoodIcon.svelte';
	import { t, getMoodLabel } from '$lib/i18n';
	import { isSessionLocked } from '$lib/utils/premium';

	// Enable smooth View Transitions for navigation
	onNavigate((navigation) => {
		// @ts-ignore - View Transitions API
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			// @ts-ignore
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	let session = $state<Session | null>(null);
	let loading = $state(true);
	let adjacentDates = $state<{ prev: string | null; next: string | null }>({ prev: null, next: null });
	let isLocked = $state(false);

	const dateParam = $derived($page.params.date);

	// Format date for display
	function formatDate(dateStr: string): string {
		const date = new Date(dateStr + 'T00:00:00');
		return date.toLocaleDateString(settingsStore.language === 'fr' ? 'fr-FR' : 'en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	// Format duration
	function formatDuration(ms: number): string {
		const totalSeconds = Math.floor(ms / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		if (minutes === 0) return `${seconds}s`;
		return `${minutes}m ${seconds}s`;
	}

	// Get mood info
	function getMood(level: MoodLevel) {
		return MOODS[level];
	}

	// Find adjacent sessions (includes both completed and interrupted)
	function findAdjacentSessions(currentDate: string): { prev: string | null; next: string | null } {
		const viewableSessions = calendarStore.sessions
			.filter(s => s.status === 'completed' || s.status === 'interrupted')
			.sort((a, b) => a.date.localeCompare(b.date));

		const currentIndex = viewableSessions.findIndex(s => s.date === currentDate);

		if (currentIndex === -1) {
			return { prev: null, next: null };
		}

		return {
			prev: currentIndex > 0 ? viewableSessions[currentIndex - 1].date : null,
			next: currentIndex < viewableSessions.length - 1 ? viewableSessions[currentIndex + 1].date : null
		};
	}

	// Export single session
	async function exportSession(): Promise<void> {
		if (!session) return;

		const mood = session.mood ? getMood(session.mood) : null;
		let markdown = `# ${formatDate(session.date)}\n\n`;
		markdown += `- **Words:** ${session.wordCount}\n`;
		markdown += `- **Duration:** ${formatDuration(session.durationMs)}\n`;
		if (mood) {
			markdown += `- **Mood:** ${mood.emoji} ${mood.labelEN}\n`;
		}
		if (session.moodNote) {
			markdown += `- **Note:** ${session.moodNote}\n`;
		}
		markdown += `\n---\n\n${session.text}\n`;

		const blob = new Blob([markdown], { type: 'text/markdown' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `wisp-${session.date}.md`;
		a.click();
		URL.revokeObjectURL(url);
	}

	// Navigate to adjacent session
	function navigateTo(date: string | null): void {
		if (date) {
			goto(`/journal/${date}`);
		}
	}

	// Keyboard navigation
	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'ArrowLeft' && adjacentDates.prev) {
			navigateTo(adjacentDates.prev);
		} else if (event.key === 'ArrowRight' && adjacentDates.next) {
			navigateTo(adjacentDates.next);
		} else if (event.key === 'Escape') {
			goto('/home');
		}
	}

	// Load session when date changes
	async function loadSession(date: string): Promise<void> {
		loading = true;
		isLocked = false;

		const foundSession = await getSessionByDate(date);

		if (foundSession && (foundSession.status === 'completed' || foundSession.status === 'interrupted')) {
			// Check if session is locked (beyond 90 days for free tier)
			if (foundSession.status === 'completed' && isSessionLocked(date)) {
				isLocked = true;
				session = foundSession; // Keep session for date display
				adjacentDates = findAdjacentSessions(date);
			} else {
				session = foundSession;
				adjacentDates = findAdjacentSessions(date);
			}
		} else {
			// Session not found or not completed/interrupted, redirect
			goto('/home');
		}

		loading = false;
	}

	// Resume from interrupted session
	function resumeSession(): void {
		if (!session) return;
		// Start a new session with the interrupted text
		sessionStore.startSession(session.text);
		goto('/write');
	}

	// Track last loaded date to prevent redundant loads
	let lastLoadedDate = $state<string | null>(null);

	// Load session on mount and when date param changes
	$effect(() => {
		const date = dateParam;
		if (!date) {
			goto('/home');
			return;
		}

		// Only reload if date actually changed
		if (date !== lastLoadedDate && !calendarStore.loading) {
			lastLoadedDate = date;
			loadSession(date);
		}
	});
</script>

<svelte:head>
	<title>{t('journal.title', { date: dateParam ?? '' })}</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div class="journal-backdrop" style={session?.mood ? `--mood-bg: ${getMood(session.mood).color}` : ''}>
<main class="journal-page">
	{#if loading}
		<div class="loading-state">
			<Wisp size="md" mood="thinking" />
			<span class="loading-text">{t('journal.loading')}</span>
		</div>
	{:else if isLocked && session}
		<!-- Locked session view -->
		<div class="locked-view">
			<header class="journal-header">
				<a href="/home" class="back-btn" aria-label={t('common.backToCalendar')}>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M19 12H5M12 19l-7-7 7-7"/>
					</svg>
				</a>

				<div class="header-center">
					<h1 class="journal-date">{formatDate(session.date)}</h1>
				</div>

				<div class="header-spacer"></div>
			</header>

			<div class="locked-content">
				<div class="locked-icon">
					<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
						<path d="M7 11V7a5 5 0 0 1 10 0v4"/>
					</svg>
				</div>

				<Wisp size="md" mood="thinking" opacity={0.5} />

				<h2 class="locked-title">{t('premium.lockedTitle')}</h2>
				<p class="locked-desc">{t('premium.lockedDesc')}</p>
				<p class="locked-unlock">{t('premium.unlockWith')}</p>

				<a href="/settings" class="btn btn--primary">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
					</svg>
					{t('premium.upgradeBtn')}
				</a>
			</div>
		</div>

	{:else if session}
		<!-- Header -->
		<header class="journal-header">
			<a href="/home" class="back-btn" aria-label={t('common.backToCalendar')}>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M19 12H5M12 19l-7-7 7-7"/>
				</svg>
			</a>

			<div class="header-center">
				<h1 class="journal-date">{formatDate(session.date)}</h1>
				{#if session.status === 'interrupted'}
					<div class="interrupted-badge">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<circle cx="12" cy="12" r="10"/>
							<line x1="12" y1="8" x2="12" y2="12"/>
							<line x1="12" y1="16" x2="12.01" y2="16"/>
						</svg>
						<span>{t('journal.interruptedSession')}</span>
					</div>
				{/if}
				<div class="journal-meta">
					<span>{session.wordCount} {t('home.words')}</span>
					<span class="meta-dot">·</span>
					<span>{formatDuration(session.durationMs)}</span>
				</div>
				{#if session.mood}
					<div class="mood-display">
						<MoodIcon mood={session.mood} size={96} />
					</div>
				{/if}
			</div>

			<button class="export-btn" onclick={exportSession} aria-label="Export entry">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
					<polyline points="7 10 12 15 17 10"/>
					<line x1="12" y1="15" x2="12" y2="3"/>
				</svg>
			</button>
		</header>

		<!-- Mood note if exists -->
		{#if session.moodNote}
			<div class="mood-note">
				<span class="mood-note-label">{t('journal.note')}</span>
				<span class="mood-note-text">{session.moodNote}</span>
			</div>
		{/if}

		<!-- Session text -->
		<article class="journal-content" class:journal-content--interrupted={session.status === 'interrupted'}>
			{#each session.text.split('\n') as paragraph}
				{#if paragraph.trim()}
					<p>{paragraph}</p>
				{/if}
			{/each}
		</article>

		<!-- Resume button for interrupted sessions -->
		{#if session.status === 'interrupted'}
			<div class="resume-section">
				<button class="btn btn--primary resume-btn" onclick={resumeSession}>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polygon points="5 3 19 12 5 21 5 3"/>
					</svg>
					{t('journal.resumeText')}
				</button>
			</div>
		{/if}

		<!-- Navigation -->
		<nav class="journal-nav" aria-label="Navigate between journal entries">
			<button
				class="nav-btn nav-btn--prev"
				onclick={() => navigateTo(adjacentDates.prev)}
				disabled={!adjacentDates.prev}
				aria-label={adjacentDates.prev ? `Previous entry: ${adjacentDates.prev}` : 'No previous entry'}
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M19 12H5M12 19l-7-7 7-7"/>
				</svg>
				<span class="nav-label">
					{#if adjacentDates.prev}
						{adjacentDates.prev}
					{:else}
						{t('journal.noEarlier')}
					{/if}
				</span>
			</button>

			<a href="/home" class="nav-home" aria-label={t('common.backToCalendar')}>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<rect x="3" y="4" width="18" height="18" rx="2"/>
					<line x1="3" y1="10" x2="21" y2="10"/>
					<line x1="9" y1="4" x2="9" y2="10"/>
					<line x1="15" y1="4" x2="15" y2="10"/>
				</svg>
			</a>

			<button
				class="nav-btn nav-btn--next"
				onclick={() => navigateTo(adjacentDates.next)}
				disabled={!adjacentDates.next}
				aria-label={adjacentDates.next ? `Next entry: ${adjacentDates.next}` : 'No next entry'}
			>
				<span class="nav-label">
					{#if adjacentDates.next}
						{adjacentDates.next}
					{:else}
						{t('journal.noLater')}
					{/if}
				</span>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M5 12h14M12 5l7 7-7 7"/>
				</svg>
			</button>
		</nav>

		<!-- Keyboard hint -->
		<p class="keyboard-hint">
			{t('journal.keyboardHint')}
		</p>
	{:else}
		<!-- Session not found -->
		<div class="not-found">
			<Wisp size="md" mood="thinking" opacity={0.5} />
			<h2>{t('journal.notFound')}</h2>
			<p class="text-muted">{t('journal.notFoundDesc')}</p>
			<a href="/home" class="btn">
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
				{t('common.backToCalendar')}
			</a>
		</div>
	{/if}
</main>
</div>

<style>
	.journal-backdrop {
		min-height: 100vh;
		background: color-mix(in srgb, var(--mood-bg, transparent) 8%, var(--color-bg));
		transition: background 0.4s ease;
	}

	.journal-page {
		min-height: 100vh;
		padding: var(--space-lg);
		max-width: 720px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
	}

	/* View Transitions */
	@keyframes -global-journal-fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes -global-journal-fade-out {
		from { opacity: 1; }
		to { opacity: 0; }
	}

	@keyframes -global-journal-slide-from-right {
		from { transform: translateX(20px); opacity: 0; }
		to { transform: translateX(0); opacity: 1; }
	}

	@keyframes -global-journal-slide-to-left {
		from { transform: translateX(0); opacity: 1; }
		to { transform: translateX(-20px); opacity: 0; }
	}

	:global(::view-transition-old(root)) {
		animation: 180ms ease-out both journal-fade-out, 180ms ease-out both journal-slide-to-left;
	}

	:global(::view-transition-new(root)) {
		animation: 280ms ease-out 50ms both journal-fade-in, 280ms ease-out 50ms both journal-slide-from-right;
	}

	/* Loading state */
	.loading-state {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-md);
	}

	.loading-text {
		font-family: var(--font-ui);
		font-size: 1rem;
		color: var(--color-text-muted);
	}

	/* Header */
	.journal-header {
		display: flex;
		align-items: flex-start;
		gap: var(--space-md);
		margin-bottom: var(--space-xl);
		padding-bottom: var(--space-lg);
		border-bottom: 1px solid var(--color-bg-alt);
	}

	.header-center {
		flex: 1;
		text-align: center;
	}

	.journal-date {
		font-family: var(--font-body);
		font-size: 1.5rem;
		font-weight: 500;
		margin: 0;
		line-height: 1.3;
	}

	.journal-meta {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		margin-top: var(--space-sm);
		font-family: var(--font-ui);
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.meta-dot {
		opacity: 0.5;
	}

	.mood-display {
		display: flex;
		justify-content: center;
		margin-top: var(--space-md);
	}

	/* Interrupted badge */
	.interrupted-badge {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-xs) var(--space-sm);
		margin-top: var(--space-sm);
		background: color-mix(in srgb, var(--color-text-muted) 15%, transparent);
		border-radius: var(--radius-full);
		font-family: var(--font-ui);
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.back-btn,
	.export-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: var(--radius-full);
		color: var(--color-text-muted);
		transition: all var(--transition-fast);
		flex-shrink: 0;
	}

	.back-btn:hover,
	.export-btn:hover {
		color: var(--color-text);
		background: var(--color-bg-alt);
		opacity: 1;
	}

	/* Mood note */
	.mood-note {
		display: flex;
		gap: var(--space-sm);
		padding: var(--space-md);
		background: var(--color-bg-alt);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-lg);
		font-size: 0.9rem;
	}

	.mood-note-label {
		font-family: var(--font-ui);
		font-weight: 500;
		color: var(--color-text-muted);
	}

	.mood-note-text {
		font-family: var(--font-body);
		font-style: italic;
		color: var(--color-text);
	}

	/* Journal content */
	.journal-content {
		flex: 1;
		font-family: var(--font-body);
		font-size: 1.125rem;
		line-height: 1.8;
		color: var(--color-text);
	}

	.journal-content p {
		margin-bottom: var(--space-lg);
		text-indent: 1.5em;
	}

	.journal-content p:first-child {
		text-indent: 0;
	}

	/* Interrupted content styling */
	.journal-content--interrupted {
		opacity: 0.85;
	}

	/* Resume section */
	.resume-section {
		display: flex;
		justify-content: center;
		padding: var(--space-lg) 0;
		margin-top: var(--space-md);
	}

	.resume-btn {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	/* Navigation */
	.journal-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md);
		padding-top: var(--space-xl);
		margin-top: var(--space-xl);
		border-top: 1px solid var(--color-bg-alt);
	}

	.nav-btn {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-sm) var(--space-md);
		font-family: var(--font-ui);
		font-size: 0.875rem;
		color: var(--color-text-muted);
		background: transparent;
		border: 1px solid transparent;
		border-radius: var(--radius-md);
		transition: all var(--transition-fast);
		min-width: 140px;
	}

	.nav-btn--prev {
		justify-content: flex-start;
	}

	.nav-btn--next {
		justify-content: flex-end;
	}

	.nav-btn:hover:not(:disabled) {
		color: var(--color-text);
		background: var(--color-bg-alt);
	}

	.nav-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.nav-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.nav-home {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		color: var(--color-text-muted);
		background: var(--color-bg-alt);
		border-radius: var(--radius-full);
		transition: all var(--transition-fast);
	}

	.nav-home:hover {
		color: var(--color-text);
		opacity: 1;
	}

	/* Keyboard hint */
	.keyboard-hint {
		text-align: center;
		font-family: var(--font-ui);
		font-size: 0.75rem;
		color: var(--color-text-muted);
		margin-top: var(--space-lg);
		opacity: 0.7;
	}

	.keyboard-hint kbd {
		display: inline-block;
		padding: 2px 6px;
		font-family: var(--font-ui);
		font-size: 0.7rem;
		background: var(--color-bg-alt);
		border: 1px solid var(--color-text-muted);
		border-radius: var(--radius-sm);
		margin: 0 2px;
	}

	/* Not found state */
	.not-found {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-md);
		text-align: center;
	}

	.not-found h2 {
		font-family: var(--font-body);
		font-size: 1.5rem;
		font-weight: 500;
		margin: 0;
	}

	.not-found p {
		margin: 0;
		max-width: 300px;
	}

	.not-found .btn {
		margin-top: var(--space-md);
	}

	/* Locked view */
	.locked-view {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.locked-view .journal-header {
		border-bottom: none;
		margin-bottom: 0;
	}

	.locked-view .header-spacer {
		width: 40px;
	}

	.locked-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-lg);
		padding: var(--space-xl);
		text-align: center;
	}

	.locked-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100px;
		height: 100px;
		border-radius: 50%;
		background: var(--color-bg-alt);
		color: var(--color-text-muted);
	}

	.locked-title {
		font-family: var(--font-body);
		font-size: 1.5rem;
		font-weight: 500;
		margin: 0;
		color: var(--color-text);
	}

	.locked-desc {
		font-family: var(--font-ui);
		font-size: 1rem;
		color: var(--color-text-muted);
		margin: 0;
	}

	.locked-unlock {
		font-family: var(--font-ui);
		font-size: 0.9rem;
		color: var(--color-text-muted);
		margin: 0;
		padding: var(--space-md);
		background: var(--color-bg-alt);
		border-radius: var(--radius-md);
		max-width: 300px;
	}

	/* Responsive */
	@media (max-width: 600px) {
		.journal-page {
			padding: var(--space-md);
		}

		.journal-header {
			flex-wrap: wrap;
		}

		.header-center {
			order: -1;
			width: 100%;
			margin-bottom: var(--space-sm);
		}

		.journal-date {
			font-size: 1.25rem;
		}

		.journal-content {
			font-size: 1rem;
		}

		.nav-btn {
			min-width: 100px;
			padding: var(--space-xs) var(--space-sm);
			font-size: 0.75rem;
		}

		.keyboard-hint {
			display: none;
		}
	}

</style>
