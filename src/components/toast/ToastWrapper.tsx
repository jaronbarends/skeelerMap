'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { type ToastKey, isToastKey, getToastData } from '@/lib/toastMessages';

import Toast from '@/components/toast/Toast';

import styles from './ToastWrapper.module.css';

export default function ToastWrapper() {
  const { toastData, onDismiss } = useInitToast();

  if (!toastData) {
    return null;
  }

  return (
    <div className={styles.wrapper} aria-live="polite">
      <Toast onDismiss={onDismiss} message={toastData.message} type={toastData.type} />
    </div>
  );
}

function useInitToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const toastData = getToastDataFromSearchParams();
  return { toastData, onDismiss };

  function onDismiss() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('toast');
    const newUrl = params.size > 0 ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl);
  }

  function getToastDataFromSearchParams() {
    const rawToastKey = searchParams.get('toast');
    const toastKey: ToastKey | null = isToastKey(rawToastKey) ? rawToastKey : null;
    return toastKey ? getToastData(toastKey) : null;
  }
}
