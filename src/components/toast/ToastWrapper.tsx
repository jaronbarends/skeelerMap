'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { type ToastKey, isToastKey, getToastMessage } from '@/lib/toastMessages';

import Toast from './Toast';

import styles from './ToastWrapper.module.css';

export default function ToastWrapper() {
  const { message, onDismiss } = useInitToast();

  if (!message) {
    return null;
  }

  return (
    <div className={styles.wrapper} aria-live="polite">
      <Toast onDismiss={onDismiss} message={message} />;
    </div>
  );
}

function useInitToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const message = getMessageFromSearchParams();
  return { message, onDismiss };

  function onDismiss() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('toast');
    const newUrl = params.size > 0 ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl);
  }

  function getMessageFromSearchParams(): string {
    const rawToastKey = searchParams.get('toast');
    const toastKey: ToastKey | null = isToastKey(rawToastKey) ? rawToastKey : null;
    const message = toastKey ? (getToastMessage(toastKey) ?? '') : '';
    return message;
  }
}
