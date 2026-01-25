/**
 * Analytics module for PostHog integration
 * Privacy-first: cookieless mode, no personal data tracking
 */

import posthog from 'posthog-js';
import { browser } from '$app/environment';

// Check if analytics is enabled (has valid API key)
const isEnabled = (): boolean => {
	if (!browser) return false;
	const key = import.meta.env.PUBLIC_POSTHOG_KEY;
	return !!key && key !== 'phc_xxxxx';
};

// Check if we're in development mode
const isDev = (): boolean => import.meta.env.DEV;

/**
 * Initialize PostHog analytics
 * Should be called once in the root layout
 */
export function initAnalytics(): void {
	if (!browser) return;

	const key = import.meta.env.PUBLIC_POSTHOG_KEY;
	const host = import.meta.env.PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

	if (!key || key === 'phc_xxxxx') {
		if (isDev()) {
			console.log('[Analytics] PostHog not configured - events will be logged to console');
		}
		return;
	}

	posthog.init(key, {
		api_host: host,
		persistence: 'memory', // Cookieless mode for privacy
		capture_pageview: false, // We handle SPA navigation manually
		capture_pageleave: true,
		autocapture: false, // Manual events only
		disable_session_recording: false, // Enable session replay if available
		loaded: () => {
			if (isDev()) {
				console.log('[Analytics] PostHog initialized');
			}
		}
	});
}

/**
 * Track a page view (for SPA navigation)
 */
export function trackPageView(path: string): void {
	if (isDev()) {
		console.log('[Analytics] page_view', { path });
	}
	if (!isEnabled()) return;

	posthog.capture('$pageview', {
		$current_url: window.location.href,
		path
	});
}

/**
 * Track a custom event
 */
export function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
	if (isDev()) {
		console.log('[Analytics]', eventName, properties || {});
	}
	if (!isEnabled()) return;

	posthog.capture(eventName, properties);
}

/**
 * Pre-defined analytics helpers for common events
 */
export const analytics = {
	// Landing page
	ctaClick: (location: 'hero' | 'close' | 'header') => {
		trackEvent('cta_click', { location });
	},

	// Onboarding
	onboardingStart: () => {
		trackEvent('onboarding_start');
	},

	onboardingComplete: () => {
		trackEvent('onboarding_complete');
	},

	// Writing session
	sessionStart: () => {
		trackEvent('session_start');
	},

	sessionComplete: (wordCount: number, durationSec: number) => {
		trackEvent('session_complete', { wordCount, durationSec });
	},

	sessionFailed: (wordCount: number) => {
		trackEvent('session_failed', { wordCount });
	},

	// Mood
	moodSelect: (level: number) => {
		trackEvent('mood_select', { level });
	},

	// Share
	shareClick: (platform: string) => {
		trackEvent('share_click', { platform });
	},

	shareSkip: () => {
		trackEvent('share_skip');
	}
};
