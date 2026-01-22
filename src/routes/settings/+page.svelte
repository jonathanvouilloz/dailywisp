<script lang="ts">
	import { goto } from '$app/navigation';
	import { settingsStore, userStore, calendarStore } from '$lib/stores';
	import { exportAllData, importData, clearAllData, generateTestData } from '$lib/db';
	import { MOODS } from '$lib/types';
	import type { WritingMode } from '$lib/types';
	import Wisp from '$lib/components/Wisp.svelte';
	import { t, getMoodLabel } from '$lib/i18n';

	let exportFormat = $state<'json' | 'markdown' | 'pdf'>('json');
	let importFile = $state<File | null>(null);
	let showResetConfirm = $state(false);
	let resetInput = $state('');
	let isExporting = $state(false);
	let isImporting = $state(false);
	let isGenerating = $state(false);
	let notification = $state<{ type: 'success' | 'error'; message: string } | null>(null);

	const appVersion = '1.0.0';

	function showNotification(type: 'success' | 'error', message: string): void {
		notification = { type, message };
		setTimeout(() => (notification = null), 3000);
	}

	// Theme toggle
	function setTheme(theme: 'light' | 'dark' | 'auto'): void {
		settingsStore.setTheme(theme);
	}

	// Language toggle
	function setLanguage(lang: 'en' | 'fr'): void {
		settingsStore.setLanguage(lang);
	}

	// Writing mode toggle
	function setWritingMode(mode: WritingMode): void {
		settingsStore.setWritingMode(mode);
	}

	// Export functions
	async function handleExport(): Promise<void> {
		isExporting = true;
		try {
			const data = await exportAllData();

			if (exportFormat === 'json') {
				downloadJson(data);
			} else if (exportFormat === 'markdown') {
				downloadMarkdown(data);
			} else if (exportFormat === 'pdf') {
				await downloadPdf(data);
			}

			showNotification('success', t('settings.exportSuccess'));
		} catch (error) {
			console.error('Export failed:', error);
			showNotification('error', t('settings.exportError'));
		} finally {
			isExporting = false;
		}
	}

	function downloadJson(data: Awaited<ReturnType<typeof exportAllData>>): void {
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
		downloadBlob(blob, `wisp-export-${getDateStr()}.json`);
	}

	function downloadMarkdown(data: Awaited<ReturnType<typeof exportAllData>>): void {
		let markdown = `# Wisp Export\n\n`;
		markdown += `Exported on: ${new Date().toLocaleDateString()}\n\n`;

		if (data.user) {
			markdown += `## User\n\n- Name: ${data.user.name}\n- Created: ${new Date(data.user.createdAt).toLocaleDateString()}\n\n`;
		}

		markdown += `## Sessions (${data.sessions.length} total)\n\n`;

		const completedSessions = data.sessions.filter((s) => s.status === 'completed');
		for (const session of completedSessions) {
			const mood = session.mood ? MOODS[session.mood] : null;
			markdown += `### ${session.date}\n\n`;
			markdown += `- Words: ${session.wordCount}\n`;
			markdown += `- Duration: ${Math.floor(session.durationMs / 60000)}m ${Math.floor((session.durationMs % 60000) / 1000)}s\n`;
			if (mood && session.mood) {
				markdown += `- Mood: ${mood.emoji} ${getMoodLabel(session.mood)}\n`;
			}
			if (session.moodNote) {
				markdown += `- Note: ${session.moodNote}\n`;
			}
			markdown += `\n${session.text}\n\n---\n\n`;
		}

		const blob = new Blob([markdown], { type: 'text/markdown' });
		downloadBlob(blob, `wisp-export-${getDateStr()}.md`);
	}

	async function downloadPdf(data: Awaited<ReturnType<typeof exportAllData>>): Promise<void> {
		const { jsPDF } = await import('jspdf');
		const doc = new jsPDF();

		let y = 20;
		const pageHeight = doc.internal.pageSize.height;
		const marginBottom = 20;

		function checkPageBreak(neededHeight: number): void {
			if (y + neededHeight > pageHeight - marginBottom) {
				doc.addPage();
				y = 20;
			}
		}

		// Title
		doc.setFontSize(24);
		doc.text('Wisp Export', 20, y);
		y += 15;

		doc.setFontSize(10);
		doc.setTextColor(128);
		doc.text(`Exported on ${new Date().toLocaleDateString()}`, 20, y);
		y += 20;

		// Sessions
		const completedSessions = data.sessions.filter((s) => s.status === 'completed');
		doc.setTextColor(0);

		for (const session of completedSessions) {
			const mood = session.mood ? MOODS[session.mood] : null;

			// Session header
			checkPageBreak(30);
			doc.setFontSize(14);
			doc.setFont('helvetica', 'bold');
			doc.text(session.date, 20, y);
			y += 8;

			doc.setFontSize(10);
			doc.setFont('helvetica', 'normal');
			doc.setTextColor(100);
			let meta = `${session.wordCount} ${t('home.words')}`;
			if (mood && session.mood) meta += ` • ${getMoodLabel(session.mood)}`;
			doc.text(meta, 20, y);
			y += 10;

			// Session text
			doc.setTextColor(0);
			doc.setFontSize(11);
			const lines = doc.splitTextToSize(session.text, 170);

			for (const line of lines) {
				checkPageBreak(7);
				doc.text(line, 20, y);
				y += 6;
			}

			y += 15;
		}

		doc.save(`wisp-export-${getDateStr()}.pdf`);
	}

	function downloadBlob(blob: Blob, filename: string): void {
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}

	function getDateStr(): string {
		return new Date().toISOString().split('T')[0];
	}

	// Import function
	async function handleImport(): Promise<void> {
		if (!importFile) return;

		isImporting = true;
		try {
			const text = await importFile.text();
			const data = JSON.parse(text);

			// Validate structure
			if (!data.sessions && !data.user && !data.settings) {
				throw new Error('Invalid file format');
			}

			await importData(data, 'merge');

			// Refresh stores
			await calendarStore.refresh();

			showNotification('success', t('settings.importSuccess'));
			importFile = null;
		} catch (error) {
			console.error('Import failed:', error);
			showNotification('error', t('settings.importError'));
		} finally {
			isImporting = false;
		}
	}

	function handleFileSelect(event: Event): void {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file && file.type === 'application/json') {
			importFile = file;
		}
	}

	// Generate test data function
	async function handleGenerateTestData(): Promise<void> {
		isGenerating = true;
		try {
			await generateTestData();
			await calendarStore.refresh();
			showNotification('success', 'Test data generated: Jan 1-20 sessions + 2 drafts');
		} catch (error) {
			console.error('Generate test data failed:', error);
			showNotification('error', 'Failed to generate test data');
		} finally {
			isGenerating = false;
		}
	}

	// Reset function
	async function handleReset(): Promise<void> {
		if (resetInput !== 'DELETE') return;

		try {
			await clearAllData();
			showResetConfirm = false;
			resetInput = '';
			goto('/');
			// Page will reload to reinitialize stores
			window.location.reload();
		} catch (error) {
			console.error('Reset failed:', error);
			showNotification('error', t('settings.resetError'));
		}
	}
