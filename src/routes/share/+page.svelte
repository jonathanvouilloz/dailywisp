<script lang="ts">
	import { goto } from '$app/navigation';
	import { calendarStore } from '$lib/stores';
	import Wisp from '$lib/components/Wisp.svelte';
	import { t } from '$lib/i18n';

	type Template = {
		id: string;
		name: string;
		template: string;
	};

	const templates: Template[] = [
		{
			id: 'minimal',
			name: 'Minimal',
			template: "Just wrote {words} words today ✨"
		},
		{
			id: 'streak',
			name: 'Streak',
			template: "Day {streak} of writing daily — {words} words down, thoughts freed."
		},
		{
			id: 'journey',
			name: 'Journey',
			template: "{total_words} words written. {sessions} sessions completed. The journey continues. 📝"
		}
	];

	let selectedTemplate = $state<string>('minimal');
	let customMessage = $state('');

	// Get the generated message based on template
	const generatedMessage = $derived.by(() => {
		const template = templates.find(t => t.id === selectedTemplate);
		if (!template) return '';

		return template.template
			.replace('{words}', calendarStore.totalWords.toLocaleString())
			.replace('{streak}', calendarStore.currentStreak.toString())
			.replace('{sessions}', calendarStore.totalSessions.toString())
			.replace('{total_words}', calendarStore.totalWords.toLocaleString());
	});

	// Final message to share
	const shareMessage = $derived(customMessage || generatedMessage);

	// Share to Twitter/X
	function shareToTwitter(): void {
		const text = encodeURIComponent(shareMessage);
		const url = `https://twitter.com/intent/tweet?text=${text}`;
		window.open(url, '_blank', 'noopener,noreferrer');
	}

	// Skip and go home
	function skipShare(): void {
		goto('/home');
	}
</script>

<svelte:head>
	<title>{t('share.title')}</title>
</svelte:head>

