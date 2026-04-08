'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { signOut } from '@/lib/supabaseAuth';

import styles from './AuthControls.module.css';

export default function AuthControls({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();

  return (
    <div className={styles.authControls}>
      {isLoggedIn ? (
        <button className={styles.button} onClick={handleSignOut}>
          Uitloggen
        </button>
      ) : (
        <Link href="/login" className={styles.button}>
          Inloggen
        </Link>
      )}
    </div>
  );

  async function handleSignOut() {
    await signOut();
    router.refresh();
  }
}
