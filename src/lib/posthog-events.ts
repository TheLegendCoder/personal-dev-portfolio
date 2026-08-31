import posthog from 'posthog-js';

/**
 * Track a custom event in PostHog
 * @param eventName - The name of the event
 * @param properties - Optional event properties/metadata
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
): void {
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.capture(eventName, properties);
  }
}

/**
 * Track a page view event
 * @param pageName - Name or title of the page
 * @param properties - Optional additional properties
 */
export function trackPageView(
  pageName: string,
  properties?: Record<string, any>
): void {
  trackEvent('Page View', {
    page_name: pageName,
    ...properties,
  });
}

/**
 * Track a button click event
 * @param buttonName - Name or label of the button
 * @param properties - Optional additional properties
 */
export function trackButtonClick(
  buttonName: string,
  properties?: Record<string, any>
): void {
  trackEvent('Button Click', {
    button_name: buttonName,
    ...properties,
  });
}

/**
 * Track a form submission event
 * @param formName - Name of the form
 * @param properties - Optional form data or metadata
 */
export function trackFormSubmission(
  formName: string,
  properties?: Record<string, any>
): void {
  trackEvent('Form Submission', {
    form_name: formName,
    ...properties,
  });
}

/**
 * Identify a user in PostHog
 * @param userId - Unique user identifier
 * @param userProperties - User metadata (name, email, plan, etc.)
 */
export function identifyUser(
  userId: string,
  userProperties?: Record<string, any>
): void {
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.identify(userId, {
      distinctId: userId,
      ...userProperties,
    });
  }
}

/**
 * Reset user identification (on logout)
 */
export function resetUserIdentification(): void {
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.reset();
  }
}

/**
 * Set user properties
 * @param properties - User properties to set
 */
export function setUserProperties(properties: Record<string, any>): void {
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.setPersonProperties(properties);
  }
}

// ---------------------------------------------------------------------------
// Information-architecture events
//
// Added with the About/Work/Writing/Now/Contact refactor so we can tell whether
// the new hubs actually route people through the site. All of these go through
// trackEvent, so they inherit the cookie-consent gate in posthog-provider.tsx.
// ---------------------------------------------------------------------------

export type NavSource = 'navbar' | 'navbar-dropdown' | 'mobile' | 'footer';

/**
 * A click on any site navigation link.
 */
export function trackNavigationClick(
  label: string,
  path: string,
  source: NavSource
): void {
  trackEvent('Navigation Click', { label, path, source });
}

/**
 * A click on a card in the Featured strip of the Writing hub. `position` is
 * 0-indexed so we can tell whether anything below the first slot gets read.
 */
export function trackFeaturedContentClick(
  contentType: string,
  slug: string,
  position: number
): void {
  trackEvent('Featured Content Click', {
    content_type: contentType,
    slug,
    position,
  });
}

/**
 * A type or topic filter applied on the Writing hub.
 */
export function trackWritingFilter(
  filter: 'type' | 'topic',
  value: string
): void {
  trackEvent('Writing Filter', { filter, value });
}

/**
 * Someone reached out — the closest thing this site has to a conversion.
 */
export function trackContactConversion(
  method: 'email' | 'linkedin' | 'github' | 'twitter'
): void {
  trackEvent('Contact Conversion', { method });
}
