<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import { sessionStore, userStore } from '$lib/stores';
	import Wisp from '$lib/components/Wisp.svelte';
	import InkGauge from '$lib/components/InkGauge.svelte';
	import MoodIcon from '$lib/components/MoodIcon.svelte';
	import BackupReminderModal from '$lib/components/BackupReminderModal.svelte';
	import { WORD_TARGET, MOODS, type MoodLevel, type WispMood } from '$lib/types';
	import { t, getMoodLabel } from '$lib/i18n';
	import { analytics } from '$lib/analytics';

	type PageState = 'loading' | 'already_done' | 'ready' | 'active' | 'completed' | 'interrupted';

	let pageState = $state<PageState>('loading');
	let editorEl = $state<HTMLDivElement | null>(null);
	let selectedMood = $state<MoodLevel | null>(null);
	let moodNote = $state('');

	// Backup reminder state
	let showBackupReminder = $state(false);

	// Anti-paste state
	let showPasteHint = $state(false);
	let pasteHintTimeout: ReturnType<typeof setTimeout> | null = null;

	// Get mood background color for atmosphere effect
	function getMoodBgColor(level: MoodLevel): string {
		const color = MOODS[level].color;
		return `color-mix(in srgb, ${color} 12%, var(--color-bg))`;
	}

	// Derive Wisp opacity from gauge level (min 0.2 for visibility)
	const wispOpacity = $derived(Math.max(0.2, sessionStore.gaugeLevel / 100));

	// Derive text opacity from gauge level (min 0.25 for readability)
	const textOpacity = $derived(
		sessionStore.canComplete ? 1 : Math.max(0.25, 0.25 + (sessionStore.gaugeLevel / 100) * 0.75)
	);

	// Derive Wisp mood based on gauge and completion status
	const wispMood = $derived.by((): WispMood => {
		if (sessionStore.isCompleted) return 'zen';
		if (sessionStore.gaugeLevel < 30) return 'stressed';
		return 'neutral';
	});

	// Format duration as "Xm Ys"
	function formatDuration(ms: number): string {
		const totalSeconds = Math.floor(ms / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${minutes}m ${seconds}s`;
	}

	onMount(async () => {
		// Redirect to onboarding if not completed
		await userStore.init();
		if (!userStore.isOnboarded) {
			goto('/onboarding');
			return;
		}

		// If session already started with text (coming from journal/drafts resume)
		if (sessionStore.isActive && sessionStore.text) {
			pageState = 'active';
			await tick();
			if (editorEl) {
				editorEl.innerText = sessionStore.text;
				editorEl.focus();
				// Place cursor at end of text
				const range = document.createRange();
				const selection = window.getSelection();
				range.selectNodeContents(editorEl);
				range.collapse(false); // false = collapse to end
				selection?.removeAllRanges();
				selection?.addRange(range);
			}
			return;
		}

		const hasExisting = await sessionStore.checkTodaySession();

		if (hasExisting) {
			if (sessionStore.isCompleted) {
				pageState = 'already_done';
			} else if (sessionStore.isInterrupted) {
				pageState = 'interrupted';
			}
		} else {
			pageState = 'ready';
		}
	});

	onDestroy(() => {
		// Stop tick if session is active when leaving
		if (sessionStore.isActive) {
			// Note: session continues in background for now
			// Could implement pause/resume later
		}
		// Cleanup paste hint timeout
		if (pasteHintTimeout) clearTimeout(pasteHintTimeout);
	});

	function startWriting(): void {
		sessionStore.startSession();
		pageState = 'active';
		analytics.sessionStart();
		// Focus editor after state change
		setTimeout(() => editorEl?.focus(), 50);
	}

	function handleInput(): void {
		const text = editorEl?.innerText || '';
		sessionStore.updateText(text);
		autoScroll();
	}

	function autoScroll(): void {
		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) return;

		const range = selection.getRangeAt(0);
		const rect = range.getBoundingClientRect();

		// Threshold: 60% of screen height
		const threshold = window.innerHeight * 0.6;

		if (rect.bottom > threshold) {
			window.scrollBy({
				top: rect.bottom - threshold,
				behavior: 'smooth'
			});
		}
	}

	function handlePaste(e: ClipboardEvent): void {
		e.preventDefault();
		triggerPasteHint();
	}

	function triggerPasteHint(): void {
		if (pasteHintTimeout) clearTimeout(pasteHintTimeout);
		showPasteHint = true;
		pasteHintTimeout = setTimeout(() => (showPasteHint = false), 2000);
	}

	function handleDragOver(e: DragEvent): void {
		e.preventDefault();
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'none';
	}

	function handleDrop(e: DragEvent): void {
		e.preventDefault();
		triggerPasteHint();
	}

	async function handleComplete(): Promise<void> {
		// Track session completion with stats
		const durationSec = sessionStore.startTime
			? Math.floor((Date.now() - sessionStore.startTime.getTime()) / 1000)
			: 0;
		analytics.sessionComplete(sessionStore.wordCount, durationSec);

		await sessionStore.completeSession();
		// Increment session count and check if backup reminder should show
		const shouldRemind = await userStore.incrementSessionCount();
		if (shouldRemind) {
			showBackupReminder = true;
		}
	}

	async function submitMood(): Promise<void> {
		if (selectedMood) {
			analytics.moodSelect(selectedMood);
			await sessionStore.setMood(selectedMood, moodNote || undefined);
			goto('/share');
		}
	}

	async function handleDismissBackupReminder(): Promise<void> {
		await userStore.markBackupReminderShown();
		showBackupReminder = false;
	}

	function goHome(): void {
		sessionStore.reset();
		goto('/home');
	}

	function retrySession(): void {
		sessionStore.reset();
		pageState = 'ready';
	}

	// React to session status changes
	$effect(() => {
		if (sessionStore.isCompleted && pageState === 'active') {
			pageState = 'completed';
		}
		if (sessionStore.isInterrupted && pageState === 'active') {
			analytics.sessionFailed(sessionStore.wordCount);
			pageState = 'interrupted';
		}
	});
</script>

<svelte:head>
	<title>{t('write.title')}</title>
</svelte:head>

<!-- Backup Reminder Modal -->
{#if showBackupReminder}
	<BackupReminderModal
		sessionCount={userStore.totalSessions}
		onDismiss={handleDismissBackupReminder}
	/>
{/if}

<main class="write-page">
	{#if pageState === 'loading'}
		<!-- Loading state -->
		<div class="write-state write-state--loading">
			<Wisp size="md" mood="thinking" />
			<p class="text-muted">{t('write.preparing')}</p>
		</div>

	{:else if pageState === 'already_done'}
		<!-- Already completed today -->
		<div class="write-state write-state--done animate-fade-in">
			<Wisp size="lg" mood="happy" />
			<h2>{t('write.alreadyDone')}</h2>
			<p class="text-muted">{t('write.alreadyDoneDesc')}</p>
			<a href="/home" class="btn">
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
				{t('common.viewCalendar')}
			</a>
		</div>

	{:else if pageState === 'ready'}
		<!-- Ready to start -->
		<div class="write-state write-state--ready animate-fade-in">
			<Wisp size="lg" mood="neutral" />
			<h2>{t('write.readyTitle')}</h2>
			<p class="text-muted">
				{@html t('write.readyDesc', { target: WORD_TARGET }).replace('\n', '<br />')}
			</p>
			<button class="btn btn--lg" onclick={startWriting}>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
				{t('write.startWriting')}
			</button>
		</div>

	{:else if pageState === 'active'}
		<!-- Active writing session - centered text with fixed bottom bar -->
		<div class="write-session animate-fade-in">
			<div class="write-main">
				<div
					bind:this={editorEl}
					class="writing-area"
					class:writing-area--flow={sessionStore.inFlowState}
					style="opacity: {textOpacity}"
					contenteditable="true"
					spellcheck="false"
					role="textbox"
					aria-multiline="true"
					oninput={handleInput}
					onpaste={handlePaste}
					ondragover={handleDragOver}
					ondrop={handleDrop}
					data-placeholder={t('write.placeholder')}
				></div>

				{#if showPasteHint}
					<div class="paste-hint" transition:fade={{ duration: 400 }}>
						<span class="paste-hint-text">{t('write.pasteBlocked')}</span>
					</div>
				{/if}
			</div>

			<!-- Fixed bottom bar -->
			<div class="write-bottom-bar">
				<div class="bottom-bar-content">
					{#if !sessionStore.canComplete}
						<div class="bar-gauge" transition:fade={{ duration: 500 }}>
							<InkGauge level={sessionStore.gaugeLevel} showPercent inFlow={sessionStore.inFlowState} />
						</div>
					{/if}

					<div class="bar-wisp">
						<Wisp size="sm" opacity={wispOpacity} mood={wispMood} />
					</div>

					<span class="word-count text-ui">
						<strong>{sessionStore.wordCount}</strong> / {WORD_TARGET}
					</span>

					{#if sessionStore.canComplete}
						<button class="btn btn--success animate-fade-in" onclick={handleComplete}>
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
							{t('write.finish')}
						</button>
					{/if}
				</div>
			</div>
		</div>

	{:else if pageState === 'completed'}
		<!-- Session completed - mood rating with atmosphere -->
		<div
			class="write-state write-state--completed animate-fade-in"
			style="--mood-bg: {selectedMood ? getMoodBgColor(selectedMood) : 'transparent'}"
		>
			<!-- Wisp changes based on selected mood -->
			<div class="mood-mascot">
				{#if selectedMood}
					<MoodIcon mood={selectedMood} size={180} />
				{:else}
					<Wisp size="lg" mood="zen" />
				{/if}
			</div>

			<div class="completion-message">
				<h2>{t('write.complete')}</h2>
				<p class="stats text-muted">
					{t('write.wordsIn', { words: sessionStore.wordCount, duration: sessionStore.startTime ? formatDuration(Date.now() - sessionStore.startTime.getTime()) : '' })}
				</p>
			</div>

			<div class="mood-rating">
				<p class="mood-question">{t('write.howFeel')}</p>

				<div class="mood-options mood-options--large">
					{#each Object.values(MOODS) as mood}
						<button
							class="mood-btn mood-btn--large"
							class:mood-btn--selected={selectedMood === mood.level}
							onclick={() => (selectedMood = mood.level)}
							title={getMoodLabel(mood.level)}
							style="--mood-color: {mood.color}"
						>
							<MoodIcon mood={mood.level} size={72} />
							<span class="mood-label">{getMoodLabel(mood.level)}</span>
						</button>
					{/each}
				</div>

					<textarea
					class="mood-note"
					placeholder={t('write.moodNotePlaceholder')}
					bind:value={moodNote}
					rows="2"
				></textarea>
			</div>

			<button
				class="btn btn--lg"
				onclick={submitMood}
				disabled={!selectedMood}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
				{t('common.continue')}
			</button>
		</div>

	{:else if pageState === 'interrupted'}
		<!-- Session interrupted - gauge hit 0 -->
		<div class="write-state write-state--interrupted animate-fade-in">
			<Wisp size="lg" opacity={0.5} mood="thinking" />

			<div class="interrupted-message">
				<h2>{t('write.interrupted')}</h2>
				<p class="text-muted">
					{t('write.interruptedDesc')}
				</p>
			</div>

			<div class="interrupted-actions">
				<button class="btn btn--primary" onclick={retrySession}>
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
					{t('write.tryAgain')}
				</button>
				<button class="btn btn--muted" onclick={goHome}>
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
					{t('common.backHome')}
				</button>
			</div>
		</div>
	{/if}
</main>

<style>
	.write-page {
		min-height: 100vh;
	}

	/* Generic write states */
	.write-state {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-xl);
		gap: var(--space-lg);
		text-align: center;
	}

	.write-state h2 {
		font-size: 1.75rem;
		margin: 0;
	}

	.write-state p {
		margin: 0;
		max-width: 320px;
		line-height: 1.6;
	}

	/* Active writing session - centered layout with fixed bottom bar */
	.write-session {
		min-height: 100vh;
		padding-bottom: 140px; /* Space for fixed bottom bar */
	}

	.write-main {
		max-width: 680px;
		margin: 0 auto;
		padding: var(--space-xl) var(--space-lg);
	}

	.writing-area {
		width: 100%;
		min-height: 70vh;
		font-family: var(--font-body);
		font-size: 1.25rem;
		line-height: 1.8;
		border: none;
		background: transparent;
		outline: none;
		color: var(--color-text);
		padding: var(--space-xl) 0;
		padding-bottom: 60vh; /* Generous padding to always see what you type */
		white-space: pre-wrap;
		word-wrap: break-word;
		caret-color: var(--color-text);
		transition: opacity 0.15s ease-out;
	}

	.writing-area:empty:before {
		content: attr(data-placeholder);
		color: var(--color-text-muted);
		opacity: 0.6;
		pointer-events: none;
	}

	/* Flow state - subtle glow around writing area */
	.writing-area--flow {
		box-shadow: 0 0 40px color-mix(in srgb, var(--mood-flow) 25%, transparent);
		transition: box-shadow 0.8s ease-out;
	}

	/* Fixed bottom bar */
	.write-bottom-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: linear-gradient(
			to top,
			var(--color-bg) 0%,
			var(--color-bg) 60%,
			transparent 100%
		);
		padding-top: var(--space-xl);
		z-index: 10;
	}

	.bottom-bar-content {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-lg);
		padding: var(--space-md) var(--space-lg) var(--space-lg);
	}

	.word-count {
		font-size: 0.9rem;
		color: var(--color-text-muted);
		text-align: center;
	}

	.word-count strong {
		display: inline;
		font-size: 1.1rem;
		color: var(--color-text);
		font-weight: 600;
	}

	/* Completed state - mood rating with atmosphere */
	.write-state--completed {
		gap: var(--space-md);
		padding: var(--space-lg);
		background: var(--mood-bg, transparent);
		transition: background-color 0.8s ease-out;
	}

	.mood-mascot {
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.3s ease-out;
	}

	.completion-message {
		margin-bottom: 0;
	}

	.stats {
		font-size: 1rem;
		margin-top: var(--space-sm);
	}

	.mood-rating {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-md);
		margin: var(--space-md) 0;
	}

	.mood-question {
		font-family: var(--font-ui);
		font-size: 1rem;
		color: var(--color-text-muted);
		margin: 0;
	}

	.mood-options {
		display: flex;
		gap: var(--space-sm);
	}

	.mood-options--large {
		gap: var(--space-md);
	}

	.mood-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-md);
		background: var(--color-bg-alt);
		border-radius: var(--radius-lg);
		transition: all var(--transition-fast);
		border: 2px solid transparent;
	}

	.mood-btn--large {
		padding: var(--space-md) var(--space-lg);
		gap: var(--space-sm);
		border-radius: 20px;
	}

	.mood-btn:hover {
		background: var(--color-bg);
		border-color: var(--color-text-muted);
		transform: translateY(-2px);
	}

	.mood-btn--selected {
		border-color: var(--mood-color);
		background: var(--color-bg);
	}

	.mood-label {
		font-family: var(--font-ui);
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.mood-btn--large .mood-label {
		font-size: 0.875rem;
	}

	.mood-note {
		width: 100%;
		max-width: 400px;
		margin-top: var(--space-md);
		font-family: var(--font-body);
		font-size: 1rem;
		line-height: 1.6;
		padding: var(--space-md);
		border: none;
		border-radius: var(--radius-lg);
		background: white;
		color: var(--color-text);
		resize: none;
	}

	.mood-note::placeholder {
		color: var(--color-text-muted);
		opacity: 0.5;
	}

	.mood-note:focus {
		outline: none;
	}

	/* Interrupted state */
	.write-state--interrupted {
		gap: var(--space-xl);
	}

	.interrupted-message h2 {
		font-weight: 500;
	}

	.interrupted-message p {
		max-width: 360px;
	}

	.interrupted-actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		margin-top: var(--space-md);
	}

	/* Dark mode adjustments */
	:global([data-theme='dark']) .mood-btn {
		background: var(--color-bg-alt);
	}

	:global([data-theme='dark']) .mood-btn:hover,
	:global([data-theme='dark']) .mood-btn--selected {
		background: var(--color-bg);
	}

	/* Responsive adjustments - mobile */
	@media (max-width: 768px) {
		.write-main {
			padding: var(--space-lg) var(--space-md);
		}

		.writing-area {
			font-size: 1.125rem;
		}

		.bottom-bar-content {
			flex-wrap: wrap;
			gap: var(--space-md);
		}

		.bar-gauge {
			width: 100%;
			display: flex;
			justify-content: center;
		}

		.bottom-bar-content .btn {
			width: 100%;
		}
	}

	@media (max-width: 600px) {
		.mood-options {
			flex-wrap: wrap;
			justify-content: center;
		}

		.mood-options--large {
			gap: var(--space-sm);
		}

		.mood-btn {
			padding: var(--space-sm);
		}

		.mood-btn--large {
			padding: var(--space-sm) var(--space-md);
		}

		.mood-btn--large .mood-label {
			font-size: 0.75rem;
		}
	}

	/* Paste hint */
	.paste-hint {
		position: fixed;
		top: var(--space-lg);
		left: 50%;
		transform: translateX(-50%);
		padding: var(--space-sm) var(--space-lg);
		background: var(--color-bg-alt);
		border-radius: var(--radius-full);
		z-index: 20;
		pointer-events: none;
	}

	.paste-hint-text {
		font-family: var(--font-ui);
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}
</style>