<main class="share-page">
	<div class="share-layout animate-fade-in">
		<!-- Left column: Mascot -->
		<aside class="share-mascot">
			<Wisp size="lg" mood="sharing" />
			<p class="mascot-message">{t('share.readyToShare')}</p>
		</aside>

		<!-- Right column: Templates + Twitter modal -->
		<section class="share-content">
			<!-- Template tabs -->
			<div class="template-tabs">
				{#each templates as template}
					<button
						class="template-tab"
						class:template-tab--active={selectedTemplate === template.id}
						onclick={() => { selectedTemplate = template.id; customMessage = ''; }}
					>
						{template.id === 'minimal' ? t('share.minimal') : template.id === 'streak' ? t('share.streak') : t('share.journey')}
					</button>
				{/each}
			</div>

			<!-- Twitter/X Modal mockup -->
			<div class="twitter-modal">
				<div class="twitter-header">
					<button class="twitter-close" onclick={skipShare} aria-label="Close">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</button>
					<span class="twitter-drafts">{t('share.drafts')}</span>
				</div>

				<div class="twitter-body">
					<div class="twitter-avatar">
						<Wisp size="sm" mood="sharing" />
					</div>
					<div class="twitter-compose">
						<div class="twitter-audience">
							<span>{t('share.everyone')}</span>
							<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<polyline points="6 9 12 15 18 9" />
							</svg>
						</div>
						<textarea
							class="twitter-text"
							bind:value={customMessage}
							placeholder={generatedMessage}
							rows="4"
						></textarea>
					</div>
				</div>

				<div class="twitter-footer">
					<div class="twitter-icons">
						<button class="twitter-icon-btn" aria-label="Media">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="3" y="3" width="18" height="18" rx="2"/>
								<circle cx="8.5" cy="8.5" r="1.5"/>
								<polyline points="21 15 16 10 5 21"/>
							</svg>
						</button>
						<button class="twitter-icon-btn" aria-label="GIF">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="2" y="4" width="20" height="16" rx="2"/>
								<path d="M8 10h2v4H8z"/>
								<path d="M14 10h2"/>
								<path d="M14 14h2"/>
							</svg>
						</button>
						<button class="twitter-icon-btn" aria-label="Emoji">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<circle cx="12" cy="12" r="10"/>
								<path d="M8 14s1.5 2 4 2 4-2 4-2"/>
								<line x1="9" y1="9" x2="9.01" y2="9"/>
								<line x1="15" y1="9" x2="15.01" y2="9"/>
							</svg>
						</button>
						<button class="twitter-icon-btn" aria-label="Location">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
								<circle cx="12" cy="10" r="3"/>
							</svg>
						</button>
					</div>
					<button class="twitter-post" onclick={shareToTwitter}>
						{t('common.post')}
					</button>
				</div>
			</div>

			<!-- Skip link -->
			<button class="skip-btn" onclick={skipShare}>
				{t('common.skipForNow')}
			</button>
		</section>
	</div>
</main>

<style>
	.share-page {
		min-height: 100vh;
		padding: var(--space-xl);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* 2-column layout */
	.share-layout {
		display: grid;
		grid-template-columns: 1fr 1.5fr;
		gap: var(--space-3xl);
		max-width: 900px;
		width: 100%;
		align-items: center;
	}

	/* Left column - Mascot */
	.share-mascot {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-lg);
		padding: var(--space-xl);
	}

	.mascot-message {
		font-family: var(--font-body);
		font-size: 1.125rem;
		color: var(--color-text-muted);
		text-align: center;
		margin: 0;
		max-width: 200px;
		line-height: 1.5;
	}

	/* Right column - Content */
	.share-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	/* Template tabs - horizontal */
	.template-tabs {
		display: flex;
		gap: var(--space-sm);
		padding-bottom: var(--space-md);
		border-bottom: 1px solid var(--color-bg-alt);
	}

	.template-tab {
		padding: var(--space-sm) var(--space-md);
		font-family: var(--font-ui);
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-muted);
		background: transparent;
		border: none;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.template-tab:hover {
		background: var(--color-bg-alt);
		color: var(--color-text);
	}

	.template-tab--active {
		background: var(--color-text);
		color: var(--color-bg);
	}

	.template-tab--active:hover {
		background: var(--color-text);
		color: var(--color-bg);
	}

	/* Twitter/X Modal */
	.twitter-modal {
		background: #ffffff;
		border: 1px solid #e5e5e5;
		border-radius: 24px;
		overflow: hidden;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
	}

	.twitter-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-md) var(--space-lg);
		border-bottom: 1px solid #eff3f4;
	}

	.twitter-close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: var(--radius-full);
		background: transparent;
		border: none;
		color: #0f1419;
		cursor: pointer;
		transition: background var(--transition-fast);
	}

	.twitter-close:hover {
		background: #eff3f4;
	}

	.twitter-drafts {
		font-family: var(--font-ui);
		font-size: 0.875rem;
		font-weight: 500;
		color: #1d9bf0;
		cursor: pointer;
	}

	.twitter-body {
		display: flex;
		gap: var(--space-md);
		padding: var(--space-lg);
	}

	.twitter-avatar {
		flex-shrink: 0;
	}

	.twitter-compose {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.twitter-audience {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-xs) var(--space-sm);
		font-family: var(--font-ui);
		font-size: 0.8rem;
		font-weight: 600;
		color: #1d9bf0;
		border: 1px solid #1d9bf0;
		border-radius: var(--radius-full);
		width: fit-content;
		cursor: pointer;
	}

	.twitter-audience svg {
		stroke: #1d9bf0;
	}

	.twitter-text {
		width: 100%;
		font-family: var(--font-body);
		font-size: 1.125rem;
		line-height: 1.5;
		color: #0f1419;
		background: transparent;
		border: none;
		outline: none;
		resize: none;
	}

	.twitter-text::placeholder {
		color: #0f1419;
		opacity: 1;
	}

	.twitter-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-md) var(--space-lg);
		border-top: 1px solid #eff3f4;
	}

	.twitter-icons {
		display: flex;
		gap: var(--space-xs);
	}

	.twitter-icon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: var(--radius-full);
		background: transparent;
		border: none;
		color: #1d9bf0;
		cursor: pointer;
		transition: background var(--transition-fast);
	}

	.twitter-icon-btn:hover {
		background: rgba(29, 155, 240, 0.1);
	}

	.twitter-icon-btn svg {
		stroke: #1d9bf0;
	}

	.twitter-post {
		padding: var(--space-sm) var(--space-lg);
		font-family: var(--font-ui);
		font-size: 0.9rem;
		font-weight: 700;
		background: #1d9bf0;
		color: white;
		border: none;
		border-radius: var(--radius-full);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.twitter-post:hover {
		background: #1a8cd8;
	}

	/* Skip button */
	.skip-btn {
		align-self: center;
		padding: var(--space-sm) var(--space-md);
		font-family: var(--font-ui);
		font-size: 0.875rem;
		color: var(--color-text-muted);
		background: none;
		border: none;
		cursor: pointer;
		transition: color var(--transition-fast);
	}

	.skip-btn:hover {
		color: var(--color-text);
	}

	/* Responsive: 1 column on mobile/tablet */
	@media (max-width: 700px) {
		.share-page {
			padding: var(--space-lg);
		}

		.share-layout {
			grid-template-columns: 1fr;
			gap: var(--space-xl);
		}

		.share-mascot {
			display: none;
		}

		.template-tabs {
			justify-content: center;
		}
	}

	/* Dark mode adjustments - keep Twitter modal white like real X */
	:global([data-theme='dark']) .twitter-modal {
		background: #ffffff;
		border-color: #e5e5e5;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
	}

	/* Animation */
	.share-layout {
		animation: layout-appear 0.5s ease-out;
	}

	@keyframes layout-appear {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
