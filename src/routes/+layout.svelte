<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { userStore, settingsStore, calendarStore } from '$lib/stores';
	import { seedDummyData } from '$lib/db';

	let { children } = $props();

	onMount(async () => {
		// Seed dummy data for development (only seeds if DB is empty)
		await seedDummyData();

		await Promise.all([
			userStore.init(),
			settingsStore.init(),
			calendarStore.init()
		]);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Wisp - Free your thoughts</title>
</svelte:head>

{@render children()}
