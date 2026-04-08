'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import styles from './Toast.module.css';

const MESSAGES: Record<string, string> = {
  'logged-in': 'Je bent nu ingelogd',
  'account-confirmed': 'Je account is bevestigd. Je kunt nu zelf segmenten aanmaken.',
  'confirmation-failed': 'Bevestiging mislukt. Probeer opnieuw aan te melden.',
};

const AUTO_DISMISS_MS = 4000;

export default function Toast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const toastKey = searchParams.get('toast');
  const message = toastKey ? (MESSAGES[toastKey] ?? null) : null;

  const [visible, setVisible] = useState(!!message);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const timer = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible || !message) {
    return null;
  }

  return (
    <div className={styles.wrapper} aria-live="polite">
      <button className={styles.toast} onClick={dismiss}>
        {message}
      </button>
    </div>
  );

  function dismiss() {
    setVisible(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('toast');
    const newUrl = params.size > 0 ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl);
  }
}
