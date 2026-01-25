<script lang="ts">
	import { onMount } from 'svelte';
	import { userStore } from '$lib/stores';
	import { analytics } from '$lib/analytics';

	// User state
	let isReturningUser = $state(false);

	// State for animations
	let thoughtsVisible = $state(false);
	let heroVisible = $state(false);
	let problemVisible = $state(false);
	let howItWorksVisible = $state(false);
	let featuresVisible = $state(false);
	let trustVisible = $state(false);
	let closeVisible = $state(false);
	let faqOpen = $state<number | null>(null);

	// Thoughts for the Problem Wall - positioned around the center with top/left percentages
	const thoughts = [
		// Zone haute gauche
		{ text: "I should call mom", top: 5, left: 3, drift: 8, duration: 4.2 },
		{ text: "That deadline...", top: 12, left: 25, drift: -6, duration: 3.8 },
		{ text: "Did I lock the door?", top: 3, left: 48, drift: 9, duration: 4.1 },
		{ text: "What's for dinner", top: 8, left: 68, drift: 10, duration: 4.5 },
		{ text: "Am I good enough?", top: 15, left: 82, drift: -8, duration: 3.5 },
		// Zone milieu haute
		{ text: "The meeting tomorrow", top: 22, left: 5, drift: 5, duration: 4.0 },
		{ text: "I forgot to...", top: 25, left: 38, drift: -10, duration: 3.7 },
		{ text: "That idea I had", top: 20, left: 72, drift: 7, duration: 4.3 },
		// Zone centre gauche
		{ text: "Why did I say that", top: 35, left: 2, drift: -5, duration: 3.9 },
		{ text: "I need to exercise more", top: 42, left: 18, drift: -7, duration: 3.6 },
		// Zone centre droite
		{ text: "That email I haven't sent", top: 38, left: 75, drift: 6, duration: 4.4 },
		{ text: "What if they don't like it", top: 45, left: 88, drift: -9, duration: 3.4 },
		// Zone centre basse gauche
		{ text: "I should sleep more", top: 55, left: 4, drift: 8, duration: 4.6 },
		{ text: "The project is stuck", top: 60, left: 22, drift: -6, duration: 3.8 },
		// Zone centre basse droite
		{ text: "I miss them", top: 58, left: 78, drift: 7, duration: 4.0 },
		{ text: "Why am I so tired", top: 52, left: 90, drift: -8, duration: 3.5 },
		// Zone basse gauche
		{ text: "Is this the right path?", top: 72, left: 2, drift: 9, duration: 4.2 },
		{ text: "I need a vacation", top: 78, left: 20, drift: -5, duration: 3.9 },
		{ text: "What did they mean by that?", top: 85, left: 5, drift: 6, duration: 4.5 },
		// Zone basse centre
		{ text: "Should I text first?", top: 75, left: 40, drift: -10, duration: 3.7 },
		{ text: "That awkward moment...", top: 82, left: 55, drift: 8, duration: 4.1 },
		// Zone basse droite
		{ text: "My back hurts", top: 70, left: 80, drift: -7, duration: 3.6 },
		{ text: "I should drink more water", top: 78, left: 72, drift: 5, duration: 4.3 },
		{ text: "What's my purpose?", top: 88, left: 85, drift: -9, duration: 3.4 },
		// Extra scattered
		{ text: "The bills are due", top: 30, left: 85, drift: 10, duration: 4.4 },
		{ text: "I'm running late", top: 65, left: 40, drift: -6, duration: 3.8 },
		{ text: "Did I say something wrong?", top: 48, left: 5, drift: 7, duration: 4.0 },
		{ text: "I wish I had more time", top: 92, left: 35, drift: -8, duration: 3.5 },
		{ text: "Why can't I focus?", top: 68, left: 60, drift: 9, duration: 4.6 },
		{ text: "That song stuck in my head", top: 90, left: 65, drift: -5, duration: 3.9 },
	];

	// FAQ items
	const faqItems = [
		{
			q: 'What happens if I stop typing?',
			a: 'Your ink gauge starts draining. If it hits zero, your entire session fades away — gone forever. It sounds harsh, but it\'s the point: it forces you to keep writing without overthinking.'
		},
		{
			q: 'Is my writing really private?',
			a: 'Yes. Wisp stores everything locally in your browser. No account, no server, no cloud (unless you choose to enable backup with Wisp+). Your words never leave your device.'
		},
		{
			q: 'Do I need to create an account?',
			a: 'No. Just open Wisp and start writing. No email, no password, no friction.'
		},
		{
			q: 'What if I clear my browser data?',
			a: 'Your writing history could be lost. That\'s why we remind you to export your data regularly. With Wisp+, you can enable encrypted cloud backup for extra peace of mind.'
		},
		{
			q: 'Can I use Wisp on my phone?',
			a: 'Wisp works on mobile browsers, but it\'s designed for keyboard writing. Desktop is the best experience — typing fast is part of the magic.'
		},
		{
			q: 'Why 300 words?',
			a: 'It\'s the sweet spot. Long enough to get into flow state. Short enough to fit in a morning routine. About 2-4 minutes of focused writing.'
		}
	];

	onMount(async () => {
		// Check if returning user
		await userStore.init();
		isReturningUser = userStore.isOnboarded;

		// Stagger hero visibility
		setTimeout(() => heroVisible = true, 100);

		// Setup intersection observer for sections
		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					const id = entry.target.id;
					if (id === 'problem') {
						problemVisible = true;
						startThoughtAnimation();
					}
					if (id === 'how-it-works') howItWorksVisible = true;
					if (id === 'features') featuresVisible = true;
					if (id === 'trust') trustVisible = true;
					if (id === 'close') closeVisible = true;
				}
			});
		}, { threshold: 0.3 });

		document.querySelectorAll('section[id]').forEach(section => {
			observer.observe(section);
		});

		return () => observer.disconnect();
	});

	function startThoughtAnimation() {
		thoughtsVisible = true;
	}

	function toggleFaq(index: number) {
		faqOpen = faqOpen === index ? null : index;
	}
