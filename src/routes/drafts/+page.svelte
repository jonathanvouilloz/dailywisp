<script lang="ts">
	import { onMount } from 'svelte';
	import { calendarStore, settingsStore } from '$lib/stores';
	import Wisp from '$lib/components/Wisp.svelte';
	import { t } from '$lib/i18n';

	let mounted = $state(false);

	onMount(async () => {
		await calendarStore.init();
		mounted = true;
	});

	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		const lang = settingsStore.language === 'fr' ? 'fr-FR' : 'en-US';
		return date.toLocaleDateString(lang, {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

	function truncateText(text: string, maxLength: number = 60): string {
		if (!text) return '';
		const trimmed = text.trim().replace(/\s+/g, ' ');
		if (trimmed.length <= maxLength) return trimmed;
		return trimmed.slice(0, maxLength).trim() + '...';
	}
</script>

<svelte:head>
	<title>{t('drafts.pageTitle')}</title>
</svelte:head>

<main class="drafts">
	<header class="header">
		<a href="/home" class="back-link" aria-label={t('common.backHome')}>
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M19 12H5"/>
				<path d="M12 19l-7-7 7-7"/>
			</svg>
		</a>

		<h1 class="title">{t('drafts.title')}</h1>

		{#if calendarStore.interruptedCount > 0}
			<span class="count-badge">{calendarStore.interruptedCount}</span>
		{:else}
			<span class="count-spacer"></span>
		{/if}
	</header>

	{#if !mounted || calendarStore.loading}
		<div class="loading">
			<Wisp size="md" mood="thinking" />
			<span class="loading-text">{t('common.loading')}</span>
		</div>
	{:else if calendarStore.interruptedSessions.length === 0}
		<div class="empty-state">
			<Wisp size="lg" mood="zen" />
			<h2 class="empty-title">{t('drafts.empty')}</h2>
			<p class="empty-desc">{t('drafts.emptyDesc')}</p>
			<a href="/write" class="start-link">{t('drafts.startNew')}</a>
		</div>
	{:else}
		<ul class="drafts-list">
			{#each calendarStore.interruptedSessions as session (session.id)}
				<li class="draft-item">
					<a href="/journal/{session.date}" class="draft-card">
						<div class="draft-header">
							<span class="draft-date">{formatDate(session.date)}</span>
							<span class="draft-words">{t('drafts.words', { count: session.wordCount })}</span>
						</div>
						<p class="draft-preview">"{truncateText(session.text)}"</p>
						<span class="resume-hint">{t('drafts.resume')} →</span>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</main>

<style>
	.drafts {
		min-height: 100vh;
		min-height: 100dvh;
		padding: var(--space-lg);
		background: var(--color-bg);
	}

	/* Header */
	.header {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		max-width: 600px;
		margin: 0 auto var(--space-xl) auto;
	}

	.back-link {
		color: var(--color-text-muted);
		padding: var(--space-sm);
		border-radius: var(--radius-md);
		transition: all var(--transition-fast);
		margin-left: calc(-1 * var(--space-sm));
	}

	.back-link:hover {
		color: var(--color-text);
		background: var(--color-bg-alt);
	}

	.title {
		flex: 1;
		font-family: var(--font-ui);
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0;
	}

	.count-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 28px;
		height: 28px;
		padding: 0 var(--space-sm);
		font-family: var(--font-ui);
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--color-accent);
		background: color-mix(in srgb, var(--color-accent) 12%, transparent);
		border-radius: var(--radius-full);
	}

	.count-spacer {
		width: 28px;
	}

	/* Loading */
	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
		gap: var(--space-md);
	}

	.loading-text {
		font-family: var(--font-ui);
		color: var(--color-text-muted);
	}

	/* Empty state */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		min-height: 50vh;
		padding: var(--space-xl);
	}

	.empty-title {
		font-family: var(--font-ui);
		font-size: 1.25rem;
		font-weight: 600;
		margin: var(--space-lg) 0 var(--space-sm) 0;
	}

	.empty-desc {
		font-family: var(--font-body);
		color: var(--color-text-muted);
		margin: 0 0 var(--space-xl) 0;
	}

	.start-link {
		font-family: var(--font-ui);
		font-size: 0.95rem;
		color: var(--color-accent);
		text-decoration: none;
		padding: var(--space-sm) var(--space-lg);
		border: 1px solid var(--color-accent);
		border-radius: var(--radius-md);
		transition: all var(--transition-fast);
	}

	.start-link:hover {
		background: var(--color-accent);
		color: white;
	}

	/* Drafts list */
	.drafts-list {
		list-style: none;
		padding: 0;
		margin: 0;
		max-width: 600px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.draft-item {
		animation: fade-in 0.3s ease;
	}

	.draft-card {
		width: 100%;
		display: block;
		padding: var(--space-lg);
		background: var(--color-bg-alt);
		border: 1px solid transparent;
		border-radius: var(--radius-lg);
		text-align: left;
		text-decoration: none;
		color: inherit;
		cursor: pointer;
		transition: all var(--transition-normal);
	}

	.draft-card:hover {
		border-color: var(--color-accent);
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
	}

	.draft-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: var(--space-sm);
	}

	.draft-date {
		font-family: var(--font-ui);
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.draft-words {
		font-family: var(--font-ui);
		font-size: 0.8rem;
		color: var(--color-text-muted);
	}

	.draft-preview {
		font-family: var(--font-body);
		font-size: 0.95rem;
		color: var(--color-text-muted);
		line-height: 1.5;
		margin: 0 0 var(--space-md) 0;
		font-style: italic;
	}

	.resume-hint {
		font-family: var(--font-ui);
		font-size: 0.85rem;
		color: var(--color-accent);
		opacity: 0;
		transition: opacity var(--transition-fast);
	}

	.draft-card:hover .resume-hint {
		opacity: 1;
	}

	/* Animation */
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Responsive */
	@media (max-width: 600px) {
		.drafts {
			padding: var(--space-md);
		}

		.title {
			font-size: 1.25rem;
		}

		.draft-card {
			padding: var(--space-md);
		}

		.resume-hint {
			opacity: 1;
		}
	}
</style>
