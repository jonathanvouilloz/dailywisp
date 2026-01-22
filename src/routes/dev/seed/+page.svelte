<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { seedDummyData, clearAllData } from '$lib/db';
	import { calendarStore } from '$lib/stores';

	let status = $state<'idle' | 'seeding' | 'done' | 'error'>('idle');
	let message = $state('');

	async function seed(): Promise<void> {
		status = 'seeding';
		message = 'Adding dummy data...';

		try {
			await seedDummyData();
			await calendarStore.refresh();
			status = 'done';
			message = 'Dummy data added! Redirecting...';
			setTimeout(() => goto('/'), 1500);
		} catch (error) {
			status = 'error';
			message = `Error: ${error}`;
		}
	}

	async function reset(): Promise<void> {
		status = 'seeding';
		message = 'Clearing all data...';

		try {
			await clearAllData();
			status = 'done';
			message = 'All data cleared! Refreshing...';
			setTimeout(() => window.location.reload(), 1000);
		} catch (error) {
			status = 'error';
			message = `Error: ${error}`;
		}
	}
</script>

<svelte:head>
	<title>Dev Tools | Wisp</title>
</svelte:head>

<main class="dev-page">
	<h1>Dev Tools</h1>

	<div class="actions">
		<button onclick={seed} disabled={status === 'seeding'}>
			Seed Dummy Data (Jan 1-17)
		</button>

		<button onclick={reset} disabled={status === 'seeding'} class="danger">
			Clear All Data
		</button>
	</div>

	{#if message}
		<p class="status" class:error={status === 'error'}>
			{message}
		</p>
	{/if}

	<a href="/">Back to home</a>
</main>

<style>
	.dev-page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-lg);
		padding: var(--space-xl);
	}

	h1 {
		font-size: 1.5rem;
		margin: 0;
	}

	.actions {
		display: flex;
		gap: var(--space-md);
	}

	button {
		padding: var(--space-sm) var(--space-lg);
		font-family: var(--font-ui);
		font-size: 1rem;
		background: var(--color-text);
		color: var(--color-bg);
		border: none;
		border-radius: var(--radius-md);
		cursor: pointer;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	button.danger {
		background: var(--color-danger);
		color: white;
	}

	.status {
		font-family: var(--font-ui);
		color: var(--color-text-muted);
	}

	.status.error {
		color: var(--color-danger);
	}

	a {
		color: var(--color-text-muted);
		font-family: var(--font-ui);
		font-size: 0.875rem;
	}
</style>
