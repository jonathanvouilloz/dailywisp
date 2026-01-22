<script lang="ts">
	const loremText = `Les mots coulent comme une rivière tranquille, portant avec eux les pensées du matin. Chaque phrase est une respiration, un moment suspendu entre le silence et l'expression. L'encre se dépose sur la page virtuelle, traçant le chemin de la conscience qui s'éveille.`;

	const fonts = [
		{ name: 'Source Serif 4', family: "'Source Serif 4', serif", note: 'Actuelle' },
		{ name: 'Merriweather', family: "'Merriweather', serif", note: '' },
		{ name: 'Lora', family: "'Lora', serif", note: '' },
		{ name: 'Libre Baskerville', family: "'Libre Baskerville', serif", note: '' },
		{ name: 'Crimson Text', family: "'Crimson Text', serif", note: '' },
	];
</script>

<svelte:head>
	<title>Font Test | Wisp</title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Merriweather:ital,wght@0,300;0,400;1,300;1,400&display=swap" rel="stylesheet">
</svelte:head>

<main class="test-page">
	<header class="header">
		<a href="/" class="back-link">← Retour</a>
		<h1>Comparaison des polices</h1>
		<p class="subtitle">Pour le contenu du journal</p>
	</header>

	<div class="font-grid">
		{#each fonts as font}
			<article class="font-card">
				<header class="font-header">
					<h2 class="font-name">{font.name}</h2>
					{#if font.note}
						<span class="font-note">{font.note}</span>
					{/if}
				</header>
				<div class="font-preview" style="font-family: {font.family}">
					<p class="preview-text">{loremText}</p>
				</div>
				<div class="font-weights" style="font-family: {font.family}">
					<span style="font-weight: 400">Regular 400</span>
					<span style="font-weight: 400; font-style: italic">Italic 400</span>
				</div>
			</article>
		{/each}
	</div>
</main>

<style>
	.test-page {
		min-height: 100vh;
		padding: var(--space-lg);
		max-width: 900px;
		margin: 0 auto;
	}

	.header {
		margin-bottom: var(--space-xl);
		text-align: center;
	}

	.back-link {
		display: inline-block;
		margin-bottom: var(--space-md);
		font-family: var(--font-ui);
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.back-link:hover {
		color: var(--color-text);
	}

	h1 {
		font-family: var(--font-ui);
		font-size: 1.75rem;
		font-weight: 500;
		margin: 0;
	}

	.subtitle {
		font-family: var(--font-ui);
		color: var(--color-text-muted);
		margin: var(--space-sm) 0 0;
	}

	.font-grid {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
	}

	.font-card {
		padding: var(--space-lg);
		background: var(--color-bg-alt);
		border-radius: var(--radius-lg);
	}

	.font-header {
		display: flex;
		align-items: baseline;
		gap: var(--space-sm);
		margin-bottom: var(--space-md);
		padding-bottom: var(--space-sm);
		border-bottom: 1px solid var(--color-bg);
	}

	.font-name {
		font-family: var(--font-ui);
		font-size: 1rem;
		font-weight: 500;
		margin: 0;
	}

	.font-note {
		font-family: var(--font-ui);
		font-size: 0.75rem;
		color: var(--color-text-muted);
		background: var(--color-bg);
		padding: 2px 8px;
		border-radius: var(--radius-full);
	}

	.font-preview {
		margin-bottom: var(--space-md);
	}

	.preview-text {
		font-size: 1.125rem;
		line-height: 1.8;
		margin: 0;
	}

	.font-weights {
		display: flex;
		gap: var(--space-lg);
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}
</style>
