<script lang="ts">
	interface Props {
		level: number; // 0-100
		showPercent?: boolean;
		size?: number; // diameter in px
		inFlow?: boolean; // Flow state - subtle glow effect
	}

	let { level, showPercent = false, size = 60, inFlow = false }: Props = $props();

	// Clamp level between 0 and 100
	const clampedLevel = $derived(Math.max(0, Math.min(100, level)));

	// Determine state based on level
	const gaugeState = $derived.by(() => {
		if (clampedLevel > 60) return 'healthy';
		if (clampedLevel > 30) return 'warning';
		return 'danger';
	});

	// SVG circle calculations
	const radius = 42;
	const circumference = 2 * Math.PI * radius;
	const dashOffset = $derived(circumference - (clampedLevel / 100) * circumference);

	// Color based on state
	const fillColor = $derived.by(() => {
		if (gaugeState === 'healthy') return 'var(--color-text)';
		if (gaugeState === 'warning') return 'var(--mood-flow)';
		return 'var(--color-danger)';
	});
</script>

<div class="ink-gauge" class:ink-gauge--danger={gaugeState === 'danger'} class:ink-gauge--flow={inFlow} style="--gauge-size: {size}px">
	<svg viewBox="0 0 100 100" class="gauge-svg">
		<!-- Track (background circle) -->
		<circle
			cx="50"
			cy="50"
			r={radius}
			fill="none"
			stroke="var(--color-bg-alt)"
			stroke-width="8"
			stroke-linecap="round"
		/>
		<!-- Fill (progress arc) -->
		<circle
			cx="50"
			cy="50"
			r={radius}
			fill="none"
			stroke={fillColor}
			stroke-width="8"
			stroke-linecap="round"
			stroke-dasharray={circumference}
			stroke-dashoffset={dashOffset}
			class="gauge-fill"
			transform="rotate(-90 50 50)"
		/>
	</svg>

	{#if showPercent}
		<span class="gauge-percent text-ui">{Math.round(clampedLevel)}%</span>
	{/if}
</div>

<style>
	.ink-gauge {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--gauge-size);
		height: var(--gauge-size);
	}

	.gauge-svg {
		width: 100%;
		height: 100%;
	}

	.gauge-fill {
		transition: stroke-dashoffset var(--transition-normal), stroke var(--transition-normal);
	}

	.gauge-percent {
		position: absolute;
		font-size: calc(var(--gauge-size) * 0.22);
		font-weight: 500;
		color: var(--color-text-muted);
		font-variant-numeric: tabular-nums;
	}

	/* Danger pulse animation */
	.ink-gauge--danger .gauge-fill {
		animation: gauge-pulse 0.6s ease-in-out infinite;
	}

	@keyframes gauge-pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	/* Flow state - subtle glow effect */
	.ink-gauge--flow {
		animation: flow-glow 2s ease-in-out infinite;
	}

	.ink-gauge--flow .gauge-fill {
		filter: drop-shadow(0 0 6px var(--mood-flow));
		stroke: var(--mood-flow);
	}

	@keyframes flow-glow {
		0%, 100% {
			filter: drop-shadow(0 0 4px var(--mood-flow));
		}
		50% {
			filter: drop-shadow(0 0 12px var(--mood-flow));
		}
	}

	/* Dark theme adjustments */
	:global([data-theme='dark']) .gauge-svg circle:first-child {
		stroke: rgba(255, 255, 255, 0.08);
	}
</style>
