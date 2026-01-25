<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { userStore, settingsStore, calendarStore } from '$lib/stores';
	import { seedDummyData } from '$lib/db';
	import { initAnalytics, trackPageView } from '$lib/analytics';

	let { children } = $props();

	onMount(async () => {
		// Initialize analytics (cookieless mode for privacy)
		initAnalytics();

		// Seed dummy data for development (only seeds if DB is empty)
		await seedDummyData();

		await Promise.all([
			userStore.init(),
			settingsStore.init(),
			calendarStore.init()
		]);
	});

	// Track SPA navigation
	afterNavigate(({ to }) => {
		if (to?.url?.pathname) {
			trackPageView(to.url.pathname);
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Wisp - Free your thoughts</title>
</svelte:head>

{@render children()}
