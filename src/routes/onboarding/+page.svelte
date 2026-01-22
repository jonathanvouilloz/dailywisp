<script lang="ts">
	import { goto } from '$app/navigation';
	import { userStore } from '$lib/stores';
	import Wisp from '$lib/components/Wisp.svelte';
	import { t } from '$lib/i18n';
	import { WORD_TARGET } from '$lib/types';

	let step = $state(1);
	let name = $state('');
	let isSubmitting = $state(false);
	let showEvaporateDemo = $state(false);

	const canContinue = $derived(step === 1 ? name.trim().length > 0 : true);

	async function nextStep() {
		if (isSubmitting) return;

		if (step === 1 && name.trim()) {
			isSubmitting = true;
			await userStore.createUser(name.trim());
			isSubmitting = false;
		}

		if (step < 3) {
			step++;
			// Trigger evaporate demo on step 2
			if (step === 2) {
				setTimeout(() => {
					showEvaporateDemo = true;
				}, 1500);
			}
		} else {
			isSubmitting = true;
			await userStore.completeOnboarding();
			goto('/write');
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && canContinue && !isSubmitting) {
			nextStep();
		}
	}
</script>

<svelte:head>
	<title>{t('onboarding.title')}</title>
</svelte:head>

<main class="onboarding">
	<div class="onboarding-container">
		<!-- Progress indicator -->
		<div class="progress" aria-label="Step {step} of 3">
			{#each [1, 2, 3] as dot}
				<span
					class="progress-dot"
					class:progress-dot--active={dot === step}
					class:progress-dot--completed={dot < step}
				></span>
			{/each}
		</div>

		<!-- Step 1: Introduction -->
		{#if step === 1}
			<div class="step step--intro" class:step--transitioning={isSubmitting}>
				<div class="wisp-container">
					<Wisp size="lg" mood="pointing" />
				</div>

				<div class="content">
					<h1 class="title">{t('onboarding.imWisp')}</h1>
					<p class="subtitle">{t('onboarding.helpYou')}</p>
					<p class="privacy-note">100% private. No account, no cloud.</p>

					<div class="input-group">
						<label for="name-input" class="input-label">{t('onboarding.yourName')}</label>
						<input
							id="name-input"
							type="text"
							bind:value={name}
							onkeydown={handleKeydown}
							placeholder={t('onboarding.namePlaceholder')}
							class="name-input"
							autocomplete="off"
							autocapitalize="words"
							disabled={isSubmitting}
						/>
					</div>
				</div>

				<button
					class="continue-btn"
					onclick={nextStep}
					disabled={!canContinue || isSubmitting}
				>
					{isSubmitting ? t('onboarding.justAMoment') : t('common.continue')}
				</button>
			</div>

		<!-- Step 2: The Rule -->
		{:else if step === 2}
			<div class="step step--rule">
				<div class="wisp-container">
					<Wisp size="md" mood="thinking" />
				</div>

				<div class="content">
					<h1 class="title">{t('onboarding.theDeal', { name: userStore.userName })}</h1>
					<p class="rule-text">{@html t('onboarding.writeWords', { target: WORD_TARGET }).replace(String(WORD_TARGET), `<span class="highlight">${WORD_TARGET}</span>`)}</p>

					<div class="demo-section">
						<p class="demo-label">{t('onboarding.ifYouPause')}</p>
						<div class="demo-text-container">
							<span class="demo-text" class:demo-text--evaporating={showEvaporateDemo}>
								{t('onboarding.everythingFades')}
							</span>
						</div>
					</div>
				</div>

				<button class="continue-btn" onclick={nextStep}>
					{t('onboarding.iUnderstand')}
				</button>
			</div>

		<!-- Step 3: The Gauge -->
		{:else if step === 3}
			<div class="step step--gauge">
				<div class="wisp-container">
					<Wisp size="md" mood="neutral" />
				</div>

				<div class="content">
					<h1 class="title">{t('onboarding.watchGauge')}</h1>
					<p class="subtitle">{t('onboarding.keepWriting')}</p>

					<div class="gauge-demo">
						<div class="gauge-track">
							<div class="gauge-fill"></div>
						</div>
						<div class="gauge-labels">
							<span class="gauge-label">{t('onboarding.gaugeEmpty')}</span>
							<span class="gauge-label">{t('onboarding.gaugeFull')}</span>
						</div>
					</div>

					<p class="ready-text">{t('onboarding.readyToFree')}</p>
				</div>

				<button
					class="continue-btn continue-btn--primary"
					onclick={nextStep}
					disabled={isSubmitting}
				>
					{isSubmitting ? t('onboarding.gettingReady') : t('write.startWriting')}
				</button>
			</div>
		{/if}
	</div>
</main>

<style>
	.onboarding {
		min-height: 100vh;
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-lg);
		background: linear-gradient(
			180deg,
			var(--color-bg) 0%,
			var(--color-bg-alt) 100%
		);
	}

	.onboarding-container {
		width: 100%;
		max-width: 440px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	/* Progress dots */
	.progress {
		display: flex;
		gap: var(--space-sm);
		margin-bottom: var(--space-xl);
	}

	.progress-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--color-text);
		opacity: 0.15;
		transition: all var(--transition-slow);
	}

	.progress-dot--active {
		opacity: 1;
		transform: scale(1.25);
	}

	.progress-dot--completed {
		opacity: 0.4;
	}

	/* Step container */
	.step {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: var(--space-lg);
		animation: step-enter 0.6s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.step--transitioning {
		opacity: 0.7;
		pointer-events: none;
	}

	@keyframes step-enter {
		from {
			opacity: 0;
			transform: translateY(24px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Wisp container */
	.wisp-container {
		margin-bottom: var(--space-md);
	}

	/* Content area */
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-md);
	}

	.title {
		font-family: var(--font-ui);
		font-size: 1.875rem;
		font-weight: 600;
		line-height: 1.2;
		color: var(--color-text);
		margin: 0;
	}

	.subtitle {
		font-family: var(--font-body);
		font-size: 1.125rem;
		color: var(--color-text-muted);
		margin: 0;
		max-width: 320px;
	}

	.privacy-note {
		font-family: var(--font-ui);
		font-size: 0.85rem;
		color: var(--color-text-muted);
		margin: 0.5rem 0 0 0;
		opacity: 0.7;
	}

	/* Input group */
	.input-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		width: 100%;
		max-width: 280px;
		margin-top: var(--space-md);
	}

	.input-label {
		font-family: var(--font-ui);
		font-size: 0.875rem;
		color: var(--color-text-muted);
		text-align: left;
	}

	.name-input {
		font-family: var(--font-body);
		font-size: 1.25rem;
		padding: var(--space-md) var(--space-lg);
		border: 1px solid transparent;
		border-radius: var(--radius-lg);
		background: var(--color-bg);
		text-align: center;
		transition: all var(--transition-normal);
		box-shadow:
			0 1px 3px rgba(0, 0, 0, 0.04),
			0 4px 12px rgba(0, 0, 0, 0.04);
	}

	.name-input:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow:
			0 0 0 3px rgba(99, 102, 241, 0.1),
			0 4px 12px rgba(0, 0, 0, 0.06);
	}

	.name-input::placeholder {
		color: var(--color-text-muted);
		opacity: 0.5;
	}

	/* Rule step */
	.rule-text {
		font-family: var(--font-body);
		font-size: 1.25rem;
		color: var(--color-text);
		margin: 0;
	}

	.highlight {
		color: var(--color-accent);
		font-weight: 600;
	}

	.demo-section {
		margin-top: var(--space-lg);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-md);
	}

	.demo-label {
		font-family: var(--font-ui);
		font-size: 0.9375rem;
		color: var(--color-text-muted);
		margin: 0;
	}

	.demo-text-container {
		min-height: 2rem;
	}

	.demo-text {
		font-family: var(--font-body);
		font-style: italic;
		font-size: 1.125rem;
		color: var(--color-text);
		transition: all 1.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.demo-text--evaporating {
		opacity: 0;
		transform: translateY(-12px);
		filter: blur(6px);
	}

	/* Gauge step */
	.gauge-demo {
		width: 100%;
		max-width: 260px;
		margin-top: var(--space-lg);
	}

	.gauge-track {
		height: 10px;
		background: var(--color-bg);
		border-radius: var(--radius-full);
		overflow: hidden;
		box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.08);
	}

	.gauge-fill {
		height: 100%;
		background: linear-gradient(
			90deg,
			var(--color-accent) 0%,
			#818cf8 100%
		);
		border-radius: var(--radius-full);
		animation: gauge-demo-pulse 3s ease-in-out infinite;
	}

	@keyframes gauge-demo-pulse {
		0%, 100% {
			width: 50%;
		}
		40% {
			width: 75%;
		}
		60% {
			width: 65%;
		}
		80% {
			width: 85%;
		}
	}

	.gauge-labels {
		display: flex;
		justify-content: space-between;
		margin-top: var(--space-sm);
	}

	.gauge-label {
		font-family: var(--font-ui);
		font-size: 0.75rem;
		color: var(--color-text-muted);
		opacity: 0.7;
	}

	.ready-text {
		font-family: var(--font-body);
		font-size: 1rem;
		color: var(--color-text-muted);
		margin: var(--space-lg) 0 0 0;
	}

	/* Continue button */
	.continue-btn {
		font-family: var(--font-ui);
		font-size: 1rem;
		font-weight: 500;
		padding: var(--space-md) var(--space-xl);
		border: none;
		border-radius: var(--radius-full);
		background: var(--color-text);
		color: var(--color-bg);
		cursor: pointer;
		transition: all var(--transition-normal);
		margin-top: var(--space-md);
		min-width: 160px;
	}

	.continue-btn:disabled {
		opacity: 0.35;
		cursor: not-allowed;
		transform: none;
	}

	.continue-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
	}

	.continue-btn:active:not(:disabled) {
		transform: translateY(0);
	}

	.continue-btn--primary {
		background: var(--color-accent);
		color: white;
	}

	.continue-btn--primary:hover:not(:disabled) {
		box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
	}

	/* Dark theme */
	:global([data-theme='dark']) .onboarding {
		background: linear-gradient(
			180deg,
			var(--color-bg) 0%,
			#0a0a0a 100%
		);
	}

	:global([data-theme='dark']) .name-input {
		background: var(--color-bg-alt);
		box-shadow:
			0 1px 3px rgba(0, 0, 0, 0.2),
			0 4px 12px rgba(0, 0, 0, 0.15);
	}

	:global([data-theme='dark']) .gauge-track {
		background: var(--color-bg-alt);
		box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
	}
</style>
