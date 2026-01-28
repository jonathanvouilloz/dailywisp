<script lang="ts">
	import { page } from '$app/stores';
	import { t } from '$lib/i18n';
	import Wisp from '$lib/components/Wisp.svelte';
</script>

<div class="error-page">
	<div class="error-content">
		<Wisp size="sm" mood="thinking" />

		<h1 class="error-title">{t('error.title')}</h1>

		<p class="error-message">
			{$page.status === 404 ? t('error.notFound') : t('error.generic')}
		</p>

		<p class="error-code">{$page.status}</p>

		<a href="/" class="btn">
			{t('common.backHome')}
		</a>
	</div>
</div>

<style>
	.error-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-lg);
		animation: error-fade-in 0.8s ease-out;
	}

	.error-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: var(--space-lg);
		max-width: 400px;
	}

	.error-title {
		font-family: var(--font-body);
		font-size: 1.5rem;
		font-weight: 400;
		font-style: italic;
		color: var(--color-text);
		margin: 0;
	}

	.error-message {
		font-family: var(--font-ui);
		font-weight: var(--font-ui-weight);
		color: var(--color-text-muted);
		margin: 0;
	}

	.error-code {
		font-family: var(--font-ui);
		font-size: 0.75rem;
		color: var(--color-text-muted);
		opacity: 0.5;
		margin: 0;
	}

	@keyframes error-fade-in {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
