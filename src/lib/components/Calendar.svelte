<script lang="ts">
	import { goto } from '$app/navigation';
	import { calendarStore } from '$lib/stores';
	import { MOODS, type MoodLevel } from '$lib/types';
	import { t, getMonthNames, getMoodLabel } from '$lib/i18n';

	// Get current date info
	const today = new Date();
	const currentYear = today.getFullYear();
	const todayStr = today.toISOString().split('T')[0];

	// Month names for labels (reactive based on language)
	const months = $derived(getMonthNames());

	// Generate days for the entire year
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

	const yearDays = generateYearDays(currentYear);

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

	// Check if day is clickable
	function isClickable(dateStr: string): boolean {
		if (isFuture(dateStr)) return false;

		const session = calendarStore.getSessionForDate(dateStr);

		if (isToday(dateStr)) return true;
		return session?.status === 'completed';
	}
</script>

<div class="calendar" role="region" aria-label="Writing calendar for {currentYear}">
	<!-- Year header -->
	<header class="calendar-header">
		<span class="year-label">{currentYear}</span>
	</header>

	<!-- Months grid -->
	<div class="months-container">
		{#each yearDays as monthDays, monthIndex}
			<div class="month-row">
				<span class="month-label">{months[monthIndex]}</span>
				<div class="days-grid" role="grid" aria-label="{months[monthIndex]} {currentYear}">
					{#each monthDays as { date, day }}
						{@const moodColor = getMoodColor(date)}
						{@const future = isFuture(date)}
						{@const todayDate = isToday(date)}
						{@const clickable = isClickable(date)}
						{@const hasSession = moodColor !== null}
						{@const missed = !future && !todayDate && !hasSession}

						<button
							class="day-dot"
							class:day-dot--future={future}
							class:day-dot--today={todayDate}
							class:day-dot--completed={hasSession}
							class:day-dot--missed={missed}
							class:day-dot--clickable={clickable}
							style={moodColor ? `--dot-color: ${moodColor}` : ''}
							onclick={() => handleDayClick(date)}
							disabled={!clickable}
							aria-label="{day} {months[monthIndex]} {currentYear}{hasSession ? ', ' + t('calendar.completedSession') : ''}{todayDate ? ', ' + t('calendar.today') : ''}"
							title="{day} {months[monthIndex]}{hasSession ? ' - ' + t('calendar.viewEntry') : todayDate ? ' - ' + t('calendar.writeToday') : ''}"
						>
							<span class="day-inner"></span>
						</button>
					{/each}
				</div>
			</div>
		{/each}
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

	.months-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.month-row {
		display: grid;
		grid-template-columns: 100px 1fr;
		align-items: flex-start;
		gap: var(--space-md);
	}

	.month-label {
		font-family: var(--font-body);
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-muted);
		line-height: 14px;
		text-align: right;
		letter-spacing: 0.02em;
	}

	.days-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

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
		display: block;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background-color: color-mix(in srgb, var(--color-text-muted) 25%, var(--color-bg));
		transition:
			background-color var(--transition-smoke),
			transform var(--transition-slow),
			box-shadow var(--transition-slow);
	}

	/* Completed session with mood color */
	.day-dot--completed .day-inner {
		background-color: var(--dot-color, var(--color-accent));
		box-shadow: 0 0 8px color-mix(in srgb, var(--dot-color, var(--color-accent)) 40%, transparent);
	}

	/* Today indicator */
	.day-dot--today {
		transform: scale(1.1);
	}

	.day-dot--today .day-inner {
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
		opacity: 0.25;
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
		border: 1px solid var(--color-text-muted);
		background: transparent;
	}

	.legend-text {
		font-family: var(--font-ui);
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	/* Responsive adjustments */
	@media (max-width: 700px) {
		.month-row {
			grid-template-columns: 1fr;
			gap: var(--space-sm);
		}

		.month-label {
			text-align: left;
			padding-left: var(--space-xs);
		}

		.days-grid {
			gap: 5px;
		}

		.day-dot {
			width: 12px;
			height: 12px;
		}

		.calendar-legend {
			flex-wrap: wrap;
			gap: var(--space-md);
		}
	}

	@media (max-width: 400px) {
		.day-dot {
			width: 10px;
			height: 10px;
		}

		.days-grid {
			gap: 4px;
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

	/* Stagger month rows */
	.month-row {
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
