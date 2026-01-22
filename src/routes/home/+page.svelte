<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { userStore, calendarStore, settingsStore } from '$lib/stores';
	import Calendar from '$lib/components/Calendar.svelte';
	import Wisp from '$lib/components/Wisp.svelte';
	import { t } from '$lib/i18n';

	// Check if today's session is done
	const todayStr = new Date().toISOString().split('T')[0];
	const todaySession = $derived(calendarStore.getSessionForDate(todayStr));
	const todayCompleted = $derived(todaySession?.status === 'completed');

	// Live clock
	let now = $state(new Date());

	onMount(async () => {
		// Redirect to onboarding if not completed
		await userStore.init();
		if (!userStore.isOnboarded) {
			goto('/onboarding');
			return;
		}

		// Load calendar data
		await calendarStore.init();

		// Update clock every second
		const interval = setInterval(() => {
			now = new Date();
		}, 1000);
		return () => clearInterval(interval);
	});

	const formattedDate = $derived(() => {
		const lang = settingsStore.settings?.language ?? 'en';
		return now.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
			weekday: 'long',
			day: 'numeric',
			month: 'long'
		});
	});

	const formattedTime = $derived(() => {
		return now.toLocaleTimeString('fr-FR', {
			hour: '2-digit',
			minute: '2-digit'
		});
	});

	// Get greeting based on time of day
	const greeting = $derived(() => {
		const hour = now.getHours();
		if (hour < 12) return t('home.goodMorning');
		if (hour < 18) return t('home.goodAfternoon');
		return t('home.goodEvening');
	});
</script>

<svelte:head>
	<title>{t('home.title')}</title>
</svelte:head>

