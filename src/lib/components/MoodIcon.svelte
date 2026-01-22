<script lang="ts">
	import type { MoodLevel } from '$lib/types';
	import { getMoodLabel } from '$lib/i18n';

	interface Props {
		mood: MoodLevel;
		size?: number;
	}

	let { mood, size = 48 }: Props = $props();

	const moodImages: Record<MoodLevel, string> = {
		1: '/wisp/wisp-stressed.webp',
		2: '/wisp/wisp-thinking.webp',
		3: '/wisp/wisp-neutral.webp',
		4: '/wisp/wisp-happy.webp',
		5: '/wisp/wisp-zen.webp'
	};
</script>

<img
	src={moodImages[mood]}
	alt={getMoodLabel(mood)}
	width={size}
	height={size}
	class="mood-icon"
	draggable="false"
/>

<style>
	.mood-icon {
		display: inline-block;
		vertical-align: middle;
		object-fit: contain;
	}
</style>
