import type { ReactNode } from 'react';

import styles from './PendingText.module.css';

export default function PendingText({
  children,
  testId,
}: {
  children: ReactNode;
  testId?: string;
}) {
  return (
    <div
      className={styles.pendingText}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-testid={testId}
    >
      <span className={styles.spinner} aria-hidden="true" />
      {children}
    </div>
  );
}