</script>

<svelte:head>
	<title>{t('settings.title')} | Wisp</title>
</svelte:head>

<main class="settings-page">
	<header class="page-header">
		<a href="/home" class="back-btn" aria-label={t('common.back')}>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M19 12H5M12 19l-7-7 7-7"/>
			</svg>
		</a>
		<h1>{t('settings.title')}</h1>
		<div class="header-spacer"></div>
	</header>

	<!-- Notification toast -->
	{#if notification}
		<div class="notification notification--{notification.type}" role="alert">
			{notification.message}
		</div>
	{/if}

	<div class="settings-content">
		<!-- Appearance Section -->
		<section class="settings-section">
			<h2>{t('settings.appearance')}</h2>

			<div class="setting-row">
				<div class="setting-info">
					<span class="setting-label">{t('settings.theme')}</span>
					<span class="setting-desc">{t('settings.themeDesc')}</span>
				</div>
				<div class="setting-control">
					<div class="toggle-group" role="radiogroup" aria-label={t('settings.theme')}>
						<button
							class="toggle-btn"
							class:toggle-btn--active={settingsStore.theme === 'light'}
							onclick={() => setTheme('light')}
							role="radio"
							aria-checked={settingsStore.theme === 'light'}
						>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<circle cx="12" cy="12" r="5"/>
								<path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
							</svg>
							{t('settings.light')}
						</button>
						<button
							class="toggle-btn"
							class:toggle-btn--active={settingsStore.theme === 'dark'}
							onclick={() => setTheme('dark')}
							role="radio"
							aria-checked={settingsStore.theme === 'dark'}
						>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
							</svg>
							{t('settings.dark')}
						</button>
						<button
							class="toggle-btn"
							class:toggle-btn--active={settingsStore.theme === 'auto'}
							onclick={() => setTheme('auto')}
							role="radio"
							aria-checked={settingsStore.theme === 'auto'}
						>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="2" y="3" width="20" height="14" rx="2"/>
								<path d="M8 21h8M12 17v4"/>
							</svg>
							{t('settings.auto')}
						</button>
					</div>
				</div>
			</div>

			<div class="setting-row">
				<div class="setting-info">
					<span class="setting-label">{t('settings.language')}</span>
					<span class="setting-desc">{t('settings.languageDesc')}</span>
				</div>
				<div class="setting-control">
					<div class="toggle-group" role="radiogroup" aria-label="Language selection">
						<button
							class="toggle-btn"
							class:toggle-btn--active={settingsStore.language === 'en'}
							onclick={() => setLanguage('en')}
							role="radio"
							aria-checked={settingsStore.language === 'en'}
						>
							EN
						</button>
						<button
							class="toggle-btn"
							class:toggle-btn--active={settingsStore.language === 'fr'}
							onclick={() => setLanguage('fr')}
							role="radio"
							aria-checked={settingsStore.language === 'fr'}
						>
							FR
						</button>
					</div>
				</div>
			</div>
		</section>

		<!-- Writing Section -->
		<section class="settings-section">
			<h2>{t('settings.writing')}</h2>

			<div class="setting-row">
				<div class="setting-info">
					<span class="setting-label">{t('settings.mode')}</span>
					<span class="setting-desc">
						{#if settingsStore.writingMode === 'zen'}
							{t('settings.zenDesc')}
						{:else}
							{t('settings.normalDesc')}
						{/if}
					</span>
				</div>
				<div class="setting-control">
					<div class="toggle-group" role="radiogroup" aria-label={t('settings.mode')}>
						<button
							class="toggle-btn"
							class:toggle-btn--active={settingsStore.writingMode === 'normal'}
							onclick={() => setWritingMode('normal')}
							role="radio"
							aria-checked={settingsStore.writingMode === 'normal'}
						>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
							</svg>
							{t('settings.normal')}
						</button>
						<button
							class="toggle-btn"
							class:toggle-btn--active={settingsStore.writingMode === 'zen'}
							onclick={() => setWritingMode('zen')}
							role="radio"
							aria-checked={settingsStore.writingMode === 'zen'}
						>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<circle cx="12" cy="12" r="10"/>
								<path d="M8 14s1.5 2 4 2 4-2 4-2"/>
								<line x1="9" y1="9" x2="9.01" y2="9"/>
								<line x1="15" y1="9" x2="15.01" y2="9"/>
							</svg>
							{t('settings.zen')}
						</button>
					</div>
				</div>
			</div>
		</section>

		<!-- Data Section -->
		<section class="settings-section">
			<h2>{t('settings.data')}</h2>

			<div class="setting-row setting-row--vertical">
				<div class="setting-info">
					<span class="setting-label">{t('settings.export')}</span>
					<span class="setting-desc">{t('settings.exportDesc')}</span>
				</div>
				<div class="export-controls">
					<div class="format-select">
						<label>
							<input type="radio" name="format" value="json" bind:group={exportFormat} />
							<span class="format-option">
								<strong>{t('settings.exportJson')}</strong>
								<small>{t('settings.exportJsonDesc')}</small>
							</span>
						</label>
						<label>
							<input type="radio" name="format" value="markdown" bind:group={exportFormat} />
							<span class="format-option">
								<strong>{t('settings.exportMarkdown')}</strong>
								<small>{t('settings.exportMarkdownDesc')}</small>
							</span>
						</label>
						<label>
							<input type="radio" name="format" value="pdf" bind:group={exportFormat} />
							<span class="format-option">
								<strong>{t('settings.exportPdf')}</strong>
								<small>{t('settings.exportPdfDesc')}</small>
							</span>
						</label>
					</div>
					<button class="btn" onclick={handleExport} disabled={isExporting}>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
						{isExporting ? t('settings.exporting') : t('settings.export')}
					</button>
				</div>
			</div>

			<div class="setting-row setting-row--vertical">
				<div class="setting-info">
					<span class="setting-label">{t('settings.import')}</span>
					<span class="setting-desc">{t('settings.importDesc')}</span>
				</div>
				<div class="import-controls">
					<label class="file-input">
						<input type="file" accept=".json" onchange={handleFileSelect} />
						<span class="file-input-text">
							{importFile ? importFile.name : t('settings.importChooseFile')}
						</span>
					</label>
					<button
						class="btn"
						onclick={handleImport}
						disabled={!importFile || isImporting}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
						{isImporting ? t('settings.importing') : t('settings.import')}
					</button>
				</div>
			</div>

			<div class="setting-row setting-row--vertical">
				<div class="setting-info">
					<span class="setting-label">Test Data</span>
					<span class="setting-desc">Generate sample sessions (Jan 1-20) with 2 drafts for testing. Replaces existing sessions.</span>
				</div>
				<button class="btn btn--outline" onclick={handleGenerateTestData} disabled={isGenerating}>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
					{isGenerating ? 'Generating...' : 'Generate Test Data'}
				</button>
			</div>
		</section>

		<!-- Danger Zone -->
		<section class="settings-section settings-section--danger">
			<h2>{t('settings.danger')}</h2>

			<div class="setting-row setting-row--vertical">
				<div class="setting-info">
					<span class="setting-label">{t('settings.reset')}</span>
					<span class="setting-desc">{t('settings.resetDesc')}</span>
				</div>

				{#if !showResetConfirm}
					<button class="btn btn--danger" onclick={() => (showResetConfirm = true)}>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
						{t('settings.resetAllData')}
					</button>
				{:else}
					<div class="reset-confirm">
						<Wisp size="sm" mood="thinking" opacity={0.5} />
						<p class="reset-warning">
							{t('settings.resetConfirm')}
						</p>
						<input
							type="text"
							class="reset-input"
							bind:value={resetInput}
							placeholder={t('settings.resetPlaceholder')}
							autocomplete="off"
						/>
						<div class="reset-actions">
							<button class="btn btn--muted" onclick={() => { showResetConfirm = false; resetInput = ''; }}>
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
								{t('common.cancel')}
							</button>
							<button
								class="btn btn--danger"
								onclick={handleReset}
								disabled={resetInput !== 'DELETE'}
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
								{t('settings.deleteEverything')}
							</button>
						</div>
					</div>
				{/if}
			</div>
		</section>

		<!-- About -->
		<footer class="settings-footer">
			<p class="app-version">Wisp v{appVersion}</p>
			<p class="app-info">{t('settings.appInfo')}</p>
		</footer>
	</div>
</main>

<style>
	.settings-page {
		min-height: 100vh;
		padding: var(--space-lg);
		max-width: 640px;
		margin: 0 auto;
	}

	.page-header {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		margin-bottom: var(--space-xl);
	}

	.page-header h1 {
		flex: 1;
		font-family: var(--font-body);
		font-size: 1.5rem;
		font-weight: 500;
		margin: 0;
	}

	.header-spacer {
		width: 40px;
	}

	.back-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: var(--radius-full);
		color: var(--color-text-muted);
		transition: all var(--transition-fast);
	}

	.back-btn:hover {
		color: var(--color-text);
		background: var(--color-bg-alt);
		opacity: 1;
	}

	/* Notification */
	.notification {
		position: fixed;
		top: var(--space-lg);
		left: 50%;
		transform: translateX(-50%);
		padding: var(--space-sm) var(--space-lg);
		border-radius: var(--radius-full);
		font-family: var(--font-ui);
		font-size: 0.875rem;
		z-index: 100;
		animation: notification-slide 0.3s ease;
	}

	.notification--success {
		background: var(--color-success);
		color: white;
	}

	.notification--error {
		background: var(--color-danger);
		color: white;
	}

	@keyframes notification-slide {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}

	/* Sections */
	.settings-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
	}

	.settings-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.settings-section h2 {
		font-family: var(--font-ui);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-text-muted);
		margin: 0;
		padding-bottom: var(--space-sm);
		border-bottom: 1px solid var(--color-bg-alt);
	}

	.settings-section--danger h2 {
		color: var(--color-danger);
		border-color: color-mix(in srgb, var(--color-danger) 20%, transparent);
	}

	/* Setting rows */
	.setting-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-lg);
	}

	.setting-row--vertical {
		flex-direction: column;
		align-items: stretch;
	}

	.setting-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.setting-label {
		font-family: var(--font-ui);
		font-size: 1rem;
		font-weight: 500;
		color: var(--color-text);
	}

	.setting-desc {
		font-family: var(--font-ui);
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	/* Toggle groups */
	.toggle-group {
		display: flex;
		background: var(--color-bg-alt);
		border-radius: var(--radius-md);
		padding: 3px;
	}

	.toggle-btn {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-xs) var(--space-md);
		font-family: var(--font-ui);
		font-size: 0.875rem;
		color: var(--color-text-muted);
		background: transparent;
		border-radius: var(--radius-sm);
		transition: all var(--transition-fast);
	}

	.toggle-btn:hover {
		color: var(--color-text);
	}

	.toggle-btn--active {
		background: var(--color-bg);
		color: var(--color-text);
		box-shadow: var(--shadow-sm);
	}

	/* Export controls */
	.export-controls {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.format-select {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-sm);
	}

	.format-select label {
		cursor: pointer;
	}

	.format-select input {
		display: none;
	}

	.format-option {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: var(--space-md);
		background: var(--color-bg-alt);
		border: 2px solid transparent;
		border-radius: var(--radius-md);
		transition: all var(--transition-fast);
	}

	.format-option strong {
		font-family: var(--font-ui);
		font-size: 0.875rem;
	}

	.format-option small {
		font-family: var(--font-ui);
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.format-select input:checked + .format-option {
		border-color: var(--color-accent);
		background: var(--color-bg);
	}

	/* Import controls */
	.import-controls {
		display: flex;
		gap: var(--space-md);
		align-items: center;
	}

	.file-input {
		flex: 1;
		cursor: pointer;
	}

	.file-input input {
		display: none;
	}

	.file-input-text {
		display: block;
		padding: var(--space-sm) var(--space-md);
		font-family: var(--font-ui);
		font-size: 0.875rem;
		color: var(--color-text-muted);
		background: var(--color-bg-alt);
		border-radius: var(--radius-md);
		border: 1px dashed var(--color-text-muted);
		transition: all var(--transition-fast);
	}

	.file-input:hover .file-input-text {
		border-color: var(--color-text);
		color: var(--color-text);
	}

	/* Reset confirmation */
	.reset-confirm {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-lg);
		background: var(--color-bg-alt);
		border-radius: var(--radius-lg);
		text-align: center;
	}

	.reset-warning {
		font-family: var(--font-ui);
		font-size: 0.875rem;
		margin: 0;
	}

	.reset-input {
		width: 100%;
		max-width: 200px;
		padding: var(--space-sm);
		font-family: var(--font-ui);
		font-size: 1rem;
		text-align: center;
		border: 1px solid var(--color-text-muted);
		border-radius: var(--radius-md);
		background: var(--color-bg);
		color: var(--color-text);
	}

	.reset-input:focus {
		outline: none;
		border-color: var(--color-danger);
	}

	.reset-actions {
		display: flex;
		gap: var(--space-md);
	}

	/* Footer */
	.settings-footer {
		text-align: center;
		padding-top: var(--space-xl);
		border-top: 1px solid var(--color-bg-alt);
	}

	.app-version {
		font-family: var(--font-ui);
		font-size: 0.875rem;
		color: var(--color-text-muted);
		margin: 0;
	}

	.app-info {
		font-family: var(--font-body);
		font-size: 0.875rem;
		color: var(--color-text-muted);
		margin: 0;
		margin-top: var(--space-xs);
		font-style: italic;
	}

	/* Responsive */
	@media (max-width: 500px) {
		.settings-page {
			padding: var(--space-md);
		}

		.setting-row {
			flex-direction: column;
			align-items: stretch;
		}

		.toggle-group {
			width: 100%;
			justify-content: center;
		}

		.format-select {
			grid-template-columns: 1fr;
		}

		.import-controls {
			flex-direction: column;
		}
	}
</style>
