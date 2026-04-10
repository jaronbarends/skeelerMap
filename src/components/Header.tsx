import Link from 'next/link';

import { getUser } from '@/lib/supabaseAuth.server';

import AuthControls from './auth/AuthControls';

import styles from './Header.module.css';

export default async function Header() {
  const user = await getUser();
  const isLoggedIn = user !== null;

  return (
    <header className={styles.header}>
      <div className={styles.branding}>
        <Link className={styles.logo} href="/">
          SkeelerMap
        </Link>
        <div className={styles.tagline}>Vind en beoordeel skeelerpaden</div>
      </div>
      <AuthControls isLoggedIn={isLoggedIn} />
    </header>
  );
}
