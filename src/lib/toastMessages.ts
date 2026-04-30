export type ToastType = 'error' | 'warning' | 'success' | 'info';

export const TOAST_MESSAGES = {
  loggedIn: { message: 'Je bent nu ingelogd', type: 'success' },
  loggedOut: { message: 'Je bent nu uitgelogd', type: 'success' },
  signOutFailed: { message: 'Uitloggen mislukt. Probeer het opnieuw.', type: 'error' },
  accountConfirmed: {
    message: 'Je account is bevestigd en je bent nu ingelogd. Je kunt nu zelf segmenten aanmaken.',
    type: 'success',
  },
  passwordChanged: { message: 'Je wachtwoord is aangepast. Je bent nu ingelogd.', type: 'success' },
} as const satisfies Record<string, { message: string; type: ToastType }>;

export type ToastKey = keyof typeof TOAST_MESSAGES;

export function getToastData(key: string | null): { message: string; type: ToastType } | null {
  if (!key || !(key in TOAST_MESSAGES)) return null;
  return TOAST_MESSAGES[key as ToastKey];
}

export function isToastKey(key: string | null): key is ToastKey {
  return key !== null && key in TOAST_MESSAGES;
}

export function getUrlWithToast(url: string, key: ToastKey): string {
  const delimiter = url.includes('?') ? '&' : '?';
  return `${url}${delimiter}toast=${key}`;
}
