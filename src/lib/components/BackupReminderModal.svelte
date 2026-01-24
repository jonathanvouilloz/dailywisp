<script lang="ts">
	import { goto } from '$app/navigation';
	import Wisp from './Wisp.svelte';
	import { t } from '$lib/i18n';

	interface Props {
		sessionCount: number;
		onDismiss: () => void;
	}

	let { sessionCount, onDismiss }: Props = $props();

	function handleExportNow(): void {
		onDismiss();
		goto('/settings');
	}

	function handleRemindLater(): void {
		onDismiss();
	}
</script>

<div class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="backup-title">
	<div class="modal-content">
		<div class="modal-icon">
			<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
				<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
				<polyline points="17 21 17 13 7 13 7 21"/>
				<polyline points="7 3 7 8 15 8"/>
			</svg>
		</div>

		<div class="modal-wisp">
			<Wisp size="sm" mood="pointing" />
		</div>

		<h2 id="backup-title" class="modal-title">{t('backup.title')}</h2>
		<p class="modal-message">{t('backup.message', { count: sessionCount })}</p>
		<p class="modal-desc">{t('backup.description')}</p>

		<div class="modal-actions">
			<button class="btn btn--primary" onclick={handleExportNow}>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
					<polyline points="7 10 12 15 17 10"/>
					<line x1="12" y1="15" x2="12" y2="3"/>
				</svg>
				{t('backup.exportNow')}
			</button>
			<button class="btn btn--muted" onclick={handleRemindLater}>
				{t('backup.remindLater')}
			</button>
		</div>
	</div>
</div>

<style>
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		padding: var(--space-lg);
		animation: overlay-fade-in 0.3s ease;
	}

	@keyframes overlay-fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.modal-content {
		background: var(--color-bg);
		border-radius: var(--radius-xl);
		padding: var(--space-xl);
		max-width: 380px;
		width: 100%;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-md);
		animation: modal-slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
	}

	@keyframes modal-slide-up {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.modal-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 72px;
		height: 72px;
		border-radius: 50%;
		background: var(--color-bg-alt);
		color: var(--color-accent);
	}

	.modal-wisp {
		position: absolute;
		top: var(--space-md);
		right: var(--space-md);
		opacity: 0.6;
	}

	.modal-title {
		font-family: var(--font-body);
		font-size: 1.5rem;
		font-weight: 500;
		margin: 0;
		color: var(--color-text);
	}

	.modal-message {
		font-family: var(--font-ui);
		font-size: 1.125rem;
		font-weight: 500;
		color: var(--color-accent);
		margin: 0;
	}

	.modal-desc {
		font-family: var(--font-ui);
		font-size: 0.9rem;
		color: var(--color-text-muted);
		margin: 0;
		max-width: 280px;
	}

	.modal-actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		width: 100%;
		margin-top: var(--space-md);
	}

	.modal-actions .btn {
		width: 100%;
		justify-content: center;
	}

	.modal-actions .btn--primary {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	/* Dark mode */
	:global([data-theme='dark']) .modal-overlay {
		background: rgba(0, 0, 0, 0.7);
	}

	:global([data-theme='dark']) .modal-content {
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
	}
</style>
