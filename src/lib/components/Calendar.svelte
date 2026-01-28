<script lang="ts">
	import { goto } from '$app/navigation';
	import { calendarStore } from '$lib/stores';
	import { MOODS, type MoodLevel } from '$lib/types';
	import { t, getMonthNames, getMoodLabel } from '$lib/i18n';
	import { isSessionLocked } from '$lib/utils/premium';
	import { onMount } from 'svelte';

	type CalendarView = 'list' | 'grid';

	let showLockedMessage = $state(false);
	let lockedMessageTimeout: ReturnType<typeof setTimeout> | null = null;
	let currentView = $state<CalendarView>('list');
	let isTransitioning = $state(false);

	// Get current date info
	const today = new Date();
	const currentYear = today.getFullYear();
	const todayStr = today.toISOString().split('T')[0];

	// Month names for labels (reactive based on language)
	const months = $derived(getMonthNames());

	// Weekday names for grid header
	const weekdays = $derived(t('calendar.weekdays').split(','));

	// Load saved view preference
	onMount(() => {
		const savedView = localStorage.getItem('wisp-calendar-view') as CalendarView | null;
		if (savedView === 'list' || savedView === 'grid') {
			currentView = savedView;
		}
	});

	// Save view preference
	function setView(view: CalendarView): void {
		if (view === currentView) return;
		isTransitioning = true;
		setTimeout(() => {
			currentView = view;
			localStorage.setItem('wisp-calendar-view', view);
			setTimeout(() => {
				isTransitioning = false;
			}, 50);
		}, 150);
	}

	// Generate days for the entire year (list view)
	function generateYearDays(year: number): { date: string; day: number; month: number }[][] {
		const monthDays: { date: string; day: number; month: number }[][] = [];

		for (let month = 0; month < 12; month++) {
			const days: { date: string; day: number; month: number }[] = [];
			const daysInMonth = new Date(year, month + 1, 0).getDate();

			for (let day = 1; day <= daysInMonth; day++) {
				const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
				days.push({ date: dateStr, day, month });
			}

			monthDays.push(days);
		}

		return monthDays;
	}

	// Get first day offset for grid view (Monday = 0, Sunday = 6)
	function getFirstDayOffset(year: number, month: number): number {
		const firstDay = new Date(year, month, 1);
		return (firstDay.getDay() + 6) % 7;
	}

	// Generate grid data for a month (with empty slots for alignment)
	type GridDay = { date: string; day: number; month: number } | null;

	function generateMonthGridData(year: number, month: number): GridDay[] {
		const offset = getFirstDayOffset(year, month);
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const grid: GridDay[] = [];

		// Add empty slots for offset
		for (let i = 0; i < offset; i++) {
			grid.push(null);
		}

		// Add actual days
		for (let day = 1; day <= daysInMonth; day++) {
			const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
			grid.push({ date: dateStr, day, month });
		}

		return grid;
	}

	const yearDays = generateYearDays(currentYear);
	const yearGridData = Array.from({ length: 12 }, (_, month) => generateMonthGridData(currentYear, month));

	// Check if a date is in the future
	function isFuture(dateStr: string): boolean {
		return dateStr > todayStr;
	}

	// Check if a date is today
	function isToday(dateStr: string): boolean {
		return dateStr === todayStr;
	}

	// Get mood color for a date
	function getMoodColor(dateStr: string): string | null {
		const session = calendarStore.getSessionForDate(dateStr);
		if (!session || session.status !== 'completed' || !session.mood) {
			return null;
		}
		return MOODS[session.mood as MoodLevel].color;
	}

	// Handle day click
	function handleDayClick(dateStr: string): void {
		if (isFuture(dateStr)) return;

		const session = calendarStore.getSessionForDate(dateStr);

		// Check if session is locked
		if (session?.status === 'completed' && isSessionLocked(dateStr)) {
			showLockedToast();
			return;
		}

		if (isToday(dateStr)) {
			if (session?.status === 'completed') {
				goto(`/journal/${dateStr}`);
			} else {
				goto('/write');
			}
		} else if (session?.status === 'completed') {
			goto(`/journal/${dateStr}`);
		}
	}

	// Show locked session toast
	function showLockedToast(): void {
		if (lockedMessageTimeout) clearTimeout(lockedMessageTimeout);
		showLockedMessage = true;
		lockedMessageTimeout = setTimeout(() => {
			showLockedMessage = false;
		}, 3000);
	}

	// Check if day is clickable (locked sessions are still clickable to show message)
	function isClickable(dateStr: string): boolean {
		if (isFuture(dateStr)) return false;

		const session = calendarStore.getSessionForDate(dateStr);

		if (isToday(dateStr)) return true;
		return session?.status === 'completed';
	}

	// Check if a date is locked
	function isLockedDate(dateStr: string): boolean {
		const session = calendarStore.getSessionForDate(dateStr);
		return session?.status === 'completed' && isSessionLocked(dateStr);
	}
