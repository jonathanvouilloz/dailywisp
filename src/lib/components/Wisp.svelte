<script lang="ts">
	import { t } from '$lib/i18n';
	import type { WispMood } from '$lib/types';

	interface Props {
		opacity?: number;
		size?: 'sm' | 'md' | 'lg';
		mood?: WispMood;
	}

	let { opacity = 1, size = 'md', mood = 'neutral' }: Props = $props();

	// Map mood to image path
	const moodImages: Record<WispMood, string> = {
		neutral: '/wisp/wisp-neutral.webp',
		happy: '/wisp/wisp-happy.webp',
		thinking: '/wisp/wisp-thinking.webp',
		stressed: '/wisp/wisp-stressed.webp',
		zen: '/wisp/wisp-zen.webp',
		pointing: '/wisp/wisp-pointing.webp',
		sharing: '/wisp/wisp-sharing.png'
	};

	const imageSrc = $derived(moodImages[mood]);
</script>

<div
	class="wisp wisp--{size}"
	style="--wisp-opacity: {opacity}"
	role="img"
	aria-label={t('component.wisp')}
>
	<img
		src={imageSrc}
		alt="Wisp - {mood}"
		class="wisp-image"
		draggable="false"
	/>
	<div class="wisp-shadow"></div>
</div>

<style>
	.wisp {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		animation: wisp-float 4s ease-in-out infinite;
		opacity: var(--wisp-opacity, 1);
		transition: opacity var(--transition-smoke);
	}

	.wisp--sm {
		width: 80px;
		height: 80px;
	}

	.wisp--md {
		width: 140px;
		height: 140px;
	}

	.wisp--lg {
		width: 200px;
		height: 200px;
	}

	.wisp-image {
		width: 100%;
		height: 100%;
		object-fit: contain;
		user-select: none;
		pointer-events: none;
	}

	.wisp-shadow {
		position: absolute;
		bottom: -8px;
		left: 50%;
		transform: translateX(-50%);
		width: 40%;
		height: 8px;
		background: radial-gradient(
			ellipse at center,
			rgba(0, 0, 0, 0.08) 0%,
			transparent 70%
		);
		border-radius: 50%;
		animation: wisp-shadow-pulse 4s ease-in-out infinite;
	}

	@keyframes wisp-float {
		0%, 100% {
			transform: translateY(0) rotate(-1deg);
		}
		25% {
			transform: translateY(-8px) rotate(0.5deg);
		}
		50% {
			transform: translateY(-4px) rotate(1deg);
		}
		75% {
			transform: translateY(-10px) rotate(-0.5deg);
		}
	}

	@keyframes wisp-shadow-pulse {
		0%, 100% {
			opacity: 1;
			transform: translateX(-50%) scaleX(1);
		}
		25% {
			opacity: 0.7;
			transform: translateX(-50%) scaleX(0.9);
		}
		50% {
			opacity: 0.9;
			transform: translateX(-50%) scaleX(1.05);
		}
		75% {
			opacity: 0.6;
			transform: translateX(-50%) scaleX(0.85);
		}
	}
</style>
