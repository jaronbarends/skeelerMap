'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

import Button from '@/components/button/Button';
import { signOut } from '@/lib/supabaseAuth';
import { getUrlWithToast } from '@/lib/toastMessages';

import styles from './AuthControls.module.css';

export default function AuthControls({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className={styles.authControls}>
      {isLoggedIn ? (
        <Button
          label={isPending ? 'Bezig…' : 'Uitloggen'}
          variant="ghost"
          onClick={handleSignOut}
          disabled={isPending}
        />
      ) : (
        <Button label="Inloggen" variant="ghost" href="/inloggen" />
      )}
    </div>
  );

  function handleSignOut() {
    startTransition(async () => {
      await signOut();
      router.push(getUrlWithToast('/', 'loggedOut'));
      // push only re-renders client-side. We need to refresh server side AuthControls as well to show correct login state. router.refresh() does that.
      router.refresh();
    });
  }
}
