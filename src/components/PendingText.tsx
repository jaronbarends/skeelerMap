import type { ReactNode } from 'react';

import styles from './PendingText.module.css';

export default function PendingText({ children }: { children: ReactNode }) {
  return (
    <div className={styles.pendingText} role="status" aria-live="polite" aria-atomic="true">
      <span className={styles.spinner} aria-hidden="true" />
      {children}
    </div>
  );
}