</script>

<div class="calendar" role="region" aria-label="Writing calendar for {currentYear}">
	<!-- Year header with view toggle -->
	<header class="calendar-header">
		<span class="year-label">{currentYear}</span>
		<div class="view-toggle" role="group" aria-label="Calendar view">
			<button
				class="view-btn"
				class:view-btn--active={currentView === 'list'}
				onclick={() => setView('list')}
				aria-pressed={currentView === 'list'}
				title={t('calendar.listView')}
			>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
					<line x1="2" y1="4" x2="14" y2="4" />
					<line x1="2" y1="8" x2="14" y2="8" />
					<line x1="2" y1="12" x2="14" y2="12" />
				</svg>
			</button>
			<button
				class="view-btn"
				class:view-btn--active={currentView === 'grid'}
				onclick={() => setView('grid')}
				aria-pressed={currentView === 'grid'}
				title={t('calendar.gridView')}
			>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
					<rect x="2" y="2" width="4" height="4" rx="0.5" />
					<rect x="10" y="2" width="4" height="4" rx="0.5" />
					<rect x="2" y="10" width="4" height="4" rx="0.5" />
					<rect x="10" y="10" width="4" height="4" rx="0.5" />
				</svg>
			</button>
		</div>
	</header>

	<!-- Locked session toast -->
	{#if showLockedMessage}
		<div class="locked-toast" role="alert">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
				<path d="M7 11V7a5 5 0 0 1 10 0v4"/>
			</svg>
			<span>{t('premium.lockedDesc')}</span>
		</div>
	{/if}

	<!-- View container with transition -->
	<div class="view-container" class:view-container--transitioning={isTransitioning}>
		<!-- List View -->
		{#if currentView === 'list'}
			<div class="months-container months-container--list">
				{#each yearDays as monthDays, monthIndex}
					<div class="month-row">
						<span class="month-label">{months[monthIndex]}</span>
						<div class="days-grid days-grid--list" role="grid" aria-label="{months[monthIndex]} {currentYear}">
							{#each monthDays as { date, day }}
								{@const moodColor = getMoodColor(date)}
								{@const future = isFuture(date)}
								{@const todayDate = isToday(date)}
								{@const clickable = isClickable(date)}
								{@const hasSession = moodColor !== null}
								{@const missed = !future && !todayDate && !hasSession}
								{@const locked = isLockedDate(date)}

								<button
									class="day-dot"
									class:day-dot--future={future}
									class:day-dot--today={todayDate}
									class:day-dot--completed={hasSession}
									class:day-dot--missed={missed}
									class:day-dot--clickable={clickable}
									class:day-dot--locked={locked}
									style={moodColor ? `--dot-color: ${moodColor}` : ''}
									onclick={() => handleDayClick(date)}
									disabled={!clickable}
									aria-label="{day} {months[monthIndex]} {currentYear}{hasSession ? ', ' + t('calendar.completedSession') : ''}{todayDate ? ', ' + t('calendar.today') : ''}{locked ? ', ' + t('premium.lockedTitle') : ''}"
									title="{day} {months[monthIndex]}{hasSession ? (locked ? ' - ' + t('premium.lockedTitle') : ' - ' + t('calendar.viewEntry')) : todayDate ? ' - ' + t('calendar.writeToday') : ''}"
								>
									<span class="day-inner">
										{#if locked}
											<svg class="lock-icon" width="6" height="6" viewBox="0 0 24 24" fill="currentColor">
												<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
												<path d="M7 11V7a5 5 0 0 1 10 0v4"/>
											</svg>
										{/if}
									</span>
								</button>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<!-- Grid View -->
			<div class="months-container months-container--grid">
				{#each yearGridData as monthGrid, monthIndex}
					<div class="month-card">
						<span class="month-card-label">{months[monthIndex]}</span>
						<div class="weekday-header">
							{#each weekdays as day}
								<span class="weekday-label">{day}</span>
							{/each}
						</div>
						<div class="days-grid days-grid--grid" role="grid" aria-label="{months[monthIndex]} {currentYear}">
							{#each monthGrid as dayData}
								{#if dayData === null}
									<span class="day-empty"></span>
								{:else}
									{@const { date, day } = dayData}
									{@const moodColor = getMoodColor(date)}
									{@const future = isFuture(date)}
									{@const todayDate = isToday(date)}
									{@const clickable = isClickable(date)}
									{@const hasSession = moodColor !== null}
									{@const missed = !future && !todayDate && !hasSession}
									{@const locked = isLockedDate(date)}

									<button
										class="day-dot day-dot--grid"
										class:day-dot--future={future}
										class:day-dot--today={todayDate}
										class:day-dot--completed={hasSession}
										class:day-dot--missed={missed}
										class:day-dot--clickable={clickable}
										class:day-dot--locked={locked}
										style={moodColor ? `--dot-color: ${moodColor}` : ''}
										onclick={() => handleDayClick(date)}
										disabled={!clickable}
										aria-label="{day} {months[monthIndex]} {currentYear}{hasSession ? ', ' + t('calendar.completedSession') : ''}{todayDate ? ', ' + t('calendar.today') : ''}{locked ? ', ' + t('premium.lockedTitle') : ''}"
										title="{day} {months[monthIndex]}{hasSession ? (locked ? ' - ' + t('premium.lockedTitle') : ' - ' + t('calendar.viewEntry')) : todayDate ? ' - ' + t('calendar.writeToday') : ''}"
									>
										<span class="day-inner">
											{#if locked}
												<svg class="lock-icon" width="6" height="6" viewBox="0 0 24 24" fill="currentColor">
													<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
													<path d="M7 11V7a5 5 0 0 1 10 0v4"/>
												</svg>
											{/if}
										</span>
									</button>
								{/if}
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Legend -->
	<footer class="calendar-legend">
		<div class="legend-item">
			<span class="legend-dot legend-dot--empty"></span>
			<span class="legend-text">{t('calendar.noEntry')}</span>
		</div>
		{#each Object.values(MOODS) as mood}
			<div class="legend-item">
				<span class="legend-dot" style="background-color: {mood.color}"></span>
				<span class="legend-text">{getMoodLabel(mood.level)}</span>
			</div>
		{/each}
	</footer>
</div>

<style>
	.calendar {
		width: 100%;
		max-width: 900px;
		margin: 0 auto;
		padding: var(--space-md);
	}

	.calendar-header {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: var(--space-lg);
		margin-bottom: var(--space-xl);
	}

	.year-label {
		font-family: var(--font-body);
		font-size: 1rem;
		font-weight: 400;
		color: var(--color-text-muted);
		letter-spacing: 0.2em;
		text-transform: uppercase;
	}

	/* View toggle */
	.view-toggle {
		display: flex;
		gap: 2px;
		background: var(--color-bg-alt);
		border-radius: var(--radius-sm);
		padding: 2px;
	}

	.view-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		padding: 0;
		border: none;
		background: transparent;
		border-radius: calc(var(--radius-sm) - 2px);
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all var(--transition-slow);
	}

	.view-btn:hover {
		color: var(--color-text);
	}

	.view-btn--active {
		background: var(--color-bg);
		color: var(--color-text);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
	}

	.view-btn:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 1px;
	}

	/* View container transition */
	.view-container {
		transition: opacity 0.15s ease;
	}

	.view-container--transitioning {
		opacity: 0;
	}

	/* List view styles */
	.months-container--list {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.month-row {
		display: grid;
		grid-template-columns: 100px 1fr;
		align-items: flex-start;
		gap: var(--space-md);
		animation: month-slide 0.6s ease-out backwards;
	}

	.month-row:nth-child(1) { animation-delay: 0.05s; }
	.month-row:nth-child(2) { animation-delay: 0.1s; }
	.month-row:nth-child(3) { animation-delay: 0.15s; }
	.month-row:nth-child(4) { animation-delay: 0.2s; }
	.month-row:nth-child(5) { animation-delay: 0.25s; }
	.month-row:nth-child(6) { animation-delay: 0.3s; }
	.month-row:nth-child(7) { animation-delay: 0.35s; }
	.month-row:nth-child(8) { animation-delay: 0.4s; }
	.month-row:nth-child(9) { animation-delay: 0.45s; }
	.month-row:nth-child(10) { animation-delay: 0.5s; }
	.month-row:nth-child(11) { animation-delay: 0.55s; }
	.month-row:nth-child(12) { animation-delay: 0.6s; }

	.month-label {
		font-family: var(--font-body);
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-muted);
		line-height: 14px;
		text-align: right;
		letter-spacing: 0.02em;
	}

	.days-grid--list {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	/* Grid view styles */
	.months-container--grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-xl);
	}

	.month-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		animation: month-card-appear 0.5s ease-out backwards;
	}

	.month-card:nth-child(1) { animation-delay: 0.02s; }
	.month-card:nth-child(2) { animation-delay: 0.04s; }
	.month-card:nth-child(3) { animation-delay: 0.06s; }
	.month-card:nth-child(4) { animation-delay: 0.08s; }
	.month-card:nth-child(5) { animation-delay: 0.10s; }
	.month-card:nth-child(6) { animation-delay: 0.12s; }
	.month-card:nth-child(7) { animation-delay: 0.14s; }
	.month-card:nth-child(8) { animation-delay: 0.16s; }
	.month-card:nth-child(9) { animation-delay: 0.18s; }
	.month-card:nth-child(10) { animation-delay: 0.20s; }
	.month-card:nth-child(11) { animation-delay: 0.22s; }
	.month-card:nth-child(12) { animation-delay: 0.24s; }

	@keyframes month-card-appear {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.month-card-label {
		font-family: var(--font-body);
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--color-text-muted);
		text-align: center;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.weekday-header {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 2px;
		margin-bottom: var(--space-xs);
	}

	.weekday-label {
		font-family: var(--font-ui);
		font-size: 0.65rem;
		color: var(--color-text-muted);
		text-align: center;
		opacity: 0.6;
	}

	.days-grid--grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 3px;
	}

	.day-empty {
		aspect-ratio: 1;
	}

	.day-dot--grid {
		width: 100%;
		aspect-ratio: 1;
	}

	.day-dot--grid .day-inner {
		width: 100%;
		height: 100%;
	}

	/* Common day dot styles */
	.day-dot {
		position: relative;
		width: 14px;
		height: 14px;
		padding: 0;
		border: none;
		background: transparent;
		cursor: default;
		border-radius: 50%;
		transition: transform var(--transition-slow);
	}

	.day-inner {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background-color: transparent;
		border: 1.5px solid color-mix(in srgb, var(--color-text-muted) 30%, transparent);
		transition:
			background-color var(--transition-smoke),
			border-color var(--transition-smoke),
			transform var(--transition-slow),
			box-shadow var(--transition-slow);
	}

	/* Completed session with mood color */
	.day-dot--completed .day-inner {
		background-color: var(--dot-color, var(--color-accent));
		border-color: var(--dot-color, var(--color-accent));
		box-shadow: 0 0 8px color-mix(in srgb, var(--dot-color, var(--color-accent)) 40%, transparent);
	}

	/* Today indicator */
	.day-dot--today {
		transform: scale(1.1);
	}

	.day-dot--today .day-inner {
		border-color: var(--color-text);
		box-shadow:
			0 0 0 2px var(--color-bg),
			0 0 0 3px var(--color-text);
	}

	.day-dot--today.day-dot--completed .day-inner {
		box-shadow:
			0 0 0 2px var(--color-bg),
			0 0 0 3px var(--dot-color, var(--color-accent)),
			0 0 12px color-mix(in srgb, var(--dot-color, var(--color-accent)) 50%, transparent);
	}

	/* Future dates */
	.day-dot--future .day-inner {
		opacity: 0.25;
	}

	/* Missed/incomplete past dates */
	.day-dot--missed .day-inner {
		opacity: 0.4;
	}

	/* Locked sessions (beyond 90 days for free tier) */
	.day-dot--locked .day-inner {
		opacity: 0.4;
		filter: grayscale(0.5);
	}

	.day-dot--locked .lock-icon {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		opacity: 0.8;
		color: var(--color-bg);
	}

	/* Locked toast message */
	.locked-toast {
		position: fixed;
		top: var(--space-lg);
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-lg);
		background: var(--color-bg-alt);
		border-radius: var(--radius-full);
		font-family: var(--font-ui);
		font-size: 0.875rem;
		color: var(--color-text-muted);
		z-index: 50;
		animation: toast-slide-in 0.3s ease;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	@keyframes toast-slide-in {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}

	/* Clickable states */
	.day-dot--clickable {
		cursor: pointer;
	}

	.day-dot--clickable:hover .day-inner {
		transform: scale(1.3);
	}

	.day-dot--clickable:focus-visible {
		outline: none;
	}

	.day-dot--clickable:focus-visible .day-inner {
		box-shadow:
			0 0 0 2px var(--color-bg),
			0 0 0 4px var(--color-accent);
	}

	.day-dot--clickable:active .day-inner {
		transform: scale(1.1);
	}

	/* Legend */
	.calendar-legend {
		display: flex;
		justify-content: center;
		gap: var(--space-lg);
		margin-top: var(--space-xl);
		padding-top: var(--space-lg);
		border-top: 1px solid var(--color-bg-alt);
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.legend-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background-color: var(--dot-color, var(--color-bg-alt));
	}

	.legend-dot--empty {
		border: 1.5px solid color-mix(in srgb, var(--color-text-muted) 30%, transparent);
		background: transparent;
	}

	.legend-text {
		font-family: var(--font-ui);
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	/* Responsive adjustments */
	@media (max-width: 700px) {
		/* List view responsive */
		.month-row {
			grid-template-columns: 1fr;
			gap: var(--space-sm);
		}

		.month-label {
			text-align: left;
			padding-left: var(--space-xs);
		}

		.days-grid--list {
			gap: 5px;
		}

		.day-dot:not(.day-dot--grid) {
			width: 12px;
			height: 12px;
		}

		/* Grid view responsive - 2 columns */
		.months-container--grid {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--space-lg);
		}

		.calendar-legend {
			flex-wrap: wrap;
			gap: var(--space-md);
		}
	}

	@media (max-width: 450px) {
		.day-dot:not(.day-dot--grid) {
			width: 10px;
			height: 10px;
		}

		.days-grid--list {
			gap: 4px;
		}

		/* Grid view responsive - 1 column */
		.months-container--grid {
			grid-template-columns: 1fr;
			gap: var(--space-lg);
			max-width: 280px;
			margin: 0 auto;
		}

		.legend-item:first-child {
			width: 100%;
			justify-content: center;
		}
	}

	/* Animation on mount */
	.calendar {
		animation: calendar-appear 0.8s ease-out;
	}

	@keyframes calendar-appear {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes month-slide {
		from {
			opacity: 0;
			transform: translateX(-10px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
</style>
