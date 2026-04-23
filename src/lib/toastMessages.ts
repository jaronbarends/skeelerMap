export const TOAST_MESSAGES = {
  loggedIn: 'Je bent nu ingelogd',
  loggedOut: 'Je bent nu uitgelogd',
  accountConfirmed: 'Je account is bevestigd. Je kunt nu zelf segmenten aanmaken.',
  accountConfirmationFailed: 'Bevestiging mislukt. Probeer opnieuw aan te melden.',
  passwordChanged: 'Je wachtwoord is aangepast. Je bent nu ingelogd.',
} as const;

export type ToastKey = keyof typeof TOAST_MESSAGES;

export function getToastMessage(key: string | null): string | null {
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
