'use client';

import { useRouter } from 'next/navigation';

import Button from '@/components/button/Button';
import { signOut } from '@/lib/supabaseAuth';

import styles from './AuthControls.module.css';

export default function AuthControls({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();

  return (
    <div className={styles.authControls}>
      {isLoggedIn ? (
        // <button className={styles.button} onClick={handleSignOut}>
        //   Uitloggen
        // </button>
        <Button label="Uitloggen" variant="ghost" onClick={handleSignOut} />
      ) : (
        // <Link href="/login" className={styles.button}>
        //   Inloggen
        // </Link>
        <Button label="Inloggen" variant="ghost" href="/login" />
      )}
    </div>
  );

  async function handleSignOut() {
    await signOut();
    router.refresh();
  }
}
