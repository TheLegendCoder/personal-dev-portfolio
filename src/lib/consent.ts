const CONSENT_KEY = 'cookie-consent';
export const CONSENT_CHANGE_EVENT = 'cookie-consent-change';

export type ConsentChoice = 'accepted' | 'rejected';

export function getConsent(): ConsentChoice | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(CONSENT_KEY);
  return value === 'accepted' || value === 'rejected' ? value : null;
}

export function setConsent(choice: ConsentChoice) {
  window.localStorage.setItem(CONSENT_KEY, choice);
  window.dispatchEvent(new CustomEvent<ConsentChoice | null>(CONSENT_CHANGE_EVENT, { detail: choice }));
}

/** Clears the stored choice, which re-opens the consent banner. */
export function clearConsent() {
  window.localStorage.removeItem(CONSENT_KEY);
  window.dispatchEvent(new CustomEvent<ConsentChoice | null>(CONSENT_CHANGE_EVENT, { detail: null }));
}