</script>

<svelte:head>
	<title>Wisp — Free your thoughts, 300 words at a time</title>
	<meta name="description" content="A minimalist journaling app that helps you write through constraint. No stopping, no editing, just flow." />
</svelte:head>

<div class="landing">
	<!-- Header -->
	<header class="header">
		<div class="header-inner">
			<a href="/" class="logo">
				<span class="logo-text">Wisp.</span>
			</a>
			<nav class="header-nav">
				{#if isReturningUser}
					<a href="/home" class="header-cta header-cta--primary">My journal</a>
				{/if}
				<a href="/write" class="header-cta" onclick={() => analytics.ctaClick('header')}>Try it now</a>
			</nav>
		</div>
	</header>

	<!-- Section 1: Hero -->
	<section id="hero" class="section hero" class:visible={heroVisible}>
		<div class="hero-content">
			<h1 class="hero-headline">
				Clear your mind<br />
				in <span class="highlight">300 words</span>.
			</h1>

			<div class="hero-wisp">
				<img src="/wisp/wisp-zen.webp" alt="Wisp" class="wisp-large" />
				<div class="wisp-glow"></div>
			</div>

			<p class="hero-subline">
				A daily brain dump for founders and creators who think too much.
			</p>

			<a href="/write" class="cta-primary" onclick={() => analytics.ctaClick('hero')}>
				Start writing — it's free
				<svg class="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M5 12h14M12 5l7 7-7 7"/>
				</svg>
			</a>

			<p class="hero-trust">
				No account. No cloud. Just you and your thoughts.
			</p>
		</div>

		<div class="mist mist-1"></div>
		<div class="mist mist-2"></div>
	</section>

	<!-- Section 2: Problem Wall -->
	<section id="problem" class="section problem" class:visible={problemVisible}>
		<div class="thought-cloud">
			<!-- Caption centré -->
			<p class="problem-caption">
				This is your brain. <span class="emphasis">Every day.</span>
			</p>

			<!-- Pensées positionnées en absolu autour -->
			{#each thoughts as thought, i}
				<span
					class="thought"
					class:visible={thoughtsVisible}
					style="
						top: {thought.top}%;
						left: {thought.left}%;
						--i: {i};
						--drift: {thought.drift}px;
						--duration: {thought.duration}s;
					"
				>
					{thought.text}
				</span>
			{/each}
		</div>
	</section>

	<!-- Section 3: How it Works -->
	<section id="how-it-works" class="section how-it-works" class:visible={howItWorksVisible}>
		<div class="how-it-works-content">
			<h2 class="how-it-works-headline">How it works</h2>

			<div class="steps-grid">
				<div class="step">
					<span class="step-number">01</span>
					<h3 class="step-title">Start typing</h3>
					<p>Open Wisp. Write your first word. The ink gauge starts.</p>
				</div>
				<div class="step">
					<span class="step-number">02</span>
					<h3 class="step-title">Keep going</h3>
					<p>Watch your ink gauge. If it empties, everything fades away.</p>
				</div>
				<div class="step">
					<span class="step-number">03</span>
					<h3 class="step-title">Feel lighter</h3>
					<p>300 words done. Session saved. See your streak grow.</p>
				</div>
			</div>

			<!-- Video placeholder -->
			<div class="video-placeholder">
				<div class="play-button">▶</div>
				<p>Watch demo (coming soon)</p>
			</div>
		</div>
	</section>

	<!-- Section 5: Features -->
	<section id="features" class="section features" class:visible={featuresVisible}>
		<h2 class="features-headline">Every session <span class="highlight">leaves a mark</span>.</h2>

		<div class="features-grid">
			<div class="feature-card" style="--delay: 0s">
				<div class="feature-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<rect x="3" y="4" width="18" height="18" rx="2"/>
						<line x1="3" y1="10" x2="21" y2="10"/>
						<line x1="10" y1="4" x2="10" y2="10"/>
					</svg>
				</div>
				<h3>Your Year in Ink</h3>
				<p>Watch your calendar fill with drops of progress. Each day you write, a mark remains.</p>
			</div>

			<div class="feature-card" style="--delay: 0.1s">
				<div class="feature-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<circle cx="12" cy="12" r="9"/>
						<path d="M12 6v6l4 2"/>
					</svg>
				</div>
				<h3>Track Your Mood</h3>
				<p>After each session, record how it felt. Discover patterns over time.</p>
			</div>

			<div class="feature-card" style="--delay: 0.2s">
				<div class="feature-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path d="M12 2L12 6"/>
						<path d="M12 18L12 22"/>
						<path d="M4.93 4.93L7.76 7.76"/>
						<path d="M16.24 16.24L19.07 19.07"/>
						<path d="M2 12L6 12"/>
						<path d="M18 12L22 12"/>
					</svg>
				</div>
				<h3>Build Your Streak</h3>
				<p>Consistency compounds. See your streak grow and protect it fiercely.</p>
			</div>

			<div class="feature-card" style="--delay: 0.3s">
				<div class="feature-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<rect x="3" y="11" width="18" height="11" rx="2"/>
						<path d="M7 11V7a5 5 0 0110 0v4"/>
					</svg>
				</div>
				<h3>100% Private</h3>
				<p>Your words never leave your device. No accounts, no tracking, no cloud.</p>
			</div>
		</div>

		<div class="calendar-preview">
			<div class="calendar-month">
				<span class="month-label">January</span>
				<div class="days-grid">
					{#each Array(31) as _, i}
						<div
							class="day-dot"
							class:day-dot--completed={i < 12}
							class:day-dot--today={i === 20}
							style="--delay: {i * 0.02}s"
						></div>
					{/each}
				</div>
			</div>
			<p class="calendar-caption">12 days written this month</p>
		</div>
	</section>

	<!-- Section 6: Trust -->
	<section id="trust" class="section trust" class:visible={trustVisible}>
		<h2 class="trust-intro">Built by a founder who couldn't journal.</h2>

		<div class="founder-quote">
			<div class="founder-photo">
				<img src="/jonathan-vouilloz.webp" alt="Jonathan Vouilloz" class="founder-img" />
			</div>
			<blockquote>
				"I tried everything. Apps, notebooks, morning pages. Nothing stuck. So I built something that forces me to write.<br /><br />
				<span class="highlight-quote">Now I do 300 words every morning.</span>"
			</blockquote>
			<cite>— Jon, Switzerland</cite>
		</div>

		<div class="social-proof">
			<div class="adopters">
				<div class="avatar-stack">
					{#each Array(5) as _, i}
						<div class="avatar" style="--i: {i}; background: hsl({200 + i * 30}, 60%, {60 + i * 5}%)"></div>
					{/each}
				</div>
				<p><strong>47</strong> writers already started their journey</p>
			</div>
		</div>
	</section>

	<!-- Section 7: Close -->
	<section id="close" class="section close" class:visible={closeVisible}>
		<h2 class="close-headline">Your thoughts are waiting.</h2>

		<a href="/write" class="cta-massive" onclick={() => analytics.ctaClick('close')}>
			Start writing — it's free
			<svg class="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M5 12h14M12 5l7 7-7 7"/>
			</svg>
		</a>

		<p class="close-trust">
			No account needed. No credit card.<br />
			Your words stay on your device.
		</p>

		<div class="pricing-subtle">
			<p>
				<span class="pricing-label">Want more?</span>
				<span class="pricing-details">Wisp+ ($29 one-time) unlocks unlimited history, cloud backup, and beautiful exports.</span>
			</p>
		</div>

		<div class="faq">
			<h3 class="faq-title">Common questions</h3>
			{#each faqItems as item, i}
				<button
					class="faq-item"
					class:open={faqOpen === i}
					onclick={() => toggleFaq(i)}
				>
					<div class="faq-header">
						<span class="faq-q">{item.q}</span>
						<svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polyline points="6 9 12 15 18 9"/>
						</svg>
					</div>
					{#if faqOpen === i}
						<p class="faq-a">{item.a}</p>
					{/if}
				</button>
			{/each}
		</div>

		<footer class="footer">
			<a href="/" class="footer-logo">Wisp.</a>
			<nav class="footer-nav">
				<a href="/write">Write</a>
				<span class="footer-sep">·</span>
				<a href="/settings">Settings</a>
			</nav>
			<p class="footer-copy">Made with intention. Your words, your device.</p>
		</footer>
	</section>
</div>

<style>
	/* ===== Base & Variables ===== */
	.landing {
		--color-cream: #faf9f6;
		--color-cream-dark: #f5f1eb;
		--color-ink: #1a1a1a;
		--color-ink-light: #6b6b6b;
		--color-ink-faint: #a0a0a0;
		--color-accent: #6366f1;
		--font-display: 'DM Sans', system-ui, sans-serif;
		--font-body: 'Lora', Georgia, serif;

		background: var(--color-cream);
		color: var(--color-ink);
		overflow-x: hidden;
	}

	:global([data-theme='dark']) .landing {
		--color-cream: #121212;
		--color-cream-dark: #1e1e1e;
		--color-ink: #f5f1eb;
		--color-ink-light: #a0a0a0;
		--color-ink-faint: #6b6b6b;
	}

	/* ===== Header ===== */
	.header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		padding: 1.5rem 3rem;
		background: linear-gradient(to bottom, var(--color-cream), transparent);
	}

	.header-inner {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}

	.logo {
		display: flex;
		align-items: center;
		text-decoration: none;
		color: var(--color-ink);
	}

	.logo-text {
		font-family: 'Nautical Prestige', serif;
		font-size: 2.5rem;
		font-weight: normal;
		letter-spacing: 0;
	}

	.header-cta {
		font-family: var(--font-display);
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--color-ink);
		text-decoration: none;
		padding: 0.6rem 1.25rem;
		border: 1.5px solid var(--color-ink);
		border-radius: 999px;
		transition: all 0.2s ease;
	}

	.header-cta:hover {
		background: var(--color-ink);
		color: var(--color-cream);
	}

	.header-cta--primary {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: #fff;
	}

	.header-cta--primary:hover {
		background: color-mix(in srgb, var(--color-accent) 85%, #000);
		border-color: color-mix(in srgb, var(--color-accent) 85%, #000);
		color: #fff;
	}

	.header-nav {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	/* ===== Section Base ===== */
	.section {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 6rem 2rem;
		position: relative;
	}

	/* ===== Hero Section ===== */
	.hero {
		padding-top: 8rem;
		overflow: hidden;
	}

	.hero-content {
		text-align: center;
		max-width: 800px;
		position: relative;
		z-index: 2;
		opacity: 0;
		transform: translateY(30px);
		transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.hero.visible .hero-content {
		opacity: 1;
		transform: translateY(0);
	}

	.hero-headline {
		font-family: var(--font-display);
		font-size: clamp(2.5rem, 6vw, 4rem);
		font-weight: 700;
		line-height: 1.15;
		letter-spacing: -0.03em;
		margin-bottom: 2rem;
	}

	.hero-headline .highlight,
	.features-headline .highlight {
		color: var(--color-accent);
	}

	.hero-wisp {
		position: relative;
		width: 220px;
		height: 220px;
		margin: 2rem auto 2.5rem;
	}

	.wisp-large {
		width: 100%;
		height: 100%;
		object-fit: contain;
		animation: wisp-breathe 6s ease-in-out infinite;
		position: relative;
		z-index: 2;
	}

	.wisp-glow {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 160%;
		height: 160%;
		background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 60%);
		animation: glow-pulse 6s ease-in-out infinite;
		z-index: 1;
	}

	@keyframes wisp-breathe {
		0%, 100% {
			transform: translateY(0) scale(1);
		}
		50% {
			transform: translateY(-12px) scale(1.02);
		}
	}

	@keyframes glow-pulse {
		0%, 100% {
			opacity: 0.5;
			transform: translate(-50%, -50%) scale(1);
		}
		50% {
			opacity: 0.8;
			transform: translate(-50%, -50%) scale(1.1);
		}
	}

	.hero-subline {
		font-family: var(--font-body);
		font-size: 1.35rem;
		line-height: 1.6;
		color: var(--color-ink);
		margin-bottom: 2.5rem;
	}

	.hero-subline .subtle {
		color: var(--color-ink-light);
	}

	.cta-primary {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		font-family: var(--font-display);
		font-size: 1.15rem;
		font-weight: 600;
		color: #fff;
		background: var(--color-accent);
		padding: 1rem 2rem;
		border-radius: 999px;
		text-decoration: none;
		transition: all 0.3s ease;
		box-shadow: 0 4px 24px rgba(99, 102, 241, 0.3);
	}

	.cta-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 32px rgba(99, 102, 241, 0.4);
	}

	.cta-arrow {
		width: 20px;
		height: 20px;
		transition: transform 0.3s ease;
	}

	.cta-primary:hover .cta-arrow {
		transform: translateX(4px);
	}

	.hero-trust {
		font-family: var(--font-display);
		font-size: 0.9rem;
		color: var(--color-ink-light);
		margin-top: 1.5rem;
	}

	/* Mist effect */
	.mist {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 200px;
		pointer-events: none;
		opacity: 0.4;
	}

	.mist-1 {
		background: linear-gradient(to top, var(--color-cream-dark), transparent);
		animation: mist-drift 20s ease-in-out infinite;
	}

	.mist-2 {
		background: radial-gradient(ellipse at center bottom, var(--color-cream-dark) 0%, transparent 70%);
		animation: mist-drift 25s ease-in-out infinite reverse;
	}

	@keyframes mist-drift {
		0%, 100% {
			transform: translateX(-5%);
		}
		50% {
			transform: translateX(5%);
		}
	}

	/* ===== Problem Wall Section ===== */
	.problem {
		background: linear-gradient(to bottom, var(--color-cream), var(--color-cream-dark));
		min-height: 80vh;
	}

	.thought-cloud {
		position: relative;
		width: 100%;
		max-width: 1000px;
		height: 600px;
	}

	.thought {
		position: absolute;
		font-family: var(--font-body);
		font-size: clamp(0.85rem, 1.5vw, 1rem);
		font-style: italic;
		color: var(--color-ink-light);
		padding: 0.5rem 1rem;
		background: rgba(255, 255, 255, 0.5);
		border-radius: 20px;
		white-space: nowrap;
		opacity: 0;
		transform: translateY(20px);
		transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
		transition-delay: calc(var(--i) * 0.1s);
		will-change: transform, opacity;
		backface-visibility: hidden; /* Hardware acceleration hint */
	}

	:global([data-theme='dark']) .thought {
		background: rgba(255, 255, 255, 0.05);
	}

	.thought.visible {
		opacity: 1;
		transform: translateY(0);
		/* Start floating ONLY after the entry transition is complete (0.6s) plus a small random offset based on index */
		animation: thought-float var(--duration) ease-in-out infinite;
		animation-delay: calc((var(--i) * 0.1s) + 0.6s);
	}

	@keyframes thought-float {
		0%, 100% {
			transform: translate3d(0, 0, 0);
		}
		50% {
			transform: translate3d(0, var(--drift), 0);
		}
	}

	.problem.visible .thought-cloud {
		animation: cloud-settle 2s ease-out forwards;
	}

	@keyframes cloud-settle {
		0% {
			opacity: 0.5;
		}
		100% {
			opacity: 1;
		}
	}

	.problem-caption {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 10;
		font-family: var(--font-display);
		font-size: clamp(1.25rem, 3vw, 1.75rem);
		font-weight: 500;
		color: var(--color-ink);
		text-align: center;
		background: var(--color-cream);
		padding: 1.5rem 2.5rem;
		border-radius: 16px;
		box-shadow: 0 8px 40px rgba(0, 0, 0, 0.06);
		opacity: 0;
		transition: opacity 0.8s ease 1.5s;
	}

	:global([data-theme='dark']) .problem-caption {
		background: var(--color-cream);
		box-shadow: 0 8px 40px rgba(0, 0, 0, 0.3);
	}

	.problem.visible .problem-caption {
		opacity: 1;
	}

	.problem-caption .emphasis {
		font-weight: 700;
		color: var(--color-accent);
	}

	/* ===== How it Works Section ===== */
	.how-it-works {
		background: var(--color-cream);
		min-height: 90vh;
	}

	.how-it-works-content {
		max-width: 900px;
		margin: 0 auto;
		text-align: center;
		opacity: 0;
		transform: translateY(40px);
		transition: all 1s ease;
	}

	.how-it-works.visible .how-it-works-content {
		opacity: 1;
		transform: translateY(0);
	}

	.how-it-works-headline {
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 600;
		margin-bottom: 4rem;
	}

	.steps-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2rem;
		margin-bottom: 4rem;
		text-align: left;
	}

	.step-number {
		font-size: 4rem;
		font-weight: 700;
		color: transparent;
		-webkit-text-stroke: 1.5px var(--color-accent);
		line-height: 1;
		display: block;
		margin-bottom: 1rem;
	}

	.step-title {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
	}

	.step p {
		font-family: var(--font-body);
		font-size: 1rem;
		color: var(--color-ink-light);
		line-height: 1.6;
	}

	.video-placeholder {
		background: #000;
		border-radius: 16px;
		aspect-ratio: 16/9;
		max-width: 700px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: white;
		cursor: pointer;
		transition: transform 0.3s ease;
	}

	.video-placeholder:hover {
		transform: scale(1.02);
	}

	.play-button {
		font-size: 3rem;
		margin-bottom: 0.5rem;
		opacity: 0.8;
	}

	.video-placeholder p {
		font-family: var(--font-display);
		font-size: 0.9rem;
		opacity: 0.6;
		margin: 0;
	}

	/* ===== Features Section ===== */
	.features {
		background: var(--color-cream);
		padding: 6rem 2rem;
	}

	.features-headline {
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 600;
		text-align: center;
		margin-bottom: 4rem;
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.8s ease;
	}

	.features.visible .features-headline {
		opacity: 1;
		transform: translateY(0);
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 2rem;
		max-width: 800px;
		margin: 0 auto;
	}

	.feature-card {
		background: #fff;
		border-radius: 16px;
		padding: 2rem;
		text-align: center;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
		opacity: 0;
		transform: translateY(30px);
		transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
		transition-delay: var(--delay);
	}

	:global([data-theme='dark']) .feature-card {
		background: #1e1e1e;
	}

	.features.visible .feature-card {
		opacity: 1;
		transform: translateY(0);
	}

	.feature-icon {
		width: 48px;
		height: 48px;
		margin: 0 auto 1.25rem;
	}

	.feature-icon svg {
		width: 100%;
		height: 100%;
		stroke: var(--color-ink);
	}

	.feature-card h3 {
		font-family: var(--font-display);
		font-size: 1.15rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
	}

	.feature-card p {
		font-family: var(--font-body);
		font-size: 0.95rem;
		color: var(--color-ink-light);
		line-height: 1.6;
		margin: 0;
	}

	.calendar-preview {
		margin-top: 4rem;
		text-align: center;
		opacity: 0;
		transition: all 0.8s ease 0.4s;
	}

	.features.visible .calendar-preview {
		opacity: 1;
	}

	.calendar-month {
		display: inline-block;
		background: #fff;
		padding: 1.5rem 2rem;
		border-radius: 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
	}

	:global([data-theme='dark']) .calendar-month {
		background: #1e1e1e;
	}

	.month-label {
		display: block;
		font-family: var(--font-display);
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--color-ink);
		margin-bottom: 1rem;
		text-align: left;
	}

	.days-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 6px;
	}

	.day-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background-color: color-mix(in srgb, var(--color-ink-light) 25%, var(--color-cream));
		opacity: 0;
		transform: scale(0.5);
		transition: all 0.5s ease;
		transition-delay: var(--delay);
	}

	:global([data-theme='dark']) .day-dot {
		background-color: #333;
	}

	.features.visible .day-dot {
		opacity: 1;
		transform: scale(1);
	}

	.day-dot--completed {
		background-color: var(--color-ink);
		box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
	}

	:global([data-theme='dark']) .day-dot--completed {
		background-color: var(--color-ink);
		box-shadow: 0 0 6px rgba(255, 255, 255, 0.1);
	}

	.day-dot--today {
		box-shadow: 0 0 0 2px var(--color-cream), 0 0 0 3px var(--color-ink);
	}

	:global([data-theme='dark']) .day-dot--today {
		box-shadow: 0 0 0 2px #1e1e1e, 0 0 0 3px var(--color-ink);
	}

	.calendar-caption {
		font-family: var(--font-display);
		font-size: 0.9rem;
		color: var(--color-ink-light);
		margin-top: 1rem;
	}

	/* ===== Trust Section ===== */
	.trust {
		background: var(--color-cream-dark);
		padding: 6rem 2rem;
	}

	.trust-intro {
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 3.5vw, 2rem);
		font-weight: 500;
		text-align: center;
		margin-bottom: 3rem;
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.8s ease;
	}

	.trust.visible .trust-intro {
		opacity: 1;
		transform: translateY(0);
	}

	.founder-quote {
		max-width: 600px;
		margin: 0 auto;
		text-align: center;
		opacity: 0;
		transform: translateY(30px);
		transition: all 0.8s ease 0.2s;
	}

	.trust.visible .founder-quote {
		opacity: 1;
		transform: translateY(0);
	}

	.founder-photo {
		width: 80px;
		height: 80px;
		margin: 0 auto 2rem;
	}

	.founder-img {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		object-fit: cover;
	}

	.founder-quote blockquote {
		font-family: var(--font-body);
		font-size: 1.2rem;
		font-style: italic;
		line-height: 1.8;
		color: var(--color-ink);
		margin: 0;
	}

	.founder-quote .highlight-quote {
		font-style: normal;
		font-weight: 600;
		color: var(--color-accent);
	}

	.founder-quote cite {
		display: block;
		font-family: var(--font-display);
		font-size: 0.95rem;
		font-style: normal;
		color: var(--color-ink-light);
		margin-top: 1.5rem;
	}

	.social-proof {
		margin-top: 4rem;
		opacity: 0;
		transition: all 0.8s ease 0.4s;
	}

	.trust.visible .social-proof {
		opacity: 1;
	}

	.adopters {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.avatar-stack {
		display: flex;
	}

	.avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		border: 3px solid var(--color-cream-dark);
		margin-left: -12px;
	}

	.avatar:first-child {
		margin-left: 0;
	}

	.adopters p {
		font-family: var(--font-display);
		font-size: 1rem;
		color: var(--color-ink-light);
		margin: 0;
	}

	.adopters strong {
		color: var(--color-ink);
	}

	/* ===== Close Section ===== */
	.close {
		background: var(--color-cream);
		padding: 6rem 2rem 4rem;
	}

	.close-headline {
		font-family: var(--font-display);
		font-size: clamp(2rem, 5vw, 3rem);
		font-weight: 700;
		text-align: center;
		margin-bottom: 2.5rem;
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.8s ease;
	}

	.close.visible .close-headline {
		opacity: 1;
		transform: translateY(0);
	}

	.cta-massive {
		display: inline-flex;
		align-items: center;
		gap: 1rem;
		font-family: var(--font-display);
		font-size: clamp(1.1rem, 2.5vw, 1.35rem);
		font-weight: 600;
		color: #fff;
		background: var(--color-accent);
		padding: 1.25rem 2.5rem;
		border-radius: 999px;
		text-decoration: none;
		transition: all 0.3s ease;
		box-shadow: 0 8px 32px rgba(99, 102, 241, 0.35);
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.8s ease 0.1s;
	}

	.close.visible .cta-massive {
		opacity: 1;
		transform: translateY(0);
	}

	.cta-massive:hover {
		transform: translateY(-3px);
		box-shadow: 0 12px 40px rgba(99, 102, 241, 0.45);
	}

	.cta-massive .cta-arrow {
		width: 22px;
		height: 22px;
		transition: transform 0.3s ease;
	}

	.cta-massive:hover .cta-arrow {
		transform: translateX(5px);
	}

	.close-trust {
		font-family: var(--font-display);
		font-size: 0.95rem;
		color: var(--color-ink-light);
		text-align: center;
		margin-top: 1.5rem;
		line-height: 1.6;
	}

	.pricing-subtle {
		max-width: 500px;
		margin: 4rem auto;
		padding: 1.5rem 2rem;
		background: var(--color-cream-dark);
		border-radius: 12px;
		text-align: center;
	}

	.pricing-subtle p {
		font-family: var(--font-display);
		font-size: 0.95rem;
		color: var(--color-ink-light);
		margin: 0;
	}

	.pricing-label {
		font-weight: 600;
		color: var(--color-ink);
	}

	/* FAQ */
	.faq {
		width: 100%;
		max-width: 600px;
		margin: 0 auto 4rem;
	}

	.faq-title {
		font-family: var(--font-display);
		font-size: 1.1rem;
		font-weight: 600;
		text-align: center;
		color: var(--color-ink-light);
		margin-bottom: 1.5rem;
	}

	.faq-item {
		width: 100%;
		text-align: left;
		padding: 1.25rem 1.5rem;
		background: #fff;
		border: none;
		border-radius: 12px;
		margin-bottom: 0.75rem;
		cursor: pointer;
		transition: all 0.2s ease;
		display: block;
	}

	:global([data-theme='dark']) .faq-item {
		background: #1e1e1e;
	}

	.faq-item:hover {
		background: var(--color-cream-dark);
	}

	:global([data-theme='dark']) .faq-item:hover {
		background: #252525;
	}

	.faq-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		gap: 1rem;
	}

	.faq-q {
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 500;
		color: var(--color-ink);
		text-align: left;
	}

	.faq-chevron {
		width: 20px;
		height: 20px;
		stroke: var(--color-ink-light);
		transition: transform 0.3s ease;
		flex-shrink: 0;
	}

	.faq-item.open .faq-chevron {
		transform: rotate(180deg);
	}

	.faq-a {
		font-family: var(--font-body);
		font-size: 0.95rem;
		color: var(--color-ink-light);
		line-height: 1.7;
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--color-cream-dark);
	}

	:global([data-theme='dark']) .faq-a {
		border-top-color: #333;
	}

	/* Footer */
	.footer {
		text-align: center;
		padding-top: 3rem;
		border-top: 1px solid var(--color-cream-dark);
	}

	:global([data-theme='dark']) .footer {
		border-top-color: #252525;
	}

	.footer-logo {
		font-family: 'Nautical Prestige', serif;
		font-size: 2rem;
		font-weight: normal;
		color: var(--color-ink);
		text-decoration: none;
	}

	.footer-nav {
		margin: 1rem 0;
	}

	.footer-nav a {
		font-family: var(--font-display);
		font-size: 0.9rem;
		color: var(--color-ink-light);
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.footer-nav a:hover {
		color: var(--color-ink);
	}

	.footer-sep {
		margin: 0 0.75rem;
		color: var(--color-ink-faint);
	}

	.footer-copy {
		font-family: var(--font-display);
		font-size: 0.85rem;
		color: var(--color-ink-faint);
		margin: 1rem 0 0;
	}

	/* ===== Responsive ===== */
	@media (max-width: 768px) {
		.header {
			padding: 1rem 1.5rem;
		}

		.section {
			padding: 4rem 1.5rem;
		}

		.hero {
			padding-top: 6rem;
		}

		.hero-wisp {
			width: 160px;
			height: 160px;
		}

		.thought-cloud {
			height: 450px;
		}

		.thought {
			font-size: 0.75rem;
			padding: 0.35rem 0.7rem;
		}

		.problem-caption {
			padding: 1rem 1.5rem;
		}

		.steps-grid {
			grid-template-columns: 1fr;
			gap: 3rem;
		}

		.features-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 1rem;
		}

		.feature-card {
			padding: 1.5rem;
		}

		.calendar-day {
			width: 40px;
			height: 40px;
		}

		.founder-quote blockquote {
			font-size: 1.05rem;
		}
	}

	@media (max-width: 480px) {
		.features-grid {
			grid-template-columns: 1fr;
		}

		.calendar-day {
			width: 36px;
			height: 36px;
		}

		.ink-drop {
			width: 16px;
			height: 16px;
		}
	}

	/* ===== Reduced Motion ===== */
	@media (prefers-reduced-motion: reduce) {
		*, *::before, *::after {
			animation-duration: 0.01ms !important;
			animation-iteration-count: 1 !important;
			transition-duration: 0.01ms !important;
		}
	}
</style>