<main class="home">
	{#if userStore.loading || calendarStore.loading}
		<div class="loading">
			<Wisp size="md" mood="thinking" />
			<span class="loading-text">{t('home.loading')}</span>
		</div>
	{:else if userStore.isOnboarded}
		<div class="dashboard">
			<!-- Header with greeting -->
			<header class="dashboard-header">
				<div class="greeting">
					<Wisp size="sm" mood={todayCompleted ? 'zen' : 'neutral'} />
					<div class="greeting-text">
						<h1>{greeting()}, {userStore.userName}</h1>
						<p class="date-time">
							<span class="date">{formattedDate()}</span>
							<span class="time">{formattedTime()}</span>
						</p>
					</div>
				</div>

				<div class="header-actions">
					{#if calendarStore.interruptedCount > 0}
						<a href="/drafts" class="header-link drafts-link" aria-label={t('drafts.title')}>
							<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
								<polyline points="14 2 14 8 20 8"/>
								<line x1="16" x2="8" y1="13" y2="13"/>
								<line x1="16" x2="8" y1="17" y2="17"/>
								<line x1="10" x2="8" y1="9" y2="9"/>
							</svg>
							<span class="drafts-badge">{calendarStore.interruptedCount}</span>
						</a>
					{/if}
					<a href="/settings" class="header-link" aria-label={t('settings.title')}>
						<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
							<circle cx="12" cy="12" r="3"/>
						</svg>
					</a>
				</div>
			</header>

			<!-- Today's status -->
			<section class="today-status">
				{#if todayCompleted}
					<div class="status-card status-card--completed">
						<div class="status-icon">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="20 6 9 17 4 12"/>
							</svg>
						</div>
						<div class="status-text">
							<h2>{t('home.todayDone')}</h2>
							<p>{t('home.todayDoneDesc')}</p>
						</div>
					</div>
				{:else}
					<a href="/write" class="status-card status-card--ready">
						<div class="status-icon">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M12 19l7-7 3 3-7 7-3-3z"/>
								<path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
								<path d="M2 2l7.586 7.586"/>
								<circle cx="11" cy="11" r="2"/>
							</svg>
						</div>
						<div class="status-text">
							<h2>{t('home.readyToWrite')}</h2>
							<p>{t('home.readyToWriteDesc')}</p>
						</div>
						<span class="status-arrow">→</span>
					</a>
				{/if}
			</section>

			<!-- Calendar -->
			<section class="calendar-section">
				<Calendar />
			</section>

			<!-- Stats summary -->
			<section class="stats-section">
				<div class="stat">
					<span class="stat-value">{calendarStore.totalSessions}</span>
					<span class="stat-label">{t('home.totalSessions')}</span>
				</div>
				<div class="stat">
					<span class="stat-value">{calendarStore.currentStreak}</span>
					<span class="stat-label">{t('home.currentStreak')}</span>
				</div>
				<div class="stat">
					<span class="stat-value">{calendarStore.longestStreak}</span>
					<span class="stat-label">{t('home.longestStreak')}</span>
				</div>
			</section>
		</div>
	{/if}
</main>

<style>
	.home {
		min-height: 100vh;
		min-height: 100dvh;
		padding: var(--space-lg);
		background: var(--color-bg);
	}

	.loading {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-md);
	}

	.loading-text {
		font-family: var(--font-ui);
		color: var(--color-text-muted);
	}

	.dashboard {
		max-width: 800px;
		margin: 0 auto;
	}

	/* Header */
	.dashboard-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--space-xl);
	}

	.greeting {
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	.greeting-text h1 {
		font-family: var(--font-ui);
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0 0 var(--space-xs) 0;
	}

	.date-time {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-family: var(--font-ui);
		font-size: 0.9rem;
		color: var(--color-text-muted);
		margin: 0;
	}

	.time {
		opacity: 0.7;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.header-link {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-muted);
		padding: var(--space-sm);
		border-radius: var(--radius-md);
		transition: all var(--transition-fast);
	}

	.header-link:hover {
		color: var(--color-text);
		background: var(--color-bg-alt);
	}

	.drafts-link {
		gap: 6px;
	}

	.drafts-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 18px;
		height: 18px;
		padding: 0 4px;
		font-family: var(--font-ui);
		font-size: 0.7rem;
		font-weight: 600;
		color: white;
		background: var(--color-accent);
		border-radius: var(--radius-full);
	}

	/* Today status */
	.today-status {
		margin-bottom: var(--space-xl);
	}

	.status-card {
		display: flex;
		align-items: center;
		gap: var(--space-lg);
		padding: var(--space-lg);
		border-radius: var(--radius-lg);
		text-decoration: none;
		transition: all var(--transition-normal);
	}

	.status-card--completed {
		background: color-mix(in srgb, var(--color-accent) 10%, var(--color-bg));
		border: 1px solid color-mix(in srgb, var(--color-accent) 20%, transparent);
	}

	.status-card--ready {
		background: var(--color-bg-alt);
		border: 1px solid transparent;
		cursor: pointer;
	}

	.status-card--ready:hover {
		border-color: var(--color-accent);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	}

	.status-icon {
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-full);
		background: var(--color-bg);
	}

	.status-card--completed .status-icon {
		background: var(--color-accent);
		color: white;
	}

	.status-card--ready .status-icon {
		color: var(--color-accent);
	}

	.status-text {
		flex: 1;
	}

	.status-text h2 {
		font-family: var(--font-ui);
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0 0 var(--space-xs) 0;
	}

	.status-text p {
		font-family: var(--font-body);
		font-size: 0.9rem;
		color: var(--color-text-muted);
		margin: 0;
	}

	.status-arrow {
		font-size: 1.5rem;
		color: var(--color-text-muted);
		transition: transform var(--transition-fast);
	}

	.status-card--ready:hover .status-arrow {
		transform: translateX(4px);
		color: var(--color-accent);
	}

	/* Calendar section */
	.calendar-section {
		margin-bottom: var(--space-xl);
	}

	.section-title {
		font-family: var(--font-ui);
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-muted);
		margin: 0 0 var(--space-md) 0;
	}

	/* Stats */
	.stats-section {
		display: flex;
		gap: var(--space-lg);
		padding: var(--space-lg);
		background: var(--color-bg-alt);
		border-radius: var(--radius-lg);
	}

	.stat {
		flex: 1;
		text-align: center;
	}

	.stat-value {
		display: block;
		font-family: var(--font-ui);
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--color-text);
	}

	.stat-label {
		font-family: var(--font-ui);
		font-size: 0.8rem;
		color: var(--color-text-muted);
	}

	/* Responsive */
	@media (max-width: 600px) {
		.home {
			padding: var(--space-md);
		}

		.greeting-text h1 {
			font-size: 1.25rem;
		}

		.status-card {
			padding: var(--space-md);
			gap: var(--space-md);
		}

		.status-icon {
			width: 40px;
			height: 40px;
		}

		.stats-section {
			flex-direction: column;
			gap: var(--space-md);
		}

		.stat {
			display: flex;
			justify-content: space-between;
			align-items: center;
			text-align: left;
		}
	}
</style>
